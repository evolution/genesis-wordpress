# Pass all local or login/admin requests straight through
if (req.http.Host ~ "^local\." || (req.url ~ "wp-(login|admin)")) {
    return (pass);
}

if (req.http.Cookie ~ "^wp-" || req.http.Cookie ~ "^wordpress_") {
  return (pass);
}

# Drop any cookies sent to Wordpress.
if (!(req.url ~ "wp-(login|admin)")) {
    unset req.http.Cookie;
}

# Anything else left?
if (!req.http.Cookie) {
    unset req.http.Cookie;
}

# Try a cache-lookup
return (lookup);
