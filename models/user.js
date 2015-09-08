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
			bcrypt.genSalt( function (err, salt) {
				bcrypt.hash(password, salt, function (err, hash) {
					var user = {
						username: username,
						passwordDigest: hash
					};
					_this.create(user, cb);
				});
			});
};

UserSchema.statics.nameAvailability = function (username, cb) {
	this.findOne({username: username}, function (err, user) {
		if (user === null) {
			cb(true, "username available");
		} else {
			cb(false, "username already taken");
		}
	});
};


UserSchema.statics.authenticate = function (username, password, cb) {
	this.findOne({username: username}, function (err, user) {
		if (user === null) {
			cb("Username not in database", null);
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
