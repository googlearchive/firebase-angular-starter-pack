(function() {
   'use strict';

   var isAuthenticated = false;
   var dependencyModules = ['ngSanitize', 'ui.bootstrap', 'ui.keypress'];
   var myAppComponents = ['myApp.utils', 'myApp.animate', 'myApp.config', 'myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers'];

   // Declare app level module which depends on filters, and services
   angular.module('myApp', dependencyModules.concat(myAppComponents))

      /** ROUTING
       ***************/
      .config(['$routeProvider', function($routeProvider) {
         $routeProvider.when('/hearth', {
            templateUrl: 'partials/hearth.html',
            controller: 'HearthCtrl',
            authRequired: true,
            reloadOnSearch: false
         });
         $routeProvider.when('/demo', {
            templateUrl: 'partials/hearth.html',
            controller: 'DemoCtrl',
            authRequired: false,
            reloadOnSearch: false
         });
         $routeProvider.when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl',
            authRequired: false
         });

         //isAuthenticated is set below in the .run() command
         $routeProvider.otherwise({redirectTo: function() { return isAuthenticated? '/hearth' : '/demo'; }});
      }])

      /** AUTHENTICATION
       ***************/
      .run(['$rootScope', 'authManager', function($rootScope, authManager) {
         $rootScope.login = authManager.login;
         $rootScope.logout = authManager.logout;
      }])

      /** LOAD LIST OF FEEDS
       ***************/
      .run(['$rootScope', 'angularFireCollection', 'fbRef', function($rootScope, angularFireCollection, fbRef) {
         // use angularFireCollection because this list should be read-only, and it should be filterable
         // by using | filter command, which doesn't work with key/value iterators
         $rootScope.feedChoices = angularFireCollection(fbRef('meta'));
      }])

      /** ROOT SCOPE AND UTILS
       *************************/
      .run(['$rootScope', '$location', '$log', function($rootScope, $location, $log) {
         $rootScope.$log = $log;

         $rootScope.keypress = function(key, $event) {
            $rootScope.$broadcast('keypress', key, $event);
         };

         // this can't be done inside the .config() call because there is no access to $rootScope
         // so we hack it in here to supply it to the .config routing methods
         $rootScope.$watch('auth.authenticated', function() {
            isAuthenticated = $rootScope.auth.authenticated;
         });

         //todo make this a service?
         $rootScope.redirectPath = null;
         $rootScope.$on('$routeUpdate', function(event, next, current) {
            $rootScope.activeFeed = next.params.feed || false;
            next.scope && (next.scope.activeFeed = next.params.feed||false);
         });

         $rootScope.$on("$routeChangeStart", function (event, next, current) {
            $rootScope.activeFeed = next.params.feed || false;
            next.scope && (next.scope.activeFeed = next.params.feed||false);
         });
      }]);

})();
