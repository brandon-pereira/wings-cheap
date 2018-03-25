app.controller('FeedbackScreen', function($stateParams, $scope, $http, $state, Listings) {
	
	var place_id = $scope.place_id = $stateParams.gPlace;
	var type = $stateParams.type === '1';
	var name = $stateParams.name;
	
	Listings.setLiked(place_id, type);
	
	// TODO: Move to actually using this view. Disabled for now.
	$state.go('Result', {id: place_id, name: name});

	
});