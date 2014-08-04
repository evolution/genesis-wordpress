namespace :genesis do
  task :service, :action do |task, args|
    on release_roles(:web) do
      execute :sudo, "/etc/init.d/genesis-wordpress #{args[:action]}"
    end
  end

  desc "Stop installed genesis web services"
  task :stop do
    invoke "genesis:service", "stop"
  end

  desc "Start installed genesis web services"
  task :start do
    invoke "genesis:service", "start"
  end

  desc "Restart installed genesis web services"
  task :restart do
    invoke "genesis:service", "restart"
  end

  namespace :logs do
    namespace :apache do
      task :tail, :action do |task, args|
        on release_roles(:web) do
          execute :sudo, "tail -f /var/log/apache2/#{fetch(:stage)}.#{fetch(:domain)}-#{args[:action]}.log"
        end
      end

      desc "Tail apache access log"
      task :access do
        invoke "genesis:logs:apache:tail", "access"
      end

      desc "Tail apache error log"
      task :error do
        invoke "genesis:logs:apache:tail", "error"
      end
    end

    desc "View varnishlog"
    task :varnish do
      on release_roles(:web) do
        execute :sudo, "varnishlog"
      end
    end

    desc "Tail pound syslog"
    task :pound do
      on release_roles(:web) do
        execute :sudo, "tail -f /var/log/syslog | grep --line-buffered 'pound:'"
      end
    end
  end

  desc "Fix remote filesystem permissions"
  task :permissions do
    on release_roles(:web) do
      # Ensure directories are group-owned by apache & group executable; SGID
      execute :sudo, "find -L #{release_path}/web -type d -exec chown :www-data {} \\; -exec chmod 775 {} \\; -exec chmod g+s {} \\;"
      # Ensure files are group readable
      execute :sudo, "find -L #{release_path}/web -type f -exec chmod 664 {} \\;"
    end
  end

  desc "Remove remote deployments"
  task :teardown do
    on release_roles(:web) do
      execute :sudo, "rm -rf #{deploy_to}"
    end
  end
end
