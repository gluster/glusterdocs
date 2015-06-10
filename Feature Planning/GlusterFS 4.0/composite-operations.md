Feature
-------

Composite operations is a term describing elimination of round trips
through a variety of techniques. Some of these techniques are borrowed
from NFS and SMB protocols in spirit at least.

Why do we need this? All too frequently we encounter situations where
Gluster performance is an order of magnitude or even two orders of
magnitude slower than NFS or SMB to a local filesystem, particularly for
small-file and metadata-intensive workloads (example: file browsing).
You can argue that Gluster provides more functionality, so it should be
slower, but we need to close the gap -- if Gluster was half the speed of
NFS and provided much greater functionality plus scalability, users
would be ok with some performance tradeoff.

What is the root cause? Response time of Gluster APIs is much higher
than response time of other protocols. A simple protocol trace can show
you a root cause for this: excessive round-trips.

There are two dimensions to this:

-   operations that require lookups on every brick (covered elsewhere)
-   excessive one-at-a-time access to xattrs and ACLs
-   client responsible for maintaining filesystem state instead of
    server
-   SMB: case-insensitivity of Windows = no direct lookup by filename on
    brick

Summary
-------

example of previous success: eager-lock. When Gluster was first acquired
by Red Hat and testing with 10-GbE interfaces began, we quickly noticed
that sequential write performance was not what we expected. The Gluster
protocol required a 5-step sequence for every write from client to
server(s), in order to maintain consistency between replicas, which is
loosely paraphrased here:

-   lock-replica-inode
-   pre-op (mark replicas dirty)
-   write
-   post-op
-   unlock-replica-inode

The **cluster.eager-lock** feature was added to Gluster (3.4?) to allow
the client to hang onto the lock, and we combined post-op for previous
write with pre-op for current write and actual write request so that
instead of 5 RPCs per write we got down to ONE RPC per write, and write
performance improved significantly (how much TBS)

Owners
------

TBS

Current status
--------------

Some of the problems with round trips stem from lack of scalability in
DHT protocol, and attributes of AFR protocol.

Related Feature Requests and Bugs
---------------------------------

-   [Features/Smallfile Perf](../GlusterFS 3.7/Small File Performance.md) - small-file performance enhancement menu
-   [Features/dht-scalability](./dht-scalability.md) - new, scalable DHT
-   [Features/new-style-replication](..GlusterFS 3.6/New Style Replication.md)- client no longer does replication

*Note : search RHS buglist for small-file-related performance bugs and directory browsing performance bugs, I haven't done that yet, there are a LOT of them*

Detailed Description
--------------------

Here are the proposals:

-   READDIRPLUS generalization
-   lockless-CREATE
-   CREATE-AND-WRITE - allow CREATE op to transmit data and metadata
    also
-   case-insensitivity feature - removes perf. penalty for SMB

### READDIRPLUS used to prefetch xattrs

