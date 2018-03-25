app.factory('Map', function($q, google, _) {
	
	var settings = {
	 center: { city: 'CALGARY', lat: 51.0486, lng: -114.0708, default: true }, 
	 currentLocationSettings: {
		currentLocation: true,
		icon: {
			// shoutout to https://github.com/ChadKillingsworth/geolocation-marker
			url: 'images/currentLocation.png',
			size: new google.Size(34, 34),
			scaledSize: new google.Size(17, 17),
			origin: new google.Point(0, 0),anchor: new google.Point(8, 8)
		},
		zIndex: google.Marker.MAX_ZINDEX + 1
	 },
	 zoom: 12
	};
	var map = null;
	var markers = [];
	var currentMapPosition = null;
	var currentLocation = null;
	var currentLocationMarker = null;
	
	/**
	* Function to intiialze map
	*/
	var init = function() {
		var def = $q.defer();
		if(!getMap()) {
			console.info("Maps: Initializing Map");
			map = new google.Map(document.getElementById('map'), {
			 center: settings.center,
		   clickableIcons: false,
			 zoom: 15
			});
			def.resolve();
			getCurrentGeolocation().then(
				function success(coords) {
					console.info("Maps: Got user location", coords);
					addMarker(coords.lat, coords.lng, settings.currentLocationSettings);	
				},
				function error() {
					console.error("Maps: User location rejected");
					def.reject();
				}	
			);
		} else {
			def.resolve({});
		}
		return def.promise;
	};

	/**
	 * Function to add a new marker to map and keep a reference to that marker.
	 * @param {Number} lat     Latitude of marker
	 * @param {Number} lng     Longitude of marker
	 * @param {Object} options Additional options to extend into marker (see Google Maps Marker options)
	 * @param {Function} clickHandler Function to execute after clicking on marker
	 */
	var addMarker = function (lat, lng, options, cb) {
		options = options ? options : {};
		var marker = new google.Marker(angular.extend({}, {
			 map: map,
			 position: {lat: lat, lng: lng}
		 }, options));
		 if(cb) {
			 var handler = function() {
				 cb(marker);
			 };
			 marker.addListener('click', handler); 
		 }
		 if(options && !options.currentLocation) {
			 markers.push(marker);			 
		 } else if(options.currentLocation) {
			 currentLocationMarker = marker;
		 }
	};
	
	var clearMarker = function() {
		console.info("Maps: Clearing all markers");
		for(var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		markers = [];
	};
	
	/**
	 * Function to fit all markers inside map viewport.
	 * Based off http://stackoverflow.com/questions/19304574/center-set-zoom-of-map-to-cover-all-visible-markers
	 */
	var fitMarkers = function() {
		var bounds = new google.LatLngBounds();
		if(currentLocationMarker) {
			bounds.extend(currentLocationMarker.getPosition());			
		}
		for (var i = 0; i < markers.length; i++) {
		 bounds.extend(markers[i].getPosition());
		}
		currentMapPosition = 'FIT';
		map.getStreetView().setVisible(false);
		map.fitBounds(bounds);
		// http://stackoverflow.com/questions/20861402/markers-not-showing-until-map-moved-slightly-or-clicked
		google.event.addListener(map, 'zoom_changed', function() {
	    setTimeout(function() {
	        var cnt = map.getCenter();
	        cnt.e+=0.000001;
	        map.panTo(cnt);
	        cnt.e-=0.000001;
	        map.panTo(cnt);
	    },400);
		});
	};
	
	var goToLatLng = function(lat, lng, zoom, options) {
		console.info("Maps: Going to lat:lng of", lat, lng);
		currentMapPosition = {'lat': lat, 'lng': lng};
		map.getStreetView().setVisible(false);
		map.panTo(currentMapPosition);
		if(zoom) {
			map.setZoom(zoom);
		}
	};
	
	/**
	 * Method to return current google map object 
	 * @return Google Map object or null of not initialzed
	 */
	var getMap = function() { 
		return map;
	};
	
	/**
	 * Function to get current userlocation.
	 * @returns {Promise} def 	Resolves with Object containing lat and 
	 *                         	lng or rejects if not available.
	 */
	var getCurrentGeolocation = function() {
		var def = $q.defer();
		if(currentLocation) {
			def.resolve(currentLocation);
			return def.promise;
		}
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(location) {
				getCityFromLatLng(location.coords.latitude, location.coords.longitude).then(function(city) {
					currentLocation = {
						lat: location.coords.latitude,
						lng: location.coords.longitude,
						city: city
					};
					def.resolve(currentLocation);
				});
			}, function(error) {
				console.error("MapsService: Current locaton declined", error);
				currentLocation = settings.center;
				currentLocation.error = 'DECLINED';
				def.resolve(currentLocation);
			});
		} else {
			console.error("MapsService: Current location not supported");
			currentLocation = settings.center;
			currentLocation.error = 'UNSUPPORTED_BROWSER';
			def.resolve(currentLocation);
		}
		return def.promise;
	};
	
	/**
	 * Function to convert a lat lng to a city. 
	 * @param  {Float}	lat 
	 * @param  {Float}	lng
	 * @return {Defer}  city
	 */
	var getCityFromLatLng = function(lat, lng) {
		var latlng = new google.LatLng(lat, lng);
		var geocoder = new google.Geocoder();
		var def = $q.defer();
		geocoder.geocode({'latLng': latlng}, function(results, status) {
		 if (status == google.GeocoderStatus.OK) {
			 if (results[0] && results[0].address_components) {
				 var city = gPlaceAddressToCity(results[0].address_components);
				 def.resolve(city);
			 }
		 } else {
			 def.reject("Maps: Can't find location", results, status);
		 }
	 });
	 return def.promise;
	};

	/**
	 * Triggers resize on map.
	 * Shoutout to http://stackoverflow.com/questions/17059816/google-maps-v3-load-partially-on-top-left-corner-resize-event-does-not-work
	 * @return {[type]} [description]
	 */
	var triggerResize = function() {
		if(map) {
			google.event.addListenerOnce(map, 'idle', function() {
				google.event.trigger(map, 'resize');
				if(currentMapPosition) {
					if(currentMapPosition === 'FIT') {
						fitMarkers();
					} else if(currentMapPosition.lat && currentMapPosition.lng) {
						goToLatLng(currentMapPosition.lat, currentMapPosition.lng);
					}
				}
			});	
		}
	};
	
	/**
	 * Function to get the distance between two latlng objects.
	 * @param  {Object} a object containing lat and lng.
	 * @param  {Object} b object containing lat and lng.
	 * @return {Number}   the distance
	 */
	var getDistanceBetweenMarkers = function(a, b) {
		a = new google.LatLng(a);
		b = new google.LatLng(b);
		return google.geometry.spherical.computeDistanceBetween(a, b);
	};
	
	/** 
	 * Function to convert a address_components object (returned from
	 * Google Places API) to a city.
	 * @param  {Object}	address_components GPlaces address
	 * @return {Defer}                               
	 */
	var gPlaceAddressToCity = function(address_components) {
		if(address_components && address_components.length) {
			var city_object = _.find(address_components, function(o) {
				return _.indexOf(o.types, 'locality') === 0;
			});
			if(city_object && city_object.long_name) {
				return city_object.long_name.toUpperCase();
			}
		}
		return null;
	};

	return {
		init: init,
		gPlaceAddressToCity: gPlaceAddressToCity,
		getDistanceBetweenMarkers: getDistanceBetweenMarkers,
		getCurrentGeolocation: getCurrentGeolocation,
		fitMarkers: fitMarkers,
		getMap: getMap,
		addMarker: addMarker,
		goToLatLng: goToLatLng,
		clearMarker: clearMarker,
		triggerResize: triggerResize
	};
	
});