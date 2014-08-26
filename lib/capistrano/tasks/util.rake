namespace :genesis do
  task :confirm, :message do |task, args|
    # interpret env values of blank, "false", or "0" as falsey
    if ENV.has_key?('genesis_non_interactive')
      do_prompt = !! (ENV['genesis_non_interactive'] =~ /^(false|0)?$/i)
    else
      do_prompt = true
    end

    if do_prompt
      fence = "=" * (args[:message].length + 20)
      warn <<-WARN

      #{fence}

          WARNING: #{args[:message]}

      #{fence}

WARN

      ask :confirmation, "Enter YES to continue"
      if fetch(:confirmation) != 'YES' then
        warn "Aborted!"
        exit
      end

      Rake::Task['genesis:confirm'].reenable
    end
  end
end
