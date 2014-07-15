<?php

class Genesis
{
    public static function initEnv()
    {
        // Set environment to the last sub-domain (e.g. foo.staging.site.com => 'staging')
        if (!defined('WP_ENV')) {
            define('WP_ENV', Genesis::getEnv());
        }

        return WP_ENV;
    }

    public static function getEnv()
    {
        preg_match('/(?:([\w-]+)\.)?[\w-]+\.co(?:m|\.uk)/', $_SERVER['HTTP_HOST'], $matches);

        $match  = array_pop($matches) ?: 'production';
        $known  = array('local', 'staging', 'production');

        return in_array($match, $known) ? $match : 'production';
    }
}
