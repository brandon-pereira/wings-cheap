app.controller('ResultScreen', function($stateParams, Listings, Map, _, $scope, $state, $q, $http, config) {	
	
	var places = Listings.getListings();
	var place_id = $stateParams.id;
	
	/**
	 * Function which kicks off results view. Checks for 
	 * the place being loaded from cache while also loading from server.
	 */
	var init = function() {
		$scope.loaded = false;
		// _fetchResult(place_id).then(function(place_server) {
			// console.info("Results: Got result from server", place_server);
			// _setResult(place_server);
		// });
		
		var map = Map.init();
		$http.get(config.serverLocation + '/deal', {params: {place_id: place_id}})
			.then(function success(response) {
				$scope.deal = response.data;
				$scope.result = response.data.result;
				$scope.deal.dow_friendly = _getFriendlyDow(response.data.dow);
				$scope.deal.isLiked = Listings.isLiked(place_id);
				map.then(function() {
					_goToResult(response.data.result);
				});
				$scope.loaded = true;
			}, function error(response) {
				if(response && response.data && response.data.error) {
					$scope.error = response.data.error;
				} else {
					$scope.error = "E100";
				}
			});
		
	}();

	/**
	 * Function to move map to a result. 
	 * @param  {Object} place A valid Google Places object
	 * @return {Boolean} 			if valid or not
	 */
	function _goToResult(place) {
		if(place && place.hasOwnProperty('geometry') && place.geometry.hasOwnProperty('location')) {
			Map.clearMarker();
			var location = place.geometry.location;
			Map.addMarker(location.lat, location.lng);
			Map.goToLatLng(location.lat, location.lng, 15);
			return true;
		}
		return false;
	}
	
	/**
	 * Creates a pretty dow.
	 * Examples:
	 * Wednesdays
	 * Wednesday and Thursdays
	 * Weekdays
	 * Monday through Friday
	 * @param  {[type]} days [description]
	 * @return {[type]}      [description]
	 */
	function _getFriendlyDow(days) {
		var names = {
			'mon': 'Monday',
			'tue': 'Tuesday',
			'wed': 'Wednesday',
			'thu': 'Thursday', 
			'fri': 'Friday', 
			'sat': 'Saturday', 
			'sun': 'Sunday', 
		};
		var order = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
		days = _.sortBy(days, function(d) {
			return order.indexOf(d);
		});
		var string = "";
		if(_.isEqual(days, ['mon', 'tue', 'wed', 'thu', 'fri'])) {
			string = "Weekdays";
		} else if(days.length === 7) {
			string = "Everyday";
		} else if(days.length > 1) {
			for(var i = 0; i < days.length; i++) {
				var isLast = (i + 1) === days.length;
				var isTwo = days.length === 2;
				string += isLast ? 'and ' : '';
				string += names[days[i]];
				string += isLast ? 's.' : isTwo ? ' ' : ', ';
			}
		} else {
			string = names[days[0]] + 's';
		}
		return string;
	}
	
});