Feature
-------

Small-file performance

Summary
-------

This page describes a menu of optimizations that together can improve
small-file performance, along with expected cases where optimizations
matter, degree of improvement expected, and degree of difficulty. -

Owners
------

Shyamsundar Ranganathan <srangana@redhat.com>

Ben England <bengland@redhat.com>

Current status
--------------

Some of these optimizations are proposed patches upstream, some are also
features being planned, such as Darcy's Gluster V4 DHT and NSR changes,
and some are not specified yet at all. Where they already exist in some
form links will be provided.

Some previous optimizations have been included already in the Gluster
code base, such as quick-read and open-behind translators. While these
were useful and do improve throughput, they do not solve the general
problem.

Detailed Description
--------------------

What is a small file? While this term seems ambiguous, it really is just
a file where the metadata access time far exceeds the data access time.
Another term used for this is "metadata-intensive workload". To be
clear, it is possible to have a metadata-intensive workload running
against large files, if it is not the file data that is being accessed
(example: "ls -l", "rm"). But what we are really concerned with is
throughput and response time of common operations on files where the
data is being accessed but metadata access time is severely restricting
throughput.

Why do we have a performance problem? We would expect that Gluster
small-file performance would be within some reasonable percentage of the
bottleneck determined by network performance and storage performance,
and that a user would be happy to pay a performance "tax" in order to
achieve scalability and high-availability that Gluster offers, as well
as a wealth of functionality. However, repeatedly we see cases where
Gluster small-file perf is an order of magnitude off of these
bottlenecks, indicating that there are flaws in the software. This
interferes with the most common tasks that a system admin or user has to
perform, such as copying files into or out of Gluster, migrating or
rebalancing data, self-heal,

So why do we care? Many of us anticipated that many Gluster workloads
would have increasingly large files, however we are continuing to
observe that Gluster workloads such as "unstructured data", are
surprisingly metadata-intensive. As compute and storage power increase
exponentially, we would expect that the average size of a storage object
would also increase, but in fact it hasn't -- in several common cases we
have files as small as 100 KB average size, or even 7 KB average size in
one case. We can tell customers to rewrite their applications, or we can
improve Gluster to be adequate for their needs, even if it isn't the
design center for Gluster.

The single-threadedness of many customer applications (examples include
common Linux utilities such as rsync and tar) amplifies this problem,
converting what was a throughput problem into a *latency* problem.

Benefit to GlusterFS
--------------------

Improvement of small-file performance will remove a barrier to
widespread adoption of this filesystem for mainstream use.

Scope
-----

Although the scope of the individual changes is limited, the overall
scope is very wide. Some changes can be done incrementally, and some
cannot. That is why changes are presented as a menu rather than an
all-or-nothing proposal.

We know that scope of DHT+NSR V4 is large and changes will be discussed
elsewhere, so we won't cover that here.

##### multi-thread-epoll

