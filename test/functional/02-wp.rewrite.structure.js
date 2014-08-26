'use strict';

var assert  = require('assert');
var exec    = require('child_process').exec;

describe('cap local wp:rewrite:structure:/%postname%/', function(done) {
  it('should not fail', function(done) {
    exec('bundle exec cap local wp:rewrite:structure:/%postname%/', {
      cwd: process.cwd() + '/temp'
    }, function(err, stdout, stderr) {
      assert.ifError(err);
      done();
    });
  });
});
