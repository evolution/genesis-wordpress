'use strict';

var assert    = require('assert');
var Browser   = require('zombie');

describe.only('Varnish', function() {
  it('should see public page', function(done) {
    var browser = new Browser();

    browser
      .visit('http://local.generatortest.com/')
      .then(function() {
        assert.equal('Hello world!', browser.text('#content h1'));
      })
      .then(done, done)
    ;
  });

  it('should cache public page', function(done) {
    var browser = new Browser();

    browser
      .visit('http://local.generatortest.com/')
      .then(function() {
        assert.equal('cached', browser.resources[0].response.headers['x-cache']);
      })
      .then(done, done)
    ;
  });

  it('should not cache with wordpress cookies', function(done) {
    var browser = new Browser();

    browser
      .visit('http://local.generatortest.com/wp-admin')
      .then(function() {
        assert(browser.resources.browser.getCookie('wordpress_test_cookie'));
      })
      .then(function() {
        return browser.visit('http://local.generatortest.com/');
      })
      .then(function() {
        assert.equal('Hello world!', browser.text('#content h1'));
        assert.equal(0, browser.resources.shift().response.headers.age);
        assert.equal('uncached', browser.resources.shift().response.headers['x-cache']);
      })
      .then(done, done)
    ;
  });
});
