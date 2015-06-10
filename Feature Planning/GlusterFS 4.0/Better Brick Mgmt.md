Goal
----

Easier (more autonomous) assignment of storage to specific roles

Summary
-------

Managing bricks and arrangements of bricks (e.g. into replica sets)
manually doesn't scale. Instead, we need more intuitive ways to group
bricks together into pools, allocate space from those pools (creating
new pools), and let users define volumes in terms of pools rather than
individual bricks. We get to worry about how to arrange those bricks
into an intelligent volume configuration, e.g. replicating between
bricks that are the same size/speed/type but not on the same server.

Because this smarter and/or finer-grain resource allocation (plus
general technology evolution) is likely to result in many more bricks
per server than we have now, we also need a brick-daemon infrastructure
capable of handling that.

Owners
------

Jeff Darcy <jdarcy@redhat.com>

Current status
--------------

Proposed, waiting until summit for approval.

Related Feature Requests and Bugs
---------------------------------

[Features/data-classification](../GlusterFS 3.7/Data Classification.md)
will drive the heaviest and/or most sophisticated use of this feature,
and some of the underlying mechanisms were originally proposed there.

Detailed Description
--------------------

To start with, we need to distinguish between the raw brick that the
user allocates to GlusterFS and the pieces of that brick that result
from our complicated storage allocation. Some documents refer to these
as u-brick and s-brick respectively, though perhaps it's better to keep
calling the former bricks and come up with a new name for the latter -
slice, tile, pebble, etc. For now, let's stick with the x-brick
terminology. We can manipulate these objects in several ways.

-   Group u-bricks together into an equivalent pool of s-bricks
    (trivially 1:1).

-   Allocate space from a pool of s-bricks, creating a set of smaller
    s-bricks. Note that the results of applying this repeatedly might be
    s-bricks which are on the same u-brick but part of different
    volumes.

-   Combine multiple s-bricks into one via some combination of
    replication, erasure coding, distribution, tiering, etc.

-   Export an s-brick as a volume.

These operations - especially combining - can be applied iteratively,
creating successively more complex structures prior to the final export.
To support this, the code we currently use to generate volfiles needs to
be changed to generate similar definitions for the various levels of
s-bricks. Combined with the need to support versioning of these files
(for snapshots), this probably means a rewrite of the volgen code.
Another type of configuration file we need to create is for a brick
daemon. We still run one glusterfsd process per u-brick, for various
reasons.

-   Maximize compatibility with our current infrastructure for starting
    and monitoring server processes.

-   Align the boundaries between actual and detected device failures.

-   Reduce the number of ports assigned, both for administrative
    convenience and to avoid exhaustion.

-   Reduce context-switch and virtual-memory thrashing between too many
    uncoordinated processes. Some day we might even add custom resource
    control/scheduling between s-bricks within a process, which would be
    impossible in separate processes.

These new glusterfsd processes are going to require more complex
volfiles, and more complex translator-graph code to consume those. They
also need to be more parallel internally, so this feature depends on
eliminating single-threaded bottlenecks such as our socket transport.

Benefit to GlusterFS
--------------------

-   Reduced administrative overhead for large/complex volume
    configurations.

-   More flexible/sophisticated volume configurations, especially with
    respect to other features such as tiering or internal enhancements
    such as overlapping replica/erasure sets.

-   Improved performance.

Scope
-----

### Nature of proposed change

-   New object model, exposed via both glusterd-level and user-level
    commands on those objects.

-   Rewritten volfile infrastructure.

-   Significantly enhanced translator-graph infrastructure.

-   Multi-threaded transport.

### Implications on manageability

New commands will be needed to group u-bricks into pools, allocate
s-bricks from pools, etc. There will also be new commands to view status
of objects at various levels, and perhaps to set options on them. On the
other hand, "volume create" will probably become simpler as the
specifics of creating a volume are delegated downward to s-bricks.

### Implications on presentation layer

Surprisingly little.

### Implications on persistence layer

None.

### Implications on 'GlusterFS' backend

The on-disk structures (.glusterfs and so on) currently associated with
a brick become associated with an s-brick. The u-brick itself will
contain little, probably just an enumeration of the s-bricks into which
it has been divided.

### Modification to GlusterFS metadata

None.

### Implications on 'glusterd'

See detailed description.

How To Test
-----------

New tests will be needed for grouping/allocation functions. In
particular, negative tests for incorrect or impossible configurations
will be needed. Once s-bricks have been aggregated back into volumes,
most of the current volume-level tests will still apply. Related tests
will also be developed as part of the data classification feature.

User Experience
---------------

See "implications on manageability" etc.

Dependencies
------------

This feature is so closely associated with data classification that the
two can barely be considered separately.

Documentation
-------------

Much of our "brick and volume management" documentation will require a
thorough review, if not an actual rewrite.

Status
------

Design still in progress.

Comments and Discussion
-----------------------
