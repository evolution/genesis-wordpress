role :db,           "staging.<%= props.domain %>"
role :web,          "staging.<%= props.domain %>"

set :stage,         "staging"

# Open site after deploying
after "deploy" do
    system "open http://#{branch}.#{stage}.#{domain}/"
end
