$(function() { // Document ready
	console.log("Santity check, document ready");
	/* Socket.io connections */
	socket = io(); // add var
	socket.on('getSessionId', function () { 
		console.log("received socket emit from backend");
		$.get('/getSessionId', function (userdata) {
			console.log("userdata received", userdata);
			socket.emit('add2userlist', userdata);
		});
	});

// chat message
	$('#message-form').submit(function() {
		socket.emit('chat message', $('#chat-message').val());
		$('#chat-message').val('');
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



