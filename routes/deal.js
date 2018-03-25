const Deal = require('../services/Deal');

module.exports = function(app) {
	app.route('/api/deal')
		.get(function(req, res) {
			console.log("GET /API/DEAL", req.query);
			if(req.query && req.query.place_id) {
				Deal.getDeal(req.query.place_id)
					.then(place => res.json(place))
					.catch(error => res.status(500).json(error));
			} else {
				res.status(500).json({error: "MISSING PLACE_ID"})
			}
		})
		.put(function(req, res) {
			console.log("PUT /API/DEAL", req.body);
			Deal.validate(req.body)
				.then(deal => Deal.addDeal(deal))
				.then(deal => res.json(deal))
				.catch(err => res.status(500).json(err));
		})
		.post(function(req, res) {
			console.log("POST /API/DEAL", req.body);
			Deal.voteDeal(req.body.place_id, req.body.like ? 1 : 0)
				.then(deal => res.json(deal))
				.catch(err => res.status(500).json(err));
	});
};