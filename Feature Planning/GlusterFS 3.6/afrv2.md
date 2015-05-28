Feature
-------

This feature is major code re-factor of current afr along with a key
design change in the way changelog extended attributes are stored in
afr.

Summary
-------

This feature introduces design change in afr which separates ongoing
transaction, pending operation count for files/directories.

Owners
------

Anand Avati  
Pranith Kumar Karampuri

Current status
--------------

The feature is in final stages of review at
<http://review.gluster.org/6010>

Detailed Description
--------------------

How AFR works:

In order to keep track of what copies of the file are modified and up to
date, and what copies require to be healed, AFR keeps state information
in the extended attributes of the file called changelog extended
attributes. These extended attributes stores that copy's view of how up
to date the other copies are. The extended attributes are modified in a
transaction which consists of 5 phases - LOCK, PRE-OP, OP, POST-OP and
UNLOCK. In the PRE-OP phase the extended attributes are updated to store
the intent of modification (in the OP phase.)

In the POST-OP phase, depending on how many servers crashed mid way and
on how many servers the OP was applied successfully, a corresponding
change is made in the extended attributes (of the surviving copies) to
represent the staleness of the copies which missed the OP phase.

Further, when those lagging servers become available, healing decisions
are taken based on these extended attribute values.

Today, a PRE-OP increments the pending counters of all elements in the
array (where each element represents a server, and therefore one of the
members of the array represents that server itself.) The POST-OP
decrements those counters which represent servers where the operation
was successful. The update is performed on all the servers which have
made it till the POST-OP phase. The decision of whether a server crashed
in the middle of a transaction or whether the server lived through the
transaction and witnessed the other server crash, is inferred by
inspecting the extended attributes of all servers together. Because
there is no distinction between these counters as to how many of those
increments represent "in transit" operations and how many of those are
retained without decrement to represent "pending counters", there is
value in adding clarity to the system by separating the two.

The change is to now have only one dirty flag on each server per file.
We also make the PRE-OP increment only that dirty flag rather than all
the elements of the pending array. The dirty flag must be set before
performing the operation, and based on which of the servers the
operation failed, we will set the pending counters representing these
failed servers on the remaining ones in the POST-OP phase. The dirty
counter is also cleared at the end of the POST-OP. This means, in
successful operations only the dirty flag (one integer) is incremented
and decremented per server per file. However if a pending counter is set
because of an operation failure, then the flag is an unambiguous "finger
pointing" at the other server. Meaning, if a file has a pending counter
AND a dirty flag, it will not undermine the "strength" of the pending
counter. This change completely removes today's ambiguity of whether a
pending counter represents a still ongoing operation (or crashed in
transit) vs a surely missed operation.

Benefit to GlusterFS
--------------------

It increases the clarity of whether a file has any ongoing transactions
and any pending self-heals. Code is more maintainable now.

Scope
-----

### Nature of proposed change

- Remove client side self-healing completely (opendir, openfd, lookup) -
Re-work readdir-failover to work reliably in case of NFS - Remove
unused/dead lock recovery code - Consistently use xdata in both calls
and callbacks in all FOPs - Per-inode event generation, used to force
inode ctx refresh - Implement dirty flag support (in place of pending
counts) - Eliminate inode ctx structure, use read subvol bits +
event\_generation - Implement inode ctx refreshing based on event
generation - Provide backward compatibility in transactions - remove
unused variables and functions - make code more consistent in style and
pattern - regularize and clean up inode-write transaction code -
regularize and clean up dir-write transaction code - regularize and
clean up common FOPs - reorganize transaction framework code - skip
setting xattrs in pending dict if nothing is pending - re-write
self-healing code using syncops - re-write simpler self-heal-daemon

### Implications on manageability

None

### Implications on presentation layer

None

### Implications on persistence layer

None

### Implications on 'GlusterFS' backend

None

### Modification to GlusterFS metadata

This changes the way pending counts vs Ongoing transactions are
represented in changelog extended attributes.

### Implications on 'glusterd'

None

How To Test
-----------

Same test cases of afrv1 hold.

User Experience
---------------

None

Dependencies
------------

None

Documentation
-------------

---

Status
------

The feature is in final stages of review at
<http://review.gluster.org/6010>

Comments and Discussion
-----------------------

---

Summary
-------

<Brief Description of the Feature>

Owners
------

<Feature Owners - Ideally includes you :-)>

Current status
--------------

<Provide details on related existing features, if any and why this new feature is needed>

Detailed Description
--------------------

<Detailed Feature Description>

Benefit to GlusterFS
--------------------

<Describe Value additions to GlusterFS>

Scope
-----

### Nature of proposed change

<modification to existing code, new translators ...>

### Implications on manageability

<Glusterd, GlusterCLI, Web Console, REST API>

### Implications on presentation layer

<NFS/SAMBA/UFO/FUSE/libglusterfsclient Integration>

### Implications on persistence layer

<LVM, XFS, RHEL ...>

### Implications on 'GlusterFS' backend

<brick's data format, layout changes>

### Modification to GlusterFS metadata

<extended attributes used, internal hidden files to keep the metadata...>

### Implications on 'glusterd'

<persistent store, configuration changes, brick-op...>

How To Test
-----------

<Description on Testing the feature>

User Experience
---------------

<Changes in CLI, effect on User experience...>

Dependencies
------------

<Dependencies, if any>

Documentation
-------------

<Documentation for the feature>

Status
------

<Status of development - Design Ready, In development, Completed>

Comments and Discussion
-----------------------

<Follow here>
