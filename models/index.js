var mongoose = require('mongoose');
mongoose.connect( process.env.MONGOLAB_URI
									|| process.env.MONGOHQ_URL
									|| "mongodb://localhost/WDI-Project-1");

module.exports.User = require('./user');
