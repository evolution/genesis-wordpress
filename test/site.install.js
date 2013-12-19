'use strict';

var assert    = require('assert');
var Browser   = require('zombie');
var fs        = require('fs');
var path      = require('path');

describe('Genesis WordPress', function () {
  describe('site', function() {
    it('may not be installed', function(done) {
      var browser = new Browser({ debug: true });

      this.timeout(0);

      browser
        .visit('http://local.generatortest.com/wp-admin/install.php')
        .then(function() {
          console.log(browser.html());

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
      var browser = new Browser({ debug: true });
      browser
        .visit('http://local.generatortest.com/wp-admin/install.php')
        .then(function() {
          console.log(browser.html());
          assert.equal('Log In', browser.text('a.button'));
        })
        .then(done, done)
      ;
    })
  });
});
