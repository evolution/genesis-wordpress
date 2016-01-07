require 'pathname'

before "genesis:up:db" do
    set(:confirmed) do
        logger.important <<-WARN

        ========================================================================

            WARNING: You are about to destroy & override the "#{stage}" database!

        ========================================================================

        WARN

        answer = Capistrano::CLI.ui.ask "  Are you sure you want to continue? (YES) "
        if answer === 'YES' then true else false end
    end

    unless fetch(:confirmed)
        logger.info "\Aborted!"
        exit
    end
end

before "genesis:up:files" do
    set(:confirmed) do
        logger.important <<-WARN

        ========================================================

            WARNING: You are about to override "#{stage}" files!

        ========================================================

        WARN

        answer = Capistrano::CLI.ui.ask "  Are you sure you want to continue? (YES) "
        if answer === 'YES' then true else false end
    end

    unless fetch(:confirmed)
        logger.info "\Aborted!"
        exit
    end
end

before "genesis:up:mirror" do
    set(:confirmed) do
        logger.important <<-WARN

        ========================================================

            WARNING: You are about to DESTRUCTIVELY override "#{stage}" files!

        ========================================================

        WARN

        answer = Capistrano::CLI.ui.ask "  Are you sure you want to continue? (YES) "
        if answer === 'YES' then true else false end
    end

    unless fetch(:confirmed)
        logger.info "\Aborted!"
        exit
    end
end

namespace :genesis do
    namespace :down do
        desc "Downloads both remote database & syncs remote files into Vagrant"
        task :default do
            db
            files
        end

        desc "Downloads remote database into Vagrant"
        task :db, :roles => :db, :once => true do
            find_and_execute_task "genesis:backup:db"
            # Rake::Task["namespace:task"].invoke

            system "gzip -d #{local_backup_dir}/#{backup_name}.gz"

            system "vagrant up"
            system "vagrant ssh local -c 'cd /vagrant && mysql -uroot < #{local_backup_dir}/#{backup_name}'"
            system "rm -f #{local_backup_dir}/#{backup_name}"
        end

        desc "Downloads remote files to Vagrant"
        task :files, :roles => :web do
            set :excludes, "--exclude '#{rsync_exclude.join('\' --exclude \'')}'"

            ssh = "-e \"ssh -i #{ssh_options[:keys][0]}\"" unless ssh_options.keys.empty?

            find_servers_for_task(current_task).each do |current_server|
                system "chmod 600 #{ssh_options[:keys][0]}" unless ssh_options.keys.empty?
                system "rsync #{ssh} -avvru --delete --copy-links #{excludes} --progress #{'--dry-run' if dry_run} #{user}@#{current_server}:#{remote_web}/ #{local_web}/"
            end
        end

        desc "Downloads limited dirs to Vagrant"
        task :limited, :roles => :web do
            set :excludes, "--exclude '#{rsync_exclude.join('\' --exclude \'')}'"

            ssh = "-e \"ssh -i #{ssh_options[:keys][0]}\"" unless ssh_options.keys.empty?

            find_servers_for_task(current_task).each do |current_server|
                system "chmod 600 #{ssh_options[:keys][0]}" unless ssh_options.keys.empty?
                rsync_limited.each do |key|
                    system "rsync #{ssh} -avvru --delete --copy-links #{excludes} --progress #{'--dry-run' if dry_run} #{user}@#{current_server}:#{remote_web}/#{key}/ #{local_web}/#{key}/"
                end
            end
        end
    end

    namespace :up do
        desc "Uploads Vagrant database & local files into production"
        task :default do
            db
            files
        end

        desc "Uploads Vagrant database into remote"
        task :db, :roles => :db, :once => true do
            find_and_execute_task "genesis:backup:db"
            sleep(1)

            set :backup_dir,  "#{deploy_to}/backups"
            set :backup_name, DateTime.now.strftime("#{db_name}.%Y-%m-%d.%H%M%S.sql")
            set :backup_path, "#{backup_dir}/#{backup_name}"

            system "vagrant up"
            system "vagrant ssh local -c 'cd /vagrant && mysqldump -u\"#{db_user}\" -p\"#{db_password.gsub('$', '\$')}\" --opt --databases \"#{db_name}\" | gzip --rsyncable > #{backup_name}.gz'"

            run "mkdir -p #{backup_dir}"
            top.upload "#{backup_name}.gz", "#{backup_path}.gz", :via => :scp
            run "gzip -d #{backup_path}.gz"
            system "rm -f #{backup_name}.gz"

            run "sudo mysql -uroot < #{backup_path}"
        end

        desc "Uploads local project files to remote"
        task :files, :roles => :web do
            set :excludes, "--exclude '#{rsync_exclude.join('\' --exclude \'')}'"

            find_servers_for_task(current_task).each do |current_server|
                system "chmod 600 #{ssh_options[:keys][0]}" unless ssh_options.keys.empty?
                system "rsync -e \"ssh -i #{ssh_options[:keys][0]}\" -avvru --keep-dirlinks #{excludes} --progress #{'--dry-run' if dry_run} #{local_web}/ #{user}@#{current_server}:#{remote_web}/"
            end
        end

        desc "Destructively syncs local project files to remote"
        task :mirror, :roles => :web do
            set :excludes, "--exclude '#{rsync_exclude.join('\' --exclude \'')}'"

            find_servers_for_task(current_task).each do |current_server|
                system "chmod 600 #{ssh_options[:keys][0]}" unless ssh_options.keys.empty?
                system "rsync -e \"ssh -i #{ssh_options[:keys][0]}\" -avvru --delete --keep-dirlinks #{excludes} --progress #{'--dry-run' if dry_run} #{local_web}/ #{user}@#{current_server}:#{remote_web}/"
            end
        end

        desc "Uploads limited dirs to remote"
        task :limited, :roles => :web do
            set :excludes, "--exclude '#{rsync_exclude.join('\' --exclude \'')}'"

            find_servers_for_task(current_task).each do |current_server|
                system "chmod 600 #{ssh_options[:keys][0]}" unless ssh_options.keys.empty?
                rsync_limited.each do |key|
                    system "rsync -e \"ssh -i #{ssh_options[:keys][0]}\" -avvru --keep-dirlinks #{excludes} --progress #{'--dry-run' if dry_run} #{local_web}/#{key}/ #{user}@#{current_server}:#{remote_web}/#{key}/"
                end
            end
        end
    end

    namespace :backup do
        desc "Downloads remote database into the backups folder"
        task :default do
            db
        end

        desc "Downloads remote database into the backups folder"
        task :db, :roles => :db, :once => true do
            set :backup_dir,  "#{deploy_to}"
            set :local_backup_dir, "backups"
            set :backup_name, DateTime.now.strftime("#{db_name}.%Y-%m-%d.%H%M%S.sql")
            set :backup_path, "#{backup_dir}/#{backup_name}"

            run "mkdir -p #{local_backup_dir}"
            run "mysqldump -u'#{db_user}' -p'#{db_password}' -h'#{db_host}' --opt --databases '#{db_name}' | gzip --rsyncable > #{backup_path}.gz"

            system "mkdir -p #{local_backup_dir}"
            download "#{backup_path}.gz", "#{local_backup_dir}/#{backup_name}.gz", :via => :scp
            run "rm -f #{backup_path}.gz"
        end
    end
end
