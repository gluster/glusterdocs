### Configure Firewall

For the Gluster to communicate within a cluster either the firewalls
have to be turned off or enable communication for each server.

```console
# iptables -I INPUT -p all -s `<ip-address>` -j ACCEPT
```

### Configure the trusted pool

Remember that the trusted pool is the term used to define a cluster of
nodes in Gluster. Choose a server to be your “primary” server. This is
just to keep things simple, you will generally want to run all commands
from this tutorial. Keep in mind, running many Gluster specific commands
(like `gluster volume create`) on one server in the cluster will
execute the same command on all other servers.

Replace `nodename` with hostname of the other server in the cluster,
or IP address if you don’t have DNS or `/etc/hosts` entries.
Let say we want to connect to `node02`:

```console
# gluster peer probe node02
```

Notice that running `gluster peer status` from the second node shows
that the first node has already been added.

### Partition the disk

Assuming you have a empty disk at `/dev/sdb`:

```console
# fdisk /dev/sdb 
```

And then create a single XFS partition using fdisk

### Format the partition

```console
# mkfs.xfs -i size=512 /dev/sdb1
```

### Add an entry to /etc/fstab

```console
# echo "/dev/sdb1 /export/sdb1 xfs defaults 0 0"  >> /etc/fstab
```

### Mount the partition as a Gluster "brick"

```console
# mkdir -p /export/sdb1 && mount -a && mkdir -p /export/sdb1/brick
```

#### Set up a Gluster volume

The most basic Gluster volume type is a “Distribute only” volume (also
referred to as a “pure DHT” volume if you want to impress the folks at
the water cooler). This type of volume simply distributes the data
evenly across the available bricks in a volume. So, if I write 100
files, on average, fifty will end up on one server, and fifty will end
up on another. This is faster than a “replicated” volume, but isn’t as
popular since it doesn’t give you two of the most sought after features
of Gluster — multiple copies of the data, and automatic failover if
something goes wrong.

To set up a replicated volume:

```console
# gluster volume create gv0 replica 3 node01.mydomain.net:/export/sdb1/brick \
    node02.mydomain.net:/export/sdb1/brick                                   \
    node03.mydomain.net:/export/sdb1/brick
```

Breaking this down into pieces:

- the first part says to create a gluster volume named gv0
(the name is arbitrary, `gv0` was chosen simply because
it’s less typing than `gluster_volume_0`).
- make the volume a replica volume
- keep a copy of the data on at least 3 bricks at any given time.
Since we only have three bricks total, this
means each server will house a copy of the data.
- we specify which nodes to use, and which bricks on those nodes. The order here is
important when you have more bricks.

It is possible (as of the most current release as of this writing, Gluster 3.3)
to specify the bricks in such a way that you would make both copies of the data reside on a
single node. This would make for an embarrassing explanation to your
boss when your bulletproof, completely redundant, always on super
cluster comes to a grinding halt when a single point of failure occurs.

Now, we can check to make sure things are working as expected:

```console
# gluster volume info
```

And you should see results similar to the following:

```console
Volume Name: gv0
Type: Replicate
Volume ID: 8bc3e96b-a1b6-457d-8f7a-a91d1d4dc019
Status: Created
Number of Bricks: 1 x 3 = 3
Transport-type: tcp
Bricks:
Brick1: node01.yourdomain.net:/export/sdb1/brick
Brick2: node02.yourdomain.net:/export/sdb1/brick
Brick3: node03.yourdomain.net:/export/sdb1/brick
```

This shows us essentially what we just specified during the volume
creation. The one this to mention is the `Status`. A status of `Created`
means that the volume has been created, but hasn’t yet been started,
which would cause any attempt to mount the volume fail.

Now, we should start the volume.

```
# gluster volume start gv0
```

Find all documentation [here](../index.md)
