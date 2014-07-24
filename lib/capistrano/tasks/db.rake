namespace :genesis do
  namespace :db do
    task :prepare do
      set :db_backup_file, DateTime.now.strftime("#{fetch(:wp_config)['name']}.%Y-%m-%d.%H%M%S.sql")
      set :db_gzip_file, "#{fetch(:db_backup_file)}.gz"
    end

    desc "Download remote DB to local"
    task :backup do
      invoke "genesis:db:prepare"

      on release_roles(:db) do
        within "/tmp" do
          execute :wp, :db, :export, fetch(:db_backup_file), "--opt", "--path=\"#{fetch(:wp_path)}\"", "--url=\"http://#{fetch(:stage)}.#{fetch(:domain)}/\""
          execute :gzip, fetch(:db_backup_file)
          download! "/tmp/#{fetch(:db_gzip_file)}", fetch(:db_gzip_file)
          execute :rm, fetch(:db_gzip_file)
        end
      end

      run_locally do
        execute :gzip, "-d", fetch(:db_gzip_file)
      end
    end

    desc "Import remote DB to local"
    task :down do
      invoke "genesis:db:backup"

      run_locally do
        execute :vagrant, :up
        execute :vagrant, :ssh, :local,  "-c 'cd /vagrant && mysql -uroot < #{fetch(:db_backup_file)}'"
        execute :rm, fetch(:db_backup_file)
      end
    end

    desc "Export local DB to remote"
    task :up do
      invoke "genesis:db:prepare"

      run_locally do
        execute :vagrant, :up
        execute :vagrant, :ssh, :local, "-c 'cd /vagrant && mysqldump -uroot --opt \"#{fetch(:wp_config)['name']}_local\" > #{fetch(:db_backup_file)}'"
        execute :gzip, fetch(:db_backup_file)
      end

      on release_roles(:db) do
        upload! fetch(:db_gzip_file), "/tmp/#{fetch(:db_gzip_file)}"
        execute :gzip, "-d", "/tmp/#{fetch(:db_gzip_file)}"

        within fetch(:wp_path) do
          execute :wp, :db, :import, "/tmp/#{fetch(:db_backup_file)}", "--path=\"#{fetch(:wp_path)}\"", "--url=\"http://#{fetch(:stage)}.#{fetch(:domain)}/\""
        end

        execute :rm, "/tmp/#{fetch(:db_backup_file)}"
      end

      run_locally do
        execute :rm, fetch(:db_gzip_file)
      end
    end
  end
end
