'use strict';

var assert  = require('assert');
var exec    = require('child_process').exec;

describe('cap production genesis:up', function(done) {
  it('should not fail', function(done) {
    this.timeout(10 * 1000);

    exec('genesis_non_interactive=1 bundle exec cap production genesis:up', {
      cwd: process.cwd() + '/temp'
    }, function(err, stdout, stderr) {
      assert.ifError(err);
      done();
    });
  });
});
