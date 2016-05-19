namespace :genesis do
    namespace :provision do
        desc "Runs project provisioning script on server"
        task :default do
            if exists?(:override_user)
                logger.info "SSH workaround for https://github.com/evolution/genesis-wordpress/issues/131"
                orig_ev=$expect_verbose
                $expect_verbose=true
                find_servers_for_task(current_task).each do |current_server|
                  logger.info "Transferring keys to #{current_server}"
                  puts "\n"
                  PTY.spawn("scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ./provisioning/files/ssh/id_rsa* #{user}@#{current_server}:~/") do |rd, wt|
                      rd.expect(/password/i, 1) { |r| wt.puts("#{password}") }
                      rd.expect("100%", 1) { |r| sleep(2) }
                  end
                  puts "\n\n"
                  logger.info "Setting up passwordless sudoable deploy on #{current_server}"
                  puts "\n"
                  PTY.spawn("ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null #{user}@#{current_server}") do |rd, wt|
                      # sudo make me a sandwich
                      rd.expect(/password/i, 1) { |r| wt.puts("#{password}") }
                      rd.expect(/[#$] /, 1) { |r| wt.puts("sudo -s") }
                      rd.expect(/password/i, 1) { |r| wt.puts("#{password}") }
                      # create deploy user & .ssh dir
                      rd.expect(/[#$] /, 1) { |r| wt.puts("id -u deploy || useradd -s /bin/bash -m deploy") }
                      rd.expect(/[#$] /, 1) { |r| wt.puts("mkdir -p /home/deploy/.ssh") }
                      rd.expect(/[#$] /, 1) { |r| wt.puts("chmod 755 /home/deploy/.ssh") }
                      # move scp'd keys into place
                      rd.expect(/[#$] /, 1) { |r| wt.puts("mv -f ~/id_rsa* /home/deploy/.ssh/") }
                      rd.expect(/[#$] /, 1) { |r| wt.puts("cp -f /home/deploy/.ssh/id_rsa.pub /home/deploy/.ssh/authorized_keys") }
                      # fix .ssh permissions
                      rd.expect(/[#$] /, 1) { |r| wt.puts("chown -R deploy:deploy /home/deploy/.ssh") }
                      rd.expect(/[#$] /, 1) { |r| wt.puts("chmod -R 600 /home/deploy/.ssh/*") }
                      # setup passwordless sudo
                      rd.expect(/[#$] /, 1) { |r| wt.puts("echo '%deploy ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/deploy") }
                      rd.expect(/[#$] /, 1) { |r| wt.puts("chmod 440 /etc/sudoers.d/deploy") }
                      # UP AND AWAAAAAAY
                      rd.expect(/[#$] /, 1) { |r| sleep(2) }
                      rd.expect(/[#$] /, 1) { |r| wt.puts("exit") }
                  end
                end
                $expect_verbose=orig_ev
                puts "\n\n"
                logger.info "Switching to passwordless deploy user"
                set :user, "deploy"
                unset :password
            end

            begin
                tmp = DateTime.now.strftime("/tmp/#{application}.%Y-%m-%d.%H%M%S")

                run "mkdir -p #{tmp} #{tmp}/bower_components/genesis-wordpress"
                upload "./bin", "#{tmp}/bin", :via => :scp, :recursive => true
                upload "./provisioning", "#{tmp}/provisioning", :via => :scp, :recursive => true
                upload "./bower_components/genesis-wordpress/provisioning", "#{tmp}/bower_components/genesis-wordpress/provisioning", :via => :scp, :recursive => true

                sudo "#{tmp}/bin/provision -e stage=#{stage}"
            rescue
                puts "\n"

                logger.important "Unable to provision as \"#{user}\"!"
                logger.important "Try running: $ cap #{stage} genesis:provision -S user=... -S password=..."
                exit 1
            end
        end
    end
end
