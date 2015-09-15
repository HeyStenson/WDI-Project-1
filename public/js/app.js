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
		console.log("socket.id in userList", socket.id);
		thisUserStats(userIds[socket.id]); // update your stats
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

	function thisUserStats (thisUser) { // replace with _.template
		$('#your-name').text(thisUser.username);
		$('#your-gamesPlayed').text(thisUser.gamesPlayed);
		var ratio = (thisUser.gamesPlayed > 0)
			? Math.round((thisUser.gamesWon / thisUser.gamesPlayed) * 100)
			: 0;
		$('#your-winRatio').text(ratio);
	}

	$('#login-form').on('submit', function(data){
		data.preventDefault();
		console.log("we are testing this response: ", data);
		da = data;
		var data = {username: data.target.username.value, password: data.target.password.value};
		$.post('/login', data)
			.success(function handleSuccess(endpoint){
				console.log("success", endpoint);
				window.location.href = endpoint;
			})
		.error(function handleError(err){
			console.log("error", err);
			$('.form-control').css('background', "pink");
		})
	})


}); // Document ready end