*Status*: DONE in glusterfs-3.6! [ <http://review.gluster.org/#/c/3842/>
based on Anand Avati's patch ]

*Why*: remove single-thread-per-brick barrier to higher CPU utilization
by servers

*Use case*: multi-client and multi-thread applications

*Improvement*: measured 40% with 2 epoll threads and 100% with 4 epoll
threads for small file creates to an SSD

*Disadvantage*: might expose some race conditions in Gluster that might
otherwise happen far less frequently, because receive message processing
will be less sequential. These need to be fixed anyway.

**Note**: this enhancement also helps high-IOPS applications such as
databases and virtualization which are not metadata-intensive. This has
been measured already using a Fusion I/O SSD performing random reads and
writes -- it was necessary to define multiple bricks per SSD device to
get Gluster to the same order of magnitude IOPS as a local filesystem.
But this workaround is problematic for users, because storage space is
not properly measured when there are multiple bricks on the same
filesystem.

##### remove io-threads translator

*Status*: no patch yet, hopefully can be tested with volfile edit

*Why*: don't need io-threads xlator now. Anand Avati suggested this
optimization was possible. io-threads translator was created to allow a
single "epoll" thread to launch multiple concurrent disk I/O requests,
and this made sense back in the era of 1-GbE networking and rotational
storage. However, thread context switching is getting more and more
expensive as CPUs get faster. For example, switching between threads on
different NUMA nodes is very costly. Switching to a powered-down core is
also expensive. And context switch makes the CPUs forget whatever they
learned about the application's memory and instructions. So this
optimization could be vital as we try to make Gluster competitive in
performance.

*Use case*: lower latency for latency-sensitive workloads such as
single-thread or single-client loads, and also improve efficiency of
glusterfsd process.

*Improvement*: no data yet

*Disadvantage*: we need to have a much bigger e-poll thread pool to keep
a large set of disks busy. In principle this is no worse than having
io-threads pool, is it?

##### glusterfsd stat and xattr cache

Please see feature page
[Features/stat-xattr-cache](../GlusterFS 4.0/stat-xattr-cache.md)

*Why*: remove most system call latency from small-file read and create
in brick process (glusterfsd)

*Use case*: single-thread throughput, response time

##### SSD and glusterfs tiering feature

*Status*: [
<http://www.gluster.org/community/documentation/index.php/Features/data-classification>
feature page ]

This is Jeff Darcy's proposal for re-using portions of DHT
infrastructure to do storage tiering and other things. One possible use
of this data classification feature is SSD caching of hot files, which
Dan Lambright has begun to implement and demo.

also see [
<https://www.mail-archive.com/gluster-devel@gluster.org/msg00385.html>
discussion in gluster-devel ]

*Improvement*: results are particularly dramatic with erasure coding for
small files, Dan's single-thread demo of 20-KB file reads showed a 100x
reduction in latency with O\_DIRECT reads.

*Disadvantages*: this will not help and may even slow down workloads
with a "working set" (set of concurrently active files) much larger than
the SSD tier, or with a rapidly changing working set that prevents the
cache from "warming up". At present tiering works at the level of the
entire file, which means it could be very expensive for some
applications such as virtualization that do not read the entire file, as
Ceph found out.

##### migrate .glusterfs to SSD

*Status*: [ <https://forge.gluster.org/gluster-meta-data-on-ssd> Dan
Lambright's code for moving .glusterfs to SSD ]

Also see [
<http://blog.gluster.org/2014/03/experiments-using-ssds-with-gluster/> ]
for background on other attempts to use SSD without changing Gluster to
be SSD-aware.

*Why*: lower latency of metadata access on disk

*Improvement*: a small smoke test showed a 10x improvement for
single-thread create, it is expected that this will help small-file
workloads that are not cache-friendly.

*Disadvantages*: This will not help large-file workloads. It will not
help workloads where the Linux buffer cache is sufficient to get a high
cache hit rate.

*Costs*: Gluster bricks now have an external dependency on an SSD device
- what if it fails?

##### tiering at block device level

*Status*: transparent to GlusterFS core. We mention it here because it
is a design alternative to preceding item (.glusterfs in SSD).

This option includes use of Linux features like dm-cache (Device Mapper
caching module) to accelerate reads and writes to Gluster "brick"
filesystems. Early experimentation with firmware-resident SSD caching
algorithms suggests that this isn't as maintainable and flexible as a
software-defined implementation, but these too are transparent to
GlusterFS.

*Use Case*: can provide acceleration for data ingest, as well as for
cache-friendly read-intensive workloads where the total size of the hot
data subset fits within SSD.

*Improvement*: For create-intensive workloads, normal writeback caching
in RAID controllers does provide some of the same benefits at lower
cost. For very small files, read acceleration can be as much as 10x if
SSD cache hits are obtained (and if the total size of hot files does NOT
fit in buffer cache). BTW, This approach can also have as much as a 30x
improvement in random read and write performance under these conditions.
This could also provide lower response times for Device Mapper thin-p
metadata device.

**NOTE**: we have to change our workload generation to use a non-uniform
file access distribution, preferably with a *moving* mean, to
acknowledge that in real-world workloads, not all files are equally
accessed, and that the "hot" files change over time. Without these two
workload features, we are not going to observe much benefit from cache
tiering.

*Disadvantage*: This does not help sequential workloads. It does not
help workloads where Linux buffer cache can provide cache hits. Because
this caching is done on the server and not the client, there are limits
imposed by network round trips on response times that limit the
improvement.

*Costs*: This adds complexity to the already-complex Gluster brick
configuration process.

##### cluster.lookup-unhashed auto

*Status*: DONE in glusterfs-3.7! [ <http://review.gluster.org/#/c/7702/>
Jeff Darcy patch ]

Why: When safe, don't lookup path on every brick before every file
create, in order to make small-file creation scalable with brick, server
count

**Note**: With JBOD bricks, we are going to hit this scalability wall a
lot sooner for smallfile creates!!!

*Use case*: small-file creates of any sort with large brick counts

*Improvement*: [
<https://s3.amazonaws.com/ben.england/small-file-perf-feature-page.pdf>
graphs ]

*Costs*: Requires monitoring hooks, see below.

*Disadvantage*: if DHT subvolumes are added/removed, how quickly do we
recover to state where we don't have to do the paranoid thing and lookup
on every DHT subvolume? As we scale, does DHT subvolume addition/removal
become a significantly more frequent occurrence?

##### lower RPC calls per file access

Please see
[Features/composite-operations](../GlusterFS 4.0/composite-operations.md)
page for details.

*Status*: no proposals exist for this, but NFS compound RPC and SMB ANDX
are examples, and NSR and DHT for Gluster V4 are necessary for this.

*Why*: reduce round-trip-induced latency between Gluster client and
servers.

*Use case*: small file creates -- example: [
<https://bugzilla.redhat.com/show_bug.cgi?id=1086681> bz-1086681 ]

*Improvement*: small-file operations can avoid pessimistic round-trip
patterns, and small-file creates can potentially avoid round trips
required because of AFR implementation. For clients with high round-trip
time to server, this has a dramatic improvement in throughput.

*Costs*: some of these code modifications are very non-trivial.

*Disadvantage*: may not be backward-compatible?

##### object-store API

Some of details are covered in
[Features/composite-operations](../GlusterFS 4.0/composite-operations.md)

*Status*: Librados in Ceph and Swift in OpenStack are examples. The
proposal would be to create an API that lets you do equivalent of Swift
PUT or GET, including opening/creating a file, accessing metadata, and
transferring data, in a single API call.

*Why*: on creates, allow application to avoid many round trips to server
to do lookups, create the file, then retrieve the data, then set
attributes, then close the file. On reads, allow application to get all
data in a single round trip (like Swift API).

*Use case*: applications which do not have to use POSIX, such as
OpenStack Swift.

*Improvement*: for clients that have a long network round trip time to
server, performance improvement could be 5x. Load on the server could be
greatly reduced due to lower context-switching overhead.

*Disadvantage*: Without preceding reduction in round trips, the changed
API may not result in much performance gain if any.

##### dentry injection

*Why*: This is not about small files themselves, but applies to
directories full of many small files. No matter how much we prefetch
directory entries from the server to the client, directory-listing speed
will still be limited by context switches from the application to the
glusterfs client process. One way to ameliorate this would be to
prefetch entries and *inject* them into FUSE, so that when the
application asks they'll be available directly from the kernel.

*Status*: Have discussed this with Brian Foster, not aware of subsequent
attempts/measurements.

*Use case*: All of those applications which insist on listing all files
in a huge directory, plus users who do so from the command line. We can
warn people and recommend against this all we like, but "ls" is often
one of the first things users do on their new file system and it can be
hard to recover from a bad first impression.

*Improvement*: TBS, probably not much impact until we have optimized
directory browsing round trips to server as discussed in
composite-operations.

*Disadvantage*: Some extra effort might be required to deal with
consistency issues.

### Implications on manageability

lookup-unhashed=auto implies that the system can, by adding/removing DHT
subvolumes, get itself into a state where it is not safe to do file
lookup using consistent hashing, until a rebalance has completed. This
needs to be visible at the management interface so people know why their
file creates have slowed down and when they will speed up again.

Use of SSDs implies greater complexity and inter-dependency in managing
the system as a whole (not necessarily Gluster).

### Implications on presentation layer

No change is required for multi-thread epoll, xattr+stat cache,
lookup-unhashed=off. If Swift uses libgfapi then Object-Store API
proposal affects it. DHT and NSR changes will impact management of
Gluster but should be transparent to translators farther up the stack
perhaps?

### Implications on persistence layer

None

### Implications on 'GlusterFS' backend

Massive changes would be required for DHT and NSR V4 to on-disk format.

### Modification to GlusterFS metadata

lookup-unhashed-auto change would require an additional xattr to track
cases where it's not safe to trust consistent hashing for a directory?

### Implications on 'glusterd'

DHT+NSR V4 require big changes to glusterd, covered elsewhere.

How To Test
-----------

Small-file performance testing methods are discussed in [Gluster
performance test
page](http://gluster.readthedocs.org/en/latest/Administrator%20Guide/Performance%20Testing/)

User Experience
---------------

We anticipate that user experience will become far more pleasant as the
system performance matches the user expectations and the hardware
capacity. Operations like loading data into Gluster and running
traditional NFS or SMB apps will be completed in a reasonable amount of
time without heroic effort from sysadmins.

SSDs are becoming an increasingly important form of storage, possibly
even replacing traditional spindles for some high-IOPS apps in the 2016
timeframe. Multi-thread-epoll and xattr+stat caching are a requirement
for Gluster to utilize more CPUs, and utilize them more efficiently, to
keep up with SSDs.

Dependencies
------------

None other than above.

Documentation
-------------

lookup-unhashed-auto behavior and how to monitor it will have to be
documented.

Status
------

Design-ready

Comments and Discussion
-----------------------

This work can be, and should be, done incrementally. However, if we
order these investments by ratio of effort to perf improvement, it might
look like this:

-   multi-thread-epoll (done)
-   lookup-unhashed-auto (done)
-   remove io-threads translator (from brick)
-   .glusterfs on SSD (prototyped)
-   cache tiering (in development)
-   glusterfsd stat+xattr cache
-   libgfapi Object-Store API
-   DHT in Gluster V4
-   NSR
-   reduction in RPCs/file-access
