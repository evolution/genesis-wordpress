# Testing Genesis WordPress

### Setup

Install NPM dependencies:

```shell
$ npm install
```

### Testing Scaffolding

Generate test project scaffolding:

```shell
$ ./test/bin/mock
```

### Testing Provisioning

Start test project server:

```shell
$ (cd test/temp && vagrant up)
```

### End-User Testing

Install Gems:

```shell
$ (cd test/temp && sudo bundle install)
```

Run tests:

```shell
$ npm test
```

Tests will be ran against:

> http://local.generatortest.com
