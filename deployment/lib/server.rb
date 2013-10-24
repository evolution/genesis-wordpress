require 'pathname'

namespace :genesis do
    desc "Restart Apache + Varnish"
    task :restart, :roles => :web do
        invoke_command "sudo /etc/init.d/apache2 graceful"
        invoke_command "sudo /etc/init.d/varnish restart"
    end


    desc "Start Apache + Varnish"
    task :start, :roles => :web do
        invoke_command "sudo /etc/init.d/apache2 start"
        invoke_command "sudo /etc/init.d/varnish start"
    end

    desc "Stop Apache + Varnish"
    task :stop, :roles => :web do
        invoke_command "sudo /etc/init.d/apache2 stop"
        invoke_command "sudo /etc/init.d/varnish stop"
    end

    desc "Fix permissions"
    task :permissions do
        run "chmod -R #{user}:www-data #{remote_web}"
        run "find -L #{remote_web} -type d -exec chmod 775 {} \\; -exec chmod g+s {} \\;"
        run "find -L #{remote_web} -type f -exec chmod 664 {} \\;"
    end

    namespace :logs do
        desc "Tail Apache error logs"
        task :default, :roles => :web do
            trap("INT") { puts 'Interupted'; exit 0; }
            sudo "tail -f /var/log/apache2/#{stage}.#{domain}-error.log" do |channel, stream, data|
                puts  # for an extra line break before the host name
                puts "#{channel[:host]}: #{data}"
                break if stream == :err
          end
        end
    end
end
