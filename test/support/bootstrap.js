var hooker  = require('hooker');
var path    = require('path');
var helpers = require('yeoman-generator').test;

var Bootstrap = {};

Bootstrap.app = function(test) {
  test.app = helpers.createGenerator('genesis-wordpress:app', [
    [require('../../generator/app'), 'genesis-wordpress:app']
  ]);

  test.app.options['skip-install'] = true;

  return test.app;
};

Bootstrap.beforeEach = function(test, done) {
  helpers.testDirectory(path.join(__dirname, '..', 'temp'), function(err) {
    if (err) {
      return done(err);
    }

    Bootstrap.app(test);
    Bootstrap.prompts(test);

    done();
  });
};

Bootstrap.prompts = function(test) {
  hooker.hook(test.app, 'prompt', function(prompts, done) {
    var answers = {
      name:         'GeneratorTest.com',
      domain:       'generatortest.com',
      ip:           '10.10.73.57',
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

    hooker.unhook(test.app, 'prompt');

    done(answers);

    return hooker.preempt(answers);
  });
};

module.exports = Bootstrap;
