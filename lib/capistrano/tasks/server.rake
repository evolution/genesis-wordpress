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
end
