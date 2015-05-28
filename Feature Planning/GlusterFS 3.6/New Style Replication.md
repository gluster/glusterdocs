Goal
----

More partition-tolerant replication, with higher performance for most
use cases.

Summary
-------

NSR is a new synchronous replication translator, complementing or
perhaps some day replacing AFR.

Owners
------

Jeff Darcy <jdarcy@redhat.com>  
Venky Shankar <vshankar@redhat.com>

Current status
--------------

Design and prototype (nearly) complete, implementation beginning.

Related Feature Requests and Bugs
---------------------------------

[AFR bugs related to "split
brain"](https://bugzilla.redhat.com/buglist.cgi?classification=Community&component=replicate&list_id=3040567&product=GlusterFS&query_format=advanced&short_desc=split&short_desc_type=allwordssubstr)

[AFR bugs related to
"perf"](https://bugzilla.redhat.com/buglist.cgi?classification=Community&component=replicate&list_id=3040572&product=GlusterFS&query_format=advanced&short_desc=perf&short_desc_type=allwordssubstr)

(Both lists are undoubtedly partial because not all bugs in these areas
using these specific words. In particular, "GFID mismatch" bugs are
really a kind of split brain, but aren't represented.)

Detailed Description
--------------------

NSR is designed to have the following features.

-   Server based - "chain" replication can use bandwidth of both client
    and server instead of splitting client bandwidth N ways.

-   Journal based - for reduced network traffic in normal operation,
    plus faster recovery and greater resistance to "split brain" errors.

-   Variable consistency model - based on
    [Dynamo](http://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf)
    to provide options trading some consistency for greater availability
    and/or performance.

-   Newer, smaller codebase - reduces technical debt, enables higher
    replica counts, more informative status reporting and logging, and
    other future features (e.g. ordered asynchronous replication).

Benefit to GlusterFS
====================

Faster, more robust, more manageable/maintainable replication.

Scope
=====

Nature of proposed change
-------------------------

At least two new translators will be necessary.

-   A simple client-side translator to route requests to the current
    leader among the bricks in a replica set.

-   A server-side translator to handle the "heavy lifting" of
    replication, recovery, etc.

Implications on manageability
-----------------------------

At a high level, commands to enable, configure, and manage NSR will be
very similar to those already used for AFR. At a lower level, the
options affecting things things like quorum, consistency, and placement
of journals will all be completely different.

Implications on presentation layer
----------------------------------

Minimal. Most changes will be to simplify or remove special handling for
AFR's unique behavior (especially around lookup vs. self-heal).

Implications on persistence layer
---------------------------------

N/A

Implications on 'GlusterFS' backend
-----------------------------------

The journal for each brick in an NSR volume might (for performance
reasons) be placed on one or more local volumes other than the one
containing the brick's data. Special requirements around AIO, fsync,
etc. will be less than with AFR.

Modification to GlusterFS metadata
----------------------------------

NSR will not use the same xattrs as AFR, reducing the need for larger
inodes.

Implications on 'glusterd'
--------------------------

Volgen must be able to configure the client-side and server-side parts
of NSR, instead of AFR on the client side and index (which will no
longer be necessary) on the server side. Other interactions with
glusterd should remain mostly the same.

How To Test
===========

Most basic AFR tests - e.g. reading/writing data, killing nodes,
starting/stopping self-heal - would apply to NSR as well. Tests that
embed assumptions about AFR xattrs or other internal artifacts will need
to be re-written.

User Experience
===============

Minimal change, mostly related to new options.

Dependencies
============

NSR depends on a cluster-management framework that can provide
membership tracking, leader election, and robust consistent key/value
data storage. This is expected to be developed in parallel as part of
the glusterd-scalability feature, but can be implemented (in simplified
form) within NSR itself if necessary.

Documentation
=============

TBD.

Status
======

Some parts of earlier implementation updated to current tree, others in
the middle of replacement.

-   [New design](http://review.gluster.org/#/c/8915/)

-   [Basic translator code](http://review.gluster.org/#/c/8913/) (needs
    update to new code-generation infractructure)

-   [GF\_FOP\_IPC](http://review.gluster.org/#/c/8812/)

-   [etcd support](http://review.gluster.org/#/c/8887/)

-   [New code-generation
    infrastructure](http://review.gluster.org/#/c/9411/)

-   [New data-logging
    translator](https://forge.gluster.org/~jdarcy/glusterfs-core/jdarcys-glusterfs-data-logging)

Comments and Discussion
=======================

My biggest concern with journal-based replication comes from my previous
use of DRBD. They do an "activity log"[^1] which sounds like the same
basic concept. Once that log filled, I experienced cascading failure.
When the journal can be filled faster than it's emptied this could cause
the problem I experienced.

So what I'm looking to be convinced is how journalled replication
maintains full redundancy and how it will prevent the journal input from
exceeding the capacity of the journal output or at least how it won't
fail if this should happen.

[jjulian](User:Jjulian "wikilink")
([talk](User talk:Jjulian "wikilink")) 17:21, 13 August 2013 (UTC)

<hr/>
This is akin to a CAP Theorem[^2][^3] problem. If your nodes can't
communicate, what do you do with writes? Our replication approach has
traditionally been CP - enforce quorum, allow writes only among the
majority - and for the sake of satisfying user expectations (or POSIX)
pretty much has to remain CP at least by default. I personally think we
need to allow an AP choice as well, which is why the quorum levels in
NSR are tunable to get that result.

So, what do we do if a node runs out of journal space? Well, it's unable
to function normally, i.e. it's failed, so it can't count toward quorum.
This would immediately lead to loss of write availability in a two-node
replica set, and could happen easily enough in a three-node replica set
if two similarly configured nodes ran out of journal space
simultaneously. A significant part of the complexity in our design is
around pruning no-longer-needed journal segments, precisely because this
is an icky problem, but even with all the pruning in the world it could
still happen eventually. Therefore the design also includes the notion
of arbiters, which can be quorum-only or can also have their own
journals (with no or partial data). Therefore, your quorum for
admission/journaling purposes can be significantly higher than your
actual replica count. So what options do we have to avoid or deal with
journal exhaustion?

-   Add more journal space (it's just files, so this can be done
    reactively during an extended outage).

-   Add arbiters.

-   Decrease the quorum levels.

-   Manually kick a node out of the replica set.

-   Add admission control, artificially delaying new requests as the
    journal becomes full. (This one requires more code.)

If you do \*none\* of these things then yeah, you're scrod. That said,
do you think these options seem sufficient?

[Jdarcy](User:Jdarcy "wikilink") ([talk](User talk:Jdarcy "wikilink"))
15:27, 29 August 2013 (UTC)

<references/>

[^1]: <http://www.drbd.org/users-guide-emb/s-activity-log.html>

[^2]: <http://www.julianbrowne.com/article/viewer/brewers-cap-theorem>

[^3]: <http://henryr.github.io/cap-faq/>
