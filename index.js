// var app_ = require("express")(); // shorthand for directly create app. Need express for path definitions
var express = require('express'),
		app = express(),
		http = require('http').Server(app),
		io = require('socket.io')(http),
		path = require('path'),
		bodyParser = require('body-parser'),
		db = require('./models'),
		session = require('express-session'),
		ejs = require('ejs');
		methodOverride = require('method-override');


/* Set path to files for clients */
var views = path.join(process.cwd(), 'views');

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use('/static', express.static('public'));
app.use('/vendor', express.static('node_modules'));
app.use('/style', express.static('bower_components'));

app.set('view engine', 'ejs');


/* create a session */
app.use(
	session({
		secret: "string-that-should-be-generated-later-on", // use keygen, see solutions of express auth
		resave: false,
		saveUninitiated: true
		// cookie: {httpOnly: false}
	})
);
/*  */





app.use(function (req, res, next) {
	// login user
	req.login = function (user) {
		req.session.userId = user._id;
	};
	//find the current user
	req.currentUser = function (cb) {
		console.log("In req.currentUser");
		db.User.findOne({ _id: req.session.userId },	function (err, user) {
			req.user = user;
			cb(null, user);
		});
	};
	//logout the current user
	req.logout = function () {
		req.session.userId = null;
		req.user = null;
	};
	//call the next middleware in the stack
	next();
});

/* HTML Routes */
app.get(['/', '/home'], function (req, res) {
	req.currentUser(function (err, user) {
		console.log("req when going to /: " + req);
		(user) ? res.render('index') : res.redirect('/login');
	});
});

app.get('/login', function (req, res) {
	req.currentUser(function (err, user) {
		(user) ? res.render('index') : res.render('login');
	});
});

app.post('/login', function (req, res) {
	console.log("HIT LOGIN ROUTE")
	var user = req.body.user,
			username = user.username,
			password = user.password;
	db.User.authenticate(username, password, function (err, user) {
		if (err) {
			res.send("ERROR", err);
		} else {
			console.log(user);
			req.login(user);
			console.log("redirecting home!")
			res.redirect('/'); 
		}
	});
});


app.get('/signup', function (req, res) {
	req.currentUser(function (err, user) {
		(user) ? res.render(path.join(views, 'index')) : res.render(path.join(views, 'signup')) ;
	});
});	

app.post('/signup', function (req, res) {
	console.log(req.body);
	var username = req.body.username;
	var password = req.body.password;
	db.User.nameAvailability(username, function (available, msg) {
		console.log("nameAvailability:", available, msg);
		if (available) {
			db.User.createSecure(username, password, function() {
				db.User.authenticate(username, password, function (err, user) {
					if (err) {
						res.send(err);
					} else {
						console.log(user);
						req.login(user);
						res.send('/home'); // Justin's solution, send instead of redirect
					}
				});
			});
		} else { // username taken
			res.send(msg); // make this more userfriendly, display in signup page
		}
	});
});

app.get('/getSessionId', function (req, res) {
	console.log("Arrived at /getSessionId");
	console.log(req.session.userId);
	req.currentUser(function (err, user) {
		console.log("USER:" + user);
		(user) ? res.send({username: user.username, gamesPlayed: user.gamesPlayed, gamesWon: user.gamesWon, _id: user._id}) : console.log("No USER!!!");
	});
})

// logout user
app.delete(['/sessions', '/logout'], function (req, res) {
	req.logout();
	res.redirect('/login');
});

/* Usernames */
userIds = {};
activeUsers = [];
joinGameButtons = {};
chatHistory = ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"];

