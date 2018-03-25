'use strict';

const DealSchema = require('../schemas/deals');
const Place = require('./Place.js');
const toJSON = require('./toJSON');

class Deals {
	
	/**
	 * Function to get deals based on specific criteria.
	 * @param {String} sortBy how to sort. Supported props: best, price, successRate
	 * @param {Object} filters any filters to use. Supported keys: city, dow
	 * @return XXX object or array
	 */
	getDeals(sortBy = 'best', filters = {}) {
		return new Promise((resolve, reject) => {
			DealSchema.find(toJSON(filters)).sort(sortBy !== 'best' ? sortBy : 'price').then((data) => {
					// Since successRate is a virtual property, we will need to do a sort after return.
					if(sortBy === 'successRate' || sortBy === 'best') {
						data.sort((a, b) => b.successRate - a.successRate);
					}
					const promises = data.map((deal) => {
						deal = deal.toJSON();
						return Place.getPlace(deal.place_id)
							.then((place) => {
								deal.name = place.result.name;
								deal.vicinity = place.result.vicinity;
								deal.location = place.result.geometry.location;
								return deal;
							}) // TODO: what happens if one errors?
							.catch((err) => console.log(err));
					});
					Promise.all(promises).then((results) => {
						resolve(results);
					})
				}).catch((error) => {
					reject(error);
				}
			);
		});
	}
}

module.exports = new Deals();