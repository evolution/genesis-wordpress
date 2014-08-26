<?php

class GenesisTest extends PHPUnit_Framework_TestCase
{
    public function testGetDbName()
    {
        $_SERVER['HTTP_HOST'] = 'local.example.com';

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
            array('example.com',              'production'),
            array('example.co.uk',            'production'),
            array('www.example.com',          'production'),
            array('www.example.co.uk',        'production'),
            array('local.example.com',        'local'),
            array('local.example.co.uk',      'local'),
            array('staging.example.com',      'staging'),
            array('staging.example.co.uk',    'staging'),
            array('production.example.com',   'production'),
            array('production.example.co.uk', 'production'),
        );
    }
}
