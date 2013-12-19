# Genesis WordPress

[![Build Status](https://travis-ci.org/genesis/wordpress.png)](https://travis-ci.org/genesis/wordpress)


> Rapidly create, develop, & deploy WordPress across multiple environments.
> ![Genesis WordPress Demo](demo.gif)

## Features

- Generate a functional WordPress site + server
- First-class local development
- Independently stage features for review
- Use production data when developing
- High-performance, zero-configuration caching out of the box
- Easily monitor remote server errors
- Instant, secure SSH access
- Automated server provisioning
- Consistent, reliable environments


## Installation

Ensure you have the latest versions of [NodeJS][9] **v0.10**, [Vagrant v1.3.*](http://downloads.vagrantup.com), & [VirtualBox v.4.2.*](https://www.virtualbox.org/wiki/Download_Old_Builds_4_2).

### Scaffolding & Development

Install [Yeoman][2] **v1**, [Bower][6] **v1.2**, [Genesis WordPress Generator][1], & [Vagrant Host Manager][4]:

    $ npm install -g yo bower generator-genesis-wordpress
    $ vagrant plugin install vagrant-hostmanager

If you get EMFILE issues, try running: `$ ulimit -n 4096`.

*(You can check your versions by running `node --version`, `npm --version`, etc.)*

### Deployment

Install [Capistrano v2.15.*][5] & [Ansible][7]:

    $ sudo gem install capistrano -v 2.15 capistrano-ext colored
    $ sudo easy_install pip
    $ sudo pip install ansible


## Getting Started


## Step 1 – Creating or Upgrading a Site

*Use the [Genesis WordPress Generator][1] for scaffolding.*


## Step 2 – Working Locally

First, ensure you're using the latest version of [Genesis WordPress][0] with [Bower][6]:

    $ bower update

Next, use [Vagrant][3] to create & provision your local environment:

    $ vagrant up

Now open http://local.mysite.com (or whatever your site's domain name is)!

If the site doesn't load for you, you may have to manually
provision your local machine:

    $ vagrant provision

Or, update your local `/etc/hosts` with [Vagrant Host Manager][4]:

    $ vagrant hostmanager

Finally, if things worked while you were at the office but broke when you got home, you probably need to just get Vagrant a new IP address:

    $ vagrant reload


## Step 3 – Wrapping Up

When you're done working on your site, suspend the VM to save on CPU & memory:

    $ vagrant suspend

You can destroy the VM entirely (while keeping your local files) to save on disk space:

    $ vagrant destroy


## Deployment

First, ensure your project on Github can be accessed by remote servers.  To do this,
access the project's *Settings -> Deploy Keys* in Github and add `provisioning/files/ssh/id_rsa.pub`.

Next, assuming the server has been provisioned, deploy your code on Github:

    $ cap production deploy

The latest code is now live:

    > http://production.mysite.com/

If you deploy to `staging`, the name of the current branch (e.g. `my-feature`) is deployed:

    > http://my-feature.staging.mysite.com/

In the rare event the changes weren't supposed to go live, you can rollback to the previous release:

    $ cap production deploy:rollback

**Note that deployments use the project's *Github repository* as the source, not your local machine!**


## Syncing Files/Database

### From Local to Remote

Suppose you have just provisioned & deployed to a new server, but the site obviously won't work without
a database or uploaded images.

You can **overwrite the remote database** with your local VM's:

    $ cap production genesis:up:db

You can sync your local files to the remote filesystem:

    $ cap production genesis:up:files

Or, you can perform both actions together:

    $ cap production genesis:up

Once a site is live, you *rarely* need to sync anything up to the remote server.  If anything,
you usually sync changes *down*.


### From Remote to Local

Suppose you have a live site that you need to work on locally.  Like the previous section,
you can sync down the database, the files (e.g. uploaded images), or both:

    $ cap production genesis:down:db
    $ cap production genesis:down:files
    $ cap production genesis:down


## Provisioning

The following environments are expected to exist and resolve via DNS to simplify deployment & provisioning:

- `local` (e.g. http://local.mysite.com)
- `staging` (e.g. http://staging.mysite.com/, http://my-feature.staging.mysite.com/)
- `production` (e.g. http://production.mysite.com/, http://www.mysite.com/, http://mysite.com/)

If you're deploying to a new machine (e.g. production.mysite.com), you first need to provision it:

    $ cap production genesis:provision

If there is an error, you may be prompted to re-run the command with an explicit username/password:

    $ cap production genesis:provision -S user=myuser -S password=mypassword

*From that point on, tasks will use a private key (`provisioning/files/ssh/id_rsa`).*

In the event you already have a live site, you can modify the settings in `deployment/stages/old.rb` to
migrate the old server to a new server:

    # Start the local VM
    $ vagrant up

    # Provision the new server
    $ cap production provision
    $ cap production deploy

    # Download the old site to local
    $ cap old genesis:down

    # Upload the old site to production
    $ cap production genesis:up

Now you can switch DNS for http://www.mysite.com/ to point to http://production.mysite.com/'s IP!

## Genesis Tasks

Most of the functionality regarding remote servers are handled by custom [Capistrano][5] tasks,
which you can see by running:

    $ cap -T genesis
    cap genesis:down        # Downloads both remote database & syncs remote files into Vagrant
    cap genesis:down:db     # Downloads remote database into Vagrant
    cap genesis:down:files  # Downloads remote files to Vagrant
    cap genesis:logs        # Tail Apache error logs
    cap genesis:permissions # Fix permissions
    cap genesis:provision   # Runs project provisioning script on server
    cap genesis:restart     # Restart Apache + Varnish
    cap genesis:ssh         # SSH into machine
    cap genesis:start       # Start Apache + Varnish
    cap genesis:stop        # Stop Apache + Varnish
    cap genesis:up          # Uploads Vagrant database & local files into production
    cap genesis:up:db       # Uploads Vagrant database into remote
    cap genesis:up:files    # Uploads local project files to remote
    cap genesis:teardown    # Remove any existing remote deployment files; counterpart to cap's built-in deploy:setup

Now run any one of those commands against an environemnt:

    $ cap local genesis:restart

## Troubleshooting

### SSH - Prompting for a password

If you're seeing this:

    $ cap staging genesis:ssh
    deploy@staging.example.com's password:

Then the `deploy` user's ssh keys on your remote server *do not match* the keys in your local repository.

You should first ensure that your local repository is up to date, thereby ensuring you are using the latest versioned ssh keys.

    $ git checkout master
    $ git pull origin master
    $ cap staging genesis:ssh

If the problem persists, this means that the keys on your remote server are out of date or otherwise incorrect, and you must re-provision by specifying a username and password:

    $ cap staging genesis:provision -S user=userWithRootOrSudoAccess -S password=usersHopefullyStrongPassword

### SSH - Host key mismatch

If you're seeing this:

    $ cap staging genesis:ssh
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    @    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
    Someone could be eavesdropping on you right now (man-in-the-middle attack)!
    It is also possible that a host key has just been changed.
    The fingerprint for the RSA key sent by the remote host is
    d3:4d:b4:4f:d3:4d:b4:4f:d3:4d:b4:4f:d3:4d:b4:4f.
    Please contact your system administrator.
    Add correct host key in ~/.ssh/known_hosts to get rid of this message.
    Offending RSA key in ~/.ssh/known_hosts:68
    RSA host key for staging.example.com has changed and you have requested strict checking.
    Host key verification failed.

Then you have at least one existing entry in your `~/.ssh/known_hosts` file (indicated, in the example above, to be on line 68), with a *different* key than the server is returning.

You can search for all line(s) matching the server name and/or ip address using `grep`:

    $ cat ~/.ssh/known_hosts | grep -n "staging.example.com"
    68:staging.example.com,192.168.1.42 ssh-rsa AAAAB3NzaCd34db33f...

Now, remove those lines from said file, using your text editor of choice.

### SSH - Permission denied (publickey)

If you're seeing this:

```
    servers: ["production.yourwebsite.com"]
    [production.yourwebsite.com] executing command
 ** [production.yourwebsite.com :: out] Permission denied (publickey).
 ** [production.yourwebsite.com :: out] fatal: The remote end hung up unexpectedly
```

Then you probably need to add the SSH keys to your GitHub repo. Open `provisioning/files/ssh/id_rsa.pub` and copy/paste the entire contents (the ssh-rsa key) to your repo by visiting __Settings > Deploy Keys > Add deploy key__.

For more help on this, refer to the [GitHub Docs](https://help.github.com/articles/error-permission-denied-publickey).

### SSH - SSH Authentication Failed!

If you're seeing this:

```
SSH authentication failed! This is typically caused by the public/private
keypair for the SSH user not being properly set on the guest VM. Please
verify that the guest VM is setup with the proper public key, and that
the private key path for Vagrant is setup properly as well.
```

Then you're probably missing the [Vagrant Public](https://raw.github.com/mitchellh/vagrant/master/keys/vagrant.pub) Key in your `authorized_keys`. To add it run:
`curl https://raw.github.com/mitchellh/vagrant/master/keys/vagrant.pub >> ~/.ssh/authorized_keys`

### Vagrant - Error While Executing `VBoxManage`

If you're seeing this:

```
There was an error while executing `VBoxManage`, a CLI used by Vagrant
for controlling VirtualBox. The command and stderr is shown below.

Command: ["hostonlyif", "create"]
```

The you'll need to restart VirtualBox with:
```
sudo /Library/StartupItems/VirtualBox/VirtualBox restart
```

## Changelog

- v0.2.41 – Fix Varnish cookie bug ([#90](https://github.com/genesis/wordpress/pull/90))
- v0.2.40 – Set hostname on each machine ([#45](https://github.com/genesis/wordpress/pull/45))
- v0.2.39 – Revert v0.2.37 (aa9e83f)
- v0.2.38 – Move events to after `deploy:update_code` ([#82](https://github.com/genesis/wordpress/pull/82))
- v0.2.37 – Fix isues with Varnish ([#62](https://github.com/genesis/wordpress/pull/62):
    - Cleaned up cookie logic in `production.vcl` (see #28, and 3fd9d0c)
    - Fixed wp cookie check in `receive/wordpress.vcl` (see 9c2f358)
    - Changed varnish to file backend (see #53)
    - Removed cache bypassing for local env (see fa96873)
    - Removed caching of static files (see 99eb9ad)
    - Piping `wp-(login|admin)` instead of passing (see 89cb137)
- v0.2.36 – Add `postfix` ([#72](https://github.com/genesis/wordpress/pull/72))
- v0.2.35 – Add `genesis:teardown` ([#55](https://github.com/genesis/wordpress/pull/55)) & fix `date.timezone` ([#73](https://github.com/genesis/wordpress/pull/73))
- v0.2.34 – Default to WordPress 3.7.1 ([#74](https://github.com/genesis/wordpress/pull/74))
- v0.2.33 – Allow two-part TLDs ([#77](https://github.com/genesis/wordpress/issues/77https://github.com/genesis/wordpress/issues/77))
- v0.2.32 – Fix issue with adding `deploy` user to `www-data` group ([#70](https://github.com/genesis/wordpress/pull/70))
- v0.2.31 – Attempt to fix issues with `genesis:permissions` ([#54](https://github.com/genesis/wordpress/pull/54))
- v0.2.30
    - Run `vagrant up` prior to `genesis:up:db` and `genesis:down:db` ([#59](https://github.com/genesis/wordpress/pull/59))
    - Use VirtualBox's `natdnshostresolver1` to resolve DNS ([#65](https://github.com/genesis/wordpress/pull/65/files))
    - [Ensure SSH port is not an octet](https://github.com/genesis/wordpress/pull/66)
- v0.2.29 – [Apache + PHP performance tuning](https://github.com/genesis/wordpress/pull/64)
- v0.2.28 – Update with last PRs from Genesis WordPress Generator
- v0.2.27 – Awwww snap!! Making it so the [Genesis WordPress Generator](https://github.com/genesis/generator-wordpress) is always up-to-date!
- v0.2.26 – Use `sudo` instead of `invoke_command` ([#41](https://github.com/genesis/wordpress/issues/41))
- v0.2.25 – Directories are now `775` and owned by `deploy:www-data` ([#31](https://github.com/genesis/wordpress/issues/31))
- v0.2.24 – Set Varnish & PHP to `512M`
- v0.2.23 – Only bypass for logged in users, not logged out
- v0.2.22 – Bypass cache for logged in users ([#19](https://github.com/genesis/wordpress/pull/19))
- v0.2.21 – Run genesis:permissions on server, not local!
- v0.2.20 – Fix `genesis:permissions`
- v0.2.19 – Fix permissions after `deploy` & `genesis:files:up`
- v0.2.18 – Remove pretty_print.  **VERBOSE ERRORS FTW!!!**
- v0.2.17 – Add `curl` as default module
- v0.2.17 – Don't sync `.sql` files by default
- v0.2.16 – `chmod 600` the ssh key only if it exists
- v0.2.15 – Rename production logs from `www-` to `production-`
- v0.2.14 – Localize `wp_get_attachment_url`
- v0.2.13 – `chmod 600` the ssh key when running `genesis:down/up`
- v0.2.12 – Remove `genesis:restart` after `genesis:down:*`
- v0.2.11 – Fix URLs for uploads & permalinks
- v0.2.10 – Fix get_option( 'home' )
- v0.2.9 – Remove probe for `/server-status`
- v0.2.8 – Fix local access log
- v0.2.7 – Restart after all `genesis:down:*` and `genesis:up:*`
- v0.2.6 – Add priority to vhosts
- v0.2.5 – Set deploy shell to `/bin/bash`
- v0.2.4 – `genesis:restart` runs on all `genesis:up` commands
- v0.2.3 – Fix bug with static assets being cached by Varnish
- v0.2.2 – Fix bug when inferring `:branch`
- v0.2.1 – Fix bug when `git branch` returns nothing
- v0.2.1 – Remove Varnish error pages
- v0.2.0 – Rename `genesis:tail` to `genesis:logs`
- v0.1.21 – Bypass Varnish for `4xx` & `5xx` error codes
- v0.1.20 – Bypass Varnish for `local.`, `wp-login`, and `wp-admin`
- v0.1.20 – Run `genesis:restart` after `deploy:restart`
- v0.1.19 – Add Varnish to `restart`, `start`, `stop`
- v0.1.18 – Initial Varnish
- v0.1.17 – Add `shared_children`
- v0.1.16 – `chmod 600 id_rsa`
- v0.1.15 – Sync with generator-genesis-wordpress#`0.1.6`
- v0.1.14 – Re-order NodeJS installation
- v0.1.13 – Update cache before NodeJS
- v0.1.12 – Bad ansible command (NodeJS)
- v0.1.11 – Forgot to install NodeJS
- v0.1.10 – Attempt to install NodeJS + Bower
- v0.1.9 – Fix `v0.1.8`
- v0.1.8 – Add filter for `option_siteurl` to fix redirects in `wp-admin`
- v0.1.7 – Fix `ssh` & remove `WP_SITEURL`
- v0.1.6 – Rename `wp` capistrano task namespace to `genesis`
- v0.1.5 – Add `cache` to `rsync_exclude` folders
- v0.1.4 – Bower release

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[0]: https://github.com/genesis/wordpress/
[1]: https://github.com/genesis/generator-wordpress/
[2]: http://yeoman.io/
[3]: http://www.vagrantup.com/
[4]: https://github.com/smdahlen/vagrant-hostmanager
[5]: https://github.com/capistrano/capistrano/wiki/2.x-Getting-Started
[6]: http://bower.io/
[7]: http://www.ansibleworks.com/
[8]: https://www.virtualbox.org/
[9]: http://nodejs.org/


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/genesis/wordpress/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

