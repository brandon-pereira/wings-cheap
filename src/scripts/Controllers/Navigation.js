app.controller('Navigation', function ($scope, $rootScope) {
	var config = {
		pageTitles: {
			'AddDeal': 'Add New Deal',
			'Feedback': 'Add Feedback',
			'Result': 'Result',
			'default': 'Wings.cheap'
		},
		hideMapOn: [
			'AddDeal',
			'Feedback'
		],
		largeMapOn: [
			'Result'
		]
	};
	var prevPages = [];
	
	// Set Default Values
	$scope.homepage = true;
	$scope.pageTitle = config.pageTitles.default;
	
	$rootScope.$on('$stateChangeSuccess', function(event, state, params, fromState, fromParams){
		console.info("Navigation: Received updated route", state, params);
		setCurrentPage(state.name, params);
	});
	
	var setCurrentPage = function(id, params) {
		$scope.homepage = (id === 'Home');
		$scope.pageTitle = config.pageTitles[id] || config.pageTitles.default;
		if(params && params.name) {
			$scope.pageTitle = $scope.pageTitle + ': ' + params.name;
		}
		if(config.hideMapOn.indexOf(id) !== -1) {
			$rootScope.$emit('map:hide');
		} else {
			if(config.largeMapOn.indexOf(id) !== -1) {
				$rootScope.$emit('map:showExpanded');
			} else {
				$rootScope.$emit('map:show');				
			}
		}
	};

}).directive('navigation', function() {
	return {
		templateUrl: 'Components/Navigation.html'
	};
});