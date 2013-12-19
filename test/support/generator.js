#!/usr/bin/env node

var hooker  = require('hooker');
var path    = require('path');
var helpers = require('yeoman-generator').test;

var Generator = function() {};

Generator.prototype.create = function() {
  this.app = helpers.createGenerator('genesis-wordpress:app', [
    [require('../../generator/app'), 'genesis-wordpress:app']
  ]);
};

Generator.prototype.prompts = function() {
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

Generator.prototype.run = function() {
  helpers.testDirectory(path.join(__dirname, '..', 'temp'), function(err) {
    if (err) {
      throw err;
    }

    this.create();
    this.prompts();

    this.app.run({}, function() {});
  }.bind(this));
};


module.exports = Generator;
