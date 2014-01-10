/*! service.feedthefire.js
 *************************************/
(function(angular) {
   "use strict";

   var service = angular.module('feedTheFire', []);

   service.factory('feedTheFire', ['Firebase', 'FIREBASE_URL', '$log', function(Firebase, URL, $log) {

      function buildUrl() {
         return URL + _.toArray(arguments).join('/');
      }

      return {
         add: function(provider, userId, feedUrl, callback) {
            var url = buildUrl('user', provider, userId, 'feeds');
            $log.debug('feedTheFire.add', url, provider, userId, feedUrl, callback);
            var ref = new Firebase(url).push();
            ref.set({
               firebase: ref.toString(),
               url: feedUrl
            }, function(error) {
               callback(error, ref.name());
            });
         },
         remove: function(provider, userId, feedId) {
            new Firebase(buildUrl('user', provider, userId, 'feeds', feedId)).remove();
         }
      }
   }]);

})(angular);