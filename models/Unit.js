var mongoose = require('mongoose');

var schema = mongoose.Schema;
var ObjectId = schema.ObjectId;

var scheme = schema({
	name: String,
	start: Date,
	end: Date,
	
});

module.exports = mongoose.model("Unit", scheme);