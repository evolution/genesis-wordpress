'use strict';

var assert  = require('assert');
var exec    = require('child_process').exec;

describe('cap production deploy', function(done) {
  it('should not fail', function(done) {
    this.timeout(60 * 1000);

    exec('bundle exec cap production deploy', {
      cwd: process.cwd() + '/temp'
    }, function(err, stdout, stderr) {
      assert.ifError(err);
      done();
    });
  });
});
