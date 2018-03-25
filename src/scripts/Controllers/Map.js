app.controller('MapController', function($scope, $rootScope, $timeout, Map, $window) {
	$scope.MapLoaded = false;
	$scope.hidden = false;
	
	/**
	 * Function to kick off the MapController. This is a self-invoking function
	 * which will listen for document ready. This is useful to ensure Google Maps
	 * has been fully initialzed. We also do a setTimeout so it can finish compiling
	 * itself.
	 * @return {[type]} [description]
	 */
	var init = function() {
		angular.element(document).ready(function() {
			if(!$scope.hidden) {
				$timeout(function () {
					initializeMap();
				});	
			}
		});
	}();
	
	/**
	 * Public calls to show or hide the map.
	 */
	 $rootScope.$on('map:hide', function() {
		$scope.hidden = true;
	});
	$rootScope.$on('map:show', function() {
		if($scope.hidden) {
			$scope.hidden = false;
			if(!$scope.MapLoaded) initializeMap();
		}
		if($scope.expanded) {
			$scope.expanded = false;
			Map.triggerResize();	
		}
	});
	$rootScope.$on('map:showExpanded', function () {
		$scope.hidden = false;
		if(!$scope.expanded) {
			$scope.expanded = true;
			Map.triggerResize();
		}
	});
	
	var initializeMap = function() {
		Map.init().then(function() {
			console.info("MapController: Map Initialized");
				$scope.MapLoaded = true;
		});
	};
	
	var _debounce;
	angular.element($window).bind('resize', function() {
		if(_debounce) $timeout.cancel(_debounce);
		_debounce = $timeout(function() {
			Map.triggerResize();
		}, 200);
	});
});