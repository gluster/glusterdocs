# Thin Arbiter volumes in gluster

Thin Arbiter is a new type of quorum node where granularity of what is
good and what is bad data is less compared to the traditional arbiter brick.
In this type of volume, quorum is taken into account at a brick
level rather than per file basis. If there is even one file that is marked
bad (i.e. needs healing) on a data brick, that brick is considered bad for
all files as a whole. So, even different file, if the write fails
on the other data brick but succeeds on this 'bad' brick we will return
failure for the write.


- [Why Thin Arbiter?](#why-thin-arbiter)
- [Setting UP Thin Arbiter Volume](#setting-up-thin-arbiter-volume)
- [How Thin Arbiter works](#how-thin-arbiter-works)


# Why Thin Arbiter?
This is a solution for handling stretch cluster kind of workload,
but it can be used for regular workloads as well in case users are
satisfied with this kind of quorum in comparison to arbiter/3-way-replication.
Thin arbiter node can be placed outside of trusted storage pool i.e,
thin arbiter is the "stretched" node in the cluster. This node can be
placed on cloud or anywhere even if that connection has high latency.
As this node will take part only in case of failure (or a brick is down)
and to decide the quorum, it will not impact the performance in normal cases.
Cost to perform any file operation would be lesser than arbiter if
everything is fine. I/O will only go to the data bricks and goes to
thin-arbiter only in the case of first failure until heal completes.

# Setting UP Thin Arbiter Volume

The command to run thin-arbiter process on node:
```
#/usr/local/sbin/glusterfsd -N --volfile-id ta-vol -f /var/lib/glusterd/vols/thin-arbiter.vol --brick-port 24007 --xlator-option ta-vol-server.transport.socket.listen-port=24007
```
Creating a thin arbiter replica 2 volume:
```
#glustercli volume create <volname> --replica 2 <host1>:<brick1> <host2>:<brick2> --thin-arbiter <quorum-host>:<path-to-store-replica-id-file>
```
For example:
```
glustercli volume create testvol --replica 2 server{1..2}:/bricks/brick-{1..2} --thin-arbiter server-3:/bricks/brick_ta --force
volume create: testvol: success: please start the volume to access data
```

# How Thin Arbiter works
There will be only one process running on thin arbiter node which will be
used to update replica id file for all replica pairs across all volumes.
Replica id file contains the information of good and bad data bricks in the
form of xattrs. Replica pairs will use its respective replica-id file that
is going to be created during mount.

1) Read Transactions:
Reads are allowed when quorum is met. i.e.

- When all data bricks and thin arbiter are up: Perform lookup on data bricks to figure out good/bad bricks and
  serve content from the good brick.
- When one brick is up: Fail FOP with EIO.
- Two bricks are up:
  If two data bricks are up, lookup is done on data bricks to figure out good/bad bricks and content will be served
  from the good brick. One lookup is enough to figure out good/bad copy of that file and keep this in inode context.
  If one data brick and thin arbiter brick are up, xattrop is done on thin arbiter to get information of source (good)
  brick. If the data brick, which is UP, has also been marked as source brick on thin arbiter, lookup on this file is
  done on the data brick to check if the file is really healthy or not. If the file is good, data will be served from
  this brick else an EIO error would be returned to user.

2) Write transactions:
  Thin arbiter doesn’t participate in I/O, transaction will choose to wind operations on thin-arbiter brick to
  make sure the necessary metadata is kept up-to-date in case of failures. Operation failure will lead to
  updating the replica-id file on thin-arbiter with source/sink information in the xattrs just how it happens in AFR.
