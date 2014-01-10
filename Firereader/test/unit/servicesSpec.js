'use strict';

/* jasmine specs for services go here */

describe('service', function() {
   describe('listDiff service', function() {
      beforeEach(function() {
         module('firebase');
         module('myApp.config');
         module('myApp.services');
      });

      it('should have diff and watch methods', inject(function($rootScope, listDiff) {
         expect(listDiff.diff).toBeDefined();
         expect(listDiff.watch).toBeDefined();
         var dispose = listDiff.watch($rootScope.$new(), 'hello', function() {}) ;
         expect(typeof(dispose)).toEqual('function');
         dispose(); // clean up refences and stop listening
      }));

      describe('diff', function() {
         it('should handle remove and add events', inject(function(listDiff) {
            expect(listDiff.diff([10, 12, 14], [8, 12, 16])).toEqual({count: 4, added: [8, 16], removed: [10, 14]});
         }));

         it('should show added if first arg is null', inject(function(listDiff) {
            expect(listDiff.diff(null, [10, 12])).toEqual({count: 2, added: [10, 12], removed: []});
         }));

         it('should show removed if second arg is null', inject(function(listDiff) {
            expect(listDiff.diff([10, 12], null)).toEqual({count: 2, added: [], removed: [10, 12]});
         }));

         it('should work on objects with a hash function', inject(function(listDiff) {
            var a = [ { id: 'one', val: 1 }, { id: 'two', val: 2 } ];
            var b = [ { id: 'two', val: 2 }, { id: 'three', val: 3 } ];
            expect(listDiff.diff(a, b, function(x) { return x.id; })).toEqual({
               count: 2,
               added: [ b[1] ],
               removed: [ a[0] ]
            })
         }));
      });

      describe('watch', function() {
         it('should invoke callback accurately', inject(function($timeout, $rootScope, listDiff) {
            var fn = jasmine.createSpy('listCallback');
            var $scope = $rootScope.$new();
            var dispose = listDiff.watch($scope, 'list', fn);

            runs(function() {
               $scope.list = [];
               $scope.$digest();
            });

            waits(100);

            runs(function() {
               $scope.list.push(10);
               $scope.list.push(20);
               $scope.list.push(30);
               $scope.$digest();
            });

            waitsFor(function() {
               return fn.calls.length > 0;
            }, 'waiting for callback to fire', 750);

            runs(function() {
               expect(fn).toHaveBeenCalled();
               expect(fn.mostRecentCall.args[0]).toEqual(listDiff.diff(null, [10, 20, 30]));
               dispose(); // clean up refences and stop listening
            });
         }));
      });
   })
});
