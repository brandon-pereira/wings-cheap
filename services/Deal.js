'use strict';

const DealSchema = require('../schemas/deals');
const Place = require('./Place.js');

class Deal {
	
	/**
	 * Function to verify a deal is valid.
	 * TODO: Also validate deal doesn't already exist
	 */
	validate(deal) {
		return new Promise((resolve, reject) => {
			var d = new DealSchema(deal);
			d.validate(function(err) {
				if(!err) {
					resolve(d);
				} else {
					reject({error: 'INVALID_DEAL'});
				}
			})
		});
	}
	
	/**
	 * Function to get deal and place information.
	 */
	getDeal(id) {
		const dealInfo = this._getDealInformation(id);
		const placeInfo = Place.getPlace(id);
		return Promise.all([dealInfo, placeInfo])
			.then((info) => Object.assign({}, info[0], info[1].toObject()))
	}
	
	/**
	 * Function to add a deal to the database
	 *  TODO: Validate google place, and return gplace
	 */
	addDeal(deal) {
		console.log("add deal", deal);
		var d = new DealSchema(deal);
		return d.save();
	}
	
	/**
	 * Function to vote for a deal. Increments by amount passed
	 * in.
	 * @param amount (-1, 1);
	 * @return Promise
	 */
	voteDeal(place_id, amount) {
		console.log(amount);
		return DealSchema.update({place_id}, {$inc: {total: 1, success: amount}});
	}
	
	// updateDeal(deal) {
	// 	// Deal.update({place_id: req.body.place_id}, {$inc: {total: 1, success: (req.body.like ? 1 : 0)}}).then(
	// 	// 	function success(data) {
	// 	// 		console.log(data);
	// 	// 	}, function error(err) {
	// 	// 		console.error("Error", err);
	// 	// 		res.status(500).json({"error": err});
	// 	// 	});
	// }
	//
	// _updateDeal(deal) {
	// 	// 		var d = new deal(req.body);
	// 	// 		d.save(function(err) {
	// 	// 	if(!err) {
	// 	// 		res.json(req.body);
	// 	// 	} else {
	// 	// 		// TODO: Handle already exists error
	// 	// 		res.status(500).json({"error": err});
	// 	// 		console.error("Error", err);
	// 	// 	}
	// 	// });
	// }
	
	
	
	_getDealInformation(place_id) {
		return new Promise((resolve, reject) => {
			DealSchema.findOne({place_id})
				.then((deal) => {
					if(deal && deal.place_id) {
						deal = deal.toJSON();
						resolve(deal);
					} else {
						reject({error: 'INVALID_ID'});
					}
				})
				.catch((err) => reject(err));

		});
	}
	
}

module.exports = new Deal();