namespace :genesis do
  desc "Export local DB & files to remote"
  task :up do
    invoke "genesis:db:up"
    invoke "genesis:files:up"
  end
end
