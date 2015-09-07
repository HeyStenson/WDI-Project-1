$(function() { // Document ready
	console.log("Santity check, document ready");
	/* Socket.io connections */
	var socket = io();
	console.log("Socket:", socket);

// Register name
	// $('#login-form').on('submit', function(e) {
	$('#login-form').submit(function(e) {
		console.log("Sanity check, in login listener");
		e.preventDefault();
		if ($('#nickname').val() !== "") {
			console.log("Your name will be " + $('#nickname').val());
				
		}
	});




// chat message
	$('#message-form').submit(function() {
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		return false;
	});
	socket.on('chat message', function (msg) {
		$('#message-list').append($('<li>').text(msg));
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