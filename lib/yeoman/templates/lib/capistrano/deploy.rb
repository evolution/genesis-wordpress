# config valid only for Capistrano 3.2.1
lock '3.2.1'

# Repository name
set :application,   "<%= props.name %>"
set :domain,        "<%= props.domain %>"
set :deploy_to,     "/var/www/#{fetch(:domain)}/#{fetch(:stage)}/#{fetch(:branch)}"
