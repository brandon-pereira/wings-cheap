const Deals = require('../services/Deals');

module.exports = function(app) {
	app.route('/api/deals')
		.get(function(req, res) {
			console.log("GET /API/DEALS", req.query);
			Deals.getDeals(req.query.sortBy, req.query.filter)
				.then((data) => {
					res.json(data);
				})
				.catch((err) => {
					res.status(500).json(err);
				});
			});
};