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

namespace :genesis do
    namespace :down do
        desc "Downloads both remote database & syncs remote files into Vagrant"
        task :default do
            db
            files
        end

        desc "Downloads remote database into Vagrant"
        task :db, :roles => :db, :once => true do
            set :backup_dir,  "#{deploy_to}/backups"
            set :backup_name, DateTime.now.strftime("#{db_name}.%Y-%m-%d.%H%M%S.sql")
            set :backup_path, "#{backup_dir}/#{backup_name}"

            pretty_print "Backing up \"#{db_name}\" database"
            run "mkdir -p #{backup_dir}"
            run "mysqldump -u'#{db_user}' -p'#{db_password}' -h'#{db_host}' --opt --databases '#{db_name}' | gzip --rsyncable > #{backup_path}.gz"
            puts_ok

            pretty_print "Downloading backup"
            download "#{backup_path}.gz", "#{backup_name}.gz", :via => :scp
            run "rm -f #{backup_path}.gz"
            system "gzip -d #{backup_name}.gz"
            puts_ok

            pretty_print "Importing backup to Vagrant"
            system "vagrant ssh local -c 'cd /vagrant && mysql -uroot < #{backup_name}' && rm -f #{backup_name}"
            puts_ok
        end

        desc "Downloads remote files to Vagrant"
        task :files, :roles => :web do
            set :excludes, "--exclude '#{rsync_exclude.join('\' --exclude \'')}'"

            ssh = "-e \"ssh -i #{ssh_options[:keys][0]}\"" unless ssh_options.keys.empty?

            pretty_print "Downloading files"
            find_servers_for_task(current_task).each do |current_server|
                system "chmod 600 #{ssh_options[:keys][0]}"
                system "rsync #{ssh} -avvru --delete --copy-links #{excludes} --progress #{'--dry-run' if dry_run} #{user}@#{current_server}:#{remote_web}/ #{local_web}/"
            end
            puts_ok
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
            set :backup_dir,  "#{deploy_to}/backups"
            set :backup_name, DateTime.now.strftime("#{db_name}.%Y-%m-%d.%H%M%S.sql")
            set :backup_path, "#{backup_dir}/#{backup_name}"

            pretty_print "Backing up \"#{db_name}\" database"
            system "vagrant ssh local -c 'cd /vagrant && mysqldump -u\"#{db_user}\" -p\"#{db_password}\" --opt --databases \"#{db_name}\" | gzip --rsyncable > #{backup_name}.gz'"
            puts_ok

            pretty_print "Uploading backup"
            run "mkdir -p #{backup_dir}"
            top.upload "#{backup_name}.gz", "#{backup_path}.gz", :via => :scp
            run "gzip -d #{backup_path}.gz"
            system "rm -f #{backup_name}.gz"
            puts_ok

            pretty_print "Importing backup to #{stage}"
            run "sudo mysql -uroot < #{backup_path}"
            puts_ok
        end

        desc "Uploads local project files to remote"
        task :files, :roles => :web do
            set :excludes, "--exclude '#{rsync_exclude.join('\' --exclude \'')}'"

            pretty_print "Uploading files"
            find_servers_for_task(current_task).each do |current_server|
                system "chmod 600 #{ssh_options[:keys][0]}"
                system "rsync -e \"ssh -i #{ssh_options[:keys][0]}\" -avvru --keep-dirlinks #{excludes} --progress #{'--dry-run' if dry_run} #{local_web}/ #{user}@#{current_server}:#{remote_web}/"
            end
            puts_ok
        end
    end
end
