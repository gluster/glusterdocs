Feature
-------

Brick Failure Detection

Summary
-------

This feature attempts to identify storage/file system failures and
disable the failed brick without disrupting the remainder of the node's
operation.

Owners
------

Vijay Bellur with help from Niels de Vos (or the other way around)

Current status
--------------

Currently, if the underlying storage or file system failure happens, a
brick process will continue to function. In some cases, a brick can hang
due to failures in the underlying system. Due to such hangs in brick
processes, applications running on glusterfs clients can hang.

Detailed Description
--------------------

Detecting failures on the filesystem that a brick uses makes it possible
to handle errors that are caused from outside of the Gluster
environment.

There have been hanging brick processes when the underlying storage of a
brick went unavailable. A hanging brick process can still use the
network and repond to clients, but actual I/O to the storage is
impossible and can cause noticible delays on the client side.

Benefit to GlusterFS
--------------------

Provide better detection of storage subsytem failures and prevent bricks
from hanging.

Scope
-----

### Nature of proposed change

Add a health-checker to the posix xlator that periodically checks the
status of the filesystem (implies checking of functional
storage-hardware).

### Implications on manageability

When a brick process detects that the underlaying storage is not
responding anymore, the process will exit. There is no automated way
that the brick process gets restarted, the sysadmin will need to fix the
problem with the storage first.

After correcting the storage (hardware or filesystem) issue, the
following command will start the brick process again:

    	# gluster volume start <VOLNAME> force

### Implications on presentation layer

None

### Implications on persistence layer

None

### Implications on 'GlusterFS' backend

None

### Modification to GlusterFS metadata

None

### Implications on 'glusterd'

'glusterd' can detect that the brick process has exited,
`gluster volume status` will show that the brick process is not running
anymore. System administrators checking the logs should be able to
triage the cause.

How To Test
-----------

The health-checker thread that is part of each brick process will get
started automatically when a volume has been started. Verifying its
functionality can be done in different ways.

On virtual hardware:

-   disconnect the disk from the VM that holds the brick

On real hardware:

-   simulate a RAID-card failure by unplugging the card or cables

On a system that uses LVM for the bricks:

-   use device-mapper to load an error-table for the disk, see [this
    description](http://review.gluster.org/5176).

On any system (writing to random offsets of the block device, more
difficult to trigger):

1.  cause corruption on the filesystem that holds the brick
2.  read contents from the brick, hoping to hit the corrupted area
3.  the filsystem should abort after hitting a bad spot, the
    health-checker should notice that shortly afterwards

User Experience
---------------

No more hanging brick processes when storage-hardware or the filesystem
fails.

Dependencies
------------

Posix translator, not available for the BD-xlator.

Documentation
-------------

The health-checker is enabled by default and runs a check every 30
seconds. This interval can be changed per volume with:

    	# gluster volume set <VOLNAME> storage.health-check-interval <SECONDS>

If `SECONDS` is set to 0, the health-checker will be disabled.

For further details refer:
<https://forge.gluster.org/glusterfs-core/glusterfs/blobs/release-3.5/doc/features/brick-failure-detection.md>

Status
------

glusterfs-3.4 and newer include a health-checker for the posix xlator,
which was introduced with [bug
971774](https://bugzilla.redhat.com/971774):

-   [posix: add a simple
    health-checker](http://review.gluster.org/5176)?

Comments and Discussion
-----------------------
