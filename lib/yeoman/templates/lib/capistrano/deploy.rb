# config valid only for Capistrano 3.2.1
lock '3.2.1'

# Repository name
set :application,   "<%= props.name %>"
set :domain,        "<%= props.domain %>"
set :deploy_to,     "/var/www/#{fetch(:domain)}/#{fetch(:stage)}/#{fetch(:branch)}"
set :wp_path,       "#{release_path}/web/wp"

namespace :deploy do
  after :updated, :bower_install do
    on roles(:web) do
      execute "cd #{release_path} && bower install --config.interactive=false"
    end
  end
end
