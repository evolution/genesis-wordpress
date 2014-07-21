'use strict';

var assert  = require('assert');
var exec    = require('child_process').exec;

describe.only('cap production genesis:up', function(done) {
  it('should not fail', function(done) {
    exec('bundle exec cap production genesis:up', {
      cwd: process.cwd() + '/temp'
    }, function(err, stdout, stderr) {
      assert.ifError(err);
      done();
    });
  });
});
