'use strict';

var assert    = require('assert');
var Browser   = require('zombie');

describe('WordPress', function() {
  it('should use relative URLs in links', function(done) {
    var browser = new Browser();

    browser
      .visit('http://staging.generatortest.com/')
      .then(function() {
        assert.equal('/hello-world/', browser.query('#content h1 a').getAttribute('href'));
      })
      .then(done, done)
    ;
  });
});
