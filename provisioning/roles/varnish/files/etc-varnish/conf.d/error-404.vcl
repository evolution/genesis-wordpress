# The vcl_error() procedure
set obj.http.Content-Type = "text/html; charset=utf-8";
set obj.http.Retry-After = "5";

synthetic {"
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>"} + obj.status + " " + obj.response + {"</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Backend Error page">
        <meta name="author" content="Pascal A.">
        <meta name="generator" content="vim">
        <meta http-equiv="Content-Type" content="text/html;charset=utf-8" >
        <!-- Le styles -->
        <link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.1/css/bootstrap-combined.min.css" rel="stylesheet">
        <style>
            body {
                padding-top: 60px; /* 60px to make the container go all the way to the bottom of the topbar */
            }
        </style>
        <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
        <!--[if lt IE 9]>
        <script src="//html5shim.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
    </head>
    <body>
        <div class="container">
            <div class="page-header">
                <h1 class="pagination-centered">Error "} + obj.status + " " + obj.response + {"</h1>
            </div>
        </div>
        <script src="//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.1/js/bootstrap.min.js"></script>
    </body>
</html>
"};
