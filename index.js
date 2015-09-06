// var app_ = require("express")(); // shorthand for directly create app. Need express for path definitions
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// console.log("app_ comp", app_);
// console.log("app  comp", app);
// console.log("expr comp", express);
// console.log("http", http);
// console.log("io", io);

/* Set path to files for clients */
app.use('/', express.static('.'));


/* Ajax Routes */
app.get('/', function (req, res) {
	res.sendFile("/index.html");
});



/* Socket.IO Routes */
// io.on('connection', ...), socket.on('disconnect', ...)
io.on('connection', function (socket) {
	// socket.broadcast.emit('hi'); // to broadcast to everyone except a certain socket
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
