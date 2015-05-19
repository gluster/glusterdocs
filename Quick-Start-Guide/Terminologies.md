### Access Control Lists

Access Control Lists (ACLs) allows you to assign different permissions
for different users or groups even though they do not correspond to the
original owner or the owning group.

### Brick

Brick is the basic unit of storage, represented by an export directory
on a server in the trusted storage pool.

### Cluster

A cluster is a group of linked computers, working together closely thus
in many respects forming a single computer.

### Distributed File System

A file system that allows multiple clients to concurrently access data
over a computer network

### FUSE

Filesystem in Userspace (FUSE) is a loadable kernel module for Unix-like
computer operating systems that lets non-privileged users create their
own file systems without editing kernel code. This is achieved by
running file system code in user space while the FUSE module provides
only a "bridge" to the actual kernel interfaces.

### glusterd

Gluster management daemon that needs to run on all servers in the
trusted storage pool.

### Geo-Replication

Geo-replication provides a continuous, asynchronous, and incremental
replication service from site to another over Local Area Networks
(LANs), Wide Area Network (WANs), and across the Internet.

### Metadata

Metadata is defined as data providing information about one or more
other pieces of data.There is no special metadata storage concept in
GlusterFS. The metadata is stored with the file data itself.

### Namespace

Namespace is an abstract container or environment created to hold a
logical grouping of unique identifiers or symbols. Each Gluster volume
exposes a single namespace as a POSIX mount point that contains every
file in the cluster.

### POSIX

Portable Operating System Interface [for Unix] is the name of a family
of related standards specified by the IEEE to define the application
programming interface (API), along with shell and utilities interfaces
for software compatible with variants of the Unix operating system.
Gluster exports a fully POSIX compliant file system.

### RAID

Redundant Array of Inexpensive Disks”, is a technology that provides
increased storage reliability through redundancy, combining multiple
low-cost, less-reliable disk drives components into a logical unit where
all drives in the array are interdependent.

### RRDNS

Round Robin Domain Name Service (RRDNS) is a method to distribute load
across application servers. It is implemented by creating multiple A
records with the same name and different IP addresses in the zone file
of a DNS server.

### Trusted Storage Pool

A storage pool is a trusted network of storage servers. When you start
the first server, the storage pool consists of that server alone.

### Userspace

Applications running in user space don’t directly interact with
hardware, instead using the kernel to moderate access. Userspace
applications are generally more portable than applications in kernel
space. Gluster is a user space application.

### Volume

A volume is a logical collection of bricks. Most of the gluster
management operations happen on the volume.

### Vol file

.vol files are configuration files used by glusterfs process. Volfiles
will be usually located at /var/lib/glusterd/vols/volume-name/.
Eg:vol-name-fuse.vol,export-brick-name.vol,etc.. Sub-volumes in the .vol
files are present in the bottom-up approach and then after tracing forms
a tree structure, where in the hierarchy last comes the client volumes.

### Client

The machine which mounts the volume (this may also be a server).

### Server

The machine which hosts the actual file system in which the data will be
stored.

### Replicate

Replicate is generally done to make a redundancy of the storage for data
availability.

Once familiar with terminilogies, Understand the [Architecture of GlusterFS](./Architecture.md)
