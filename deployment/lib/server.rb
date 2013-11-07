require 'pathname'

before "genesis:teardown" do
    set(:confirmed) do
        logger.important <<-WARN

        ========================================================================

            WARNING: You are about to permanently remove everything within #{deploy_to}

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

namespace :genesis do
    desc "Restart Apache + Varnish"
    task :restart, :roles => :web do
        sudo "/etc/init.d/apache2 graceful"
        sudo "/etc/init.d/varnish restart"
    end


    desc "Start Apache + Varnish"
    task :start, :roles => :web do
        sudo "/etc/init.d/apache2 start"
        sudo "/etc/init.d/varnish start"
    end

    desc "Stop Apache + Varnish"
    task :stop, :roles => :web do
        sudo "/etc/init.d/apache2 stop"
        sudo "/etc/init.d/varnish stop"
    end

    desc "Tear down anything previously deployed"
    task :teardown, :roles => :web do
        sudo "rm -rf #{deploy_to}"
    end

    desc "Fix permissions"
    task :permissions do
        # Avoid uploading problems if Apache owns directories
        run "find #{remote_web} -follow -type d -exec chown :www-data {} \\;"

        # Both deploy & Apache have 1st control of directories
        run "find #{remote_web} -follow -type d -exec chmod 775 {} \\;"

        # Files should not be executable, but deploy + Apache still have control
        run "find #{remote_web} -follow -type f -exec chmod 644 {} \\;"
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
