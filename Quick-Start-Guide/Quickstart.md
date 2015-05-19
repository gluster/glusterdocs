Installing GlusterFS - a Quick Start Guide
-------

#### Purpose of this document
This document is intended to give you a step by step guide to setting up
GlusterFS for the first time. For this tutorial, we will assume you are
using Fedora 21 (or later) virtual machines (other distributions and methods can be
found in the new user guide, below. We also do not explain the steps in
detail here, this guide is just to help you get it up and running as
soon as possible. After you deploy GlusterFS by following these steps,
we recommend that you read the GlusterFS Admin Guide to learn how to
administer GlusterFS and how to select a volume type that fits your
needs. Read the GlusterFS New User Guide for a more detailed explanation
of the steps we took here. We want you to be successful in as short a
time as possible.

If you would like a more detailed walk through with instructions for
installing using different methods (in local virtual machines, EC2 and
baremetal) and different distributions, then have a look at the Install
guide.

#### Automatically deploying GlusterFS with Puppet-Gluster+Vagrant

If you'd like to deploy GlusterFS automatically using
Puppet-Gluster+Vagrant, have a look at [this
article](https://ttboj.wordpress.com/2014/01/08/automatically-deploying-glusterfs-with-puppet-gluster-vagrant/).

### Step 1 – Have at least two nodes

-   Fedora 20 on two nodes named "server1" and "server2"
-   A working network connection
-   At two virtual disks, one for the OS installation, and one to be
    used to serve GlusterFS storage (sdb). This will emulate a real
    world deployment, where you would want to separate GlusterFS storage
    from the OS install.
-   Note: GlusterFS stores its dynamically generated configuration files
    at /var/lib/glusterd. If at any point in time GlusterFS is unable to
    write to these files, it will at minimum cause erratic behavior for
    your system; or worse, take your system offline completely. It is
    advisable to create separate partitions for directories such as
    /var/log to ensure this does not happen.

### Step 2 - Format and mount the bricks

(on both nodes): Note: These examples are going to assume the brick is
going to reside on /dev/sdb1.

	    mkfs.xfs -i size=512 /dev/sdb1
		mkdir -p /data/brick1
		vi /etc/fstab

Add the following:

		/dev/sdb1 /data/brick1 xfs defaults 1 2

Save the file and exit

		mount -a && mount

You should now see sdb1 mounted at /data/brick1

### Step 3 - Installing GlusterFS

(on both servers) Install the software

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

### Step 4 - Configure the trusted pool

From "server1"

		gluster peer probe server2

Note: When using hostnames, the first server needs to be probed from
***one*** other server to set its hostname.

From "server2"

		gluster peer probe server1

Note: Once this pool has been established, only trusted members may
probe new servers into the pool. A new server cannot probe the pool, it
must be probed from the pool.

### Step 5 - Set up a GlusterFS volume

On both server1 and server2:

		mkdir /data/brick1/gv0

From any single server:

		gluster volume create gv0 replica 2 server1:/data/brick1/gv0 server2:/data/brick1/gv0
		gluster volume start gv0

Confirm that the volume shows "Started":

		gluster volume info

Note: If the volume is not started, clues as to what went wrong will be
in log files under /var/log/glusterfs on one or both of the servers -
usually in etc-glusterfs-glusterd.vol.log

### Step 6 - Testing the GlusterFS volume

For this step, we will use one of the servers to mount the volume.
Typically, you would do this from an external machine, known as a
"client". Since using the method here would require additional packages
be installed on the client machine, we will use the servers as a simple
place to test first.

		mount -t glusterfs server1:/gv0 /mnt
		  for i in `seq -w 1 100`; do cp -rp /var/log/messages /mnt/copy-test-$i; done

First, check the mount point:

		ls -lA /mnt | wc -l

You should see 100 files returned. Next, check the GlusterFS mount
points on each server:

		ls -lA /data/brick1/gv0

You should see 100 per server using the method we listed here. Without
replication, in a distribute only volume (not detailed here), you should
see about 50 each.

[Terminologies](./Terminologies.md) you should be familiar with.
