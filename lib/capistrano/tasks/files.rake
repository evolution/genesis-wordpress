namespace :genesis do
  namespace :files do
    task :prepare, :key_file, :path_from, :path_to do |task, args|
      run_locally do
        execute "chmod 600 #{args[:key_file]}"
      end

      set :rsync_cmd, "vagrant ssh local -c 'cd /vagrant && rsync -e \"ssh -i #{args[:key_file]}\" -avvru --delete --copy-links --progress #{args[:path_from]}/ #{args[:path_to]}/'"
    end

    desc "Download remote uploads to Vagrant"
    task :down do
      local_uploads = "/vagrant/web/wp-content/uploads"
      remote_uploads = "#{release_path}/web/wp-content/uploads"
      uploads_exist = false

      on roles(:web) do |host|
        uploads_exist = test "[ -d #{remote_uploads} ]"
      end

      if uploads_exist
        key = fetch(:ssh_options)[:keys].last

        run_locally do
          execute :vagrant, :up
        end

        on roles(:web) do |host|
          invoke "genesis:files:prepare", key, "#{fetch(:user)}@#{host}:#{remote_uploads}", local_uploads
          info ":: Running via system call: #{fetch(:rsync_cmd)}"
          system fetch(:rsync_cmd)
        end
      else
        warn "!! No remote uploads to sync...skipping"
      end
    end

    desc "Uploads local uploads to remote"
    task :up do
      local_uploads = "/vagrant/web/wp-content/uploads"
      remote_uploads = "#{release_path}/web/wp-content/uploads"
      uploads_exist = false

      run_locally do
        execute :vagrant, :up
        uploads_exist = test :vagrant, :ssh, :local, "-c '[ -d #{local_uploads} ]'"
      end

      if uploads_exist
        key = fetch(:ssh_options)[:keys].last

        on roles(:web) do |host|
          invoke "genesis:files:prepare", key, local_uploads, "#{fetch(:user)}@#{host}:#{remote_uploads}"
          info ":: Running via system call: #{fetch(:rsync_cmd)}"
          system fetch(:rsync_cmd)
        end
      else
        warn "!! No local uploads to sync...skipping"
      end
    end
  end
end
