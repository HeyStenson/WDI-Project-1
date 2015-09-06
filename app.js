$(function() { // Document ready
	console.log("Santity check, document ready");
	/* Socket.io connections */
	var socket = io();
	console.log("Socket:", socket);
	$('form').submit(function() {
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		return false;
	});
	socket.on('chat message', function (msg) {
		$('#messages').append($('<li>').text(msg));
	});

}); // Document ready end