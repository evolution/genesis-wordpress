<?php

class GenesisTest extends PHPUnit_Framework_TestCase
{
    public function testGetDbName()
    {
        $_SERVER['HTTP_HOST'] = 'local.generatortest.com';

        $this->assertEquals('test_local', Genesis::getDbName('test'));
    }

    /**
     * @dataProvider httpHostProvider
     */
    public function testGetEnv($host, $expected)
    {
        $_SERVER['HTTP_HOST'] = $host;

        $this->assertEquals($expected, Genesis::getEnv());
    }

    /**
     * @dataProvider httpHostProvider
     */
    public function testInitEnv($host, $expected)
    {
        $_SERVER['HTTP_HOST'] = $host;

        Genesis::initEnv();

        $this->assertTrue(defined('WP_ENV'), '`Genesis::initEnv()` should define `WP_ENV`');
        $this->assertEquals($expected, WP_ENV);
    }

    public function httpHostProvider()
    {
        return array(
            array('generatortest.com',              'production'),
            array('generatortest.co.uk',            'production'),
            array('www.generatortest.com',          'production'),
            array('www.generatortest.co.uk',        'production'),
            array('local.generatortest.com',        'local'),
            array('local.generatortest.co.uk',      'local'),
            array('staging.generatortest.com',      'staging'),
            array('staging.generatortest.co.uk',    'staging'),
            array('production.generatortest.com',   'production'),
            array('production.generatortest.co.uk', 'production'),
        );
    }
}
