'use strict';

var assert    = require('assert');
var Browser   = require('zombie');
var fs        = require('fs');
var path      = require('path');

describe('Varnish', function() {
  it('should cache public page', function(done) {
    var browser = new Browser();

    this.timeout(0);

    browser
      .visit('http://local.generatortest.com/')
      .then(function() {
        assert.equal('Hello world!', browser.text('#content h1'));
        assert.equal('cached', browser.resources.shift().response.headers['x-cache']);
      })
      .then(done, done)
    ;
  });
});
