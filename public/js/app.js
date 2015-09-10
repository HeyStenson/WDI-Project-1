$(function() { // Document ready
	console.log("Santity check, document ready");
	/* Socket.io connections */
	socket = io(); // connect client with socket
	socket.on('getSessionId', function (chatHistory) { 
		postChatHistory(chatHistory); // populates the chat with the last 20 messages
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
		socket.emit('chat-message', $('#chat-message').val());
		$('#chat-message').val('');
		return false;
	});
	socket.on('chat-message', function (msg) {
		$('#message-list').append($('<li tabindex="1">').text(msg));
		$('#message-list').scrollTop($('#message-list')[0].scrollHeight)
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
	function postChatHistory (chatHistory) {
		chatHistory.forEach(function (msg) {
			$('#message-list').append($('<li tabindex="1">').text(msg));
		});
		$('#message-list').scrollTop($('#message-list')[0].scrollHeight)
	}

/* variables */
	users = {};


}); // Document ready end



