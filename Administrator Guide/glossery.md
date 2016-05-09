### Distributed File System

A file system that allows multiple clients to concurrently access data
over a computer network

### Cluster

A cluster is a group of linked computers, working together closely thus
in many respects forming a single computer.

### Trusted Storage Pool

A storage pool is a trusted network of storage servers. When you start
the first server, the storage pool consists of that server alone.

### Brick

Brick is the basic unit of storage, represented by an export directory
on a server in the trusted storage pool.

### Volume

A volume is a logical collection of bricks. Most of the gluster
management operations happen on the volume.

### Client

The machine which mounts the volume (this may also be a server).

### Server

The machine which hosts the actual file system(bricks) in which the data will be
stored.

### FUSE

Filesystem in Userspace (FUSE) is a loadable kernel module for Unix-like
computer operating systems that lets non-privileged users create their
own file systems without editing kernel code. This is achieved by
running file system code in user space while the FUSE module provides
only a "bridge" to the actual kernel interfaces.

### Namespace

Namespace is an abstract container or environment created to hold a
logical grouping of unique identifiers or symbols. Each Gluster volume
exposes a single namespace as a POSIX mount point that contains every
file in the cluster.

### Metadata

Metadata is defined as data providing information about one or more
other pieces of data.There is no special metadata storage concept in
GlusterFS. The metadata is stored with the file data itself.

