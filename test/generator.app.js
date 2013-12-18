'use strict';

var assert    = require('assert');
var Bootstrap = require('./support/bootstrap');
var helpers   = require('yeoman-generator').test;

describe('Genesis WordPress generator', function () {
  this.timeout(0);

  beforeEach(function(done) {
    Bootstrap.beforeEach(this, done);
  });

  it('can be ran', function(done) {
    this.app.run({}, function() {
      helpers.assertFiles([
        'bin/provision',
        'deployment/deploy.rb',
        'provisioning/provision.yml',
        'provisioning/files/ssh/id_rsa',
        'provisioning/files/ssh/id_rsa.pub',
        'web/wp-config.php',
        'bower.json',
        'Capfile',
        'README.md',
        'Vagrantfile',
      ]);

      done();
    });
  });
});
