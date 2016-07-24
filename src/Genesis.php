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

    public static function rewriteUrls()
    {
        if (!function_exists('is_blog_installed') || !is_blog_installed()) {
            return false;
        }

        // Remove domain from uploads
        update_option('upload_path', null);

        $old_url = site_url();
        $new_url = ($_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];

        // Ensure internal WordPress functions map correctly to new url (but don't want to persist in the DB)
        add_filter('option_home',             function($value) use ($old_url, $new_url) { return str_replace($old_url, $new_url, $value); });
        add_filter('option_siteurl',          function($value) use ($old_url, $new_url) { return str_replace($old_url, $new_url, $value); });
        add_filter('option_upload_path',      function($value) use ($old_url, $new_url) { return str_replace($old_url, $new_url, $value); });
        add_filter('option_upload_url_path',  function($value) use ($old_url, $new_url) { return str_replace($old_url, $new_url, $value); });
        add_filter('wp_get_attachment_url',   function($value) use ($old_url, $new_url) { return str_replace($old_url, $new_url, $value); });

        // Override URLs in output with local environment URL
        ob_start( function( $output ) use ( $old_url, $new_url ) {
            return str_replace( $old_url, $new_url, $output );
        } );

        register_shutdown_function( function() {
            @ob_end_flush();
        } );
    }
}

Genesis::initEnv();
