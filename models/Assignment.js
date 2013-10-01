var mongoose = require('mongoose');

var schema = mongoose.Schema;
var ObjectId = schema.ObjectId;

var scheme = schema({
	name: String,
	owner: { type: ObjectId, ref: 'User' },
	due: Date,
	instructor: String,
	file: String, //path
	criteria: [{
		name: String,
		accomplished: { type: Boolean, default: false }
	}],
	deleted: { type: Boolean, default: false },
	created: { type: Date, default: Date.now }
});

scheme.statics.getAll = function (user, cb) {
	module.exports.find({
		owner: user._id,
		deleted: false
	}).sort("-created").exec(function(err, assignments) {
		if (err) throw err;
		
		cb(assignments);
	})
}

module.exports = mongoose.model("Assignment", scheme);