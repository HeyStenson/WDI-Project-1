$(function() { // document ready
	console.log("Santity check, document ready");

	/* client variables */	
	var whosTurn = "O"; // temp probably
	var inGame = false;
	var myTurn = false; // can only click if true
	game = new Game(null, null, null, null);
	/* Socket.io connections */
	// Join Game
	$('#join-game').on('click', 'button', function (join) {
		console.log("Join game button clicked", join);
		if (!inGame) {
			inGame = true;
			var sid = join.target.value;
			var name = join.target.name;
			// info = join.target;
			console.log("opponent:", sid, name);
			// remove button for everyone
			socket.emit('join-game', sid, name);
		} else {
			// join game and close created game or active game, will count as a loss
		}
	});

	

// Create Game
	$('#create-game').click(function() {
		var userName = users[socket.id].username;
		console.log("create new game",userName , users);
		if (!inGame) {
			isHost = true;
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
	// Start game //
	socket.on('game-joined', function (host_sid, host_name, opponent_sid, opponent_name) {
		inGame = true;
		console.log("received private message from opponent, you are:", host_sid, host_name, ". Opponent is:", opponent_sid, opponent_name);
		game = new Game(host_sid, host_name , opponent_sid, opponent_name);
		console.log("GAME!!", game);
		game.init;
		socket.emit('next-turn', game); // sends game obj to opponent
	});

	socket.on("next-turn", function (sentGame) {
		game = sentGame;
		console.log("GAME IN NEXT-TURN,", game);
		if (game.lastMove === "init") {
			init();
		} 
		myTurn = true;
	});
	
	socket.on('clicked-cell', function (cell, XO) {
		console.log("player clicked cell", cell);
		$(cell).text(XO);
	});

	$('#gameboard').click(function (ec) {
		console.log(ec.target.id);
		var cell = "#" + ec.target.id
		if ($(cell).text() === "" && myTurn) {
			console.log("Empty cell clicked and my turn");
			console.log("GAME IN GAMEBOARD", game);
			if (game.whosTurn) {
				var XO = "O";
				var sid = game.player2_sid;
			} else {
				var XO = "X";
				var sid = game.player1_sid;
			}
			$(cell).text(XO);
			socket.emit('cell-clicked', sid, cell, XO); // send update to other player
			game.lastMove = cell;
			if (hasWon()) {
				console.log("game won by:TBD");
			} else {
				game.whosTurn = !game.whosTurn; // toggles who's turn it is
				socket.emit('next-turn', game);
			}
			console.log("End of next-turn, does it trigger?");
			myTurn = false;
		}
	});

	function init () {
		console.log("init initiated");
		$('#r1c1').text('');
		$('#r1c2').text('');
		$('#r1c3').text('');
		$('#r2c1').text('');
		$('#r2c2').text('');
		$('#r2c3').text('');
		$('#r3c1').text('');
		$('#r3c2').text('');
		$('#r3c3').text('');
	}


	function hasWon () {
		// write win logic
		console.log("hasWon called");
		return false;
	}

	/* Game Constructor */
	function Game(host_sid, host_name , opponent_sid, opponent_name) {
		this.player1 = host_name;
		this.player1_sid = host_sid;
		this.player2 = opponent_name;
		this.player2_sid = opponent_sid;
		this.lastMove = "init";
		this.whosTurn = false; // true is the hosts turn (player1), false is the opponents turn
	};





}); // document ready end