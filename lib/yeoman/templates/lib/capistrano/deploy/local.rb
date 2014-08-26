server 'local.<%= props.domain %>',
  roles:        %w{db web},
  user:         fetch(:user),
  ssh_options:  fetch(:ssh_options)

set :wp_path,   "/vagrant/web/wp"
