namespace :genesis do
    namespace :ssh do
        desc "SSH into machine"
        task :default, :roles => :web do
            find_servers_for_task(current_task).each do |current_server|
                system "ssh #{user}@#{current_server} -i ./provisioning/files/ssh/id_rsa"
            end
        end
    end
end
