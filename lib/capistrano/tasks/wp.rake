namespace :wp do
  desc "Execute WP-CLI command remotely"
  rule /^wp\:/ do |task|
    on release_roles(:db) do
      within fetch(:wp_path) do
        execute "#{task.name.split(":").join(" ")} --path=\"#{fetch(:wp_path)}\" --url=\"http://#{fetch(:stage)}.#{fetch(:domain)}/\""
      end
    end
  end
end
