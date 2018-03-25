app.controller('HomeScreen', function ($scope, Map, google, Listings, $state, $q, $filter) {
	var mapReady = Map.init();
	$scope.loaded = false;
	$scope.filtersVisible = false;
	$scope.currentCity = true; // this is simply to not show error until we know they aren't in a valid city
	$scope.filters = null;
	$scope.serverUnavailable = false;
	$scope.listings = [];
	
	/**
	 * Function to initialize both map and deals listings
	 * Once listings finishes, puts pricing and name on page. 
	 * Once Map and deals loaded, fetches Google Places object
	 * and adds to map.
	 */
	(function init() {
		// Load deals, cities, filters, etc
		var init = Listings.init();
		var currentLocation = Map.getCurrentGeolocation();
		init.then(function(data) {
			$scope.cities = data.cities;
			$scope.listings = data.deals;		
			$scope.filters = data.filters;
			$scope.loaded = true;
			addListingsToMap(data.deals);
		}, function(error) {
			$scope.serverUnavailable = true;
		});
		// Fetch real location 
		currentLocation.then(function(location) {
			if(location.error) {
				$scope.locatonError = location.error;
			}
		});
		$q.all([init, currentLocation]).then(function(data) {
			var response = data[0];
			var location = data[1];
			$scope.currentCity = Listings.getSupportedCities(location.city);
			$scope.listings = response.deals;
			if(response.filters.city.id !== location.city && $scope.currentCity) { // if user is in a different city that we support
				if($scope.listings.length === 0) {
					$scope.switchToCity(location.city);	
					addListingsToMap(response.deals);
				} else {
					$scope.differentCity = $scope.currentCity
				}
			}
		}, function() {});
	})();
	
	function addMarker(place, i) {
		var location = place.location;
		if(i < 9) {
			Map.addMarker(location.lat, location.lng, {
				gPlace: place,
				label: (i < 9) ? (i+1).toString() : null,
			}, _onMarkerClick);
		} else {
			Map.addMarker(location.lat, location.lng, {
				gPlace: place,
				icon: {
					path: google.SymbolPath.CIRCLE,
					fillColor: '#E93E3E	',
					fillOpacity: 1,
					scale: 4,
					strokeColor: '#BD3721',
					strokeWeight: 1
				}
			}, _onMarkerClick);	
		}	
	}
	
	function addListingsToMap(listings) {
		mapReady.then(function() {
			Map.clearMarker(); // if you come from another screen	
			listings.forEach(function(listing, i, array) {
				addMarker(listing, i);
				if(++i === array.length) { // If last item
					Map.fitMarkers();
				}
			});
		});
	}
	
	function getListingsInformation(listings) {
		console.info("HomeScreen: Getting information for ", listings);
		$scope.listings = listings;
		var counter = listings.length < 10 ? listings.length : 10;
		mapReady.then(function() {
			Map.clearMarker();
			listings.forEach(function(listing, i, array) {
				if(i < 25) {
					$scope.listings[i] = listing;
					addMarker(listing, i);
					counter--;
					if(counter === 0) { // If last item
						$scope.loaded = true; // TODO: Isn't actually loaded... but first 10 are. 
						Listings.setCache($scope.filters, $scope.listings);
						Map.fitMarkers();
					}
				}
			});			
		});
	}
					
	function getListingsInformationByDistance(listings) {
		if(!listings || !listings.length) {
			$scope.listings = [];
			return;
		}
		var currentLocation = Map.getCurrentGeolocation();
		$q.all([mapReady, currentLocation]).then(function(responses) {
			var currentLocation = responses[1];
			var counter = listings.length;
			listings.forEach(function(listing, i, array) {
				var latlng = {
					lat: listing.location.lat,
					lng: listing.location.lng
				};
				listing.distance = Map.getDistanceBetweenMarkers(latlng, currentLocation);
				counter--;
				if(counter === 0) { // If last item
					listings = $filter('orderBy')(array, 'distance');
					$scope.listings = listings;
					Listings.setCache($scope.filters, listings);
					addListingsToMap(listings);
				}
			});
		});
	}
	
	var _onMarkerClick = function(marker) {
		var place = marker.gPlace;
		console.info("Listings: Clicked on marker for", place.name);
		$state.go('Result', {id: place.place_id, name: place.name});
	};
	
	$scope.applyFilters = function(params) {
		console.info("HomeScreen: Update Filters", params);
		$scope.loaded = false;
		$scope.listings = null;
		Listings.searchDeals(params.filters, params.sortBy).then(function(listings) {
			if(params.sortBy === 'distance') {
				getListingsInformationByDistance(listings);
			} else {
				getListingsInformation(listings);
			}
			$scope.filtersVisible = false;
			$scope.loaded = true;
		});
	};
	
	$scope.switchToCity = function(city) {
		city = Listings.getSupportedCities(city);
		$scope.filters.city = city;
		var payload = {
			filters: {
				dow: $scope.filters.dow,
				city: $scope.filters.city.id
			}, 
			sortBy: $scope.filters.sortBy
		};
		$scope.applyFilters(payload);
		$scope.differentCity = null;
	}
	
});