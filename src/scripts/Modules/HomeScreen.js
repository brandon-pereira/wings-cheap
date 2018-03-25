angular.module('HomeScreen', [])
	.directive('map', function() {
		return {
			controller: 'MapController',
			templateUrl: 'Components/Map.html',
			link: function(scope, element) {
				scope.$watch('hidden', function(hidden) {
					if(hidden) {
						element.addClass('hidden');	
					} else {
						element.removeClass('hidden');
					}
				});
			}
		};
	}).directive('listingList', function() {
		return {
			scope: {
				listing: '=',
				index: '='
			},
			templateUrl: 'Components/ListingList.html'
		};
	}).directive('filtersScreen', function() {
		return {
			restrict: 'E',
			scope: {
				city: '=',
				visible: '=',
				onSubmit: '&',
				cities: '=',
				dow: '=',
				sortBy: '='
			},
			link: function(scope, element) {
				scope.$watch('visible', function(visible) {
					if(visible) {
						element.addClass('visible');
					} else {
						element.removeClass('visible');
					}
				});
			},
			templateUrl: 'Components/Filters.html'
		};
	}).directive('rippleEffect', function($timeout) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				var timeout;
				var ripples = [];
				element.bind("click", function(e) {
					// e.preventDefault();
					var $el = element;
					var position = element[0].getBoundingClientRect();
					xPos = event.pageX - position.left;
  				yPos = event.pageY - position.top;
					var ripple = angular.element('<div/>');
					ripples.forEach(function(existingRipple) {
					 	existingRipple.css({
 							height: position.height + 'px',
 							width: position.width + 'px'
 						});	
					});
					ripples.push(ripple);
					ripple.css({
						top: yPos + 'px',
						left: xPos + 'px'
					});
					ripple.addClass('ripple-effect');
					element.append(ripple);
					if(timeout) $timeout.cancel(timeout);
					timeout = $timeout(function() {
					 	ripples.forEach(function(ripple) {
							ripple.remove();
						});
					}, 200);
				});
			}
		};
	});