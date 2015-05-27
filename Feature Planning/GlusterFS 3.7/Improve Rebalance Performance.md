Feature
-------

Improve GlusterFS rebalance performance

Summary
-------

Improve the current rebalance mechanism in GlusterFS by utilizing the
resources better, to speed up overall rebalance and also to speed up the
brick removal and addition cases where data needs to be spread faster
than the current rebalance mechanism does.

Owners
------

Raghavendra Gowdappa <rgowdapp@redhat.com>  
Shyamsundar Ranganathan <srangana@redhat.com>  
Susant Palai <spalai@redhat.com>  
Venkatesh Somyajulu <vsomyaju@redhat.com>  

Current status
--------------

This section is split into 2 parts, explaining how the current rebalance
works and what its limitations are.

### Current rebalance mechanism

Currently rebalance works as follows,

​A) Each node in the Gluster cluster kicks off a rebalance process for
one of the following actions

-   layout fixing
-   rebalance data, with space constraints in check
    -   Will rebalance data with file size and disk free availability
        constraints, and move files that will not cause a brick
        imbalance in terms of amount of data stored across bricks
-   rebalance data, based on layout precision
    -   Will rebalance data so that the layout is adhered to and hence
        optimize lookups in the future (find the file where the layout
        claims it is)

​B) Each nodes process, then uses the following algorithm to proceed,

-   1: Open root of the volume
-   2: Fix the layout of root
-   3: Start a crawl on the current directory
-   4: For each file in the current directory,
    -   4.1: Determine if file is in the current node (optimize on
        network reads for file data)
    -   4.2: If it does, migrate file based on type of rebalance sought
    -   4.3: End the file crawl once crawl returns no more entries
-   5: For each directory in the current directory
    -   5.1: Fix the layout, and iterate on starting the crawl for this
        directory (goto step 3)
-   6: End the directory crawl once crawl returns no more entries
-   7: Cleanup and exit

### Limitations and issues in the current mechanism

The current mechanism spreads the work of rebalance to all nodes in the
cluster, and also takes into account only files that belong to the node
on which the rebalance process is running. This spreads the load of
rebalance well and also optimizes network reads of data, by taking into
account only files local to the current node.

Where this becomes slow is in the following cases,

​1) It rebalances one file at a time only as it uses the syncop
infrastructure to start the rebalance of a file issuing a setxattr with
the special attribute "distribute.migrate-data", which in turn would
return after its synctask of migrating the file is completes (synctask:
rebalance\_task)

-  This reduces the bandwidth consumption of several resources, like
    disk, CPU and network as we would read and write a single file at a
    time

​2) Rebalance of data is serial between reads and writes of data, i.e
for a file a chunk of data is read from disk, written to the network,
awaiting an response on the write from the remote node, and then
proceeds with the next read

-  This makes read-write dependent on each other, and waiting for one
    or the other to complete, so we either have the network idle when
    reads from disk are in progress or vice-versa

-  This further makes serial use of resource like the disk or network,
    reading or writing one block at a time

​3) Each rebalance process crawls the entire volume for files to
migrate, and chooses only files that are local to it

-  This crawl could be expensive and as a node deals with files that
    are local to it, based on the cluster size and number of nodes,
    quite a proportion of the entries crawled would hence be dropped

​4) On a remove brick the current rebalance, ends up rebalancing the
entire cluster. If the interest is in removing the brick(s) or replacing
the bricks, realancing the entire cluster can be costly.

​5) On addition of bricks, again the entire cluster is rebalanced. If
space constraints are in play due to which bricks were added, it is
sub-optimal to rebalance the entire cluster.

​6) In cases where AFR is below DHT, all the nodes in AFR participate in
the rebalance, and end up rebalancing (or attempting to) the same set of
files. This is racy, and could (maybe) be made better.

Detailed Description
--------------------

The above limitations can be broken down into separate features to
improve rebalance performance and to also provide options in rebalance
when specific use cases like quicker brick removal is sought. The
following sections detail out these improvements.

### Rebalance multiple files in parallel

Instead of rebalancing file by file due to using syncops to trigger the
rebalance of a files data using setxattr, use the wind infrastructure to
migrate multiple files at a time. This would end up using the disk and
network infrastructure better and can hence enable faster rebalance of
data. This would even mean that when one file is blocked on a disk read
the other parallel stream could be writing data to the network, hence
starvation of the read-write-read model between disk and network could
also be alleviated to a point.

