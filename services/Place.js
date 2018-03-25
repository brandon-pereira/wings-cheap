'use strict';

var gPlace = require('../schemas/gPlace');
var GooglePlaces = require('googleplaces')(process.env.GOOGLE_PLACES_API_KEY, process.env.GOOGLE_PLACES_OUTPUT_FORMAT);

class Place {
	
	getPlace(place_id) {
		return new Promise((resolve, reject) => {
			gPlace.findOne({place_id})
				.then(function(place) {
					if(place) { // If place is already cached.
						place.toJSON();
						resolve(place);
					} else { // Cache it
						GooglePlaces.placeDetailsRequest({placeid: place_id}, (error, place) => {
							if(error || !place || place.status !== 'OK') {
								if(error || !place) {
									reject({error: error || place});
								} else {
									reject({error: place.status});
								}
							} else {
								var gplace = new gPlace({result: place.result, place_id: place_id});
								gplace.save(); // we don't really care if it errors.. it's just for caching.
								gplace.toJSON();
								resolve(gplace);
							}
						});
					}
				})
			.catch((error) => {
				reject(error);
			});
		});
	}
}

module.exports = new Place();