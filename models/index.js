var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/WDI-Project-1");

modular.exports.User = require("./user");
