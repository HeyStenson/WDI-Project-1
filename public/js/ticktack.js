$(function() { // document ready
	console.log("Santity check, document ready");

	/* client variables */	
	var whosTurn = "O"; // temp probably
	var inGame = false;
	var opponent = {name: "",
									sid: ""
									}; 

	/* Socket.io connections */
	// Join Game
	$('#join-game').on('click', 'button', function (join) {
		console.log("Join game button clicked", join);
		if (!inGame) {
			opponent.sid = join.target.value;
			opponent.name = join.target.name;
			// info = join.target;
			console.log("opponent:", opponent);
			// remove button for everyone
			socket.emit('join-game', opponent.sid);
		} else {
			// join game and close created game or active game, will count as a loss
		}
	});

	$('#gameboard').click(function (e) {
		console.log(e.target.id);
		var cell = "#" + e.target.id;
		if ($(cell).text() === "" && inGame) {
			console.log("Empty cell clicked");
			(whosTurn === "O") ? whosTurn = "X" : whosTurn = "O"; 
			var celldata = {cell: cell, player: whosTurn};
			socket.emit('clicked-cell', celldata);
		}
	});
	
	socket.on('clicked-cell', function (celldata) {
		console.log("Other player clicked cell");
		console.log("celldata: " + celldata.cell + ", " + celldata.player);
		whosTurn = celldata.player;
		$(celldata.cell).text(whosTurn);
	});

// Create Game
	$('#create-game').click(function() {
		var userName = users[socket.id].username;
		console.log("create new game",userName , users);
		if (!inGame) {
			socket.emit('create-game', userName);
		}
	});
	// add join game button
	socket.on('addJoinButton', function (joinGameButtons) {
		console.log("received buttonStr:", joinGameButtons);
		var buttonKeys = Object.keys(joinGameButtons);
		var tmpButtons = "";
		buttonKeys.forEach(function (key) {
			if (key !== socket.id) {
				tmpButtons = tmpButtons + joinGameButtons[key];
			}
		});
	$('#join-game').html(tmpButtons);
	});
	// receive private message
	socket.on('game-joined', function (sid, name) {
		console.log("received private message", sid, name);
	});


	/* Game */
	




}); // document ready end