### Split reads and writes of files into separate tasks when rebalancing the data

This is to reduce the wait between a disk read or a network write, and
to ensure both these resources can be kept busy. By rebalancing more
files in parallel, this improvement may not be needed, as the parallel
streams would end up in keeping one or the other resource busy with
better probability. Noting this enhancement down anyway to see if this
needs consideration post increasing the parallelism of rebalance as
above.

### Crawl only bricks that belong to the current node

As explained, the current rebalance takes into account only those files
that belong to the current node. As this is a DHT level operation, we
can hence choose not to send opendir/readdir calls to subvolumes that do
not belong to the current node. This would reduce the crawls that are
performed in rebalance for files at least and help in speeding up the
entire process.

NOTE: We would still need to evaluate the cost of this crawl vis-a-vis
the overall rebalance process, to evaluate its benefits

### Rebalance on access

When removing bricks, one of the intention is to drain the brick of all
its data and to hence enable removing the brick as soon as possible.

When adding bricks, one of the requirements could be that the cluster is
reaching its capacity and hence we want to increase the same.

In both the cases rebalancing the entire cluster could/would take time.
Instead an alternate approach is being proposed, where we do 3 things
essentially as follows,

-  Kick off rebalance to fix layout, and drain a brick of its data,
    or rebalance files onto a newly added brick
-  On further access of data, if the access is leading to a double
    lookup or redirection based on layout (due to older bricks data not
    yet having been rebalanced), start a rebalance of this file in
    tandem to IO access (call this rebalance on access)
-  Start a slower, or a later, rebalance of the cluster, once the
    intended use case is met, i.e draining a brick of its data or
    creating space in other bricks and filling the newly added brick
    with relevant data. This is to get the cluster balanced again,
    without requiring data to be accessed.

### Make rebalance aware of IO path requirements

One of the problems of improving resource consumption in a node by the
rebalance process would be that, we could starve the IO path. So further
to some of the above enhancements, take into account IO path resource
utilization (i.e disk/network/CPU) and slow down or speed up the
rebalance process appropriately (say by increasing or decreasing the
number of files that are rebalanced in parallel).

NOTE: This requirement is being noted down, just to ensure we do not
make the IO access to the cluster slow as rebalance is being made
faster, resources to monitor and tune rebalance may differ when tested
and experimented upon

### Further considerations

-  We could consider some further layout optimization to reduce the
    amount of data that is being rebalanced
-  Addition of scheduled rebalance, or the ability to stop and
    continue rebalance from a point, could be useful for preventing IO
    path slowness in cases where an admin could choose to run rebalance
    on non-critical hours (do these even exist today?)
-  There are no performance xlators in the rebalance graph. We should
    try experiments loading them.

Benefit to GlusterFS
--------------------

Gluster is a grow as you need distributed file system. With this in
picture, rebalance is key to grow the cluster in relatively sane amount
of time. This enhancement attempts to speed things up in rebalance, in
order to better this use case.

Scope
-----

### Nature of proposed change

This is intended as a modification to existing code only, there are no
new xlators being introduced. BUT, as things evolve and we consider say,
layout optimization based on live data or some such notions, we would
need to extend this section to capture the proposed changes.

### Implications on manageability

The gluster command would need some extensions, for example the number
of files to process in parallel, as we introduce these changes. As it is
currently in the prototype phase, keeping this and the sections below as
TBDs

**Document TBD from here on...**

### Implications on presentation layer

*NFS/SAMBA/UFO/FUSE/libglusterfsclient Integration*

### Implications on persistence layer

*LVM, XFS, RHEL ...*

### Implications on 'GlusterFS' backend

*brick's data format, layout changes*

### Modification to GlusterFS metadata

*extended attributes used, internal hidden files to keep the metadata...*

### Implications on 'glusterd'

*persistent store, configuration changes, brick-op...*

How To Test
-----------

*Description on Testing the feature*

User Experience
---------------

*Changes in CLI, effect on User experience...*

Dependencies
------------

*Dependencies, if any*

Documentation
-------------

*Documentation for the feature*

Status
------

Design/Prototype in progress

Comments and Discussion
-----------------------

*Follow here*
