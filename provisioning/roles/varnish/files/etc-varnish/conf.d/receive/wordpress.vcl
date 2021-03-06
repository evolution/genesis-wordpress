# Pass all login requests straight through
if (req.url ~ "wp-login") {
    return (pass);
}
# Pipe all admin requests directly
if (req.url ~ "wp-admin") {
    return (pipe);
}

# Pass all requests containing a wp- or wordpress_ cookie
# (meaning NO caching for logged in users)
if (req.http.Cookie ~ "(^|;\s*)(wp-|wordpress_)") {
  return (pass);
}

# Drop *all* cookies sent to Wordpress, if we've gotten this far
unset req.http.Cookie;

# Try a cache-lookup
return (lookup);
