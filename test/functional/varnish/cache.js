'use strict';

var assert    = require('assert');
var Browser   = require('zombie');

describe('Varnish', function() {
  it('should access backend', function(done) {
    var browser = new Browser();

    browser
      .visit('http://staging.generatortest.com/')
      .then(function() {
        assert.equal('Hello world!', browser.text('#content h1'));
      })
      .then(done, done)
    ;
  });

  describe('with no cookies', function() {
    it('should cache', function(done) {
      var browser = new Browser();

      browser
        .visit('http://staging.generatortest.com/')
        .then(function() {
          assert.equal('cached', browser.resources[0].response.headers['x-cache']);
        })
        .then(done, done)
      ;
    });
  });

  describe('with WordPress cookies', function() {
    it('should not cache', function(done) {
      var browser = new Browser();

      browser
        .visit('http://staging.generatortest.com/wp-admin')
        .then(function() {
          assert(browser.resources.browser.getCookie('wordpress_test_cookie'));
        })
        .then(function() {
          return browser.visit('http://staging.generatortest.com/');
        })
        .then(function() {
          assert.equal('Hello world!', browser.text('#content h1'));
          assert.equal(0, browser.resources[0].response.headers.age);
          assert.equal('uncached', browser.resources[0].response.headers['x-cache']);
        })
        .then(done, done)
      ;
    });
  });

  describe('with tracking cookies', function() {
    it('should ignore tracking cookies for cache', function(done) {
      var browser = new Browser();

      browser.setCookie({
        name: '_test',
        value: +new Date(),
        domain: 'staging.generatortest.com',
        path: '/',
      });

      browser
        .visit('http://staging.generatortest.com/')
        .then(function() {
          assert(browser.getCookie('_test'));
          assert(browser.resources[0].response.headers.age);
          assert.equal('cached', browser.resources[0].response.headers['x-cache']);
        })
        .then(done, done)
      ;
    });
  });

  describe('with an application cookies', function() {
    var cookie  = {
      name: 'test',
      value: +new Date(),
      domain: 'staging.generatortest.com',
      path: '/',
    };

    it('should not be cached initially', function(done) {
      var browser = new Browser();

      browser.setCookie(cookie);

      browser
        .visit('http://staging.generatortest.com/')
        .then(function() {
          assert(browser.getCookie('test'));
          assert.equal(0, browser.resources[0].response.headers.age);
          assert.equal('uncached', browser.resources[0].response.headers['x-cache']);
        })
        .then(done, done)
      ;
    });

    it('should be subsequently cached', function(done) {
      var browser = new Browser();

      browser.setCookie(cookie);

      browser
        .visit('http://staging.generatortest.com/')
        .then(function() {
          assert(browser.getCookie('test'));
          assert(browser.resources[0].response.headers.age);
          assert.equal('cached', browser.resources[0].response.headers['x-cache']);
        })
        .then(done, done)
      ;
    });
  });
});
