namespace :genesis do
  rule /^genesis\:(?:(?:re)?start|stop)$/ do |task|
    on release_roles(:web) do
      execute :sudo, "/etc/init.d/genesis-wordpress #{task.name.split(":")[1]}"
    end
  end
end
