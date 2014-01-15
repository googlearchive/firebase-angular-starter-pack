angular.module('chatRoom', ['ionic', 'chatRoom.services', 'chatRoom.filters', 'chatRoom.controllers', 'firebase'])

.config(function ($compileProvider){
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('Home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'RoomListCtrl'
  });

  $stateProvider.state('roomsId', {
    url: '/rooms/:roomId',
    templateUrl: 'templates/room.html',
    controller: 'RoomCtrl'
  });

  $stateProvider.state('newRoom', {
    url: '/new',
    templateUrl: 'templates/new_room.html',
    controller: 'RoomCreateCtrl'
  });

  
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');

});

