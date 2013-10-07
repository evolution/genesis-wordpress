Genesis WordPress
=================

> Rapidly create, develop, & deploy WordPress across multiple environments.

*This repository primarily houses the tools & libraries utilized by projects
created using the [Genesis WordPress Generator][1].*


## Dependencies

- [Yeoman][2] + [generator-wordpress][1] for scaffolding
- [Vagrant][3] + [Host Manager][4] for local development
- [Capistrano][5] for deployment & task automation


## Installation

    $ npm install -g generator-genesis-wordpress


*If you get EMFILE issues, try running: `ulimit -n 4096`*


## Getting Started

First, open up a git-enabled project in your terminal and run:

    $ yo genesis-wordpress

Follow the prompts (all of which has sane defaults!), then run:

    $ vagrant up

Open up http://local.{mysite.com}/ and start developing!

## Changelog

- v0.1.5 – Add `cache` to `rsync_exclude` folders
- v0.1.4 – Bower release

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)


[1]: https://github.com/genesis/generator-wordpress/
[2]: http://yeoman.io/
[3]: http://www.vagrantup.com/
[4]: https://github.com/smdahlen/vagrant-hostmanager
[5]: https://github.com/capistrano/capistrano/wiki/2.x-Getting-Started
