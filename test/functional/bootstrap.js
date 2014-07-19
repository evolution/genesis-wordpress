'use strict';

var assert    = require('assert');
var Browser   = require('zombie');
var fs        = require('fs');
var path      = require('path');

describe('Mock site', function() {
  it('may not be installed', function(done) {
    var browser = new Browser();

    this.timeout(0);

    browser
      .visit('http://staging.generatortest.com/wp/wp-admin/install.php')
      .then(function() {
        if (browser.button('Install WordPress')) {
          browser
            .fill('Site Title',       'Genesis WordPress Test')
            .fill('Username',         'test')
            .fill('admin_password',   'test')
            .fill('admin_password2',  'test')
            .fill('Your E-mail',      'test@example.com')
            .uncheck('blog_public')
          ;

          return browser.pressButton('Install WordPress');
        }
      })
      .then(done, done)
    ;
  });

  it('should be installed', function(done) {
    var browser = new Browser();

    browser
      .visit('http://staging.generatortest.com/wp/wp-admin/install.php')
      .then(function() {
        assert.equal('Log In', browser.text('a.button'));
      })
      .then(done, done)
    ;
  })
});
