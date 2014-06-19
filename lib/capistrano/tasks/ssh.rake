namespace :genesis do
  desc "SSH into remote machine"
  task :ssh do |host|
    key = fetch(:ssh_options)[:keys].last

    run_locally do
      execute "chmod 600 #{key}"
    end

    on roles(:web) do |host|
      system("ssh #{fetch(:user)}@#{host} -i #{key}")
    end
  end
end
