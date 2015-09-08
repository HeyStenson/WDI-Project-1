var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/WDI-Project-1");

module.exports.User = require('./user');
