namespace :wp do
  desc "Execute WP-CLI command remotely"
  rule /^wp\:/ do |task|
    on release_roles(:db) do
      wp_path = "#{release_path}/web/wp"

      within wp_path do
        execute "#{task.name.split(":").join(" ")} --path=\"#{wp_path}\" --url=\"http://#{fetch(:stage)}.#{fetch(:domain)}/\""
      end
    end
  end
end
