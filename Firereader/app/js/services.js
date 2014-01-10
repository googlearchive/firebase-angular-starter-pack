(function(angular) {
   "use strict";
   var appServices = angular.module('myApp.services', ['myApp.utils']);

   /**
    * A service that authenticates against Fireabase using simple login
    */
   appServices.factory('authManager', ['$rootScope', 'fbRef', 'angularFireAuth', 'authScopeUtil', function($rootScope, fbRef, angularFireAuth, authScopeUtil) {
      authScopeUtil($rootScope);

      angularFireAuth.initialize(fbRef(), {
         scope: $rootScope,
         name: 'user',
         path: '/login'
      });

      // provide some convenience methods to log in and out
      return {
         login: function(providerId) {
            angularFireAuth.login(providerId, { rememberMe: true, scope: 'email'});
         },

         logout: function() {
            angularFireAuth.logout();
         }
      };
   }]);

   /**
    * A simple utility to monitor changes to authentication and set some scope values
    * for use in bindings and directives
    */
   appServices.factory('authScopeUtil', ['$log', 'updateScope', 'localStorage', '$location', function($log, updateScope, localStorage, $location) {
      return function($scope) {
         $scope.auth = {
            authenticated: false,
            user: null,
            name: null,
            provider: localStorage.get('authProvider')
         };

         $scope.$on('angularFireAuth:login', _loggedIn);
         $scope.$on('angularFireAuth:error', function(err) {
            $log.error(err);
            _loggedOut();
         });
         $scope.$on('angularFireAuth:logout', _loggedOut);

         function parseName(user) {
            switch(user.provider) {
               case 'persona':
                  return (user.id||'').replace(',', '.');
               default:
                  return user.id;
            }
         }

         function _loggedIn(evt, user) {
            localStorage.set('authProvider', user.provider);
            $scope.auth = {
               authenticated: true,
               user: user.id,
               name: parseName(user),
               provider: user.provider
            };
            updateScope($scope, 'auth', $scope.auth, function() {
               if( !($location.path()||'').match('/hearth') ) {
                  $location.path('/hearth');
               }
            });
         }

         function _loggedOut() {
            $scope.auth = {
               authenticated: false,
               user: null,
               name: null,
               provider: $scope.auth && $scope.auth.provider
            };
            updateScope($scope, 'auth', $scope.auth, function() {
               $location.search('feed', null);
               $location.path('/demo');
            });
         }
      }
   }]);

   /**
    * A common set of controller logic used by DemoCtrl and HearthCtrl for managing
    * scope and synching feeds and articles with Firebase
    */
   appServices.factory('FeedManager', ['feedChangeApplier', 'feedScopeUtils', 'feedTheFire', '$timeout', '$location', function(feedChangeApplier, feedScopeUtils, feedTheFire, $timeout, $location) {
      return function($scope, provider, userId) {
         var inst = {
            getFeeds: function() {
               return $scope.feeds;
            },
            fromChoice: function(choiceOrId) {
               var choice = angular.isObject(choiceOrId)? choiceOrId : findChoice(choiceOrId);
               return {
                  title: choice.title,
                  id: choice.$id,
                  last: Date.now()
               };
            },
            removeFeed: function(feedId) {
               var auth = $scope.auth||{};
               var f = $scope.feeds[feedId];
               if( f ) {
                  delete $scope.feeds[feedId];
                  f.isCustom && feedTheFire.remove(auth.provider, auth.user, feedId);
                  //todo remove read articles as well
               }
            },
            addFeed: function(title, url) {
               // create a custom feed
               var auth = $scope.auth||{};
               $scope.startLoading();
               feedTheFire.add(auth.provider, auth.user, url, function(error, id) {
                  if( error ) {
                     $scope.$log.error(error);
                     alert(error);
                  }
                  else {
                     $timeout(function() {
                        $scope.feeds[id] = {
                           id: id,
                           title: title,
                           last: Date.now(),
                           isCustom: true
                        };
                        $location.search('feed', id);
                     })
                  }
               });
            },
            getFeed: function(feedId) {
               return $scope.getFeed(feedId);
            },
            baseLink: _.memoize(function(feedId) {
               return findChoice(feedId).link;
            })
         };

         var findChoice = _.memoize(function(feedId) {
            return _.find($scope.feedChoices, function(f) { return f.$id === feedId })||{};
         });

         $scope.feedManager = inst;

         feedScopeUtils($scope, provider, userId);
         feedChangeApplier($scope, inst, provider, userId);

         return inst;
      }
   }]);

   /**
    * Some straightforward scope methods for dealing with feeds and articles; these have no dependencies
    */
   appServices.factory('feedScopeUtils', ['localStorage', '$timeout', 'angularFire', 'fbRef', function(localStorage, $timeout, angularFire, fbRef) {
      return function($scope, provider, userId) {
         $scope.noFeeds = true;
         $scope.showRead = false;
         $scope.loading = true;

         //todo snag this from $location?
         $scope.link = $scope.isDemo? 'demo' : 'hearth';

         $scope.getFeed = function(feedId) {
            return $scope.feeds[feedId]||{};
         };

         $scope.isActive = function(feedId) {
            return $scope.activeFeed === feedId;
         };

         $scope.showAllFeeds = function() {
            return !$scope.activeFeed;
         };

         $scope.openFeedBuilder = function($event) {
            $event && $event.preventDefault();
            $scope.$broadcast('modal:customFeed');
         };

         $scope.openArticle = function(article, $event) {
            if( $event ) { $event.preventDefault(); $event.stopPropagation(); }
            $scope.$broadcast('modal:article', article);
         };

         $scope.filterMethod = function(article) {
            return passesFilter(article) && notRead(article) && activeFeed(article);
         };

         $scope.orderMethod = function(article) {
            var v = article[$scope.sortField];
            return $scope.sortDesc? 0 - parseInt(v) : parseInt(v);
         };

         $scope.markArticleRead = function(article, $event) {
            if( $scope.isDemo ) { return; }
            if( $event ) { $event.preventDefault(); $event.stopPropagation(); }
            var f = article.feed;
            if( !_.has($scope.readArticles, article.feed) ) {
               $scope.readArticles[f] = {};
            }
            $scope.readArticles[f][article.$id] = Date.now();
         };

         $scope.markFeedRead = function(feedId, $event) {
            if( $event ) { $event.preventDefault(); $event.stopPropagation(); }
            angular.forEach($scope.articles, function(article) {
               if( article.feed === feedId ) { $scope.markArticleRead(article); }
            });
         };

         $scope.markAllFeedsRead = function($event) {
            if( $event ) { $event.preventDefault(); $event.stopPropagation(); }
            angular.forEach($scope.feeds, function(feed) {
               $scope.markFeedRead(feed.id, $event);
            });
         };

         $scope.noVisibleArticles = function() {
            return !$scope.loading && !$scope.noFeeds && countActiveArticles() === 0;
         };

         var to;
         $scope.startLoading = function() {
            $scope.loading = true;
            to && clearTimeout(to);
            to = $timeout(function() {
               $scope.loading = false;
            }, 4000);
         };

         $scope.sortField = 'date';

         $scope.$watch('sortDesc', function() {
            //todo store in firebase
            localStorage.set('sortDesc', $scope.sortDesc);
         });

         $scope.sortDesc = !!localStorage.get('sortDesc');

         // 2-way synchronize of the articles this user has marked as read
         $scope.readArticles = {};
         $scope.isDemo || angularFire(fbRef(['user', provider, userId, 'read'], 250), $scope, 'readArticles');

         function passesFilter(article) {
            if(_.isEmpty($scope.articleFilter)) {
               return true;
            }
            var txt = ($scope.articleFilter||'').toLowerCase();
            return _.find(article, function(v,k) {
               return !!(v && (v+'').toLowerCase().indexOf(txt) >= 0);
            });
         }

         function notRead(article) {
            return $scope.showRead || !_.has($scope.readArticles, article.feed) || !_.has($scope.readArticles[article.feed], article.$id);
         }

         function activeFeed(article) {
            return !$scope.activeFeed || $scope.activeFeed === article.feed;
         }

         function countActiveArticles() {
            if( $scope.activeFeed ) {
               return $scope.counts[$scope.activeFeed] || 0;
            }
            else {
               return _.reduce($scope.counts, function(memo, num){ return memo + num; }, 0);
            }
         }
      }
   }]);

   /**
    * A change listener that updates the feedManager and articleManager, as well as
    * making some minor scope manipulations
    */
   appServices.factory('feedChangeApplier', ['$log', 'ArticleManager', 'treeDiff', 'fbRef', 'angularFire', '$timeout', '$location',
      function($log, ArticleManager, treeDiff, fbRef, angularFire, $timeout, $location) {
         return function($scope, feedManager, provider, userId) {
            var articleManager = new ArticleManager(feedManager, $scope);
            $scope.feeds = {};

            // treeDiff gives a change list for the feeds object
            treeDiff($scope, 'feeds').watch(changed);

            function changed(changes, newVals, orig) {
               _.each(['added', 'updated', 'removed'], function(type) {
                  _.each(changes[type], function(key) {
                     var feed = type === 'removed'? orig[key] : newVals[key];
                     switch(type) {
                        case 'removed':
                           articleManager.removeFeed(feed);
                           break;
                        case 'added':
                           articleManager.addFeed(feed);
                           break;
                        default:
                        // do nothing
                     }
                  });
               });
               $scope.noFeeds = _.isEmpty($scope.feeds);
            }

            var userRef = fbRef(['user', provider, userId, 'list']);
            if( userId === 'demo' && provider === 'demo' ) {
               // read only
               userRef.once('value', function(ss) {
                  $timeout(function() {
                     $scope.feeds = ss.val();
                     $scope.loading = false;
                  })
               });
            }
            else {
               // 2-way synchronize of the list of feeds this user has picked
               angularFire(userRef, $scope, 'feeds').then(function() {
                  var feed = ($location.search()||{}).feed;
                  if( feed && !($scope.feeds||{})[feed] ) {
                     $location.replace();
                     $location.search(null);
                  }
                  $scope.startLoading();
               });
            }
         }
      }]);

   appServices.factory('ArticleManager', ['angularFireAggregate', 'articleFactory', 'feedUrl', 'readUrl', function(angularFireAggregate, articleFactory, feedUrl, readUrl) {
      return function(feedManager, $scope) {
         var feeds = {};

         $scope.counts = {};
         $scope.articles = angularFireAggregate($scope, { factory: articleFactory(feedManager) });
         $scope.readArticles = {};

         $scope.articles.on('added', incFeed);
         $scope.articles.on('removed', decFeed);
         angular.forEach(feedManager.getFeeds(), initFeed);

         function incFeed(article) {
            $scope.counts[article.feed]++;
            if( $scope.loading ) {
               $scope.loading = false;
               $scope.$apply();
            }
         }

         function decFeed(article) {
            $scope.counts[article.feed] = Math.max(0, $scope.counts[article.feed]-1);
         }

         function initFeed(feed) {
            if( !_.has(feeds, feed.id)) {
               feeds[feed.id] = $scope.articles.addPath(feedUrl(feed, $scope.isDemo), readUrl(feed, $scope.isDemo));
               $scope.counts[feed.id] = 0;
            }
         }

         function removeFeed(feed) {
            var id = angular.isString(feed)? feed : feed.id;
            feeds[id] && feeds[id].dispose();
            delete feeds[id];
         }

         $scope.feedName = function(article) {
            return feedManager.getFeed(article.feed).title || article.feed;
         };

         return {
            on: $scope.articles.on,
            addFeed: initFeed,
            removeFeed: removeFeed
         }
      }
   }]);

   /**
    * A simple Factory pattern to create the article objects from JSON data
    */
   appServices.factory('articleFactory', [function() {
      //todo move to an article parser service
      function fixRelativeLinks(txt, baseUrl) {
         if( !baseUrl ) { return txt; }
         return txt.replace(/(href|src)=(['"])([^'"]+)['"]/g, function(match, p1, p2, p3) {
            if( !p3.match(/^(mailto:|[a-z][-a-z0-9\+\.]*:\/\/)/) ) {
               match = p1 + '=' + p2 + _prefix(baseUrl, p3) + p2;
            }
            return match;
         });
      }

      function _prefix(base, url) {
         while(url.match(/^..\//)) {
            url = url.substr(3);
            base = base.replace(/[^/]+\/$/, '');
         }
         return base+url.replace(/^\//, '');
      }

      // we use a custom article factory because Angular becomes very slow when a Firebase reference
      // is included in the object; $scope.$watch becomes completely unstable and results in recursion errors;
      // so don't include any of that in our objects; also gives us a chance to parse dates and such
      return function(feedManager) {
         return function(snapshot, index) {
            var out = _.extend({
               feed: snapshot.ref().parent().parent().name()
            }, _.pick(snapshot.val(), 'title', 'description', 'summary', 'link', 'date'));
            var baseLink = feedManager.baseLink(out.feed);
            out.date = new Date(out.date).getTime();
            out.summary = fixRelativeLinks(out.summary || out.description, baseLink);
            out.description = fixRelativeLinks(out.description, baseLink);
            return out;
         }
      };
   }]);

})(angular);
