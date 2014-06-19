var fs      = require('fs-extra');
var hooker  = require('hooker');
var helpers = require('yeoman-generator').test;
var path    = require('path');

var MockGenerator = function(outputDir) {
  this.outputDir = __dirname + '/../temp';
};

MockGenerator.prototype.create = function() {
  this.app = helpers.createGenerator('genesis-wordpress:app', [
    [require('../../generator/app'), 'genesis-wordpress:app']
  ]);

  this.app.options['skip-install'] = true;
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
  fs.appendFileSync(this.outputDir + '/deployment/deploy.rb', [
    '',
    '# Use local repository for testing',
    'set :deploy_via,        :copy',
    'set :repo_url,          "."',
    'set :local_repository,  "."',
    'set :copy_remote_dir,   "/var/www/#{fetch(:domain)}/#{fetch(:branch)}"',
    ''
  ].join('\n'));

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
  ;

  fs.writeFileSync(this.outputDir + '/Vagrantfile', vagrantFile);

  // Copy current library into bower location, except for test
  fs.copy(
    path.resolve(this.outputDir, '../../'),
    this.outputDir + '/bower_components/genesis-wordpress',
    function(path) {
      return !path.match('test');
    }, function(err) {
      if (err) {
        return console.error(err);
      }
    }
  );
};

module.exports = MockGenerator;
