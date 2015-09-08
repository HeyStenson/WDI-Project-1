var db = require("./models");

db.User.find({}, function (err, users) {
	if(err) {return console.log(err);}
	 // To remove ANY embedded document, simplly call .remove(); 
	console.log("users: " + users)
	// users.remove();
});

// db.User.remove({}, function (err, users) {
// 	if(err) {return console.log(err);}
// 	 To remove ANY embedded document, simplly call .remove(); 
// 	console.log("users: " + users)
// 	// users.remove();
// });