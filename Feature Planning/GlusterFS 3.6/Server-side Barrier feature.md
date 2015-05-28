Server-side barrier feature
===========================

-   Author(s): Varun Shastry, Krishnan Parthasarathi
-   Date: Jan 28 2014
-   Bugzilla: <https://bugzilla.redhat.com/1060002>
-   Document ID: BZ1060002
-   Document Version: 1
-   Obsoletes: NA

Abstract
--------

Snapshot feature needs a mechanism in GlusterFS, where acknowledgements
to file operations (FOPs) are held back until the snapshot of all the
bricks of the volume are taken.

The barrier feature would stop holding back FOPs after a configurable
'barrier-timeout' seconds. This is to prevent an accidental lockdown of
the volume.

This mechanism should have the following properties:

-   Should keep 'barriering' transparent to the applications.
-   Should not acknowledge FOPs that fall into the barrier class. A FOP
    that when acknowledged to the application, could lead to the
    snapshot of the volume become inconsistent, is a barrier class FOP.

With the below example of 'unlink' how a FOP is classified as barrier
class is explained.

For the following sequence of events, assuming unlink FOP was not
barriered. Assume a replicate volume with two bricks, namely b1 and b2.

                         b1               b2
    time           ----------------------------------
     |        t1      snapshot
     |        t2      unlink /a        unlink /a
     \/       t3      mkdir /a         mkdir /a
              t4                       snapshot

The result of the sequence of events will store /a as a file in snapshot
b1 while /a is stored as directory in snapshot b2. This leads to split
brain problem of the AFR and in other way inconsistency of the volume.

Copyright
---------

Copyright (c) 2014 Red Hat, Inc. <http://www.redhat.com>

This feature is licensed under your choice of the GNU Lesser General
Public License, version 3 or any later version (LGPLv3 or later), or the
GNU General Public License, version 2 (GPLv2), in all cases as published
by the Free Software Foundation.

Introduction
------------

The volume snapshot feature snapshots a volume by snapshotting
individual bricks, that are available, using the lvm-snapshot
technology. As part of using lvm-snapshot, the design requires bricks to
be free from few set of modifications (fops in Barrier Class) to avoid
the inconsistency. This is where the server-side barriering of FOPs
comes into picture.

Terminology
-----------

-   barrier(ing) - To make barrier fops temporarily inactive or
    disabled.
-   available - A brick is said to be available when the corresponding
    glusterfsd process is running and serving file operations.
-   FOP - File Operation

High Level Design
-----------------

### Architecture/Design Overview

-   Server-side barriering, for Snapshot, must be enabled/disabled on
    the bricks of a volume in a synchronous manner. ie, any command
    using this would be blocked until barriering is enabled/disabled.
    The brick process would provide this mechanism via an RPC.
-   Barrier translator would be placed immediately above io-threads
    translator in the server/brick stack.
-   Barrier translator would queue FOPs when enabled. On disable, the
    translator dequeues all the FOPs, while serving new FOPs from
    application. By default, barriering is disabled.
-   The barrier feature would stop blocking the acknowledgements of FOPs
    after a configurable 'barrier-timeout' seconds. This is to prevent
    an accidental lockdown of the volume.
-   Operations those fall into barrier class are listed below. Any other
    fop not listed below does not fall into this category and hence are
    not barriered.
    -   rmdir
    -   unlink
    -   rename
    -   [f]truncate
    -   fsync
    -   write with O\_SYNC flag
    -   [f]removexattr

### Design Feature

Following timeline diagram depicts message exchanges between glusterd
and brick during enable and disable of barriering. This diagram assumes
that enable operation is synchronous and disable is asynchronous. See
below for alternatives.

            glusterd (snapshot)                       barrier @ brick
            ------------------                        ---------------
    t1           |                                            |
    t2           |                                continue to pass through
                 |                                     all the fops
    t3     send 'enable'                                      |
    t4           |                                * starts barriering the fops
                 |                                * send back the ack
    t5    receive the ack                                     |
                 |                                            |
    t6           |    &lt;take snap&gt;                             |
                 |         .                                  |
                 |         .                                  |
                 |         .                                  |
                 |    &lt;/take snap&gt;                            |
                 |                                            |
    t7     send disable                                       |
         (does not wait for the ack)                          |
    t8           |                               release all the holded fops
                 |                                 and no more barriering
                 |                                            |
    t9           |                               continue in PASS_THROUGH mode

Glusterd would send an RPC (described in API section), to enable
barriering on a brick, by setting option feature.barrier to 'ON' in
barrier translator. This would be performed on all the bricks present in
that node, belonging to the set of volumes that are being snapshotted.

Disable of barriering can happen in synchronous or asynchronous mode.
The choice is left to the consumer of this feature.

On disable, all FOPs queued up will be dequeued. Simultaneously the
subsequent barrier request(s) will be served.

Barrier option enable/disable is persisted into the volfile. This is to
make the feature available for consumers in asynchronous mode, like any
other (configurable) feature.

Barrier feature also has timeout option based on which dequeuing would
get triggered if the consumer fails to send the disable request.

Low-level details of Barrier translator working
-----------------------------------------------

The translator operates in one of two states, namely QUEUEING and
PASS\_THROUGH.

When barriering is enabled, the translator moves to QUEUEING state. It
queues outgoing FOPs thereafter in the call back path.

When barriering is disabled, the translator moves to PASS\_THROUGH state
and does not queue when it is in PASS\_THROUGH state. Additionally, the
queued FOPs are 'released', when the translator moves from QUEUEING to
PASS\_THROUGH state.

It has a translator global queue (doubly linked lists, see
libglusterfs/src/list.h) where the FOPs are queued in the form of a call
stub (see libglusterfs/src/call-stub.[ch])

When the FOP has succeeded, but barrier translator failed to queue in
the call back, the barrier translator would disable barriering and
release any queued FOPs, barrier would inform the consumer about this
failure on succesive disable request.

Interfaces
----------

### Application Programming Interface

-   An RPC procedure is added at the brick side, which allows any client
    [sic] to set the feature.barrier option of the barrier translator
    with a given value.
-   Glusterd would be using this to set server-side-barriering on, on a
    brick.

Performance Considerations
--------------------------

-   The barriering of FOPs may be perceived as a performance degrade by
    the applications. Since this is a hard requirement for snapshot, the
    onus is on the snapshot feature to reduce the window for which
    barriering is enabled.

### Scalability

-   In glusterd, each brick operation is executed in a serial manner.
    So, the latency of enabling barriering is a function of the no. of
    bricks present on the node of the set of volumes being snapshotted.
    This is not a scalability limitation of the mechanism of enabling
    barriering but a limitation in the brick operations mechanism in
    glusterd.

Migration Considerations
------------------------

The barrier translator is introduced with op-version 4. It is a
server-side translator and does not impact older clients even when this
feature is enabled.

Installation and deployment
---------------------------

-   Barrier xlator is not packaged with glusterfs-server rpm. With this
    changes, this has to be added to the rpm.
