Goal
----

More scalable DHT translator.

Summary
-------

Current DHT inhibits scalability by requiring that directories be on all
subvolumes. In addition to the extra message traffic this incurs during
*mkdir*, it adds significant complexity keeping all of the directories
consistent across operations like *create* and *rename*. What is
proposed, in a nutshell, is that directories should only exist on one
subvolume, which might contain "stubs" pointing to files and directories
that can be accessed by GFID on the same or other subvolumes. In concert
with this, the way we store layout information needs to change, so that
at least the "fix-layout" part of rebalancing need not involve
traversing every directory on every subvolume.

Owners
------

Shyam Ranganathan <srangana@redhat.com>

Raghavendra Gowdappa <rgowdapp@redhat.com>

Current status
--------------

Proposed, awaiting summit for approval.

Related Feature Requests and Bugs
---------------------------------

[Features/thousand-node-glusterd](../GLusterFS 3.6/Thousand Node Gluster.md)
will define new ways of managing maintenance activities, some of which
are DHT-related. Also, the new "mon cluster" might be where we store
layout information.

[Features/data-classification](../GLusterFS 3.7/Data Classification.md)
also affects layout storage and use.

Detailed Description
--------------------

Under this scheme, path-based lookup becomes very different. Currently,
we look up a path on the file's "hashed" subvol first (according to
parent-directory layout and file GFID). If it's not there, we need to
look elsewhere - in the worst case on **all** subvolumes. In the future,
our first lookup should be at the parent directory's subvolume. If the
file is not there, it's not linked anywhere (though it might still exist
unlinked and accessible by GFID) and we can terminate immediately. If it
is there, then that single copy of the parent directory will contain a
"stub" giving the file's GFID and a hint for what subvolume it's on
(similar to a current linkfile). That information can then be used to
initiate a GFID-based lookup. Many other code paths, such as *rename*,
can leverage this new infrastructure to avoid current problems with
multiple directory entries and linkfiles all for the same actual file.

A possible enhancement would be to include more information in stubs,
allowing readdirp to operate only on the directory and avoid going to
every subvolume for information about individual files. Also, some
secondary issues such as hard links and garbage collection (of unlinked
but still open files) remain TBD in the final design.

With respect to layout storage, the basic idea is to store a fairly
small number of actual layouts - default, user defined, or related to
data classification - that are each shared across many directories.
These layouts are stored as part of our configuration, and the xattrs on
individual directories need only specify a shared layout ID (plus
possibly some additional "tweak" parameters) instead of a full explicit
layout. When we do any kind of rebalancing, we need only change the
shared layouts and not the pointers on each directory.

Benefit to GlusterFS
--------------------

Improved scalability and performance for all directory-entry operations.

Improved reliability for conflicting directory-entry operations, and for
layout repair.

Almost instantaneous "fix-layout" completion.

Scope
-----

### Nature of proposed change

Due to the complexity of the changes involved, this will probably be a
new translator developed using a similar model to that used for AFR2.
While it's likely to share/borrow a significant amount of code from
current DHT, the new version will go through most of its development
lifecycle separately and then completely supplant the old version, as
opposed to integrating individual changes. For testing of
compatibility/migration, it is probably desirable for both versions to
coexist in the source tree and packages, but not necessarily in the same
process.

### Implications on manageability

New/different options, but otherwise no change.

### Implications on presentation layer

No change. At this level the new DHT translator should be a plug-in
replacement for the old one.

### Implications on persistence layer

None, unless you count reduced xattr usage.

### Implications on 'GlusterFS' backend

This will fundamentally change the directory structure on our back end.
A file that is currently visible within a brick as \$BRICK\_ROOT/a/b/c
might now be visible only as \$GFID\_FOR\_B/c with neither of the parent
directories even present on that brick. Even that "file" will actually
be a stub containing only the file's own GFID; to get the contents, one
would need to look up that GFID in .glusterfs on this or some other
brick.

Linkfiles will be gone, also subsumed by stubs.

### Modification to GlusterFS metadata

Explicit layouts will be replaced by IDs for shared layouts (in config
storage).

### Implications on 'glusterd'

Minimal changes (mostly volfile generation).

How To Test
-----------

Most existing DHT tests should suffice, except for those that depend on
the details of how layouts are stored and formatted. Those will have to
be modified to go through the extra layer of indirection to where the
actual layouts live.

User Experience
---------------

None, except for better performance and less lost data.

Dependencies
------------

See "related features" section.

Documentation
-------------

TBD. There should be very little at the user level, though hopefully
this time we'll do better at documenting the things developers
(including add-on tool developers) need to know.

Status
------

Design in progress

Design and some notes can be found here,
<https://drive.google.com/open?id=15_TOW9jwzW4griAmk-rqg2cWF-LHiR_TJ8Jn0vOvYpU&authuser=0>

Thread at gluster-devel opening this up for discussion here,
<https://www.mail-archive.com/gluster-devel%40gluster.org/msg03036.html>

Comments and Discussion
-----------------------
