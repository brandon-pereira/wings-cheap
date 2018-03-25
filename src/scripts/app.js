var app = angular.module('app', ['templates', 'HomeScreen', 'ResultScreen', 'ui.router', 'ngPlacesAutocomplete']);

app.constant('_', window._);
app.constant('config', {
		serverLocation: '/api'
});

app.factory('google', function($window) {
	if($window.google && $window.google.hasOwnProperty('maps'))
		return $window.google.maps;
	else return {};
});

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/Home");
  
  $stateProvider
    .state('Home', {
      url: "/Home",
      templateUrl: "Pages/HomeScreen.html",
      controller: 'HomeScreen'
    })
    .state('AddDeal', {
      url: "/AddDeal",
      templateUrl: "Pages/AddDealScreen.html",
			controller: 'AddDealScreen'
    })
    .state('Feedback', {
      url: "/Feedback/:name/:type/:gPlace",
      templateUrl: "Pages/FeedbackScreen.html",
			controller: 'FeedbackScreen'
    })
    .state('Result', {
      url: "/Result/:name/:id",
      templateUrl: "Pages/ResultScreen.html",
			controller: 'ResultScreen'
    });
});

(function() {
	if (window.navigator.userAgent.indexOf('iPhone') !== -1) {
    if (window.navigator.standalone === true) {
      document.querySelector("body").classList.add('ios-app');
    }
	}
})();