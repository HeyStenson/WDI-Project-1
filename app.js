$(function() { // Document ready
	console.log("Santity check, document ready");
	/* Socket.io connections */
	var socket = io();
	console.log("Socket:", socket);

// chat message
	$('form').submit(function() {
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		return false;
	});
	socket.on('chat message', function (msg) {
		$('#messages').append($('<li>').text(msg));
	});

// change color of box
	$('#color-box').click(function() {
		console.log("clicked!");
		var rgb = "rgb(" + zeroTo255() + "," + zeroTo255() + "," + zeroTo255() + ")" ; 
		console.log("rgb", rgb);
		socket.emit('box-clicked', rgb);
		return false;
	});
	socket.on('box-clicked', function (rgb) {
		$('#color-box').css('background-color', rgb);
	})



/* functions */
function zeroTo255() {
	return (Math.floor(Math.random() * 256));
}
}); // Document ready end