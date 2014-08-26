namespace :genesis do
  desc "Import remote DB & files to local"
  task :down do
    invoke "genesis:db:down"
    invoke "genesis:files:down"
  end
end
