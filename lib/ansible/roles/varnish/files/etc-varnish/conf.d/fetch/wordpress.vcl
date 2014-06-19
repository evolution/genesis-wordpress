# Drop any cookies Wordpress tries to send back to the client.
if (!(req.url ~ "wp-(login|admin)")) {
    unset beresp.http.set-cookie;
}
