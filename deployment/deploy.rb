# Capistrano multistage files
set :stage_dir,     "deployment/stages"

begin
    require "capistrano"
    require "capistrano/ext/multistage"
    require "colored"
rescue LoadError
  puts "You need to run: $ gem install capifony capistrano-ext colored"
  exit
end

# Load local recipes
Dir[File.expand_path(File.dirname(__FILE__)) + '/lib/*.rb'].each { |recipe| load(recipe) }

# Infer Git repository from current repo
set :repository,        (`git config --get remote.origin.url`).strip!

# Infer branch (unless overridden via -S) from current repo
set :branch,            (`git branch`.match(/\* (\S+)\s/m)[1] || "master") unless exists?(:branch)

# Sudo shouldn't be required
set :use_sudo,          false

# This is the fastest way to deploy, once the branch is live
set :deploy_via,        :remote_cache

# Files will be owned by deploy:www-data
set :group_writable,    true

# When rsync'ing files, ignore these paths
set :rsync_exclude,     [".git", ".test", ".vagrant", "wp-content/cache"]

# Setting current_release just in case
set :current_release,   ""

# Remote web root for rsync'ing,
set(:remote_web)        { "#{current_path}/web" }

# Keep 5 previous releases, used with deploy:cleanup
set :keep_releases,     5

# Prevent creation of public/images,javascripts,assets
set :normalize_asset_timestamps, false

# If user is not specified (i.e. `cap -S user=foo`), assume deploy + private key
if not exists?(:user)
    set :user,          "deploy"
    set :ssh_options,   {
        :forward_agent  =>  true,
        :auth_methods   =>  ["publickey"],
        :keys           =>  ["./provisioning/files/ssh/id_rsa"]
    }
end

# Auto-detect DB_* constants from wp-config.php
File.read('./web/wp-config.php').scan(/DB_(\w+)(?:'|"),\s+(?:'|")([^\'\"]*)/).each do | match |
    set "db_#{match[0].downcase}", "#{match[1]}"
end

# Default bash shell options
default_run_options[:pty]   = true
default_run_options[:shell] = "/bin/bash"

# Enable pretty output+errors
pretty_errors
