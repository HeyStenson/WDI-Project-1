$(function() { // document ready
	console.log("Santity check, document ready");

	var socket = io();

	var whosTurn = "O";

	/* Socket.io connections */
	$('#gameboard').click(function (e) {
		console.log(e.target.id);
		var cell = "#" + e.target.id;
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