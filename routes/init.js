const Deals = require('../services/Deals');
const getCities = require('../services/getCities');
const geoip = require('geoip-lite');

function init(req, res) {
	console.log("GET /API/INIT");
	const ip = req.clientIp;
	const geo = geoip.lookup(ip);
	const current_day = new Date().getDay();
	const order = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
	const dow = order[current_day];
	const default_city = 'CALGARY';
	const sortBy = 'best';
	let cities = [];
	let city = default_city;
	getCities().then((supportedCities) => {
		if(geo) {
			const isSupportedCity = supportedCities.find((city) => city.id === geo.city.toUpperCase());
			if(isSupportedCity) {
				city = isSupportedCity.id;
			}
		}
		cities = supportedCities;
		return Deals.getDeals(sortBy, {dow: dow, city: city});
	})
	.then((deals) => {
			res.json({
				filters: {
					dow: dow,
					city: city,
					sortBy: sortBy
				},
				deals,
				cities
			// });
		});
	})
}

module.exports = (app) => {
	app.route('/api/init')
		.get(init);
	app.route('/api/city')
		.get((req, res) => {
			const ip = req.clientIp;
			res.json({
				ip,
				geo: geoip.lookup(ip)
			})
		})
		
	
		
	// var City = require('../schemas/cities');
	// app.route('/api/addCity/:id/:name/:lat/:lng')
	// 	.get(function(req, res) {
	// 		var city = new City(req.params);
	// 		city.save(function(err) {
	// 			if(!err) {
	// 				res.send('Listing Added');
	// 			} else {
	// 				res.json(err);
	// 			}
	// 		});
	// 	});
};