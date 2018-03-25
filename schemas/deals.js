var mongoose = require('mongoose');
var gPlace = require('../services/Place');
var db = mongoose.createConnection('mongodb://localhost/wingdeals');

// Deals Schema
var schema = mongoose.Schema({
	place_id: {
		type: String,
		required: true,
		unique: true,
		validate: [(value) => gPlace.getPlace(value), 'Invalid Google Place ID']
	},
	name: {
		type: String,
		required: true
	},
	dow: {
		type: Array,
		required: true
	},
	price: {
		type: String,
		required: true
	},
	unit: {
		type: String,
		required: true
	},
	success: {
		type: Number,
		default: 3
	},
	total: {
		type: Number,
		default: 4
	},
	city: {
		type: String,
		uppercase: true,
		default: "UNKNOWN"
	}
},
{
	timestamps: true,
	toObject: { virtuals: true },
	toJSON: { virtuals: true }
});

schema.virtual('successRate').get(function () {
  return parseFloat(this.success / this.total * 100).toFixed(0);
});

module.exports = db.model('Deal', schema);