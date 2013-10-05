# after "provision",      "wp:permissions"
after "wp:up:files",    "wp:permissions"

# # Ensure deploy_to is writeable by user
# before "deploy:setup" do
#     wp.permissions
# end

before "deploy:setup" do
    pretty_print "Setting up deployment structure"
end

after "deploy:setup" do
    puts_ok
end

# Ensure entire project is writeable by user
# after "deploy:setup" do
#     wp.permissions
# end

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
    pretty_print "Finishing \"#{stage}\" deployment of \"#{branch}\""
    puts_ok
end

before "wp:up:db" do
    set(:confirmed) do
        logger.important <<-WARN

        ========================================================================

            WARNING: You are about to destroy & override the "#{stage}" database!

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

before "wp:up:files" do
    set(:confirmed) do
        logger.important <<-WARN

        ========================================================

            WARNING: You are about to override "#{stage}" files!

        ========================================================

        WARN

        answer = Capistrano::CLI.ui.ask "  Are you sure you want to continue? (YES) "
        if answer === 'YES' then true else false end
    end

    unless fetch(:confirmed)
        logger.info "\Aborted!"
        exit
    end
end