recent correction: For SMB and other protocols that have additional
security metadata, READDIRPLUS can be used more effectively to prefetch
xattr data, such as ACLs and Windows-specific security info. However,
upper layers have to make use of this feature. We treat ACLs as a
special case of an extended attribute, since ACLs are not currently
returned by READDIRPLUS (can someone confirm this?). The current RPC
request and response structure are in
[gfs3\_readdirp\_{req,rsp}](https://forge.gluster.org/glusterfs-core/glusterfs/blobs/master/rpc/xdr/src/glusterfs3-xdr.x)
in the above source code URL. In both cases, the request structure field
"dict" can contain a list of extended attribute IDs (or names, not sure
which).

However, once these xattrs are prefetched, will md-cache translator in
the client be able to hang onto them to prevent round-trips to the
server? Is there any additional invalidation needed for the expanded
role of md-cache?

### eager-lock for directories

This extension doesn't seem to impact APIs at all, but it does require a
way to safely do a CREATE FOP that will either appear on all replicas or
none (or allow self-healing to repair the difference in the directories
in the correct way).

If we have an NSR translator, this seems pretty straightforward. NSR
only allows the client to talk to the "leader" server in the replica
host set, and the leader then takes responsibility for propagating the
change.

With AFR, the situation is very different. In order to guarantee that a
CREATE will succeed on all AFR subvolumes, the client must write-lock
the parent directory. Otherwise some other client could create the same
file at the same time on some but not all of the AFR subvolumes.

But why unlock? Chances are that any immediate subsequent file create in
that directory will be coming from the same client, so it makes sense
for the client to hang onto the write lock for a short while, unless
some other client wants it. This optimistic lock behavior is similar to
the "eager-lock" feature in the AFR translator today. Doing this saves
us not only the need to do a LOOKUP prior to CREATE, but also saves us
the need to do a directory unlock per file!

### CREATE-AND-WRITE

This extension is similar to quick-read, where the OPEN FOP can return
the file data if it's small enough. This extension adds the following
features to the CREATE FOP:

-   -   optionally specify xattrs to associate with file when it's
        created
    -   optionally specify write data (if it fits in 1 RPC)
    -   optionally close the file (what RELEASE does today)
    -   optionally fsync the file (for apps that require file
        persistence such as Swift)

This option is also similar to what librados (Ceph) API allows user to
do today, see [Ioctx.write\_full in librados python
binding](http://ceph.com/docs/master/rados/api/python/#writing-reading-and-removing-objects)

This avoids the need for the round-trip sequence:

-   lock inode for write
-   create
-   write
-   flush(directory)
-   set-xattr[1]
-   set-xattr[2]
-   ...
-   set-xattr[N]
-   release
-   unlock inode

The existing protocol structure is in [structure
gfs3\_create\_req](https://forge.gluster.org/glusterfs-core/glusterfs/blobs/master/rpc/xdr/src/glusterfs3-xdr.x)
. We would allocate reserved bits from the "flags" field for the
optional extensions. The xdata field in the request would contain a
tagged sequence containing the optional parameter values.

### case-insensitive volume support

The SMB protocol is bridging a divide between an operating system,
Windows, that supports case-insensitive lookup, and an operating system,
Linux (POSIX) that supports only case-sensitive lookup inside Gluster
bricks. If nothing is done to bridge this gap, file lookup and creation
becomes very expensive in large directories (a few thousand files in
size):

-   on CREATE, the client has to search the entire directory to
    determine whether some other file with the same name (but a
    different case mix) already exists. This requires locking the
    directory. Furthermore, consistent hashing, which knows nothing
    about case mix, can not predict which brick might contain the file,
    since it might have been created with a different case mix. This is
    a SCALABILITY issue.

-   on LOOKUP, the client has to search all bricks for the filename
    since there is in general no way to predict which brick the
    case-altered version of the filename might have hashed to. This is a
    SCALABILITY issue. The entire contents of the directory on each
    brick must be searched as well.

-   SMB does support "case-sensitive yes" smb.conf configuration option,
    but this is user-hostile since Windows does not understand it.

What happens when Linux user-mode process such as glusterfsd (brick)
tries to do a case-insensitive lookup on the filename using a local
filesystem? XFS has a feature for this, but Gluster can't assume XFS as
for VFS supporting case-insensitivity - it's not going to happen. Yes
you can do readdir on directory and scan for the case-insensitive match,
but it's O(N\^2) where N is number of files you place into a directory.

**Proposal**: only use lower-case filenames (or upper-case, it doesn't
matter) at the brick filesystem, and record the original case mix (how
the user specified the filename at create/rename time) in an xattr, call
it 'original-case'.

**Issue**: (from Ira Cooper): what locales would be supported? SMB
already had to deal with this.

We could define a 'case-insensitive' volume parameter (default off), so
that users who have no SMB clients do not experience this change in
behavior.

This mapping to lower-case filenames has to happen at or above DHT layer
to avoid the scalability issue above. If this is not done by DHT (if it
is done in VFS-gluster SMB plugin for example), then Gluster clients on
a POSIX filesystem will not see the same filenames as Windows users, and
this will lead to confusion.

However, this has consequences for sharing file between SMB and non-SMB
client - non-SMB client will pay performance penalty for
case-insensitivity and will see case-insensitive behavior that is not
strictly POSIX-compliant - for example if I create file "a" and then
file "A" in same directory, the 2nd create will get EEXIST. That's the
price you pay for having the two kinds of clients accessing the same
volume - the most restricted client has to win.

Changes required to DHT or equivalent:

-   READDIR(PLUS): report filenames as the user expects to see them,
    using the original-case xattr. see above READDIRPLUS enhancement for
    how this can be done efficiently.
-   CREATE (or RENAME):, map the filename within the brick to lower case
    before creating, and records the original case mix using the
    original-case xattr. See CREATE-AND-WRITE enhancement above for how
    this can be done efficiently.
-   LOOKUP: map the filename to lower case before attempting a lookup on
    the brick.
-   RENAME: To prevent loss of file during a client-side crash, first
    delete the case-mix xattr, then do the rename, then re-add the
    case-mix xattr. If the case-mix xattr is not present, then the
    lower-case filename is returned by READDIR(PLUS) but the file is not
    lost.

Since existing SMB users may want to take advantage of this change, we
need a process for converting a Gluster volume to support
case-insensitivity:

-   optional - use "find /your/brick/directory -not -type d -a -not
    -path '/your/brick/directory/.glusterfs/\*' | tr '[A-Z]' '[a-z]' |
    sort " command in parallel on every brick, and do sort -merge of
    per-brick outputs followed by "uniq -d" to quickly determine if
    there are case-insensitivity collisions on existing volume. This
    would let user resolve such conflicts ahead of time without taking
    down the volume.
-   shut down the volume
-   run a script on all bricks in parallel to convert it to
    case-insensitive format - very fast because it runs on a local fs.
    -   rename the brick file to lower case and store an xattr with
        original case.
-   turn volume lookup-unhashed to ON because files will not yet be on
    the right brick.
-   set volume into case-insensitive state
-   start volume - it is now online but not in efficient state
-   rebalance (get DHT to place the files where they belong)
    -   If rebalance uncovers case-insensitive filename collisions (very
        unlikely), the 2nd file is renamed to its original case-mix with
        string 'case-collision-gfid' + hex gfid appended, and a counter
        is incremented. A simple "find" command at each brick in
        parallel executed with pdsh can locate all instances of such
        files - the user then has to decide what they want to do with
        them.
-   reset lookup-unhashed to default (auto)

Benefit to GlusterFS
--------------------

-   READDIRPLUS optimizations could completely solve the performance
    problems with file browsing in large directories, at least to the
    point where Gluster performs similarly to NFS and SMB in general and
    can't be blamed. (DHT v2 could also improve performance by not
    requiring round trips to every brick to retrieve a directory).

-   lockless-CREATE - can improve small-file create performance
    significantly by condensing 4 round-trips into 1. Small-file create
    is the worst-performing feature in Gluster today. However, it won't
    solve small-file create problems until we address other areas below.

-   CREATE-AND-WRITE - as you can see, at least 6 round trips (maybe
    more) are combined into 1 round trip.

The performance benefit increases as the Gluster client round-trip time
to the servers increases. For example, these enhancements could make
possible use of Gluster protocol over a WAN.

Scope
-----

Still unsure. This impacts libgfapi - if we want applications to take
advantage of these enhancements, we need to expose these APIs to
applications somehow, and POSIX does not allow them AFAIK.

CREATE-AND-WRITE impacts the translator interface. Translators must be
able to pass down:

-   a list of xattr values (which translators in the stack can append
    to).
-   a data buffer
-   flags to request optionally that file be fsynced and/or closed.

The [fop\_create\_t
params](https://forge.gluster.org/glusterfs-core/glusterfs/blobs/master/libglusterfs/src/xlator.h)
have both a "flags" parameter and a "xdata" parameter; this last
parameter could be used to pass both data and xattrs in a tagged
sequence format (not sure whether **dict\_t** supports this).

### Nature of proposed change

The Gluster code might need refactoring in create-related code to
maximize common code between existing implementation, which won't go
away, and the new implementation of these FOPS.

However, I suspect that READDIRPLUS extensions may be possible to insert
without disrupting existing code that much, may need some help on this
one.

### Implications on manageability

The gluster volume profile command will have to be extended to get
support for the new CREATE FOP if this is how we choose to implement it.

These changes should be somewhat transparent to management layer
otherwise.

### Implications on presentation layer

Swift-on-file Gluster-specific code would have to change to take
advantage of this feature.

NFS and SMB would have to change to exploit new features to reduce
SMB-specific xattr and ACL access.

The
[libgfapi](https://forge.gluster.org/glusterfs-core/glusterfs/blobs/master/api/src/glfs.h)
implementation would have to expose these features.

-   **glfs\_readdirplus\_r** - it's not clear that struct dirent would
    be able to handle xattrs, and there is no place to specify which
    extended attributes we are interested in.
-   **glfs\_creat** - has no parameters to support xattrs or write data.
    So we'd need a new entry point to do this.

### Implications on persistence layer

None.

### Implications on 'GlusterFS' backend

None.

### Modification to GlusterFS metadata

None. We are repackaging how data gets passed in protocol, not what it
means.

### Implications on 'glusterd'

None.

How To Test
-----------

We have programs that can generate metadata-intensive workloads, such as
smallfile benchmark or fio. For smallfile creates, we can use a modified
version of the [parallel libgfapi
benchmark](https://github.com/bengland2/parallel-libgfapi) (don't worry,
I know the developer ;-) to verify that the response time for the new
create-and-write API is better than before, or to verify that
lockless-create improves response time.

In the case of readdirplus extensions, we can test with simple libgfapi
program coupled with a protocol trace or gluster volume profile output
to see if it's working and has desired decrease in response time.

User Experience
---------------

The impact of this operation should be functionally transparent to the
end-user, but it should significantly improve Gluster performance to the
point where throughput and response time are reasonably close (not
equal) to NFS, SMB, etc on local filesystems. This is particularly true
for small-file operations and directory browsing/listing.

Dependencies
------------

This change will have significant impact on translators, it is not easy.
Because this is a non-trivial change, an incremental approach should be
specified and followed, with each stage committed and regression tested
separately. For example, we could break CREATE-and-WRITE proposal into 4
pieces:

-   add libgfapi support, with ENOSUPPORT returned for unimplemented
    features
-   add list of xattrs written at create time.
-   add write data
-   add close and fsync options

Documentation
-------------

How do we document RPC protocol changes? For now, I'll try to use IDL .x
file or whatever specifies the RPC itself.

Status
------

Not designed yet.

Comments and Discussion
-----------------------

### Jeff Darcy 16:20, 3 December 2014

Talk:Features/composite-operations

"SMB: case-insensitivity of Windows = no direct lookup by filename on
brick"

We did actually come up with a way to do the case-preserving and
case-squashing lookups simultaneously before falling back to the global
lookup, but AFAIK it's not implemented.

READDIRPLUS extension: md-cache actually does pre-fetch some attributes
associated with (Linux) ACLs and SELinux. Maybe it just needs to
pre-fetch some others for SMB? Also, fetching into glusterfs process
memory doesn't save us the context switch. For that we need dentry
injection (or something like it) so that the information is available in
the kernel by the time the user asks for it.

"glfs\_creat - has no parameters to support xattrs"

These are being added already because NSR reconciliation needs them (for
many other calls already).
