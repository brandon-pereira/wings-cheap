app.controller('AddDealScreen', function($scope, $rootScope, google, Map, $state, $http, _, Listings) {	
	
	$scope.errors = {};
	$scope.autoCompleteSettings = {
		componentRestrictions: {country: 'ca'},
		type: ['bar', 'meal_takeaway', 'restaurant', 'food'], 
		bounds: new google.LatLngBounds(
			new google.LatLng(50.819520, -114.351196),
		 	new google.LatLng(51.208308, -113.843079)
		)
	};

	$scope.submitForm = function(valid) {
		var restaurant = $scope.result;
		var dow = _.keys(_.pickBy($scope.dow, _.identity)); // Get all truthy keys, and convert to Array
		var price = $scope.price;
		var unit = $scope.unit;	 
		var city = gPlaceToCity(restaurant);
		var isSupported = Listings.getSupportedCities(city);
		if(!restaurant || !dow.length || !price || !unit || !city || !isSupported) {
			$scope.hasErrors = true;
			$scope.errors.restraunt = !restaurant;
			$scope.errors.dow = !dow.length;
			$scope.errors.price = !price;
			$scope.errors.unit = !unit;
			$scope.errors.city = !city;
			$scope.errors.unsupported = !isSupported;
			return;
		}

		price = price.toFixed(2);
		var params = {
			name: restaurant.name,
			place_id: restaurant.place_id,
			dow: dow,
			price: price,
			unit: unit,
			city: city
		};
		
		Listings.addDeal(params);
		alert("Thank you for helping make Wings.cheap better! It's you who makes the app shine!");
	};
	
	$scope.autoCompleteCb = function(err, result) {
		console.info("Autocomplete Returned", result, "Located in", gPlaceToCity(result));
		if(result) {
			$scope.hasErrors = false;
			$scope.result = result;
		} else {
			$scope.result = null;
			$scope.restaurantName = '';
			$scope.hasErrors = true;
			$scope.errors.restraunt = true;
		}
	};
	
	function gPlaceToCity(gPlace) {
		if(gPlace && gPlace.address_components) {
			return Map.gPlaceAddressToCity(gPlace.address_components);
		}
		return null;
	}
});