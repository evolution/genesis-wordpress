backend default {
    .host = "127.0.0.1";
    .port = "8080";
    .probe = {
        .url = "/server-status";
        .timeout  = 1s;
        .interval = 10s;
        .window    = 5;
        .threshold = 2;
    }
    .first_byte_timeout     = 300s;   # How long to wait before we receive a first byte from our backend?
    .connect_timeout        = 5s;     # How long to wait for a backend connection?
    .between_bytes_timeout  = 2s;     # How long to wait between bytes received from our backend?
}
