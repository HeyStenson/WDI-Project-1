// var app_ = require("express")(); // shorthand for directly create app. Need express for path definitions
var express = require('express'),
		app = express(),
		http = require('http').Server(app),
		io = require('socket.io')(http),
		path = require('path'),
		bodyParser = require('body-parser'),
		db = require('./models'),
		session = require('express-session'),
		methodOverride = require('method-override');


/* Set path to files for clients */
var views = path.join(process.cwd(), 'views');

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use('/static', express.static('public'));
app.use('/vendor', express.static('node_modules'));

/* create a session */
app.use(
	session({
		secret: "string-that-should-be-generated-later-on", // use keygen, see solutions of express auth
		resave: false,
		saveUninitiated: true
	})
);
app.use(function (req, res, next) {
	// login user
	req.login = function (user) {
		req.session.userId = user._id;
	};
	//find the current user
	req.currentUser = function (cb) {
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
		console.log("Are we here?");
		(user) ? res.sendFile(path.join(views, 'index.html')) : res.redirect('/login');
	});
});

app.get('/login', function (req, res) {
	req.currentUser(function (err, user) {
		(user) ? res.sendFile(path.join(views, 'index.html')) : res.sendFile(path.join(views, 'login.html'));
	});
});

app.post('/login', function (req, res) {
	var user = req.body.user,
			username = user.username,
			password = user.password;
	db.User.authenticate(username, password, function (err, user) {
		if (err) {
			res.send(err);
		} else {
			console.log(user);
			req.login(user);
			res.redirect('/'); 
		}
	});
});

app.get('/signup', function (req, res) {
	req.currentUser(function (err, user) {
		(user) ? res.sendFile(path.join(views, 'index.html')) : res.sendFile(path.join(views, 'signup.html')) ;
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

app.get('/ticktack', function (req, res) {
	res.sendFile(path.join(views, 'ticktack.html'));
});




// logout user
app.delete(['/sessions', '/logout'], function (req, res) {
	req.logout();
	res.redirect('/login');
});










/* Usernames */
var usernames = {};
var numUsers = 0;

/* Socket.IO Routes */
io.on('connection', function (socket) {
	console.log("A user connected");
	socket.on('disconnect', function () {
		console.log("user disconnected");
	});
	socket.on('chat message', function (msg) { 
		io.emit('chat message', msg);
		console.log('message: ' + msg);
	});
	socket.on('box-clicked', function (rgb) {
		io.emit('box-clicked', rgb);
	})
	socket.on('login-name', function (name) {
		socket.username = name;
		console.log("socket.username: " + socket.username);
		usernames.username = name;
		console.log("usernames: " + usernames.username);
		++numUsers;
		// addedUser = true;
		socket.emit('login', {
			numUsers: numUsers
		});
	});
/* TickTackToe connections */
	socket.on('clicked-cell', function (celldata) {
		console.log("received clicked cell");
		console.log("celldata: " + celldata.cell + ", " + celldata.player);
		io.emit('clicked-cell', celldata);
	});

});



// // sending to sender-client only
//  socket.emit('message', "this is a test");

//  // sending to all clients, include sender
//  io.emit('message', "this is a test");

//  // sending to all clients except sender
//  socket.broadcast.emit('message', "this is a test");

//  // sending to all clients in 'game' room(channel) except sender
//  socket.broadcast.to('game').emit('message', 'nice game');

//  // sending to all clients in 'game' room(channel), include sender
//  io.in('game').emit('message', 'cool game');

//  // sending to sender client, only if they are in 'game' room(channel)
//  socket.to('game').emit('message', 'enjoy the game');

//  // sending to all clients in namespace 'myNamespace', include sender
//  io.of('myNamespace').emit('message', 'gg');

//  // sending to individual socketid
//  socket.broadcast.to(socketid).emit('message', 'for your eyes only');

/* Server listening port */
var port = 3000
http.listen(port, function() {
	console.log('listening on localhost:' + port);
});
