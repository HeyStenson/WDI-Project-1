$(function() { // Document ready
	console.log("Santity check, document ready");
	/* Socket.io connections */
	socket = io(); // connect client with socket
	socket.on('getSessionId', function () { 
		console.log("received socket emit from backend");
		$.get('/getSessionId', function (userdata) {
			console.log("userdata received", userdata);
			socket.emit('add2userlist', userdata);
		});
	});
	socket.on('userList', function (userIds) {
		users = userIds;
		$('#user-list').text('') // clear list before appending updated names
		var socketIds = Object.keys(userIds);
		socketIds.forEach(function (sid) {
			console.log(userIds[sid].username);
			$('#user-list').append($('<li>').text(userIds[sid].username));
		});
	});

// chat message
	$('#message-form').submit(function() {
		socket.emit('chat message', $('#chat-message').val());
		$('#chat-message').val('');
		return false;
	});
	socket.on('chat message', function (msg) {
		$('#message-list').append($('<li tabindex="1">').text(msg));
		// trying to scroll to bottom for each message without using focus()
		// $('#message-list').scrollIntoView({block: "end", behavior: "smooth"});
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
/* variables */
	users = {};


}); // Document ready end



