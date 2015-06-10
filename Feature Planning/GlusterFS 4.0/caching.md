Goal Caching
------------

Improved performance via client-side caching.

Summary
-------

GlusterFS has historically taken a very conservative approach to
client-side caching, due to the cost and difficulty of ensuring
consistency across a truly distributed file system. However, this has
often led to a competitive disadvantage vs. other file systems that
cache more aggressively. While one could argue that expecting an
application designed for a local FS or NFS to behave the same way on a
distributed FS is unrealistic, or question whether competitors' caching
is really safe, this nonetheless remains one of our users' top requests.

For purposes of this discussion, pre-fetching into cache is considered
part of caching itself. However, write-behind caching (buffering) is a
separate feature, and is not in scope.

Owners
------

Xavier Hernandez <xhernandez@datalab.es>

Jeff Darcy <jdarcy@redhat.com>

Current status
--------------

Proposed, waiting until summit for approval.

Related Feature Requests and Bugs
---------------------------------

[Features/FS-Cache](Features/FS-Cache "wikilink") is about a looser
(non-consistent) kind of caching integrated via FUSE. This feature is
differentiated by being fully consistent, and implemented in GlusterFS
itself.

[IMCa](http://mvapich.cse.ohio-state.edu/static/media/publications/slide/imca_icpp08.pdf)
describes a completely external approach to caching (both data and
metadata) with GlusterFS.

Detailed Description
--------------------

Retaining data in cache on a client after it's read is trivial.
Pre-fetching into that same cache is barely more difficult. All of the
hard parts are on the server.

-   Tracking which clients still have cached copies of which data (or
    metadata).

-   Issuing and waiting for invalidation requests when a client changes
    data cached elsewhere.

-   Handling failures of the servers tracking client state, and of
    communication with clients that need to be invalidated.

-   Doing all of this without putting performance in the toilet.

Invalidating cached copies is analogous to breaking locks, so the
async-notification and "oplock" code already being developed for
multi-protocol (SMB3/NFS4) support can probably be used here. More
design is probably needed around scalable/performant tracking of client
cache state by servers.

Benefit to GlusterFS
--------------------

Much better performance for cache-friendly workloads.

Scope
-----

### Nature of proposed change

Some of the existing "performance" translators could be replaced by a
single client-caching translator. There will also need to be a
server-side helper translator to track client cache states and issue
invalidation requests at the appropriate times. Such asynchronous
(server-initiated) requests probably require transport changes, and
[GF\_FOP\_IPC](http://review.gluster.org/#/c/8812/) might play a part as
well.

### Implications on manageability

New commands will be needed to set cache parameters, force cache
flushes, etc.

### Implications on presentation layer

None, except for integration with the same async/oplock infrastructure
as used separately in SMB and NFS.

### Implications on persistence layer

None.

### Implications on 'GlusterFS' backend

We will likely need some sort of database associated with each brick to
maintain information about cache states.

### Modification to GlusterFS metadata

None.

### Implications on 'glusterd'

None.

How To Test
-----------

We'll need new tests to verify that invalidations are in fact occurring,
that we can't read stale/inconsistent data despite the increased caching
on clients, etc.

User Experience
---------------

See "implications on manageability" section.

Dependencies
------------

Async-notification and oplock code from the Samba team.

Documentation
-------------

TBD

Status
------

Design in private review, hopefully available for public review soon.

Comments and Discussion
-----------------------
