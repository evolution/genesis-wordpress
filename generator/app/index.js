'use strict';

var util    = require('util');
var path    = require('path');
var yeoman  = require('yeoman-generator');
var chalk   = require('chalk');
var crypto  = require('crypto');
var request = require('request');
var keygen  = require('ssh-keygen');
var fs      = require('fs-extra');


var WordpressGenerator = function(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.prompts  = [];

  this.on('end', function() {
    this.installDependencies({
      bower:        true,
      npm:          false,
      skipInstall:  options['skip-install'],
      skipMessage:  true,
      callback:     function() {
        this.log.write();
        this.log.ok('All done! Run ' + chalk.yellow('vagrant up') + ' to get started!');
      }.bind(this)
    });
  });
};

util.inherits(WordpressGenerator, yeoman.generators.Base);

WordpressGenerator.prototype.welcome = function() {
  var message = this.readFileAsString(path.join(__dirname, 'welcome.txt'));

  message = message.replace(/./g, function(match) {
    return /\w/.test(match) ? chalk.yellow(match) : chalk.cyan(match);
  });

  this.log.writeln(message);
};

WordpressGenerator.prototype.promptForName = function() {
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
};

WordpressGenerator.prototype.promptForDomain = function() {
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
};

WordpressGenerator.prototype.promptForGenesis = function() {
  this.prompts.push({
    type:     'text',
    name:     'genesis',
    message:  'Genesis library version',
    default:  '~0.2.*'
  });
};

WordpressGenerator.prototype.promptForWeb = function() {
  this.prompts.push({
    type:     'text',
    name:     'web',
    message:  'WordPress directory',
    default:  'web'
  });
};

WordpressGenerator.prototype.promptForWordPress = function() {
  var existing = function(web) {
    try {
      var file    = this.readFileAsString(path.join(web, 'wp-includes', 'version.php'));
      var version = file.match(/\$wp_version\s=\s['"]([^'"]+)/);

      if (version.length) {
        return version[1];
      }
    } catch(e) {}
  }.bind(this);

  this.prompts.push({
    type:     'text',
    name:     'wordpress',
    message:  'WordPress version',
    default:  function(answers) {
      return existing(answers.web) || '3.6.1';
    }
  });
};

WordpressGenerator.prototype.promptForTablePrefix = function() {
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
};

WordpressGenerator.prototype.promptForDatabase = function() {
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
};

WordpressGenerator.prototype.promptForIp = function() {
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
};

WordpressGenerator.prototype.ask = function() {
  var done = this.async();

  this.prompt(this.prompts, function(props) {
    this.props = props;

    done();
  }.bind(this));
};

WordpressGenerator.prototype.ready = function() {
  this.log.write('\n');
  this.log.info(chalk.green('Here we go!'));
};

WordpressGenerator.prototype.writeProjectFiles = function() {
  this.log.info('Writing project files...');

  try {
    this.readmeFile = this.readFileAsString(path.join(this.env.cwd, 'README.md'));
    this.readmeFile = this.readmeFile
      .replace(/^(?:\[[^\]]+\]){1,2}(?:\([^\)]+\))?[\r\n]+=+[\r\n]+> Powered by \[Genesis[^\r\n]+[\r\n]+/i, '')
      .replace(/\[[^\]]+\]:\s*http[^\r\n]+[\r\n]+\[genesis-wordpress\]:\s*http[^\r\n]+[\r\n]*$/i, '')
    ;
  } catch(e) {
    this.readmeFile = '';
  }

  this.template('gitignore',   '.gitignore');
  this.template('bower.json',   'bower.json');
  this.template('Capfile',      'Capfile');
  this.template('editorconfig', '.editorconfig');
  this.template('README.md',    'README.md');
  this.template('Vagrantfile',  'Vagrantfile');
};

