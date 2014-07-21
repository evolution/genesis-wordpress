'use strict';

var assert    = require('assert');
var Browser   = require('zombie');

describe('WordPress', function() {
  it('should redirect /wp-admin to /wp/wp-admin', function(done) {
    var browser = new Browser();

    browser
      .visit('http://example.com/wp-admin')
      .then(function() {
        var location = browser.location.toString();

        assert(browser.redirected);
        assert.equal(200, browser.statusCode);
        assert.equal(0, location.indexOf('http://example.com/wp/wp-login'));
      })
      .then(done, done)
    ;
  });
});
