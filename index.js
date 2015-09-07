// var app_ = require("express")(); // shorthand for directly create app. Need express for path definitions
var express = require('express'),
		app = express(),
		http = require('http').Server(app),
		io = require('socket.io')(http),
		path = require("path");


/* Set path to files for clients */
var views = path.join(process.cwd(), 'views');
// app.use('/', express.static('/views'));
app.use('/static', express.static('public'));
app.use('/vendor', express.static('node_modules'));
// app.use(bodyParser.urlencoded({ extended: true})); // haven't installed bodyParser yet



/* HTML Routes */
app.get('/', function (req, res) {
	res.sendFile(path.join(views, 'index.html'));
});
app.get('/ticktack', function (req, res) {
	res.sendFile(path.join(views, 'ticktack.html'));
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
	socket.on('chat message', function (msg) { // 'chat message' is the connection name defined by emit in app.js
		io.emit('chat message', msg);
		console.log('message: ' + msg);
	});
	socket.on('box-clicked', function (rgb) {
		io.emit('box-clicked', rgb);
	})
	socket.on('login-name', function (name) {
		socket.username = name;
		username[username] = name;
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
