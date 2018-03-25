angular.module('ResultScreen', [])
	.directive('listingResult', function($sce) {
		return {
			scope: {
				loaded: '=?',
				listing: '=',
				classes: '=',
				deal: '='
			},
			templateUrl: 'Components/ListingResult.html',
			controller: function($scope){
        // check if it was defined.  If not - set a default
        $scope.loaded = angular.isDefined($scope.loaded) ? $scope.loaded : true;
				
				$scope.$watch('listing', function(listing) {
					if(listing) {
						if(listing.formatted_phone_number) {
							listing.formatted_phone_number = listing.formatted_phone_number.replace(/[^0-9]/g, ''); // remove all characters but numbers
						}
						listing.adr_address_safe = $sce.trustAsHtml(listing.adr_address);
					}
				});
				$scope.$watch('deal', function(deal) {
					if(deal && deal.success && deal.total) {
						$scope.hasDeal = true;
					}
				});
      }
		};
	});