before "deploy:update" do
    deploy.setup
end

after "deploy:update" do
    run "cd #{release_path} && bower install"
end

after "deploy:update",      "genesis:permissions"
after "genesis:up:files",   "genesis:permissions"

after "deploy:restart",     "genesis:restart"
after "genesis:up",         "genesis:restart"
after "genesis:up:db",      "genesis:restart"
after "genesis:up:files",   "genesis:restart"
