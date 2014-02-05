# Testing Genesis WordPress

### Setup

Install NPM dependencies:

```shell
$ npm install
```

### Testing Scaffolding

Generate test project scaffolding:

```shell
$ ./test/bin/generate
```

### Testing Provisioning

Start test project server:

```shell
$ (cd test/temp && vagrant up)
```

Tests will be ran against:

> http://local.generatortest.com

### End-User Testing

```shell
$ npm test
```
