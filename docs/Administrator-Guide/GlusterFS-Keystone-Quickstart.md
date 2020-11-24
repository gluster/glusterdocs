# GlusterFS Keystone Quickstart

This is a document in progress, and may contain some errors or missing information.

I am currently in the process of building an AWS Image with this installed, however if you can't wait, and want to install this with a script, here are the commands from both articles, with defaults appropriate for an Amazon CentOS/RHEL 6 AMI, such as ami-a6e15bcf

This document assumes you already have GlusterFS with UFO installed, 3.3.1-11 or later, and are using the instructions here:

[`http://www.gluster.org/2012/09/howto-using-ufo-swift-a-quick-and-dirty-setup-guide/`](http://www.gluster.org/2012/09/howto-using-ufo-swift-a-quick-and-dirty-setup-guide/)

These docs are largely derived from:

[`http://fedoraproject.org/wiki/Getting_started_with_OpenStack_on_Fedora_17#Initial_Keystone_setup`](http://fedoraproject.org/wiki/Getting_started_with_OpenStack_on_Fedora_17#Initial_Keystone_setup)


Add the RDO Openstack Grizzly and Epel repos:

		$ sudo yum install -y `[`http://dl.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm`](http://dl.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm)
		$ sudo yum install -y `[`http://rdo.fedorapeople.org/openstack/openstack-grizzly/rdo-release-grizzly-1.noarch.rpm`](http://rdo.fedorapeople.org/openstack/openstack-grizzly/rdo-release-grizzly-1.noarch.rpm)

Install Openstack-Keystone

		$ sudo yum install openstack-keystone openstack-utils python-keystoneclient

Configure keystone

		$ cat > keystonerc << _EOF
		export ADMIN_TOKEN=$(openssl rand -hex 10)
		export OS_USERNAME=admin
		export OS_PASSWORD=$(openssl rand -hex 10)
		export OS_TENANT_NAME=admin
		export OS_AUTH_URL=`[`https://127.0.0.1:5000/v2.0/`](https://127.0.0.1:5000/v2.0/)
		export SERVICE_ENDPOINT=`[`https://127.0.0.1:35357/v2.0/`](https://127.0.0.1:35357/v2.0/)
		export SERVICE_TOKEN=\$ADMIN_TOKEN
		_EOF
		$ . ./keystonerc
		$ sudo openstack-db --service keystone --init

Append the keystone configs to /etc/swift/proxy-server.conf

		$ sudo -i`
		# cat >> /etc/swift/proxy-server.conf << _EOM`
		[filter:keystone]`
		use = egg:swift#keystoneauth`
		operator_roles = admin, swiftoperator`
		
		[filter:authtoken]
		paste.filter_factory = keystoneclient.middleware.auth_token:filter_factory
		auth_port = 35357
		auth_host = 127.0.0.1
		auth_protocol = https
		_EOM
		exit

Finish configuring both swift and keystone using the command-line tool:

		$ sudo openstack-config --set /etc/swift/proxy-server.conf filter:authtoken admin_token $ADMIN_TOKEN
		$ sudo openstack-config --set /etc/swift/proxy-server.conf filter:authtoken auth_token $ADMIN_TOKEN
		$ sudo openstack-config --set /etc/swift/proxy-server.conf DEFAULT log_name proxy_server
		$ sudo openstack-config --set /etc/swift/proxy-server.conf filter:authtoken signing_dir /etc/swift
		$ sudo openstack-config --set /etc/swift/proxy-server.conf pipeline:main pipeline "healthcheck cache authtoken keystone proxy-server"

		$ sudo openstack-config --set /etc/keystone/keystone.conf DEFAULT admin_token $ADMIN_TOKEN
		$ sudo openstack-config --set /etc/keystone/keystone.conf ssl enable True
		$ sudo openstack-config --set /etc/keystone/keystone.conf ssl keyfile /etc/swift/cert.key
		$ sudo openstack-config --set /etc/keystone/keystone.conf ssl certfile /etc/swift/cert.crt
		$ sudo openstack-config --set /etc/keystone/keystone.conf signing token_format UUID
		$ sudo openstack-config --set /etc/keystone/keystone.conf sql connection mysql://keystone:keystone@127.0.0.1/keystone

Configure keystone to start at boot and start it up.

		$ sudo chkconfig openstack-keystone on
		$ sudo service openstack-keystone start # If you script this, you'll want to wait a few seconds to start using it

We are using untrusted certs, so tell keystone not to complain. If you replace with trusted certs, or are not using SSL, set this to "".

		$ INSECURE="--insecure"

Create the keystone and swift services in keystone:

		$ KS_SERVICEID=$(keystone $INSECURE service-create --name=keystone --type=identity --description="Keystone Identity Service" | grep " id " | cut -d "|" -f 3)
		$ SW_SERVICEID=$(keystone $INSECURE service-create --name=swift --type=object-store --description="Swift Service" | grep " id " | cut -d "|" -f 3)
		$ endpoint="`[`https://127.0.0.1:443`](https://127.0.0.1:443)`"
		$ keystone $INSECURE endpoint-create --service_id $KS_SERVICEID \
		  --publicurl $endpoint'/v2.0' --adminurl `[`https://127.0.0.1:35357/v2.0`](https://127.0.0.1:35357/v2.0)` \
		  --internalurl `[`https://127.0.0.1:5000/v2.0`](https://127.0.0.1:5000/v2.0)
		$ keystone $INSECURE endpoint-create --service_id $SW_SERVICEID \
		  --publicurl $endpoint'/v1/AUTH_$(tenant_id)s' \
		  --adminurl $endpoint'/v1/AUTH_$(tenant_id)s' \
		  --internalurl $endpoint'/v1/AUTH_$(tenant_id)s'

Create the admin tenant:

		$ admin_id=$(keystone $INSECURE tenant-create --name admin --description "Internal Admin Tenant" | grep id | awk '{print $4}')

Create the admin roles:

		$ admin_role=$(keystone $INSECURE role-create --name admin | grep id | awk '{print $4}')
		$ ksadmin_role=$(keystone $INSECURE role-create --name KeystoneServiceAdmin | grep id | awk '{print $4}')
		$ kadmin_role=$(keystone $INSECURE role-create --name KeystoneAdmin | grep id | awk '{print $4}')
		$ member_role=$(keystone $INSECURE role-create --name member | grep id | awk '{print $4}')

Create the admin user:

		$ user_id=$(keystone $INSECURE user-create --name admin --tenant-id $admin_id --pass $OS_PASSWORD | grep id | awk '{print $4}')
		$ keystone $INSECURE user-role-add --user-id $user_id --tenant-id $admin_id \
		  --role-id $admin_role
		$ keystone $INSECURE user-role-add --user-id $user_id --tenant-id $admin_id \
		  --role-id $kadmin_role
		$ keystone $INSECURE user-role-add --user-id $user_id --tenant-id $admin_id \
		  --role-id $ksadmin_role

If you do not have multi-volume support (broken in 3.3.1-11), then the volume names will not correlate to the tenants, and all tenants will map to the same volume, so just use a normal name. (This will be fixed in 3.4, and should be fixed in 3.4 Beta. The bug report for this is here: <https://bugzilla.redhat.com/show_bug.cgi?id=924792>)

		$ volname="admin"
		#  or if you have the multi-volume patch
		$ volname=$admin_id

Create and start the admin volume:

		$ sudo gluster volume create $volname $myhostname:$pathtobrick
		$ sudo gluster volume start $volname
		$ sudo service openstack-keystone start

Create the ring for the admin tenant. If you have working multi-volume support, then you can specify multiple volume names in the call:

		$ cd /etc/swift
		$ sudo /usr/bin/gluster-swift-gen-builders $volname
		$ sudo swift-init main restart

Create a testadmin user associated with the admin tenant with password testadmin and admin role:

		$ user_id=$(keystone $INSECURE user-create --name testadmin --tenant-id $admin_id --pass testadmin | grep id | awk '{print $4}')
		$ keystone $INSECURE user-role-add --user-id $user_id --tenant-id $admin_id \
		  --role-id $admin_role

Test the user:

		$ curl $INSECURE -d '{"auth":{"tenantName": "admin", "passwordCredentials":{"username": "testadmin", "password": "testadmin"}}}' -H "Content-type: application/json" `[`https://127.0.0.1:5000/v2.0/tokens`](https://127.0.0.1:5000/v2.0/tokens)

See here for more examples:

<http://docs.openstack.org/developer/keystone/api_curl_examples.html>
