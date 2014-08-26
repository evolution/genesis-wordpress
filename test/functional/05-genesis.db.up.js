'use strict';

var assert  = require('assert');
var Browser = require('zombie');
var exec    = require('child_process').exec;

describe('cap production genesis:db:up', function(done) {
  it('should not fail', function(done) {
    this.timeout(10 * 1000);

    exec('genesis_non_interactive=1 bundle exec cap production genesis:db:up', {
      cwd: process.cwd() + '/temp'
    }, function(err, stdout, stderr) {
      assert.ifError(err);
      done();
    });
  });

  it('should be installed', function(done) {
    var browser = new Browser();

    browser
      .visit('http://production.example.com/wp/wp-admin/install.php')
      .then(function() {
        assert.equal('Log In', browser.text('a.button'));
      })
      .then(done, done)
    ;
  })
});
