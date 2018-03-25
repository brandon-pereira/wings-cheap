var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/wingdeals');

var schema = new mongoose.Schema({
	place_id: {
		type: String,
		unique: true,
		required: true
	},
	result: {
		type: Object,
		required: true
	},
	valid: {
		type: Date,
		expires: '7d',
		default: Date.now()
	}
});

module.exports = db.model('gPlace', schema);