# Installing the Gluster File System - a Quick Start Guide
-------

This document is intended to give you a step-by-step guide to setting up GlusterFS for the first time. 

## Prerequisites

* At least two nodes 
* Fedora 22 (or later) on two nodes named "server1" and "server2"
* A working network connection
* At least two virtual disks, one for the OS installation, and one to be used to serve GlusterFS storage (sdb). This will emulate a real world deployment, where you would want to separate GlusterFS storage from the OS install.
* Free space to write Gluster’s dynamically generated configuration files at /var/lib/glusterd. Failure to write these files can cause system instability.

# Formatting and mounting the bricks
NOTE: These examples assume the brick is going to reside on /dev/sdb1. 

### To create the file system and directory

Enter the following commands on each node:

1. Make a file system by entering:
``mkfs.xfs -i size=512 /dev/sdb1``
1. Make a directory by entering:
``mkdir -p /data/brick1``
3. Enter ``echo '/dev/sdb1 /data/brick1 xfs defaults 1 2' >> /etc/fstab``

### To mount the directories
1. Mount the directories by entering:
``mount -a && mount``

You should now see sdb1 mounted at **/data/brick1**.

Next, install the Gluster file system

## Installing the Gluster file system
Install the file system with the yum command and then start the daemon so both nodes have identical configurations.

### To install Gluster

1. On both nodes, install Gluster by entering:   
``yum install glusterfs-server``
2. Start the Gluster FS management daemon by typing:
``service glusterd start``
  
   You will see the following status:
   >``` service glusterd status
    glusterd.service - LSB: glusterfs server  
           Loaded: loaded (/etc/rc.d/init.d/glusterd)  
       Active: active (running) since Mon, 13 Aug 2012 13:02:11 -0700; 2s ago
      Process: 19254 ExecStart=/etc/rc.d/init.d/glusterd start (code=exited, status=0/SUCCESS)
       CGroup: name=systemd:/system/glusterd.service  
           ├ 19260 /usr/sbin/glusterd -p /run/glusterd.pid  
           ├ 19304 /usr/sbin/glusterfsd --xlator-option georep-server.listen-port=24009 -s localhost...  
           └ 19309 /usr/sbin/glusterfs -f /var/lib/glusterd/nfs/nfs-server.vol -p /var/lib/glusterd/…  ```<

Next, configure the trusted pool

## Configuring the trusted pool
The trusted pool defines the nodes that make the shared Gluster file system. Each node must know the hostnames of the other servers so they can communicate.

NOTE: If you are using hostnames, the first server must be probed from one other server to set its own hostname.

### To establish the pool

1. From "server1", enter:
``gluster peer probe server2``
2. From "server2", enter:
``gluster peer probe server1``

NOTE: Once this pool has been established, only trusted members may probe new servers into the pool. A new server cannot probe the pool, it must be probed from the pool.

Next, set up the GlusterFS volume

## Setting up a GlusterFS volume
Set up the GlusterFS volume on both nodes and then start the volume.

### To set up the volumes

1. On both server1 and server2, to make the Gluster FS volume, enter:
``mkdir -p /data/brick1/gv0``
1. From any single server, enter:
``gluster volume create gv0 replica 2 server1:/data/brick1/gv0 server2:/data/brick1/gv0``
1. On the same server, enter:
``gluster volume start gv0``
1. To confirm that the volume started correctly, enter:
``gluster volume info``

You should see the status as “Started”.

NOTE: If the volume is not started, check the log files under **/var/log/glusterfs** on one or both of the servers - usually in **etc-glusterfs-glusterd.vol.log**.

Finally, test the GlusterFS volume

## Testing the GlusterFS volume
Now that you have your nodes and volumes created, we’ll test them. Choose a node to act as client for this test.

### To install the Gluster client
1. On your node enter:
``mount -t glusterfs server1:/gv0 /mnt
      for i in `seq -w 1 100`; do cp -rp /var/log/messages /mnt/copy-test-$i; done``
2. Check the mount point by entering:
``ls -lA /mnt | wc -l``

You should see 100 files returned. 

1. Check the GlusterFS mount points on each server by entering:
``ls -lA /data/brick1/gv0``

You should see 100 files on each server.

----------

You have finished the Quick Start! 
## Related topics

[GlusterFS Admin Guide](../Administrator Guide/index.md) to learn how to administer GlusterFS and how to select a volume type that fits your needs. 

[Glossary](../Administrator Guide/glossary.md) for words used in specific ways for the Gluster ecosystem. 
