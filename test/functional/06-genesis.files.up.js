'use strict';

var assert  = require('assert');
var Browser = require('zombie');
var fs      = require('fs');
var exec    = require('child_process').exec;

var testFile = '/vagrant/web/wp-content/uploads/uploads_sync_test.jpg';
var testUrl  = 'http://production.example.com/wp-content/uploads/uploads_sync_test.jpg';

describe('cap production genesis:files:up', function(done) {
  it('may need to remove uploads', function(done) {
    this.timeout(10 * 1000);

    exec('vagrant ssh local -c "rm -f ' + testFile + '"', {
      cwd: process.cwd() + '/temp'
    }, function(err, stdout, stderr) {
      assert.ifError(err);
      done();
    });
  });

  it('should have no uploads', function(done) {
    this.timeout(10 * 1000);

    exec('genesis_non_interactive=1 bundle exec cap production genesis:files:up', {
      cwd: process.cwd() + '/temp'
    }, function(err, stdout, stderr) {
      assert.ifError(err);
      done();
    });
  });

  it('should not exist at url', function(done) {
    this.timeout(10 * 1000);

    var browser = new Browser();

    browser
      .visit(testUrl)
      .then(function() {
        assert(false, "Url unexpectedly exists")
      })
      .fail(function(error) {
        done();
      })
    ;
  });

  it('may have to create upload', function(done) {
    this.timeout(10 * 1000);

    exec('vagrant ssh local -c "touch ' + testFile + '"', {
      cwd: process.cwd() + '/temp'
    }, function(err, stdout, stderr) {
      assert.ifError(err);
      done();
    });
  });

  it('should sync uploads', function(done) {
    this.timeout(10 * 1000);

    exec('genesis_non_interactive=1 bundle exec cap production genesis:files:up', {
      cwd: process.cwd() + '/temp'
    }, function(err, stdout, stderr) {
      assert.ifError(err);
      done();
    });
  });

  it('should exist at url', function(done) {
    this.timeout(10 * 1000);

    var browser = new Browser();

    browser
      .visit(testUrl)
      .then(function() {
        done();
      })
      .fail(function(error) {
        assert(error)
      })
    ;
  });
});
