var mongoose = require('mongoose');

var schema = mongoose.Schema;
var ObjectId = schema.ObjectId;

var scheme = schema({
	name: String,
	email: String,
	password: String,
	teacher: { type: Boolean, default: false },
	created: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", scheme);