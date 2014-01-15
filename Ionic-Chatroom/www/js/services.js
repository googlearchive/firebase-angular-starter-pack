angular.module('chatRoom.services', [])

.factory('Rooms', function() {

  var rooms = [
  ];

  return {
    all: function() {
      return rooms;
    },
    get: function(roomId) {
      // Simple index lookup
      return rooms[roomId];
    },
    add: function(title, slug, description) {
      var newRoom = {
        id: rooms.length,
        title: title,
        slug: slug,
        description: description
      };
      rooms.push(newRoom);
      return newRoom;
    }
  }
});
