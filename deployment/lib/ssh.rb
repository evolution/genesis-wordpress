namespace :ssh do
    desc "SSH into machine"
    task :default do
        system "ssh #{user}@#{stage}.#{domain} -i ./provisioning/files/ssh/id_rsa"
    end
end
