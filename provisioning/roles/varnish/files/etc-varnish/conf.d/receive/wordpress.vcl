# Drop any cookies sent to Wordpress.
if (!(req.url ~ "wp-(login|admin)")) {
    unset req.http.cookie;
}

# Anything else left?
if (!req.http.cookie) {
    unset req.http.cookie;
}

# Try a cache-lookup
return (lookup);
