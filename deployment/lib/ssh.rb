namespace :genesis do
    namespace :ssh do
        desc "SSH into machine"
        task :default, :roles => :web do
            find_servers_for_task(current_task).each do |current_server|
                system "chmod 600 #{ssh_options[:keys][0]}"
                system "ssh #{user}@#{current_server} -i #{ssh_options[:keys][0]}"
            end
        end
    end
end