/* Socket.IO Routes */
/* Main lobby */
io.on('connection', function (socket) {
	console.log("A user connected: " + socket.id);
// match socket id with user
	socket.emit('getSessionId', chatHistory); // emit to front end to get the session id sent back to add2userlist
	socket.on('add2userlist', function (userdata) { // receives userdata and adds them to userIds
		console.log("add2userlist:", userdata);
		console.log("socke.id:", socket.id);
		userIds[socket.id] = userdata;
		activeUsers = Object.keys(userIds);
		console.log("ActiveUsers:", activeUsers);
		io.emit('userList', userIds); // send userIds to all clients
	});
	socket.emit('addJoinButton', joinGameButtons); // add join existion join buttons for new clients
// on disconnect delete user from userIds array
	socket.on('disconnect', function () {
		var dname = (userIds[socket.id]) ? userIds[socket.id].username : "client";
		console.log(dname,"disconnected");
		delete userIds[socket.id];
		delete joinGameButtons[socket.id];
		activeUsers = Object.keys(userIds);
		console.log("user IDs: ", userIds);	
		io.emit('addJoinButton', joinGameButtons); // refresh everyone's join game buttons
		io.emit('userList', userIds); // send userIds to all clients
	});
	socket.on('chat-message', function (msg) { 
		console.log('users: ' + userIds);
		console.log('chat socket: ' + socket.id);
		console.log("userIds: " + userIds);
		msg = userIds[socket.id].username + " - " + msg;
		chatHistory.push(msg); // add new msg
		chatHistory.shift(); // remove old msg
		io.emit('chat-message', msg);
	});
	socket.on('box-clicked', function (rgb) {
		io.emit('box-clicked', rgb);
	});
	socket.on('login-name', function (name) {
		socket.username = name;
		console.log("socket.username: " + socket.username);
		usernames.username = name;
		console.log("usernames: " + usernames.username);
		++numUsers;
		socket.emit('login', {
			numUsers: numUsers
		});
	});
	// Create new game, send join button to clients
	socket.on('create-game', function () {
		var hostUser = userIds[socket.id];
		console.log("In create-game socket receiver", hostUser.username);
		var ratio = (hostUser.gamesPlayed > 0)
			? Math.round((hostUser.gamesWon / hostUser.gamesPlayed) * 100)
			: 0;
		var titleRatio = "Games Played: " + hostUser.gamesPlayed + ", Win Ratio: " + ratio + "%";
		var buttonStr = '<button value="' + socket.id + '" name="' + hostUser.username + '" gamesPlayed="' + hostUser.gamesPlayed + '" gamesWon="' + hostUser.gamesWon + '" title="' + titleRatio + '" class="join-game">Play against ' + hostUser.username + '</button><br>';
		joinGameButtons[socket.id] = buttonStr; // add button to list
		socket.broadcast.emit('addJoinButton', joinGameButtons); // add the Join game button for all other clients
	});
	// remove button if game is joined
	socket.on('join-game', function (sid, name) {
		delete joinGameButtons[sid];
		io.emit('addJoinButton', joinGameButtons); // refresh everyone's join game buttons
		// add one game to both players gamesPlayed
		console.log("In Join game before updating gamesPlayed, sid:", sid, "name:", name, "socket:id:", socket.id, "userIds[socket.id]:", userIds[socket.id]);
		var socketIds = [sid, socket.id];
		socketIds.forEach(function (sid) {
			userIds[sid].gamesPlayed++;
			console.log("updated gamesPlayed", userIds[sid].username, userIds[sid].gamesPlayed);
			db.User.findOne({_id: userIds[sid]._id}, function (err, user) {
				user.gamesPlayed = userIds[sid].gamesPlayed;
				db.User.update({_id: userIds[sid]._id}, user, {}, function (err, updatedUser){
					if (err) {
						console.log("ERROR in user DB update", err);
					} else {
						console.log("DB updated successfully:", updatedUser);
					}
				});
			});
		});
		// start game
		// var hostSid = socket.id;
		// console.log("----------////////-----------", hostSid, sid);
		// socket.broadcast.to(hostSid).emit('hostStats', userIds[hostSid]);
		socket.broadcast.to(sid).emit('game-joined', sid, name, socket.id, userIds[socket.id]);
	});
	// cancel created game
	socket.on('cancel-game', function () {
		// remove join button and put back create game button to default
	});
/* TickTackToe connections */
	// fill in X or O in cell clicked
	socket.on('cell-clicked', function (sid, cell, XO) {
		console.log("In cell-clicked", sid, cell, XO);
		console.log(typeof(XO));
		socket.broadcast.to(sid).emit('clicked-cell', cell, XO);
	});
	// passing game object to other player
	socket.on('next-turn', function(game) {
		console.log("NEXT-TURN", game);
		console.log(typeof(game.whosTurn));
		var sid = (game.whosTurn) ? game.player1_sid : game.player2_sid;
		console.log("Who's sid:", game.whosTurn, sid);
		socket.broadcast.to(sid).emit('next-turn', game);
	});
	// winner!!!
	socket.on('winner', function(sid) {
		socket.broadcast.to(sid).emit('winner');
		var userWon = userIds[socket.id];
		var id = userWon._id;
		++userWon.gamesWon;
		console.log("GamesWon:", userWon.gamesWon);
		console.log("winner's user ID:" , id);
		db.User.findOne({_id: id}, function (err, user) {
			user.gamesWon = userWon.gamesWon;
			db.User.update({_id: id}, user, {}, function (err, updatedUser){
				if (err) {
					console.log("ERROR in user DB update", err);
				} else {
					console.log("DB updated successfully:", updatedUser);
				}
			});
		});
	});
	socket.on('draw', function(sid) {
		socket.broadcast.to(sid).emit('draw');
	});

}); // io.on connection end


// // sending to sender-client only
//  socket.emit('message', "this is a test");

//  // sending to all clients, include sender
//  io.emit('message', "this is a test");

//  // sending to all clients except sender
//  socket.broadcast.emit('message', "this is a test");

//  // sending to all clients in 'game' room(channel) except sender
//  socket.broadcast.to('game').emit('message', 'nice game');

//  // sending to all clients in 'game' room(channel), include sender
//  io.in('game').emit('message', 'cool gamesWonme');

//  // sending to sender client, only if they are in 'game' room(channel)
//  socket.to('game').emit('message', 'enjoy the game');

//  // sending to all clients in namespace 'myNamespace', include sender
//  io.of('myNamespace').emit('message', 'gg');

//  // sending to individual socketid
//  socket.broadcast.to(socketid).emit('message', 'for your eyes only');

/* Server listening port */
var localPort = 3000
http.listen(process.env.PORT || localPort, function() {
	console.log('listening on localhost:' + localPort);
});
