var mongoose = require('mongoose'),
		Schema = mongoose.Schema,
		bcrypt = require('bcrypt');

var UserSchema = new Schema({
		username: {type: String, required: true},
		passwordDigest: {type: String, required: true},
		createdAt: {type: Date, default: Date.now},
		gamesPlayed: {type: Number, default: 0},
		gamesWon: {type: Number, default: 0},
		winRatio: {type: Number, default: 0}
});

UserSchema.statics.createSecure = function (username, password, cb) {
	var _this = this;
	// _this.findOne({username: username}, function (err, user) {
	// 	if (user === null) {
			bcrypt.genSalt( function (err, salt) {
				bcrypt.hash(password, salt, function (err, hash) {
					var user = {
						username: username,
						passwordDigest: hash
					};
					_this.create(user, cb);
				});
			});
		// } else {
		// 	cb("Username already taken", null);
		// }
	// }
};

UserSchema.statics.authenticate = function (username, password, cb) {
	this.findOne({username: username}, function (err, user) {
		if (user === null) {
			cb("Can't find user with that email", null);
		} else if (user.checkPassword(password)) {
			cb(null, user);
		} else {
			cb("password incorrect", user);
		}
	});
};

UserSchema.methods.checkPassword = function (password) {
	return bcrypt.compareSync(password, this.passwordDigest);
};


var User = mongoose.model('User', UserSchema);
module.exports = User;
