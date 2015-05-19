FHS-2.3 isn't entirely clear on where data shared by the server should reside. It does state that "/srv contains site-specific data which is served by this system" but is GlusterFS data site-specific?

The consensus seems to lean toward using /data. A good hierarchical method for placing bricks is:

		/data/glusterfs/`<volume>`/`<brick>`/brick

In this example, <brick> is the filesystem that is mounted.

### Example: One Brick Per Server

A physical disk */dev/sdb* is going to be used as brick storage for a volume you're about to create named *myvol1*. You've partitioned and formatted */dev/sdb1* with xfs on each of 4 servers.

On all 4 servers:

		mkdir -p /data/glusterfs/myvol1/brick1
		mount /dev/sdb1 /data/glusterfs/myvol1/brick1

We're going to define the actual brick in the /brick directory on that filesystem. This helps by causing the brick to fail to start if the xfs filesystem isn't mounted.

On just one server:

		gluster volume create myvol1 replica 2 server{1..4}:/data/glusterfs/myvol1/brick1/brick

This will create a volume that uses that directory on all 4 servers.

### Example: Two Bricks Per Server

Two physical disks */dev/sdb* and */dev/sdc* are going to be used as brick storage for a volume you're about to create named *myvol2*. You've partitioned and formatted */dev/sdb1* and */dev/sdc1* with xfs on each of 4 servers.

On all 4 servers:

		mkdir -p /data/glusterfs/myvol2/brick{1,2}
		mount /dev/sdb1 /data/glusterfs/myvol2/brick1
		mount /dev/sdc1 /data/glusterfs/myvol2/brick2

Again we're going to define the actual brick in the /brick directory on those filesystems.

On just one server:

		gluster volume create myvol2 replica 2 server{1..4}:/data/glusterfs/myvol2/brick1/brick server{1..4}:/data/glusterfs/myvol2/brick2/brick

**Note** It might be tempting to try

		gluster volume create myvol2 replica 2 server{1..4}:/data/glusterfs/myvol2/brick{1,2}/brick

but bash will expand the last {} first so you would end up replicating between the two bricks on each server instead of across servers.