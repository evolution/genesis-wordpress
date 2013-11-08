role :db,           "www.<%= props.domain %>"
role :web,          "www.<%= props.domain %>"

set :stage,         "old"
set :branch,        "master"

set :stage,         "old"
set :user,          "myuser"        # SSH user
set :password,      "mypassword"    # SSH password
set :ssh_options,   {}              # Ignore "deploy" private key authentication

# Many shared hosts only allow access to the user's home directory
set :deploy_to,     "/home/#{user}/genesis"

# Where the "web" folder is located on the server
set :remote_web,    "/home/#{user}/public_html"
