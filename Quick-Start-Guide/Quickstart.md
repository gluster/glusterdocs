Installing GlusterFS - a Quick Start Guide
-------

#### Purpose of this document

This document is intended to give you a step by step guide to setting up
GlusterFS for the first time. For this tutorial, we will assume you are
using Fedora 26 (or later) virtual machines.

After you deploy GlusterFS by following these steps,
we recommend that you read the GlusterFS Admin Guide to learn how to
administer GlusterFS and how to select a volume type that fits your
needs. Read the GlusterFS Install Guide for a more detailed explanation
of the steps we took here. We want you to be successful in as short a
time as possible.

If you would like a more detailed walkthrough with instructions for
installing using different methods (in local virtual machines, EC2 and
baremetal) and different distributions, then have a look at the Install
guide.

#### Using Ansible to deploy and manage GlusterFS

If you are already an ansible user, and are more comfortable with setting
up distributed systems with Ansible, we recommend you to skip all these and
move over to [gluster-ansible](https://github.com/gluster/gluster-ansible) repository, which gives most of the details to get the systems running faster.

#### Automatically deploying GlusterFS with Puppet-Gluster+Vagrant

If you'd like to deploy GlusterFS automatically using
Puppet-Gluster+Vagrant, have a look at [this
article](https://ttboj.wordpress.com/2014/01/08/automatically-deploying-glusterfs-with-puppet-gluster-vagrant/).


### Step 1 – Have at least three nodes

-   Fedora 26 (or later) on 3 nodes named "server1", "server2" and "server3"
-   A working network connection
-   At least two virtual disks, one for the OS installation, and one to be
    used to serve GlusterFS storage (sdb), on each of these VMs. This will
    emulate a real-world deployment, where you would want to separate
    GlusterFS storage from the OS install.

**Note**: GlusterFS stores its dynamically generated configuration files
    at `/var/lib/glusterd`. If at any point in time GlusterFS is unable to
    write to these files (for example, when the backing filesystem is full),
    it will at minimum cause erratic behavior for your system; or worse,
    take your system offline completely. It is advisable to create separate
    partitions for directories such as `/var/log` to ensure this does not
    happen.


### Step 2 - Format and mount the bricks

Perform this step on all the nodes, "server{1,2,3}"

**Note**: We are going to use the XFS filesystem for the backend bricks. But Gluster is designed to work on top of any filesystem, which supports extended attributes.

These examples are going to assume the brick is going to reside on /dev/sdb1.

		mkfs.xfs -i size=512 /dev/sdb1
		mkdir -p /data/brick1
		echo '/dev/sdb1 /data/brick1 xfs defaults 1 2' >> /etc/fstab
		mount -a && mount

You should now see sdb1 mounted at /data/brick1


### Step 3 - Installing GlusterFS

Install the software

		yum install glusterfs-server

Start the GlusterFS management daemon:

		service glusterd start
		service glusterd status
		glusterd.service - LSB: glusterfs server
		       Loaded: loaded (/etc/rc.d/init.d/glusterd)
		   Active: active (running) since Mon, 13 Aug 2012 13:02:11 -0700; 2s ago
		  Process: 19254 ExecStart=/etc/rc.d/init.d/glusterd start (code=exited, status=0/SUCCESS)
		   CGroup: name=systemd:/system/glusterd.service
		       ├ 19260 /usr/sbin/glusterd -p /run/glusterd.pid
		       ├ 19304 /usr/sbin/glusterfsd --xlator-option georep-server.listen-port=24009 -s localhost...
		       └ 19309 /usr/sbin/glusterfs -f /var/lib/glusterd/nfs/nfs-server.vol -p /var/lib/glusterd/...


        
### Step 4 - Configure the firewall

The gluster processes on the nodes need to be able to communicate with each other.
To simplify this setup, configure the firewall on each node to accept all traffic from the other node.

                iptables -I INPUT -p all -s <ip-address> -j ACCEPT

where ip-address is the address of the other node.


### Step 5 - Configure the trusted pool

From "server1"

		gluster peer probe server2
		gluster peer probe server3

Note: When using hostnames, the first server needs to be probed from
***one*** other server to set its hostname.

From "server2"

		gluster peer probe server1

Note: Once this pool has been established, only trusted members may
probe new servers into the pool. A new server cannot probe the pool, it
must be probed from the pool.

Check the peer status on server1

                gluster peer status

You should see something like this (the UUID will differ)

                Number of Peers: 2

                Hostname: server2
                Uuid: f0e7b138-4874-4bc0-ab91-54f20c7068b4
                State: Peer in Cluster (Connected)

                Hostname: server3
                Uuid: f0e7b138-4532-4bc0-ab91-54f20c701241
                State: Peer in Cluster (Connected)


### Step 6 - Set up a GlusterFS volume

On all servers:

		mkdir -p /data/brick1/gv0

From any single server:

		gluster volume create gv0 replica 3 server1:/data/brick1/gv0 server2:/data/brick1/gv0 server3:/data/brick1/gv0
		gluster volume start gv0

Confirm that the volume shows "Started":

		gluster volume info


You should see something like this (the Volume ID will differ):

                Volume Name: gv0
                Type: Replicate
                Volume ID: f25cc3d8-631f-41bd-96e1-3e22a4c6f71f
                Status: Started
                Snapshot Count: 0
                Number of Bricks: 1 x 3 = 3
                Transport-type: tcp
                Bricks:
                Brick1: server1:/data/brick1/gv0
                Brick2: server2:/data/brick1/gv0
                Brick3: server3:/data/brick1/gv0
                Options Reconfigured:
                transport.address-family: inet


Note: If the volume is not started, clues as to what went wrong will be
in log files under `/var/log/glusterfs/glusterd.log` on one or all of the servers.


### Step 7 - Testing the GlusterFS volume

For this step, we will use one of the servers to mount the volume.
Typically, you would do this from an external machine, known as a
"client". Since using this method would require additional packages to
be installed on the client machine, we will use one of the servers as
a simple place to test first , as if it were that "client".

		mount -t glusterfs server1:/gv0 /mnt
		  for i in `seq -w 1 100`; do cp -rp /var/log/messages /mnt/copy-test-$i; done

First, check the client mount point:

		ls -lA /mnt/copy* | wc -l

You should see 100 files returned. Next, check the GlusterFS brick mount
points on each server:

		ls -lA /data/brick1/gv0/copy*

You should see 100 files on each server using the method we listed here.
Without replication, in a distribute only volume (not detailed here), you
should see about 33 files on each one.

