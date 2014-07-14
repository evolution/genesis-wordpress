var fs      = require('fs-extra');
var hooker  = require('hooker');
var helpers = require('yeoman-generator').test;
var path    = require('path');

var MockGenerator = function(outputDir) {
  this.outputDir = __dirname + '/../temp';
};

MockGenerator.prototype.create = function() {
  this.app = helpers.createGenerator('genesis-wordpress:app', [
    [require('../../lib/yeoman'), 'genesis-wordpress:app']
  ]);

  this.app.options['skip-install'] = true;
  this.app.options['debug'] = true;
};

MockGenerator.prototype.prepare = function() {
  this.privatePath  = this.outputDir + '/provisioning/files/ssh/id_rsa';
  this.privateKey   = fs.existsSync(this.privatePath) ? fs.readFileSync(this.privatePath) : null;
  this.publicPath   = this.outputDir + '/provisioning/files/ssh/id_rsa.pub';
  this.publicKey    = fs.existsSync(this.publicPath) ? fs.readFileSync(this.publicPath) : null;
};

MockGenerator.prototype.prompts = function() {
  hooker.hook(this.app, 'prompt', function(prompts, done) {
    var answers = {
      name:         'GeneratorTest.com',
      domain:       'generatortest.com',
      ip:           '192.168.137.137',
      DB_NAME:      'generator_test',
      DB_USER:      'generator_test',
      DB_PASSWORD:  'generator_test'
    };

    prompts.forEach(function(prompt) {
      if (answers[prompt.name]) {
        return;
      }

      if (prompt.default instanceof Function) {
        answers[prompt.name] = prompt.default(answers);
      } else {
        answers[prompt.name] = prompt.default;
      }
    });

    hooker.unhook(this.app, 'prompt');

    done(answers);

    return hooker.preempt(answers);
  }.bind(this));
};

MockGenerator.prototype.run = function() {
  helpers.testDirectory(this.outputDir, function(err) {
    if (err) {
      throw err;
    }

    this.create();
    this.prepare();
    this.prompts();

    this.app.run({}, this.finalize.bind(this));
  }.bind(this));
};

MockGenerator.prototype.finalize = function() {
  if (this.privateKey) {
    fs.writeFileSync(this.privatePath, this.privateKey);
  }

  if (this.publicKey) {
    fs.writeFileSync(this.publicPath, this.publicKey);
  }

  var vagrantFile = fs.readFileSync(this.outputDir + '/Vagrantfile', 'utf8')
    .replace(
      new RegExp('(# Remount)'),
      [
        '# Mount library for testing',
        '    box.vm.synced_folder "../../", "/wordpress", :nfs => true',
        '',
        '    $1'
      ].join('\n')
    )
    .replace(
      '/vagrant/bin/provision',
      'echo Bypassing provisioning script for testing: /vagrant/bin/provision'
    )
  ;

  fs.writeFileSync(this.outputDir + '/Vagrantfile', vagrantFile);
};

module.exports = MockGenerator;
