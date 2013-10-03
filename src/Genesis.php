<?php

class Genesis
{
    public static function isDebug()
    {
        return WP_ENV === 'local';
    }

    public static function initEnv()
    {
        if (!defined('WP_ENV')) {
            // Set environment to the last sub-domain (e.g. foo.staging.site.com => 'staging')
            define('WP_ENV', array_pop(array_splice(explode('.', $_SERVER['HTTP_HOST']), 0, -2)));
        }

        return WP_ENV;
    }

    public static function rewriteUrls()
    {
        $old_url = site_url();
        $new_url = 'http://' . $_SERVER['HTTP_HOST'];

        define('WP_SITEURL', $new_url);

        update_option('upload_path', null);

        ob_start( function( $output ) use ( $old_url, $new_url ) {
            return str_replace( $old_url, $new_url, $output );
        } );

        register_shutdown_function( function() {
            @ob_end_flush();
        } );
    }
}

Genesis::initEnv();
