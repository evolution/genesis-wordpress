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

- v0.1.16 – `chmod 600 id_rsa`
- v0.1.15 – Sync with generator-genesis-wordpress#`0.1.6`
- v0.1.14 – Re-order NodeJS installation
- v0.1.13 – Update cache before NodeJS
- v0.1.12 – Bad ansible command (NodeJS)
- v0.1.11 – Forgot to install NodeJS
- v0.1.10 – Attempt to install NodeJS + Bower
- v0.1.9 – Fix `v0.1.8`
- v0.1.8 – Add filter for `option_siteurl` to fix redirects in `wp-admin`
- v0.1.7 – Fix `ssh` & remove `WP_SITEURL`
- v0.1.6 – Rename `wp` capistrano task namespace to `genesis`
- v0.1.5 – Add `cache` to `rsync_exclude` folders
- v0.1.4 – Bower release

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)


[1]: https://github.com/genesis/generator-wordpress/
[2]: http://yeoman.io/
[3]: http://www.vagrantup.com/
[4]: https://github.com/smdahlen/vagrant-hostmanager
[5]: https://github.com/capistrano/capistrano/wiki/2.x-Getting-Started
