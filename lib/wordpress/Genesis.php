<?php

class Genesis
{
    public static function initEnv()
    {
        if (!defined('WP_ENV')) {
            // Set environment to the last sub-domain (e.g. foo.staging.site.com => 'staging')
            define('WP_ENV', array_pop(array_splice(explode('.', $_SERVER['HTTP_HOST']), 0, -2)));
        }

        return WP_ENV;
    }
}

Genesis::initEnv();
