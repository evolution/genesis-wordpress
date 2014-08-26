'use strict';

var util    = require('util');
var path    = require('path');
var latest  = require('github-latest');
var yeoman  = require('yeoman-generator');
var chalk   = require('chalk');
var crypto  = require('crypto');
var request = require('request');
var keygen  = require('ssh-keygen');
var fs      = require('fs-extra');

var WordpressGenerator = yeoman.generators.Base.extend({
  init: function() {
    this.pkg      = JSON.parse(this.readFileAsString(path.join(__dirname, '../../package.json')));
    this.prompts  = [];

    this.option('dev', {
      desc: 'Dev-mode for localized development of the generator',
      defaults: false,
    });

    this.on('end', function() {
      this.installDependencies({
        bower:        true,
        npm:          false,
        skipInstall:  this.options['skip-install'],
        skipMessage:  true,
        callback:     function() {
          this.log.write();
          this.log.ok('All done! Run ' + chalk.yellow('vagrant up') + ' to get started!');
        }.bind(this)
      });
    });

    this.sourceRoot(path.join(__dirname, 'templates'));
  },

  welcome: function() {
    var message = this.readFileAsString(path.join(__dirname, 'welcome.txt'));

    message = message.replace(/./g, function(match) {
      return /\w/.test(match) ? chalk.yellow(match) : chalk.cyan(match);
    });

    this.log.writeln(message);
  },

  promptForName: function() {
    var existing = function() {
      try {
        var bower = JSON.parse(this.readFileAsString(path.join(this.env.cwd, 'bower.json')));

        return bower.name;
      } catch(e) {};
    }.bind(this);

    this.prompts.push({
      required: true,
      type:     'text',
      name:     'name',
      message:  'Repository name (e.g. MySite)',
      default:  function() {
        return existing() || path.basename(this.env.cwd);
      }.bind(this)
    });
  },

  promptForDomain: function() {
    this.prompts.push({
      required: true,
      type:     'text',
      name:     'domain',
      message:  'Domain name (e.g. mysite.com)',
      default:  path.basename(this.env.cwd).toLowerCase(),
      validate: function(input) {
        if (/^[\w-]+\.\w+(?:\.\w{2,3})?$/.test(input)) {
          return true;
        } else if (!input) {
          return "Domain is required";
        }

        return chalk.yellow(input) + ' does not match the example';
      }
    });
  },

  promptForGenesis: function() {
    this.prompts.push({
      type:     'text',
      name:     'genesis',
      message:  'Genesis library version',
      default:  '~' + this.pkg.version
    });
  },

  promptForWordPress: function() {
    var existing = function(web) {
      try {
        var file    = this.readFileAsString(path.join(web, 'wp-includes', 'version.php'));
        var version = file.match(/\$wp_version\s=\s['"]([^'"]+)/);

        if (version.length) {
          return version[1];
        }
      } catch(e) {}
    }.bind(this);

    var done = this.async();

    latest('wordpress', 'wordpress', function(err, tag) {
      this.prompts.push({
        type:     'text',
        name:     'wordpress',
        message:  'WordPress version',
        default:  function(answers) {
          return existing(answers.web) || tag || '3.7.1';
        }
      });

      done();
    }.bind(this));
  },

  promptForTablePrefix: function() {
    var existing = function(web) {
      try {
        var config = this.readFileAsString(path.join(web, 'wp-config.php'));
        var prefix = config.match(/\$table_prefix\s*=\s*['"]([^'"]+)/);

        if (prefix.length) {
          return prefix[1];
        }
      } catch(e) {}
    }.bind(this);

    this.prompts.push({
      type:     'text',
      name:     'prefix',
      message:  'WordPress table prefix',
      default:  function(answers) {
        return existing(answers.web) || 'wp_';
      }
    });
  },

  promptForDatabase: function() {
    var done      = this.async();
    var existing  = function(web, constant) {
      try {
        var config = this.readFileAsString(path.join(web, 'wp-config.php'));
        var regex   = new RegExp(constant + '[\'"],\\s*[\'"]([^\'"]+)');
        var matches = regex.exec(config);

        return matches && matches[1];
      } catch(e) {}
    }.bind(this);

    crypto.randomBytes(12, function(err, buffer) {
      this.prompts.push({
        type:     'text',
        name:     'DB_NAME',
        message:  'Database name',
        default:  function(answers) { return existing(answers.web, 'DB_NAME') || 'wordpress'; }
      });

      this.prompts.push({
        type:     'text',
        name:     'DB_USER',
        message:  'Database user',
        default:  function(answers) { return existing(answers.web, 'DB_USER') || 'wordpress'; }
      });

      this.prompts.push({
        type:     'text',
        name:     'DB_PASSWORD',
        message:  'Database password',
        default:  function(answers) { return existing(answers.web, 'DB_PASSWORD') || buffer.toString('base64'); }
      });

      this.prompts.push({
        type:     'text',
        name:     'DB_HOST',
        message:  'Database host',
        default:  function(answers) { return existing(answers.web, 'DB_HOST') || 'localhost'; }
      });

      done();
    }.bind(this));
  },

  promptForIp: function() {
    // Private IP blocks
    var blocks = [
      ['192.168.0.0', '192.168.255.255'],
      ['172.16.0.0',  '172.31.255.255'],
      ['10.0.0.0',    '10.255.255.255']
    ];

    // Long IP ranges
    var ranges = blocks.map(function(block) {
      return block.map(function(ip) {
        var parts = ip.split('.');

        return parts[0] << 24 | parts[1] << 16 | parts[2] << 8 | parts[3] >>> 0;
      });
    });

    // Randomize IP addresses
    var ips = ranges.map(function(range) {
      return Math.random() * (range[1] - range[0]) + range[0];
    }).map(function(ip) {
      return [
        (ip & (0xff << 24)) >>> 24,
        (ip & (0xff << 16)) >>> 16,
        (ip & (0xff << 8)) >>> 8,
        (ip & (0xff << 0)) >>> 0
      ].join('.');
    });

    try {
      var vagrant = this.readFileAsString('Vagrantfile').match(/ip:\s['"]([\d\.]+)['"]/);

      if (vagrant.length) {
        ips.unshift(vagrant[1]);
      }
    } catch(e) {}

    this.prompts.push({
      required: true,
      type:     'list',
      name:     'ip',
      message:  'Vagrant IP',
      pattern:  /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
      choices:  ips
    });
  },

  ask: function() {
    var done = this.async();

    this.prompt(this.prompts, function(props) {
      this.props = props;

      done();
    }.bind(this));
  },

  prepareReadme: function() {
    try {
      this.readmeFile = this.readFileAsString(path.join(this.env.cwd, 'README.md'));
      this.readmeFile = this.readmeFile
        .replace(/^(?:\[[^\]]+\]){1,2}(?:\([^\)]+\))?[\r\n]+=+[\r\n]+> Powered by \[Genesis[^\r\n]+[\r\n]+/i, '')
        .replace(/\[[^\]]+\]:\s*http[^\r\n]+[\r\n]+\[genesis-wordpress\]:\s*http[^\r\n]+[\r\n]*$/i, '')
      ;
    } catch(e) {
      this.readmeFile = '';
    }
  },

  prepareSalts: function() {
    var done = this.async();

    request('https://api.wordpress.org/secret-key/1.1/salt/', function(err, response, salts) {
      if (err) {
        throw err;
      }

      this.props.salts = salts;
      done();
    }.bind(this));
  },

  prepareSshKeys: function() {
    var done      = this.async();
    var location  = path.join(this.env.cwd, 'lib', 'ansible', 'files', 'ssh', 'id_rsa');

    this.log.info('Creating SSH keys...');

    this.mkdir(path.dirname(location));

    keygen({
      location: location,
      comment:  'deploy@' + this.props.domain,
      read: false
    }, done);
  },

  prepareTemplates: function() {
    this.templates = this.expandFiles('**/*', {
      cwd: this.sourceRoot(),
    });
  },

  ready: function() {
    this.log.write('\n');
    this.log.info(chalk.green('Here we go!'));
  },

  symlinkGenesisWordPress: function() {
    if (!this.options.dev) {
      return false;
    }

    this.log.info(chalk.green('Symlinking local Genesis WordPress as dependency...'));

    var srcpath = '../../../wordpress';
    var dstpath = path.join(this.env.cwd, 'bower_components', 'genesis-wordpress');

    this.mkdir(path.dirname(dstpath));

    fs.symlinkSync(srcpath, dstpath);
  },

  copyBower: function() {
    this.template('bower.json', 'bower.json');
  },

  runBower: function() {
    var done = this.async();

    this.log.info(chalk.green('Installing project dependencies...'));

    this.bowerInstall(null, null, done);
  },

  copyBowerrc: function() {
    this.template('_bowerrc', '.bowerrc');
  },

  runPostInstall: function() {
    var done  = this.async();
    var rc    = JSON.parse(this.readFileAsString('.bowerrc'));
    var cmd   = rc.scripts.postinstall;

    this.log.info(chalk.green('Running Bower `postinstall`...'));

    this.emit('postInstall');

    this
      .spawnCommand(cmd, [], {
        cwd: process.cwd(),
      })
      .on('error', done)
      .on('exit', this.emit.bind(this, 'postInstall:end'))
      .on('exit', function (err) {
        if (err === 127) {
          this.log.error('Could not run post Bower `postinstall`.');
        }

        done(err);
      }.bind(this))
    ;
  },

  prepareWpConfig: function() {
    this.wpConfigFile = this.readFileAsString(path.join(this.env.cwd, 'web', 'wp', 'wp-config-sample.php'));
  },

  scaffold: function() {
    this.log.info(chalk.green('Scaffolding...'));

    this.templates.forEach(function(file) {
      this.template(file, file.replace(/(^|\/)_/, '$1.'));
    }.bind(this));
  },

  generateSslCert: function() {
    var done      = this.async();
    var location  = path.join(this.env.cwd, 'lib', 'ansible', 'files', 'ssl');
    var stages    = ['local', 'staging', 'production'];
    var exited    = function (err) {
      stages.pop();

      if (err || !stages.length) {
        done(err);
      }
    };

    this.log.info('Creating self-signed SSL certificate...');

    this.mkdir(path.dirname(location));

    stages.forEach(function (stage) {
      this.emit('sslInstall'+stage);

      var cert = path.join(location, stage + '.' + this.props.domain + '.pem');
      var cfg  = path.join(location, stage + '.cfg');

      this
        .spawnCommand('openssl', [
          'req',
          '-x509',
          '-nodes',
          '-days',
          '365',
          '-newkey',
          'rsa:2048',
          '-keyout',
          cert,
          '-out',
          cert,
          '-config',
          cfg
        ], {
          cwd: process.cwd(),
        })
        .on('error', exited)
        .on('exit', this.emit.bind(this, 'sslInstall'+stage+':end'))
        .on('exit', function (err) {
          if (err === 127) {
            this.log.error('Could not generate SSL certificate for '+stage);
          }

          exited(err);
        }.bind(this))
      ;
    }.bind(this));
  },

  symlinkBowerComponents: function() {
    this.log.info(chalk.green('Symlinking `bower_components` into `web`...'));

    fs.symlinkSync('../bower_components', path.join(this.env.cwd, 'web', 'bower_components'));
  },

  removeDevFiles: function() {
    if (this.options.dev) {
      return false;
    }

    this.log.info(chalk.red('Removing'), chald.green('dev files...'));

    fs.unlinkSync(path.join(this.env.cwd, 'lib', 'capistrano', 'tasks', 'testing.rake'));
  },

  fixPermissions: function() {
    fs.chmodSync(path.join(this.env.cwd, 'bin', 'provision'), '744');
    fs.chmodSync(path.join(this.env.cwd, 'lib', 'ansible', 'files', 'ssh', 'id_rsa'), '600');
  },

  installGems: function() {
    var done      = this.async();
    var installer = 'bundle';

    this.log.info(chalk.green('Installing Gems...'));

    this.emit(installer + 'Install');

    this
      .spawnCommand(installer, ['install'], done)
      .on('error', done)
      .on('exit', this.emit.bind(this, installer + 'Install:end'))
      .on('exit', function (err) {
        if (err === 127) {
          this.log.error('Could not run bundler. Please install with `sudo ' + installer + ' install`.');
        }

        done(err);
      }.bind(this))
    ;
  },
});

module.exports = WordpressGenerator;
