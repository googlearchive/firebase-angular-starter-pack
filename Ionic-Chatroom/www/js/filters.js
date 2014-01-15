angular.module('chatRoom.filters', [])

.filter('dateToday', function($filter) {
  return function(v) {
    var dv = new Date(v);
    if(dv.toDateString() == (new Date).toDateString()) {
      return $filter('date')(v, 'HH:mm a');
    }
    return $filter('date')(v, 'MMM-dd HH:mm a');
  }
});
