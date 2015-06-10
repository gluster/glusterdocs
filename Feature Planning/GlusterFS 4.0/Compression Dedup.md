Feature
-------

Compression / Deduplication

Summary
-------

In the never-ending quest to increase storage efficiency (or conversely
to decrease storage cost), we could compress and/or deduplicate data
stored on bricks.

Owners
------

Jeff Darcy <jdarcy@redhat.com>

Current status
--------------

Just a vague idea so far.

Related Feature Requests and Bugs
---------------------------------

TBD

Detailed Description
--------------------

Compression and deduplication for GlusterFS have been discussed many
times. Deduplication across machines/bricks is a recognized Hard
Problem, with uncertain benefits, and is thus considered out of scope.
Deduplication within a brick is potentially achievable by using
something like
[lessfs](http://sourceforge.net/projects/lessfs/files/ "wikilink"),
which is itself a FUSE filesystem, so one fairly simple approach would
be to integrate lessfs as a translator. There's no similar option for
compression.

In both cases, it's generally preferable to work on fully expanded files
while they're open, and then compress/dedup when they're closed. Some of
the bitrot or tiering infrastructure might be useful for moving files
between these states, or detecting when such a change is needed. There
are also some interesting interactions with quota, since we need to
count the un-compressed un-deduplicated size of the file against quota
(or do we?) and that's not what the underlying local file system will
report.

Benefit to GlusterFS
--------------------

Less \$\$\$/GB for our users.

Scope
-----

### Nature of proposed change

New translators, hooks into bitrot/tiering/quota, probably new daemons.

### Implications on manageability

Besides turning these options on or off, or setting parameters, there
will probably need to be some way of reporting the real vs.
compressed/deduplicated size of files/bricks/volumes.

### Implications on presentation layer

Should be none.

### Implications on persistence layer

If the DM folks ever get their <expletive deleted> together on this
front, we might be able to use some of their stuff instead of lessfs.
That worked so well for thin provisioning and snapshots.

### Implications on 'GlusterFS' backend

What's on the brick will no longer match the data that the user stored
(and might some day retrieve). In the case of compression,
reconstituting the user-visible version of the data should be a simple
matter of decompressing via a well known algorithm. In the case of
deduplication, the relevant data structures are much more complicated
and reconstitution will be correspondingly more difficult.

### Modification to GlusterFS metadata

Some of the information tracking deduplicated blocks will probably be
stored "privately" in .glusterfs or similar.

### Implications on 'glusterd'

TBD

How To Test
-----------

TBD

User Experience
---------------

Mostly unchanged, except for performance. As with erasure coding, a
compressed/deduplicated slow tier will usually need to be paired with a
simpler fast tier for overall performance to be acceptable.

Dependencies
------------

External: lessfs, DM, whatever other technology we use to do the
low-level work

Internal: tiering/bitrot (perhaps changelog?) to track state and detect
changes

Documentation
-------------

TBD

Status
------

Still just a vague idea.

Comments and Discussion
-----------------------
