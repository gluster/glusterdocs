Feature
-------

Clone of a Snapshot

Summary
-------

GlusterFS volume snapshot provides point-in-time copy of a GlusterFS
volume. When we take a volume snapshot, the newly created snap volume is
a read only volume.

By this feature, this snap volume can be later 'cloned' to create a new
regular volume which contains the same contents of snapshot bricks. This
is a space efficient clone therefore it will be created instantaneously
and will share the disk space in the back-end, just like a snapshot and
the origin volume.

Owners
------

Mohammed Rafi KC <rkavunga@redhat.com>

Current status
--------------

Requiremnt for openstack manila.

Detailed Description
--------------------

Snapshot create will take point-in-time snapshot of a volume. upon
successful completion, it will create a new read/only volume. But the
new volume is not considered as a regular volume, which prevents us to
perform any volume related operations on this snapshot volume. The
ultimate aim of this feature is creating a new regular volume out of
this snap.

For e.g.:

		gluster snapshot create snap1 vol1

The above command will create a read-only snapshot "snap1" from volume
vol1.

		gluster snapshot clone share1 snap1

The above command will create a regular gluster volume share1 from
snap1.

Benefit to GlusterFS
--------------------

We will have a writable snapshot.

Scope
-----

### Nature of proposed change

Modification to glusterd snapshot code.

### Implications on manageability

glusterd,gluster cli

### Implications on 'GlusterFS' backend

There will be performance degradation for the first write of a each
block of main volume.

### Modification to GlusterFS metadata

none

How To Test
-----------

create a volume Take snapshot create a clone. start the clone. cloned
volume should support all operation for a regular volume.

User Experience
---------------

there will an additional cli option for snapshot. gluster snapshot clone
```<clonename> <snapname> [<description> <description test>] [force]```

Dependencies
------------

Documentation
-------------

Status
------

In development

Comments and Discussion
-----------------------
