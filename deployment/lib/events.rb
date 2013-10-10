before "deploy:setup" do
    pretty_print "Setting up deployment structure"
end

after "deploy:setup" do
    puts_ok
end

before "deploy:update" do
    pretty_print "Starting \"#{stage}\" deployment of \"#{branch}\""
    puts_ok

    deploy.setup
end

before "deploy:update_code" do
  msg = "Updating code base with via #{deploy_via}"

  if logger.level == Logger::IMPORTANT
    pretty_errors
    puts msg
  else
    puts msg.green
  end
end

after "deploy:update" do
    pretty_print "Installing Bower dependencies"
    run "cd #{release_path} && bower install"
    puts_ok
end

after "deploy:update" do
    pretty_print "Finishing \"#{stage}\" deployment of \"#{branch}\""
    puts_ok
end

after "deploy:restart", "genesis:restart"
