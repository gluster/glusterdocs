Feature
-------

server-side md-cache

Summary
-------

Two years ago, Peter Portante noticed the extremely high number of
system calls on the XFS brick required per Swift object. Since then, he
and Ben England have observed several similar cases.

More recently, while looking at a **netmist** single-thread workload run
by a major banking customer to characterize Gluster performance, Ben
observed this [system call profile PER
FILE](https://s3.amazonaws.com/ben.england/netmist-and-gluster.pdf) .
This is strong evidence of several problems with POSIX translator:

-   repeated polling with **sys\_lgetxattr** of the **gfid** xattr
-   repeated **sys\_lstat** calls
-   polling of xattrs that were *undefined*
-   calling **sys\_llistattr** to get list of all xattrs AFTER all other
    calls
-   calling *'sys\_lgetxattr* two times, once to find out how big the
    value is and once to get the value!
-   one-at-a-time calls to get individual xattrs

All of the problems except for the last one could be solved through use
of a metadata cache associated with each inode. The last problem is not
solvable in a pure POSIX API at this time, although XFS offers an
**ioctl** that can get all xattrs at once (the cache could conceivably
determine whether the brick was XFS or not and exploit this where
available).

Note that as xattrs are added to the system, this becomes more and more
costly, and as Gluster adds new features, these typically require that
state be kept associated with a file, usually in one or more xattrs.

Owners
------

TBS

Current status
--------------

There is already a **md-cache** translator, so you would think that
problems like this would not occur, but clearly they do -- this
translator is typically on the client side of the protocol and is
typically above such translators as AFR and DHT. The problems may be
worse in cases where the md-cache translator is not present (example:
SMB with gluster-vfs plugin that requires stat-prefetch volume parameter
to be set to *off*.

Related Feature Requests and Bugs
---------------------------------

-   [Features/Smallfile Perf](../GlusterFS 3.7/Small File Performance.md)
-   bugzillas TBS

Detailed Description
--------------------

This proposal has changed as a result of discussions in
\#gluster-meeting - instead of modifying the POSIX translator, we
propose to use the md-cache translator in the server above the POSIX
translator, and add negative caching capabilities to the md-cache
translator.

By "negative caching" we mean that md-cache can tell you if the xattr
does not exist without calling down the translator stack. How can it do
this? In the server side, the only path to the brick is through the
md-cache translator. When it encounters a xattr get request for a file
it has not seen before, the first step is to call down with llistxattr()
to find out what xattrs are stored for that file. From that point on
until the file is evicted from the cache, any request for non-existent
xattr values from higher translators will immediately be returned with
ENODATA, without calling down to POSIX translator.

We must ensure that memory leaks do not occur, and that race conditions
do not occur while multiple threads are accessing the cache, but this
seems like a manageable problem and is certainly not a new problem for
Gluster translator code.

Benefit to GlusterFS
--------------------

Most of the system calls and about 50% of the elapsed time could have
been removed from the above small-file read profile through use of this
cache. This benefit will be more visible as we transition to using SSD
storage, where disk seek times will not mask overheads such as this.

Scope
-----

This can be done local to the glusterfsd process by inserting md-cache
translator just above the POSIX translator, where the vast majority of
the stat, getxattr and setxattr calls are generated from.

### Nature of proposed change

No new translators are required. We may require some existing
translators to call down the stack ("wind a FOP") instead of calling
sys\_\*xattr themselves if these calls are heavily used, so that they
can take advantage of the stat-xattr-cache.

It is *really important* that the md-cache use listxattr() to
immediately determine which xattrs are on disk, avoiding needless
getxattr calls this way. At present it does not do this.

### Implications on manageability

None. We need to make sure that the cache is big enough to support the
threads that use it, but not so big that it consumes a significant
percentage of memory. We may want to make a cache size and expiration
time a tunable so that we can experiment in performance testing to
determine optimal parameters.

### Implications on presentation layer

Translators above the md-cache translator are not affected

### Implications on persistence layer

None.

### Implications on 'GlusterFS' backend

None

### Modification to GlusterFS metadata

None

### Implications on 'glusterd'

None

How To Test
-----------

We can use strace of a single-thread smallfile workload to verify that
the cache is filtering out excess system calls. We could include
counters into the cache to measure the cache hit rate.

User Experience
---------------

single-thread small-file creates should be faster, particularly on SSD
storage. Performance testing is needed to further quantify this.

Dependencies
------------

None

Documentation
-------------

None, except for tunables relating to cache size and expiration time.

Status
------

Not started.

Comments and Discussion
-----------------------

Jeff Darcy: I've been saying for ages that we should store xattrs in a
local DB and avoid local xattrs altogether. Besides performance, this
would also eliminate the need for special configuration of the
underlying local FS (to accommodate our highly unusual use of this
feature) and generally be good for platform independence. Not quite so
sure about other stat(2) information, but perhaps I could be persuaded.
In any case, this has led me to look into the relevant code on a few
occasions. Unfortunately, there are \*many\* places that directly call
sys\_\*xattr instead of winding fops - glusterd (for replace-brick),
changelog, quota, snapshots, and others. I think this feature is still
very worthwhile, but all of the "cheating" we've tolerated over the
years is going to make it more difficult.

Ben England: a local DB might be a good option but could also become a
bottleneck, unless you have a DB instance per brick (local) filesystem.
One problem that the DB would solve is getting all the metadata in one
query - at present POSIX API requires you to get one xattr at a time. If
we implement a caching layer that hides whether a DB or xattrs are being
used, we can make it easier to experiment with a DB (level DB?). On your
2nd point, While it's true that there are many sites that call
sys\_\*xattr directory, only a few of these really generate a lot of
system calls. For example, some of these calls are only for the
mountpoint. From a performance perspective, as long as we can intercept
the vast majority of the sys\_\*xattr calls with this caching layer,
IMHO we can tolerate a few exceptions in glusterd, etc. However, from a
CORRECTNESS standpoint, we have to be careful that calls bypassing the
caching layer don't cause cache contents to become stale (out-of-date,
inconsistent with the on-disk brick filesystem contents).
