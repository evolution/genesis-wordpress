set :repo_url, "https://github.com/genesis/wordpress.git"

# Bypass git:check because test repo doesn't recognize this key
Rake::Task['deploy:check'].clear_actions
namespace :deploy do
  desc 'Check required files and directories exist'
  task :check do
    # invoke "#{scm}:check"
    invoke 'deploy:check:directories'
    invoke 'deploy:check:linked_dirs'
    invoke 'deploy:check:make_linked_dirs'
    invoke 'deploy:check:linked_files'
  end
end
