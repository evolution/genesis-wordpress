'use strict';

var assert    = require('assert');
var fs        = require('fs');
var path      = require('path');

describe('Generator', function() {
  it('should create required files', function(done) {
    [
      'bin/provision',
      'deployment/deploy.rb',
      'provisioning/provision.yml',
      'provisioning/files/ssh/id_rsa',
      'provisioning/files/ssh/id_rsa.pub',
      'web/wp-config.php',
      'bower.json',
      'Capfile',
      'Gemfile',
      'README.md',
      'Vagrantfile',
    ].forEach(function(file) {
      var filePath = path.join(__dirname, 'temp', file);

      assert.ok(fs.existsSync(filePath), 'File not created: ' + filePath);
    });

    done();
  });
});
