<?php

/** Include Genesis to use with WordPress */
require_once(dirname(__FILE__) . '/../bower_components/genesis-wordpress/src/Genesis.php');
<%= wpConfigFile
  // Already started PHP
  .replace('<?php', '')

  // Replace DB_*
  .replace('database_name_here',  props.DB_NAME)
  .replace('username_here',       props.DB_USER)
  .replace('password_here',       props.DB_PASSWORD)
  .replace('localhost',           props.DB_HOST)

  // Replace WP_DEBUG
  .replace(/define\('WP_DEBUG'.+\);/, "define('WP_DEBUG', WP_ENV === 'local');")

  // Replace salts
  .replace(/(\/\*\*#@\+.+?\*\/\n).+?(\n\/\*\*#@-\*\/)/m, "$1" + props.salts + "$2")

  // Limit to 5 post revisions, and force direct filesystem IO
  .replace("/* That's all,", "define('WP_POST_REVISIONS', 5);\n\ndefine('FS_METHOD', 'direct');\n\n/*That's all,")
%>
if (WP_ENV !== 'www') {
  Genesis::rewriteUrls();
}
