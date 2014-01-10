'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('my app', function() {

  beforeEach(function() {
    browser().navigateTo('../../app/index.html');
  });

  it('should automatically redirect to /demo when location hash/fragment is empty', function() {
    expect(browser().location().url()).toBe("/demo");
  });

   describe('hearth', function() {
      beforeEach(function() {
         browser().navigateTo('#/hearth');
      });

      it('should redirect to /login', function() {
         expect(element('[ng-view] #login').count()).toBe(1);
      });

      //todo need to test authenticated actions, but we don't have a way
      //todo to OAuth via e2e tests
      //todo viewing an article
      //todo marking an article read
      //todo marking all articles read
   });

   describe('demo', function() {
      beforeEach(function() {
         browser().navigateTo('#/demo');
      });

      it('should render demo when user navigates to /demo', function() {
         expect(element('[ng-view] #feeds').count()).toBe(1);
      });
   });

  describe('account', function() {
    beforeEach(function() {
      browser().navigateTo('#/account');
    });

     it('should redirect to /login', function() {
        expect(element('[ng-view] #login').count()).toBe(1);
     });

     //todo need to test authenticated actions, but we don't have a way
     //todo to OAuth via e2e tests
  });
});
