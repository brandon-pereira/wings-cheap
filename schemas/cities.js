var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/wingdeals');

// Deals Schema
var schema = mongoose.Schema({
	id: {
		type: String,
		uppercase: true,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	lat: {
		type: Number,
		default: 1
	},
	lng: {
		type: Number,
		default: 0
	},
});

module.exports = db.model('City', schema);