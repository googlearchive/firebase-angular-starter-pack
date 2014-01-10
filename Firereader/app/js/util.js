/*! service.util.js
 *************************************/
(function (angular) {
   "use strict";

   var appUtils = angular.module('myApp.utils', []);

   /**
    * A simple utility to create Firebase URLs from a list of parameters
    * by joining them to the base URL for this instance (defined in FIREBASE_URL above)
    */
   appUtils.factory('fbUrl', ['FIREBASE_URL', function(URL) {
      /**
       * Any number of arguments may be passed into this function. They can be strings or arrays
       */
      return function() {
         var args = _.flatten(_.toArray(arguments));
         return URL + args.join('/');
      }
   }]);

   /**
    * Just a wrapper to create a Firebase reference based on a url and possible limit or startAt/endAt parms
    */
   appUtils.factory('fbRef', ['fbUrl', 'Firebase', function(fbUrl, Firebase) {
      // url can be an array or string
      return function(url, limit) {
         var ref = new Firebase(fbUrl(url));
         if( limit ){
            ref = ref.limit(limit);
         }
         return ref;
      }
   }]);

   /**
    * A utility to store variables in local storage, with a fallback to cookies if localStorage isn't supported.
    */
   appUtils.factory('localStorage', ['$log', function($log) {
      //todo should handle booleans and integers more intelligently?
      var loc = {
         /**
          * @param {string} key
          * @param value  objects are converted to json strings, undefined is converted to null (removed)
          * @returns {localStorage}
          */
         set: function(key, value) {
//               $log.debug('localStorage.set', key, value);
            var undefined;
            if( value === undefined || value === null ) {
               // storing a null value returns "null" (a string) when get is called later
               // so to make it actually null, just remove it, which returns null
               loc.remove(key);
            }
            else {
               value = angular.toJson(value);
               if( typeof(localStorage) === 'undefined' ) {
                  cookie(key, value);
               }
               else {
                  localStorage.setItem(key, value);
               }
            }
            return loc;
         },
         /**
          * @param {string} key
          * @returns {*} the value or null if not found
          */
         get: function(key) {
            var v = null;
            if( typeof(localStorage) === 'undefined' ) {
               v = cookie(key);
            }
            else {
               //todo should reconstitute json values upon retrieval
               v = localStorage.getItem(key);
            }
            return angular.fromJson(v);
         },
         /**
          * @param {string} key
          * @returns {localStorage}
          */
         remove: function(key) {
//               $log.debug('localStorage.remove', key);
            if( typeof(localStorage) === 'undefined' ) {
               cookie(key, null);
            }
            else {
               localStorage.removeItem(key);
            }
            return loc;
         }
      };

      //debug just a temporary tool for debugging and testing
      angular.resetLocalStorage = function() {
         $log.info('resetting localStorage values');
         _.each(['authUser', 'authProvider', 'sortBy'], loc.remove);
      };

      return loc;
   }]);

   /**
    * A diff utility that compares arrays and returns a list of added, removed, and updated items
    */
   appUtils.factory('listDiff', [function() {
      function _map(list, hashFn) {
         var out = {};
         _.each(list, function(x) {
            out[ hashFn(x) ] = x;
         });
         return out;
      }

      function diff(old, curr, hashFn) {
         var out = {
            count: 0,
            added: [],
            removed: []
         };

         if( !old && curr ) {
            out.added = curr.slice(0);
         }
         else if( !curr && old ) {
            out.removed = old.slice(0);
         }
         else if( hashFn ) {
            //todo this could be more efficient (it's possibly worse than o(n) right now)
            var oldMap = _map(old, hashFn), newMap = _map(curr, hashFn);
            out.removed = _.filter(oldMap, function(x,k) { return !_.has(newMap, k); });
            out.added = _.filter(newMap, function(x,k) { return !_.has(oldMap, k); });
         }
         else {
            // these don't work for angularFire because it returns different objects in each set and === is used to compare
            out.removed = _.difference(old, curr);
            out.added = _.difference(curr, old);
         }
         out.count = out.removed.length + out.added.length;
         return out;
      }

      return {
         diff: diff,
         watch: function($scope, varName, callback, hashFn) {
            //todo add a dispose method
            return $scope.$watch(varName, function(newVal, oldVal) {
               var out = diff(oldVal, newVal, hashFn);
//                  console.log('listDiff', out);
               if( out.count ) {
                  callback(out);
               }
            }, true);
         }
      };
   }]);

   /**
    * A diff utility that compares objects (only one level deep) and returns a list
    * of added, removed, and updated elements.
    */
   appUtils.factory('treeDiff', function() {
      return function($scope, variableName) {
         var orig = copy($scope[variableName]);
         var listeners = [];

         function copy(orig) {
            var cloned = {};
            orig && _.each(orig, function(v,k) {
               cloned[k] = _.isArray(v)? v.slice(0) : (_.isObject(v)? _.clone(v) : v);
            });
            return cloned;
         }


         function update(newVal) {
            newVal || (newVal = {});
            var changes = diff(orig, newVal);
            if( changes.count ) {
               notify(changes, newVal, orig);
               orig = copy(newVal);
            }
         }

         function diff(orig, updated) {
            var newKeys = _.keys(updated), oldKeys = _.keys(orig);
            var removed = _.difference(oldKeys, newKeys);
            var added = _.difference(newKeys, oldKeys);
            var union = _.union(newKeys, oldKeys);

            var changes = {
               count: removed.length+added.length,
               added: added,
               removed: removed,
               updated: []
            };

            _.each(union, function(k) {
               if( !_.isEqual(orig[k], updated[k]) ) {
                  changes.updated.push(k);
                  changes.count++;
               }
            });

            return changes;
         }

         function notify(changes, newVal, orig) {
            _.each(listeners, function(fn) { fn(changes, newVal, orig); });
         }

         $scope.$watch(variableName, update, true);

         return {
            orig: function() {
               return orig;
            },
            diff: diff,
            watch: function(callback) {
               listeners.push(callback);
            }
         }
      }
   });

   appUtils.factory('feedUrl', ['FIREBASE_URL', 'FB_DEMO_LIMIT', 'FB_LIVE_LIMIT', 'Firebase', '$rootScope', function(URL, DEMO_LIMIT, LIVE_LIMIT, Firebase, $rootScope) {
      return function(opts, isDemo) {
         var path, limit = isDemo? DEMO_LIMIT : LIVE_LIMIT;
         opts = _.extend({id: null, isCustom: false}, opts);
         var feedId = opts.id || new Firebase(URL).push().name();
         var auth = $rootScope.auth || {};
         if( opts.isCustom ) {
            path = URL + ['user', auth.provider, auth.user, 'feeds', feedId, 'articles'].join('/');
         }
         else {
            path = 'https://feeds.firebaseio.com/'+feedId+'/articles';
         }
         return [new Firebase(path).limit(limit), feedId];
      }
   }]);

   appUtils.factory('readUrl', ['FIREBASE_URL', 'Firebase', '$rootScope', function(URL, Firebase, $rootScope) {
      return function(opts, isDemo) {
         if( isDemo ) { return null; }
         var feedId = opts.id;
         var path = URL + ['user', $rootScope.auth.provider, $rootScope.auth.user, 'read', feedId].join('/');
         return new Firebase(path).limit(250);
      }
   }]);

   appUtils.factory('updateScope', ['$timeout', '$parse', function($timeout, $parse) {
      return function(scope, name, val, cb) {
         $timeout(function() {
            $parse(name).assign(scope, val);
            cb && cb();
         });
      }
   }]);

   function cookie(key, value, options) {
      // key and at least value given, set cookie...
      if (arguments.length > 1 && String(value) !== "[object Object]") {
         options = angular.extend({ path: '/', expires: 365 }, options);

         if (value === null || value === undefined) {
            options.expires = -1;
         }

         if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
         }

         value = String(value);

         return (document.cookie = [
            encodeURIComponent(key), '=',
            options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
         ].join(''));
      }

      // key and possibly options given, get cookie...
      options = value || {};
      var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
      return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
   }

})(angular);