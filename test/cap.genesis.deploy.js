'use strict';

var assert  = require('assert');
var exec   = require('child_process').exec;

describe('bundle exec cap local deploy', function(done) {
  this.timeout(100000);

  it('should not fail', function(done) {
    exec('bundle exec cap local deploy', {
      cwd: __dirname + '/temp',
      maxBuffer: 1024*1024*1024
    }, function(err, stdout, stderr) {
      assert.ifError(err);
      done();
    });
  });
});
