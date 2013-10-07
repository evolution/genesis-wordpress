require 'pathname'

namespace :wp do
    task :restart, :roles => :web do
        pretty_print "Gracefully restarting Apache"
        invoke_command "sudo /etc/init.d/apache2 graceful"
        puts_ok
    end

    task :start, :roles => :web do
        pretty_print "Starting Apache"
        invoke_command "sudo /etc/init.d/apache2 start"
        puts_ok
    end

    task :stop, :roles => :web do
        pretty_print "Stopping Apache"
        invoke_command "sudo /etc/init.d/apache2 stop"
        puts_ok
    end

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
                system "rsync #{ssh} -avru --delete --copy-links #{excludes} --progress #{'--dry-run' if dry_run} #{user}@#{current_server}:#{remote_web}/ #{local_web}"
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
                system "rsync -e \"ssh -i #{ssh_options[:keys][0]}\" -avru --keep-dirlinks #{excludes} --progress #{'--dry-run' if dry_run} #{local_web} #{user}@#{current_server}:#{remote_web}/"
            end
            puts_ok
        end
    end

    desc "Fix permissions"
    task :permissions do
        pretty_print "Fixing permissions"
        sudo "mkdir -p #{deploy_to}"
        sudo "chown -R #{user}:www-data #{deploy_to}"
        sudo "chmod -R 0775 #{deploy_to}"
        puts_ok
    end

    namespace :tail do
        desc "Tail error log on remote"
        task :default do
            error
        end

        desc "Tail error log on remote"
        task :error, :roles => :web do
            trap("INT") { puts 'Interupted'; exit 0; }
            sudo "tail -f /var/log/apache2/#{stage}.#{domain}-error.log" do |channel, stream, data|
                puts  # for an extra line break before the host name
                puts "#{channel[:host]}: #{data}"
                break if stream == :err
          end
        end
    end
end
