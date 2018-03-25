app.factory('Listings', function($q, Map, google, $state, $http, _, config) {

	var listings = [];
	var votes = []; 
	var initialize = $q.defer();
	var supported_cities = null;
	var deals_cached = null;
	var filters_cached = {
		dow: '',
		sortBy: 'best'
	};
	
	(function() {
		$http.get(config.serverLocation + '/init/').then(function(response) {
			if(response.data) {
				supported_cities = response.data.cities;
				filters_cached = response.data.filters;
				deals_cached = response.data.deals;
				filters_cached.city = getSupportedCities(filters_cached.city); // Server returns ID.
				initialize.resolve();
				return;
			}
			console.error("Listings: Got error from init", response);
			initialize.reject();
			}, function error(response) {
				console.error("Listings: Got error from init", response);
				initialize.reject();
			}
		);
	})();
	
	var init = function() {
		var def = $q.defer();
		// Wait for initialize function to complete before running
		initialize.promise.then(function() {
				def.resolve({
					cities: supported_cities,
					filters: filters_cached,
					deals: deals_cached
				});
		});
		return def.promise;
	};

	var setCache = function(filters, deals) {
		filters_cached = filters;
		deals_cached = deals;
	};
	/**
	 * Function to return all listings.
	 * @return {Array} Array of all marker/places.
	 */
	var getListings = function() {
		return listings;
	};
	
	var setLiked = function(place_id, isLike) {
		var like = isLike ? true : false; // sanitize 
		var votesEntry = {place_id: place_id, like: like};
		if(!_.find(votes, votesEntry)) {
			$http.post(config.serverLocation + '/deal', {place_id: place_id, like: like});	
			votes.push(votesEntry);
		}
	};
	
	var isLiked = function(place_id) {
		var currentEntry = _.find(votes, {place_id: place_id});
		if(currentEntry) {
			return {selected: currentEntry.like};
		} else {
			return false;
		}
	};
	
	/**
	 * Function to get supported city, or supported_cities
	 * depending on if you pass in a param.
	 * @param  {String} city_id ID if city to check against
	 * @return {Array}   Array of cities.
	 */
	var getSupportedCities = function(city_id) {
		if(supported_cities) {
			if(city_id) {
				return _.find(supported_cities, {id: city_id});
			} else {
				return supported_cities;
			}			
		} else {
			initialize.promise.then(getSupportedCities);
		}
	};
	
	var searchDeals = function(params, sortBy) {
		var def = $q.defer();
		console.info("Listings: Preparing to fetch deals", params, sortBy);
		$http.get(config.serverLocation + '/deals/', {params: {
			filter: _.pickBy(params),
			sortBy: sortBy
		}}).then(
			function success(response) {
				if(response.data) {
					deals_cached = response.data;
					def.resolve(response.data);
				}
				def.reject();
			}, function error(response) {
				console.error("Listings: Got error from searchDeals", response);
				def.reject();
			}
		);
		return def.promise;
	};
	
	var addDeal = function(params) {
		$http.put(config.serverLocation + '/deal/', params).then(
			function success(response) {
				console.info("Listings: Got success from addDeal", response.data);
				$state.go('Result', {id: params.place_id, name: params.name});
			}, function error(response) {
				console.error("Listings: Got error from addDeal", response);
				$state.go('Result', {id: params.place_id, name: params.name});
			}
		);
	};
	
	/**
	 * Function to kick off a nearby search.
	 * @return {Promise:Array} listings 
	 */
	var searchNearby = function(){
		console.info("Listings: Preparing to fetch nearby listings");
		var request = {
			types: ['bar'],
			radius: 2500
		};
		return _search(request, 'NEARBY');
	};

	/**
	 * Function to kick off a lookup.
	 * @param  {String} id Google Places ID
	 * @return {Object} gPlace resulting place
	 */
	var searchID = function(id) {
		var result = _.find(listings, {place_id:id});
		if(result) {
			var def = $q.defer();
			def.resolve(result);
			return def.promise;
		}
		console.info("Listings: Preparing to fetchListingById");
		var request = {
	  	placeId: id
	  };
		return _search(request, 'ID');
	};
	
	/**
	 * @private Function to kick off and delegate Google Place API access.
	 * @param  {Object} request Parameters for your request
	 * @param  {String} service The service you'd like to access. See code for examples.
	 * @param  {Deferred} def   Since this can be recursive, a deferred object can be passed to help with bubbling.
	 * @return {Promise}  			The result from server.
	 */
	var _search = function(request, service, def) {
		def = def || $q.defer();
		var map = Map.getMap();
		var gApi = new google.places.PlacesService(map);
		if(service === 'NEARBY') {
			// center map to current location
			map.setCenter(Map.getMarker('CURRENT').getPosition());
			request.location = map.getCenter();
			gApi.nearbySearch(request, resolve);
		} else if(service === 'ID') {
			gApi.getDetails(request, resolve);
		} else {
			console.error("Listings: Unknown service type provided.");	
		}
		
		function resolve(response, status) {
			if(status === 'OK') {
				listings = listings.concat(response);
				return def.resolve(response);
			} else if(status === 'ZERO_RESULTS') {
				console.warn("Listings: Zero results for radius, redoing with larger radius.");
				request.radius *= request.radius;
				return _search(request, 'NEARBY', def);
			} else if(status === 'OVER_QUERY_LIMIT') {
				console.warn("Listings: Google API timed out. Trying again soon.", request);
				setTimeout(function() {
					return _search(request, 'ID', def);
				}, 5000);
			} else {
				console.error("Listings: Got an invalid response. GOOGLE ERROR:", status);
			}
		}

		return def.promise;
	};

	return {
		searchDeals: searchDeals,
		init: init,
		setCache: setCache,
		addDeal: addDeal,
		getListings: getListings,
		searchNearby: searchNearby,
		searchID: searchID,
		isLiked: isLiked,
		setLiked: setLiked,
		getSupportedCities: getSupportedCities
	};
	
});