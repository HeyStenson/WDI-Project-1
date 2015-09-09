$(function() { // document ready
	/* Ajax connections */
	$("form").on('submit', function (e) {
		$('#username').css('background', '');
		$('#password1').css('background', '');
		$('#password2').css('background', '');
		console.log("Sanity test, in submit listener");
		e.preventDefault();
		var message = "";
		var data = {username: $('#username').val(),
								password: $('#password1').val()
							};
		if ( data.username === "" ) {
			$('#username').css('background', 'lightcoral');
			message = "Enter a username";
		} else if ( data.password === "" ) {
			$('#password1').css('background', 'lightcoral');
			message = "Enter a password";
		} else if ( data.password !== $('#password2').val()) {
			$('#password2').css('background', 'lightcoral');
			console.log($('#password1').val(), $('#password2').val());
			message = "Your password doesn't match";
		} else {


			$.post('/signup', data)
				.success(function handleSuceess(endpoint) {
					console.log(endpoint);
					window.location.href = endpoint; // receives sendFile from backend
				})
				.error(function handleError(err) {
					message = err;
					console.log("Error", err);
				});


		}
		console.log("message", message);
	});

}); // document ready end