# Testing Genesis WordPress

### Setup

Install NPM dependencies:

```shell
$ npm install
```

Generate test project scaffolding:

```shell
$ ./test/bin/generate
```

Start test project server:

```shell
$ (cd test/temp && vagrant up)
```

Tests will be ran against:

> http://local.generatortest.com

### Testing

```shell
$ npm test
```
