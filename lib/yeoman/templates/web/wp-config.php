<?php

/* Include Genesis to use with WordPress */
require_once(dirname(__FILE__) . '/../bower_components/genesis-wordpress/lib/wordpress/Genesis.php');
<%= wpConfigFile
  // Already started PHP
  .replace('<?php', '')

  // Replace table prefix
  .replace(/(\$table_prefix\s*=\s*['"]).+(["'])/, '$1' + props.prefix + '$2')

  // Replace DB_*
  .replace("'database_name_here'","Genesis::getDbName('" + props.DB_NAME + "')")
  .replace('username_here',       props.DB_USER)
  .replace('password_here',       props.DB_PASSWORD)
  .replace('localhost',           props.DB_HOST)

  // Replace WP_DEBUG
  .replace(/define\('WP_DEBUG'.+\);/, "define('WP_DEBUG', Genesis::getEnv() === 'local');")

  // Replace salts
  .replace(/(\/\*\*#@\+(?:.|[\r\n])+?\*\/[\r\n]+)(?:.|[\r\n])+?([\r\n]+\/\*\*#@-\*\/)/m, '$1__GENERATED_SALTS_PLACEHOLDER__$2')
  .split('__GENERATED_SALTS_PLACEHOLDER__').join(props.salts)

  // Limit to 5 post revisions, and force direct filesystem IO
  .replace("/* That's all,",
    [
      "/**",
      " * Custom overrides",
      " */",
      "define('AUTOMATIC_UPDATER_DISABLED', true);",
      "define('CONTENT_DIR', '/wp-content');",
      "define('DISABLE_WP_CRON', true);",
      "define('DISALLOW_FILE_EDIT', true);",
      "define('FS_METHOD', 'direct');",
      "define('WP_AUTO_UPDATE_CORE', false);",
      "define('WP_CONTENT_DIR', dirname(__FILE__) . CONTENT_DIR);",
      "define('WP_CONTENT_URL', CONTENT_DIR);",
      "define('WP_ENV', Genesis::getEnv());",
      "define('WP_HOME', '/');",
      "define('WP_POST_REVISIONS', 5);",
      "define('WP_SITEURL', '/wp');",
      "/* That's all,",
    ].join('\n')
  )

  // Replace ABSPATH
  .replace(/define\('ABSPATH'.+\);/, "define('ABSPATH', dirname(__FILE__) . '/wp/');")
%>
