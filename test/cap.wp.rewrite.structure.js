'use strict';

var assert  = require('assert');
var exec    = require('child_process').exec;

describe('bundle exec cap local wp:rewrite:structure:/%postname%/', function(done) {
  this.timeout(0);

  it('should not fail', function(done) {
    exec('bundle exec cap local wp:rewrite:structure:/%postname%/', {
      cwd: __dirname + '/temp'
    }, function(err, stdout, stderr) {
      assert.ifError(err);
      done();
    });
  });
});
