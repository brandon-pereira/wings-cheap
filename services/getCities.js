var City = require('../schemas/cities');

module.exports = function() {
	return new Promise(function(resolve, reject) {
		City.find().then(
			function success(data) {
				resolve(data);
			},
			function error(error) {
				reject(error);
			}
		);
	});
};