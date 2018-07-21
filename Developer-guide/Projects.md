This page contains a list of project ideas which will be suitable for
students (for GSOC, internship etc.)

Projects/Features which needs contributors
------------------------------------------

### glusterd2

Repo: https://github.com/gluster/glusterd2

New management layer for glusterfs. Has native ReST API, and uses etcd to
store the data, and hence would solve more common GlusterD scale issues seen today.

### RIO

Issue: https://github.com/gluster/glusterfs/issues/243

This is a new distribution logic, which can scale Gluster to 1000s of nodes.

### gluster-block

Repo: https://github.com/gluster/gluster-block

The project tries to expose files in glusterfs as iSCSI block devices. A very good
way to get the transaction workload work on GlusterFS.

### GlusterFS UFO/SWIFT

To build and run Gluster UFO you can do the following:

1.  Configure UFO/SWIFT as described in [Howto Using UFO SWIFT - A quick
    and dirty setup
    guide](https://github.com/gluster/gluster-swift/blob/master/doc/markdown/quick_start_guide.md)


Projects with mentors
---------------------

### gfsck - A GlusterFS filesystem check

-   A tool to check filesystem integrity and repairing

### Language bindings for libgfapi

-   API/library for accessing gluster volumes

### oVirt gui for stats

Have pretty graphs and tables in ovirt for the GlusterFS top and profile
commands.

### Monitoring integrations - munin others

The more monitoring support we have for GlusterFS the better.

### More compression algorithms for compression xlator

The on-wire compression translator should be extended to support more
compression algorithms. Ideally it should be pluggable.

### Cinder GlusterFS backup driver

Write a driver for cinder, a part of openstack, to allow backup onto
GlusterFS volumes

### rsockets - sockets for rdma transport

Coding for RDMA using the familiar socket api should lead to a more
robust rdma transport

### Data import tool

Create a tool which will allow importing already existing data in the
brick directories into the gluster volume. This is most likely going to
be a special rebalance process.

### Rebalance improvements

Improve rebalance performance.

### Quota using underlying FS' quota

GlusterFS quota is currently maintained completely in GlusterFSs
namespace using xattrs. We could make use of the quota capabilities of
the underlying fs (XFS) for better performance.

Check [#184](https://github.com/gluster/glusterfs/184)

### Snapshot pluggability

Snapshot should be able to make use of snapshot support provided by
btrfs for example.

### Compression at rest

Lessons learnt while implementing encryption at rest can be used with
the compression at rest.

### File-level deduplication

GlusterFS works on files. So why not have dedup at the level files as
well.

### Composition xlator for small files

Merge small files into a designated large file using our own custom
semantics. This can improve our small file performance.