WordpressGenerator.prototype.writeWordPress = function() {
  var done = this.async();

  this.log.info('Downloading WordPress...');

  this.remote('wordpress', 'wordpress', this.props.wordpress, function(err, remote) {
    this.log.info('Writing WordPress to ' + chalk.yellow(this.props.web));

    fs.copy(remote.cachePath, this.props.web, function(err) {
      if (err) {
        return console.error(err);
      }

      done();
    });
  }.bind(this), true);
};

WordpressGenerator.prototype.writeWeb = function() {
  this.log.info('Writing ' + chalk.yellow(this.props.web) + ' files...');

  try {
    this.htaccessFile = this.readFileAsString(path.join(this.env.cwd, this.props.web, '.htaccess'));
    this.htaccessFile = this.htaccessFile.replace(/# BEGIN Genesis WordPress(?:.|[\r\n]+)+?# END Genesis WordPress[\r\n]*/i, '');
  } catch(e) {
    this.htaccessFile = '';
  }

  this.template('web/htaccess',      path.join(this.props.web, '.htaccess'));
  this.template('web/no_robots.txt',  path.join(this.props.web, 'no_robots.txt'));
  this.template('web/robots.txt',     path.join(this.props.web, 'robots.txt'));
};

WordpressGenerator.prototype.fetchSalts = function() {
  var done = this.async();

  request('https://api.wordpress.org/secret-key/1.1/salt/', function(err, response, salts) {
    if (err) {
      throw err;
    }

    this.props.salts = salts;
    done();
  }.bind(this));
};

WordpressGenerator.prototype.setupWordPressConfig = function() {
  this.log.info('Configuring ' + chalk.yellow('wp-config.php'));

  this.wpConfigFile = this.readFileAsString(path.join(this.env.cwd, this.props.web, 'wp-config-sample.php'));
  this.template('web/wp-config.php', path.join(this.props.web, 'wp-config.php'));
};

WordpressGenerator.prototype.setupProvisioning = function() {
  this.log.info('Creating provisioning scripts...');

  this.mkdir(path.join(this.env.cwd, 'bin'));
  this.template('bin/provision', 'bin/provision');

  this.mkdir(path.join(this.env.cwd, 'provisioning'));
  this.template('provisioning/localhost', 'provisioning/localhost');
  this.template('provisioning/local', 'provisioning/local');
  this.template('provisioning/staging', 'provisioning/staging');
  this.template('provisioning/production', 'provisioning/production');
  this.template('provisioning/provision.yml', 'provisioning/provision.yml');

  this.mkdir(path.join(this.env.cwd, 'provisioning', 'group_vars'));
  this.template('provisioning/group_vars/webservers', 'provisioning/group_vars/webservers');
};

WordpressGenerator.prototype.createSshKeys = function() {
  var done      = this.async();
  var location  = path.join(this.env.cwd, 'provisioning', 'files', 'ssh', 'id_rsa');

  this.log.info('Creating SSH keys...');

  this.mkdir(path.dirname(location));

  keygen({
    location: location,
    comment:  'deploy@' + this.props.domain,
    read: false
  }, done);
};

WordpressGenerator.prototype.fixPermissions = function() {
  fs.chmodSync(path.join(this.env.cwd, 'bin', 'provision'), '744');
  fs.chmodSync(path.join(this.env.cwd, 'provisioning', 'files', 'ssh', 'id_rsa'), '600');
};

WordpressGenerator.prototype.setupDeployment = function() {
  this.log.info('Creating deployment scripts...');

  this.mkdir(path.join(this.env.cwd, 'deployment'));
  this.mkdir(path.join(this.env.cwd, 'deployment', 'deploy'));

  this.template('deployment/deploy.rb', 'deployment/deploy.rb');
  this.template('deployment/stages/old.rb', 'deployment/stages/old.rb');
  this.template('deployment/stages/local.rb', 'deployment/stages/local.rb');
  this.template('deployment/stages/staging.rb', 'deployment/stages/staging.rb');
  this.template('deployment/stages/production.rb', 'deployment/stages/production.rb');
};

module.exports = WordpressGenerator;
