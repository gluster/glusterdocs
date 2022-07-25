# Brick Naming Conventions

FHS-2.3 isn't entirely clear on where data shared by the server should reside. It does state that "_/srv contains site-specific data which is served by this system_", but is GlusterFS data site-specific?

The consensus seems to lean toward using `/data`. A good hierarchical method for placing bricks is:

```text
/data/glusterfs/<volume>/<brick>/brick
```

In this example, `<brick>` is the filesystem that is mounted.

### Example: One Brick Per Server

A physical disk _/dev/sdb_ is going to be used as brick storage for a volume you're about to create named _myvol1_. You've partitioned and formatted _/dev/sdb1_ with XFS on each of 4 servers.

On all 4 servers:

```console
mkdir -p /data/glusterfs/myvol1/brick1
mount /dev/sdb1 /data/glusterfs/myvol1/brick1
```

We're going to define the actual brick in the `brick` directory on that filesystem. This helps by causing the brick to fail to start if the XFS filesystem isn't mounted.

On just one server:

```console
gluster volume create myvol1 replica 2 server{1..4}:/data/glusterfs/myvol1/brick1/brick
```

This will create the volume _myvol1_ which uses the directory `/data/glusterfs/myvol1/brick1/brick` on all 4 servers.

### Example: Two Bricks Per Server

Two physical disks _/dev/sdb_ and _/dev/sdc_ are going to be used as brick storage for a volume you're about to create named _myvol2_. You've partitioned and formatted _/dev/sdb1_ and _/dev/sdc1_ with XFS on each of 4 servers.

On all 4 servers:

```console
mkdir -p /data/glusterfs/myvol2/brick{1,2}
mount /dev/sdb1 /data/glusterfs/myvol2/brick1
mount /dev/sdc1 /data/glusterfs/myvol2/brick2
```

Again we're going to define the actual brick in the `brick` directory on these filesystems.

On just one server:

```console
gluster volume create myvol2 replica 2 \
  server{1..4}:/data/glusterfs/myvol2/brick1/brick \
  server{1..4}:/data/glusterfs/myvol2/brick2/brick
```

**Note:** It might be tempting to try `gluster volume create myvol2 replica 2 server{1..4}:/data/glusterfs/myvol2/brick{1,2}/brick` but Bash would expand the last `{}` first, so you would end up replicating between the two bricks on each servers, instead of across servers.
