$(function() { // document ready
	console.log("Santity check, document ready");

	var socket = io();

	var whosTurn = "O";

	var $r1c1 = $('#r1c1'),
			$r1c2 = $('#r1c2'),
			$r1c3 = $('#r1c3'),
			$r2c1 = $('#r2c1'),
			$r2c2 = $('#r2c2'),
			$r2c3 = $('#r2c3'),
			$r3c1 = $('#r3c1'),
			$r3c2 = $('#r3c2'),
			$r3c3 = $('#r3c3');

	/* Socket.io connections */
	$('#gameboard').click(function (e) {
		console.log(e.toElement.id);
		var cell = "#" + e.toElement.id;
		if ($(cell).text() === "") {
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



}); // document ready end