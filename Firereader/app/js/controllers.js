'use strict';

/* Controllers */

angular.module('myApp.controllers', ['firebase', 'feedTheFire'])

   .controller('LoginCtrl', ['$scope', 'authProviders', '$location', function($scope, authProviders) {
      $scope.providers = {};
      angular.forEach(authProviders, function(p) {
         $scope.providers[p.id] = angular.extend({preferred: $scope.auth.provider === p.id}, p);
      });

      $scope.$watch('auth.provider', setPreferred);
      setPreferred($scope.auth.provider);

      $scope.filteredProviders = function() {
         return _.filter($scope.providers, function(v,k) {
            return k !== $scope.auth.provider;
         });
      };

      $scope.colorMe = function(id) {
         var c;
         switch(id) {
            case 'facebook':
               c = 'btn-primary';
               break;
            case 'github':
               c = 'btn-inverse';
               break;
            case 'twitter':
               c = 'btn-info';
               break;
            case 'persona':
               c = 'btn-success';
               break;
            default:
               c = '';
         }
         return !$scope.preferred || $scope.preferred.id === id? c : '';
      };

      function setPreferred(provider) {
         $scope.preferred = provider? angular.extend({}, $scope.providers[provider]) : null;
         angular.forEach($scope.providers, function(p, k) {p.preferred = (k === provider)});
      }
   }])

   .controller('NavCtrl', ['$scope',  'localStorage', function($scope, localStorage) {
      //todo NavCtrl is attached to <body> tag, use a pseudo element to limit scope?
      $scope.showAbout = !localStorage.get('hideAbout');

      $scope.toggleAbout = function() {
         $scope.showAbout = !$scope.showAbout;
         localStorage.set('hideAbout', !$scope.showAbout);
      };

      $scope.dismissAbout = function() {
         $scope.showAbout = false;
         localStorage.set('hideAbout', true);
      };
   }])

   .controller('HearthCtrl', ['$scope', 'FeedManager', '$location', '$dialog', function($scope, FeedManager, $location, $dialog) {
      var feedMgr = new FeedManager($scope, $scope.auth.provider, $scope.auth.user);

      $scope.addFeed = function(feedId) {
         $scope.feeds[feedId] = feedMgr.fromChoice(feedId);
         $scope.startLoading();
         $location.search('feed', feedId);
      };

      $scope.removeFeed = function(feedId, $event) {
         $dialog.dialog({
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            templateUrl: 'partials/confirmDialog.html',
            controller: 'ConfirmDialogCtrl'
         }).open().then(function(confirmed) {
            if( confirmed ) {
               if( $scope.activeFeed === feedId ) {
                  $scope.activeFeed = null;
                  $location.replace();
                  $location.search('feed', null);
               }
               if( $event ) {
                  $event.preventDefault();
                  $event.stopPropagation();
               }
               feedMgr.removeFeed(feedId);
            }
         });
      };
   }])

   .controller('DemoCtrl', ['$scope', 'FeedManager', function($scope, FeedManager) {
      $scope.isDemo = true;
      new FeedManager($scope, 'demo', 'demo');
   }])

   .controller('ArticleCtrl', ['$scope', function($scope) {
      var $log = $scope.$log;

      var ABSOLUTE_WIDTH = 850;

      $scope.opts = {
         dialogClass: 'modal article'
      };

      $scope.open = function(article) {
         if( !article ) { $scope.close(); }
         else {
            $scope.article = article;
            setNext(article);
            setPrev(article);
            $scope.isOpen = true;
            resize();
            if( angular.element(window).width() <= ABSOLUTE_WIDTH ) {
               window.scrollTo(0,0);
            }
            $scope.markArticleRead(article);
         }
      };
      $scope.close = function() {
         $scope.isOpen = false;
      };

      $scope.closed = function() {
         $scope.article = null;
         $scope.isOpen = false;
      };


      // resize height of element dynamically
      var resize = _.debounce(function() {
         if( $scope.isOpen ) {
            var $article = angular.element('div.modal.article');
            var maxHeight = 'none';
            if( angular.element(window).width() > ABSOLUTE_WIDTH ) {
               var windowHeight = angular.element(window).height();
               var headHeight = $article.find('.modal-header').outerHeight() + $article.find('.modal-footer').outerHeight();
               maxHeight = (windowHeight * .8 - headHeight)+'px';
            }
            $article.find('.modal-body').css('max-height', maxHeight);
         }
      }, 50);

      function setNext(article) {
         var next = angular.element('#'+article.$id).next('article');
         $scope.next = next.length? $scope.articles.find(next.attr('id')) : null;
      }

      function setPrev(article) {
         var prev = angular.element('#'+article.$id).prev('article');
         $scope.prev = prev.length? $scope.articles.find(prev.attr('id')) : null;
      }

      angular.element(window).bind('resize', resize);

      $scope.$on('modal:article', function(event, article) {
         $scope.open(article);
      });

   }])

   .controller('CustomFeedCtrl', ['$scope', function($scope) {
      var $log = $scope.$log;
      $scope.isOpen = false;

      $scope.$on('modal:customFeed', function() {
         $scope.open();
      });

      $scope.open = function() {
         $scope.isOpen = true;
      };

      $scope.close = function() {
         $scope.isOpen = false;
      };

      $scope.add = function() {
         var auth = $scope.auth||{};
         $log.debug('addFeed', $scope.title, $scope.url);
         $scope.feedManager.addFeed($scope.title, $scope.url);
         $scope.close();
         $scope.title = null;
         $scope.url = null;
      };
   }])

   .controller('ConfirmDialogCtrl', ['$scope', 'dialog', function($scope, dialog) {
      $scope.close = function(result) {
         dialog.close(result);
      }
   }]);