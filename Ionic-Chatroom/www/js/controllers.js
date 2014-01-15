angular.module('chatRoom.controllers', [])

.controller('RoomListCtrl', function($scope, $timeout, $firebase, $location) {
  var ref = new Firebase('https://chatroom-io.firebaseio.com/opened_rooms');  
  $scope.rooms = $firebase(ref);

  $scope.rightButtons = [
    {
      type: 'button-energized',
      content: '<i class="icon ion-plus"></i>',
      tap: function(e) {
        $location.path("/new");
      }
    }
  ];
})

.controller('RoomCreateCtrl', function($scope, $timeout, $firebase, $location) {
  var ref = new Firebase('https://chatroom-io.firebaseio.com/opened_rooms');  
  $scope.rooms = $firebase(ref);

  $scope.createRoom = function(roomName, roomDescription) {
    if (!roomName) return;
      
    var roomId = Math.floor(Math.random() * 5000001);
      
    $scope.rooms.$add({
      id: roomId,
      title: roomName,
      slug: roomName.split(/\s+/g).join('-'),
      description: roomDescription
    });
    
    $location.path('/rooms/' + roomId);
  };

  $scope.rightButtons = [
    {
      type: 'button-energized',
      content: '<i class="icon ion-plus"></i>',
      tap: function(e) {
        $location.path("/new");
      }
    }
  ];
})


.controller('RoomCtrl', function($scope, $stateParams, $timeout, $firebase, $location, $ionicScrollDelegate) {
  var roomRef = new Firebase('https://chatroom-io.firebaseio.com/opened_rooms/');
  var messagesRef = new Firebase('https://chatroom-io.firebaseio.com/rooms/' + $stateParams.roomId);

  $scope.newMessage = "";
  $scope.roomsObj = $firebase(roomRef);
  $scope.messagesObj = $firebase(messagesRef);
  $scope.username = 'User' + Math.floor(Math.random() * 501);

  $scope.leftButtons = [
    { 
      type: 'button-energized',
      content: '<i class="icon ion-arrow-left-c"></i>',
      tap: function(e) {
        $location.path('/');
      }
    }
  ]

  var scrollBottom = function() {
    // Resize and then scroll to the bottom
    $ionicScrollDelegate.resize();
    $timeout(function() {
      $ionicScrollDelegate.scrollBottom();
    });
  };

  $scope.$watch('messagesObj', function (value) {
    var messagesObj = angular.fromJson(angular.toJson(value));
    $timeout(function () {scrollBottom()});
    $scope.messages = [];

    angular.forEach(messagesObj, function (message, key) {
      $scope.messages.push(message);
    });

    if ($scope.messages.length) {
      loaded = true;
    }
  }, true);

  $scope.$watch('roomsObj', function (value) {
    var roomsObj = angular.fromJson(angular.toJson(value));
    $scope.room = false;

    angular.forEach(roomsObj, function (room, key) {
      if ($scope.room) return;
      if (room.id == $stateParams.roomId) {
        $scope.room = room;
      };
    });
  }, true);
    
  $scope.submitAddMessage = function() {
    $scope.messagesObj.$add({
      created_by: this.username,
      content: this.newMessage,
      created_at: new Date()
    });
    this.newMessage = "";

    scrollBottom();
  };
})

.controller('AboutCtrl', function($scope) {})
.controller('AppCtrl', function($scope, $state) {});