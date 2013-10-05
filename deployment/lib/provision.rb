namespace :provision do
    desc "Runs project provisioning script on server"
    task :default do
        script
    end

    desc "Runs project provisioning script on server"
    task :script do
        begin
            tmp = DateTime.now.strftime("/tmp/#{application}.%Y-%m-%d.%H%M%S")

            pretty_print "Uploading provisioning scripts"
            run "mkdir -p #{tmp} #{tmp}/bower_components/genesis-wordpress"
            upload "./bin", "#{tmp}/bin", :via => :scp, :recursive => true
            upload "./provisioning", "#{tmp}/provisioning", :via => :scp, :recursive => true
            upload "./bower_components/genesis-wordpress/provisioning", "#{tmp}/bower_components/genesis-wordpress/provisioning", :via => :scp, :recursive => true
            puts_ok

            pretty_print "Running provisioning script"
            sudo "#{tmp}/bin/provision"
            puts_ok
        rescue
            puts "\n"

            logger.important "Unable to provision as \"#{user}\"!"
            logger.important "Try running: $ cap #{stage} provision -S user=... -S password=..."
            exit 1
        end
    end

    desc "Creates new server for deployment"
    task :create, :roles => :web do
        # TODO
        #
        # Creates a brand new server in the environment defined in production.rb
        # Spits back out credentials, logins, etc. from the Puppet/whatever service
        default
    end
end
