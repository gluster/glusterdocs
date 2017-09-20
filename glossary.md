Glossary
========

**Access Control Lists**
:  Access Control Lists (ACLs) allow you to assign different permissions
   for different users or groups even though they do not correspond to the
   original owner or the owning group.

**Block Storage**
:  Block special files, or block devices, correspond to devices through which the system moves
   data in the form of blocks. These device nodes often represent addressable devices such as
   hard disks, CD-ROM drives, or memory regions. GlusterFS requires a filesystem (like XFS) that
   supports extended attributes.

**Brick**
:  A Brick is the basic unit of storage in GlusterFS, represented by an export directory
   on a server in the trusted storage pool.
   A brick is expressed by combining a server with an export directory in the following format:

        `SERVER:EXPORT`
    For example:
        `myhostname:/exports/myexportdir/`

**Client**
:  Any machine that mounts a GlusterFS volume. Any applications that use libgfapi access
   mechanism can also be treated as clients in GlusterFS context.

**Cluster**
:  A trusted pool of linked computers working together, resembling a single computing resource.
   In GlusterFS, a cluster is also referred to as a trusted storage pool.

**Distributed File System**
:   A file system that allows multiple clients to concurrently access data which is spread across
    servers/bricks in a trusted storage pool. Data sharing among multiple locations is fundamental
    to all distributed file systems.

**Extended Attributes**
:   Extended file attributes (abbreviated xattr) is a filesystem feature that enables
    users/programs to associate files/dirs with metadata. Gluster stores metadata in xattrs.

**Filesystem**
:   A method of storing and organizing computer files and their data.
    Essentially, it organizes these files into a database for the
    storage, organization, manipulation, and retrieval by the computer's
    operating system.

Source [Wikipedia][Wikipedia]

**FUSE**
: Filesystem in Userspace (FUSE) is a loadable kernel module for Unix-like
  computer operating systems that lets non-privileged users create their
  own file systems without editing kernel code. This is achieved by
  running file system code in user space while the FUSE module provides
  only a "bridge" to the actual kernel interfaces.
Source: [Wikipedia][1]

**GFID**
: Each file/directory on a GlusterFS volume has a unique 128-bit number
associated with it called the GFID. This is analogous to inode in a
regular filesystem.

**glusterd**
:   The Gluster daemon/service that manages volumes and cluster membership. It is required to
    run on all the servers in the trusted storage pool.

**Geo-Replication**
:  Geo-replication provides a continuous, asynchronous, and incremental
   replication service from site to another over Local Area Networks
   (LANs), Wide Area Network (WANs), and across the Internet.


**Infiniband**
    InfiniBand is a switched fabric computer network communications link
    used in high-performance computing and enterprise data centers.

**Metadata**
:  Metadata is defined as data providing information about one or more
   other pieces of data. There is no special metadata storage concept in
   GlusterFS. The metadata is stored with the file data itself usually in the
   form of extended attributes

**Namespace**
:  A namespace is an abstract container or environment created to hold a
   logical grouping of unique identifiers or symbols. Each Gluster volume
   exposes a single namespace as a POSIX mount point that contains every
   file in the cluster.

**Node**
:   A server or computer that hosts one or more bricks.

**N-way Replication**
:   Local synchronous data replication which is typically deployed across campus
    or Amazon Web Services Availability Zones.

**Petabyte**
:   A petabyte (derived from the SI prefix peta- ) is a unit of
    information equal to one quadrillion (short scale) bytes, or 1000
    terabytes. The unit symbol for the petabyte is PB. The prefix peta-
    (P) indicates a power of 1000:

    1 PB = 1,000,000,000,000,000 B = 10005 B = 1015 B.

    The term "pebibyte" (PiB), using a binary prefix, is used for the
    corresponding power of 1024.

Source: [Wikipedia][3]

**POSIX**
:  Portable Operating System Interface (for Unix) is the name of a family
   of related standards specified by the IEEE to define the application
   programming interface (API), along with shell and utilities interfaces
   for software compatible with variants of the Unix operating system
   Gluster exports a POSIX compatible file system.

**Quorum**
:   The configuration of quorum in a trusted storage pool determines the
    number of server failures that the trusted storage pool can sustain.
    If an additional failure occurs, the trusted storage pool becomes
    unavailable.

**Quota**
:   Quota allows you to set limits on usage of disk space by directories or
    by volumes.

**RAID**
:  Redundant Array of Inexpensive Disks (RAID) is a technology that provides
   increased storage reliability through redundancy, combining multiple
   low-cost, less-reliable disk drives components into a logical unit where
   all drives in the array are interdependent.

**RDMA**
:   Remote direct memory access (RDMA) is a direct memory access from the
    memory of one computer into that of another without involving either
    one's operating system. This permits high-throughput, low-latency
    networking, which is especially useful in massively parallel computer
    clusters

**Rebalance**
:   The process of redistributing data in a distributed volume when a
    brick is added or removed.

**RRDNS**
:  Round Robin Domain Name Service (RRDNS) is a method to distribute load
   across application servers. It is implemented by creating multiple A
   records with the same name and different IP addresses in the zone file
   of a DNS server.

**Samba**
:   Samba allows file and print sharing between computers running Windows and
    computers running Linux. It is an implementation of several services and
    protocols including SMB and CIFS.

**Scale-Up Storage**
:   Increases the capacity of the storage device in a single dimension.
    For example, adding additional disk capacity to an existing trusted storage pool.

**Scale-Out Storage**
:   Scale out systems are designed to scale on both capacity and performance.
    It increases the capability of a storage device in single dimension.
    For example, adding more systems of the same size, or adding servers to a trusted storage pool
    that increases CPU, disk capacity, and throughput for the trusted storage pool.

**Self-Heal**
:   The self-heal daemon that runs in the background, identifies
    inconsistencies in files/dirs in a replicated or erasure coded volume and then resolves
    or heals them. This healing process is usually required when one or more
    bricks of a volume goes down and then comes up later.

**Server**
:   The machine (virtual or bare metal) that hosts the bricks in which data is stored.

**Split-brain**
:   A situation where data on two or more bricks in a replicated
    volume start to diverge in terms of content or metadata. In this state,
    one cannot determine programmatically which set of data is "right" and
    which is "wrong".

**Subvolume**
:   A brick after being processed by at least one translator.

**Translator**
:   Translators (also called xlators) are stackable modules where each
    module has a very specific purpose. Translators are stacked in a
    hierarchical structure called as graph. A translator receives data
    from its parent translator, performs necessary operations and then
    passes the data down to its child translator in hierarchy.

**Trusted Storage Pool**
:  A storage pool is a trusted network of storage servers. When you start
   the first server, the storage pool consists of that server alone.

**Userspace**
:  Applications running in user space don’t directly interact with
   hardware, instead using the kernel to moderate access. Userspace
   applications are generally more portable than applications in kernel
   space. Gluster is a user space application.

**Virtual File System (VFS)**
:   VFS is a kernel software layer which handles all system calls related to the standard Linux file system.
    It provides a common interface to several kinds of file systems.

**Volume**
:  A volume is a logical collection of bricks.

**Vol file**
: Vol files or volume (.vol) files are configuration files that determine the behavior of the
  Gluster trusted storage pool. It is a textual representation of a
  collection of modules (also known as translators) that together implement the
  various functions required.


  [Wikipedia]: http://en.wikipedia.org/wiki/Filesystem
  [1]: http://en.wikipedia.org/wiki/Filesystem_in_Userspace
  [2]: http://en.wikipedia.org/wiki/Open_source
  [3]: http://en.wikipedia.org/wiki/Petabyte
