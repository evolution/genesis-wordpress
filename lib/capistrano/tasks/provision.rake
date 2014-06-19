namespace :genesis do
  desc "Provisions remote machine via Ansible"
  task :provision do
    run_locally do
      ansible_path = Dir.pwd + "/lib/ansible"
      provision = "ansible-playbook provision.yml -e stage=#{fetch(:stage)}"

      set :user, ask('user to provision as', fetch(:user))

      if fetch(:user)
        success = system("cd #{ansible_path} && #{provision}")

        unless success
          error "Unable to provision with SSH publickey for \"#{fetch(:user)}\" user"
          puts "Try again with a password:"

          system("cd #{ansible_path} && #{provision} --user=#{fetch(:user)} --ask-pass")
        end
      end
    end
  end
end
