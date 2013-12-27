'use strict';

var assert  = require('assert');
var exec   = require('child_process').exec;

describe('Genesis WordPress', function () {
  describe('cap', function() {
    this.timeout(0);

    describe('deploy', function(done) {
      it('should not fail', function(done) {
        exec('cap local deploy', {
          cwd: __dirname + '/temp'
        }, function(err, stdout, stderr) {
          assert.ifError(err);
          done();
        });
      });
    });
  });
});
