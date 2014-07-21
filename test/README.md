# Testing Genesis WordPress

### Dependencies

- Composer (`$ curl -sS https://getcomposer.org/installer | php`)
- Node + NPM
- Vagrant

### Setup

Install Composer dependencies:

```shell
$ php composer.phar install --dev
```

Install NPM dependencies:

```shell
$ npm install
```

### Testing Scaffolding

Generate test project scaffolding:

```shell
$ ./bin/mock
```

### Testing Provisioning

Start test project server:

```shell
$ (cd temp && vagrant up)
```

### Unit Tests

```shell
$ ./vendor/bin/phpunit
```

### End-User Testing

Run tests:

```shell
$ npm test
```

Tests will be ran against the new entries in `/etc/hosts`:

> http://local.example.com and http://example.com/
