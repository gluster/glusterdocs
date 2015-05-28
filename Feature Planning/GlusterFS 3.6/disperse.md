Feature
=======

Dispersed volume translator

Summary
=======

The disperse translator is a new type of volume for GlusterFS that can
be used to offer a configurable level of fault tolerance while
optimizing the disk space waste. It can be seen as a RAID5-like volume.

Owners
======

Xavier Hernandez <xhernandez@datalab.es>

Current status
==============

A working version is included in GlusterFS 3.6

Detailed Description
====================

The disperse translator is based on erasure codes to allow the recovery
of the data stored on one or more bricks in case of failure. The number
of bricks that can fail without losing data is configurable.

Each brick stores only a portion of each block of data. Some of these
portions are called parity or redundancy blocks. They are computed using
a mathematical transformation so that they can be used to recover the
content of the portion stored on another brick.

Each volume is composed of a set of N bricks (as many as you want), and
R of them are used to store the redundancy information. On this
configuration, if each brick has capacity C, the total space available
on the volume will be (N - R) \* C.

A versioning system is used to dectect inconsistencies and initiate a
self-heal if appropiate.

All these operations are made on the fly, transparently to the user.

Benefit to GlusterFS
====================

It can be used to create volumes with a configurable level of redundancy
(like replicate), but optimizing disk usage.

Scope
=====

Nature of proposed change
-------------------------

The dispersed volume is implemented by a client-side translator that
will be responsible of encoding/decoding the brick contents.

Implications on manageability
-----------------------------

The new type of volume will be configured as any other one. However the
healing operations are quite different and maybe will be necessary to
handle them separately.

Implications on presentation layer
----------------------------------

N/A

Implications on persistence layer
---------------------------------

N/A

Implications on 'GlusterFS' backend
-----------------------------------

N/A

Modification to GlusterFS metadata
----------------------------------

Three new extended attributes are created to manage a dispersed file:

-   trusted.ec.config: Contains information about the parameters used to
    encode the file.
-   trusted.ec.version: Tracks the number of changes made to the file.
-   trusted.ec.size: Tracks the real size of the file.

Implications on 'glusterd'
--------------------------

glusterd and cli have been modified to add the needed functionality to
create and manage dispersed volumes.

How To Test
===========

There is a new glusterd syntax to create dispersed volumes:

		gluster volume create <volname> [disperse [count]] [redundancy <count>]] <bricks>

Both 'disperse' and 'redundancy' are optional, but at least one of them
must be present to create a dispersed volume. The <count> of 'disperse'
is also optional: if not specified, the number of bricks specified in
the command line is taken as the <count> value. To create a
distributed-disperse volume, it's necessary to specify 'disperse' with a
<count> value smaller than the total number of bricks.

When 'redundancy' is not specified, it's default value is computed so
that it generates an optimal configuration. A configuration is optimal
if *number of bricks - redundancy* is a power of 2. If such a value
exists and it's greater than one, a warning is shown to validate the
number. If it doesn't exist, 1 is taken and another warning is shown.

Once created, the disperse volume can be started, mounted and used as
any other volume.

User Experience
===============

Almost the same. Only a new volume type added.

Dependencies
============

None

Documentation
=============

Not available yet.

Status
======

First implementation ready.

Comments and Discussion
=======================
