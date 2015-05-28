Feature
-------

Snapshot of Gluster Volume

Summary
-------

Gluster volume snapshot will provide point-in-time copy of a GlusterFS
volume. This snapshot is an online-snapshot therefore file-system and
its associated data continue to be available for the clients, while the
snapshot is being taken.

Snapshot of a GlusterFS volume will create another read-only volume
which will be a point-in-time copy of the original volume. Users can use
this read-only volume to recover any file(s) they want. Snapshot will
also provide restore feature which will help the user to recover an
entire volume. The restore operation will replace the original volume
with the snapshot volume.

Owner(s)
--------

Rajesh Joseph <rjoseph@redhat.com>

Copyright
---------

Copyright (c) 2013-2014 Red Hat, Inc. <http://www.redhat.com>

This feature is licensed under your choice of the GNU Lesser General
Public License, version 3 or any later version (LGPLv3 or later), or the
GNU General Public License, version 2 (GPLv2), in all cases as published
by the Free Software Foundation.

Current status
--------------

Gluster volume snapshot support is provided in GlusterFS 3.6

Detailed Description
--------------------

GlusterFS snapshot feature will provide a crash consistent point-in-time
copy of Gluster volume(s). This snapshot is an online-snapshot therefore
file-system and its associated data continue to be available for the
clients, while the snapshot is being taken. As of now we are not
planning to provide application level crash consistency. That means if a
snapshot is restored then applications need to rely on journals or other
technique to recover or cleanup some of the operations performed on
GlusterFS volume.

A GlusterFS volume is made up of multiple bricks spread across multiple
nodes. Each brick translates to a directory path on a given file-system.
The current snapshot design is based on thinly provisioned LVM2 snapshot
feature. Therefore as a prerequisite the Gluster bricks should be on
thinly provisioned LVM. For a single lvm, taking a snapshot would be
straight forward for the admin, but this is compounded in a GlusterFS
volume which has bricks spread across multiple LVM’s across multiple
nodes. Gluster volume snapshot feature aims to provide a set of
interfaces from which the admin can snap and manage the snapshots for
Gluster volumes.

Gluster volume snapshot is nothing but snapshots of all the bricks in
the volume. So ideally all the bricks should be snapped at the same
time. But with real-life latencies (processor and network) this may not
hold true all the time. Therefore we need to make sure that during
snapshot the file-system is in consistent state. Therefore we barrier
few operation so that the file-system remains in a healthy state during
snapshot.

For details about barrier [Server Side
Barrier](http://www.gluster.org/community/documentation/index.php/Features/Server-side_Barrier_feature)

Benefit to GlusterFS
--------------------

Snapshot of glusterfs volume allows users to

-   A point in time checkpoint from which to recover/failback
-   Allow read-only snaps to be the source of backups.

Scope
-----

### Nature of proposed change

Gluster cli will be modified to provide new commands for snapshot
management. The entire snapshot core implementation will be done in
glusterd.

Apart from this Snapshot will also make use of quiescing xlator for
doing quiescing. This will be a server side translator which will
quiesce will fops which can modify disk state. The quescing will be done
till the snapshot operation is complete.

### Implications on manageability

Snapshot will provide new set of cli commands to manage snapshots. REST
APIs are not planned for this release.

### Implications on persistence layer

Snapshot will create new volume per snapshot. These volumes are stored
in /var/lib/glusterd/snaps folder. Apart from this each volume will have
additional snapshot related information stored in snap\_list.info file
in its respective vol folder.

### Implications on 'glusterd'

Snapshot information and snapshot volume details are stored in
persistent stores.

How To Test
-----------

For testing this feature one needs to have mulitple thinly provisioned
volumes or else need to create LVM using loop back devices.

Details of how to create thin volume can be found at the following link
<https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Logical_Volume_Manager_Administration/thinly_provisioned_volume_creation.html>

Each brick needs to be in a independent LVM. And these LVMs should be
thinly provisioned. From these bricks create Gluster volume. This volume
can then be used for snapshot testing.

See the User Experience section for various commands of snapshot.

User Experience
---------------

##### Snapshot creation

        snapshot create <snapname> <volname(s)> [description <description>] [force]

This command will create a sapshot of the volume identified by volname.
snapname is a mandatory field and the name should be unique in the
entire cluster. Users can also provide an optional description to be
saved along with the snap (max 1024 characters). force keyword is used
if some bricks of orginal volume is down and still you want to take the
snapshot.

##### Listing of available snaps

        gluster snapshot list [snap-name] [vol <volname>]

This command is used to list all snapshots taken, or for a specified
volume. If snap-name is provided then it will list the details of that
snap.

##### Configuring the snapshot behavior

        gluster snapshot config [vol-name]

This command will display existing config values for a volume. If volume
name is not provided then config values of all the volume is displayed.

        gluster snapshot config [vol-name] [<snap-max-limit> <count>] [<snap-max-soft-limit> <percentage>] [force]

The above command can be used to change the existing config values. If
vol-name is provided then config value of that volume is changed, else
it will set/change the system limit.

The system limit is the default value of the config for all the volume.
Volume specific limit cannot cross the system limit. If a volume
specific limit is not provided then system limit will be considered.

If any of this limit is decreased and the current snap count of the
system/volume is more than the limit then the command will fail. If user
still want to decrease the limit then force option should be used.

**snap-max-limit**: Maximum snapshot limit for a volume. Snapshots
creation will fail if snap count reach this limit.

**snap-max-soft-limit**: Maximum snapshot limit for a volume. Snapshots
can still be created if snap count reaches this limit. An auto-deletion
will be triggered if this limit is reached. The oldest snaps will be
deleted if snap count reaches this limit. This is represented as
percentage value.

##### Status of snapshots

        gluster snapshot status ([snap-name] | [volume <vol-name>])

Shows the status of all the snapshots or the specified snapshot. The
status will include the brick details, LVM details, process details,
etc.

##### Activating a snap volume

By default the snapshot created will be in an inactive state. Use the
following commands to activate snapshot.

        gluster snapshot activate <snap-name>

##### Deactivating a snap volume

        gluster snapshot deactivate <snap-name>

The above command will deactivate an active snapshot

##### Deleting snaps

        gluster snapshot delete <snap-name>

This command will delete the specified snapshot.

##### Restoring snaps

        gluster snapshot restore <snap-name>

This command restores an already taken snapshot of single or multiple
volumes. Snapshot restore is an offline activity therefore if any volume
which is part of the given snap is online then the restore operation
will fail.

Once the snapshot is restored it will be deleted from the list of
snapshot.

Dependencies
------------

To provide support for a crash-consistent snapshot feature Gluster core
com- ponents itself should be crash-consistent. As of now Gluster as a
whole is not crash-consistent. In this section we will identify those
Gluster components which are not crash-consistent.

**Geo-Replication**: Geo-replication provides master-slave
synchronization option to Gluster. Geo-replication maintains state
information for completing the sync operation. Therefore ideally when a
snapshot is taken then both the master and slave snapshot should be
taken. And both master and slave snapshot should be in mutually
consistent state.

Geo-replication make use of change-log to do the sync. By default the
change-log is stored .glusterfs folder in every brick. But the
change-log path is configurable. If change-log is part of the brick then
snapshot will contain the change-log changes as well. But if it is not
then it needs to be saved separately during a snapshot.

Following things should be considered for making change-log
crash-consistent:

-   Change-log is part of the brick of the same volume.
-   Change-log is outside the brick. As of now there is no size limit on
    the

change-log files. We need to answer following questions here

-   -   Time taken to make a copy of the entire change-log. Will affect
        the

overall time of snapshot operation.

-   -   The location where it can be copied. Will impact the disk usage
        of

the target disk or file-system.

-   Some part of change-log is present in the brick and some are outside

the brick. This situation will arrive when change-log path is changed
in-between.

-   Change-log is saved in another volume and this volume forms a CG
    with

the volume about to be snapped.

**Note**: Considering the above points we have decided not to support
change-log stored outside the bricks.

For this release automatic snapshot of both master and slave session is
not supported. If required user need to explicitly take snapshot of both
master and slave. Following steps need to be followed while taking
snapshot of a master and slave setup

-   Stop geo-replication manually.
-   Snapshot all the slaves first.
-   When the slave snapshot is done then initiate master snapshot.
-   When both the snapshot is complete geo-syncronization can be started
    again.

**Gluster Quota**: Quota enables an admin to specify per directory
quota. Quota makes use of marker translator to enforce quota. As of now
the marker framework is not completely crash-consistent. As part of
snapshot feature we need to address following issues.

-   If a snapshot is taken while the contribution size of a file is
    being updated then you might end up with a snapshot where there is a
    mismatch between the actual size of the file and the contribution of
    the file. These in-consistencies can only be rectified when a
    look-up is issued on the snapshot volume for the same file. As a
    workaround admin needs to issue an explicit file-system crawl to
    rectify the problem.
-   For NFS, quota makes use of pgfid to build a path from gfid and
    enforce quota. As of now pgfid update is not crash-consistent.
-   Quota saves its configuration in file-system under /var/lib/glusterd
    folder. As part of snapshot feature we need to save this file.

**NFS**: NFS uses a single graph to represent all the volumes in the
system. And to make all the snapshot volume accessible these snapshot
volumes should be added to this graph. This brings in another
restriction, i.e. all the snapshot names should be unique and
additionally snap name should not clash with any other volume name as
well.

To handle this situation we have decided to use an internal uuid as snap
name. And keep a mapping of this uuid and user given snap name in an
internal structure.

Another restriction with NFS is that when a newly created volume
(snapshot volume) is started it will restart NFS server. Therefore we
decided when snapshot is taken it will be in stopped state. Later when
snapshot volume is needed it can be started explicitly.

**DHT**: DHT xlator decides which node to look for a file/directory.
Some of the DHT fop are not atomic in nature, e.g rename (both file and
directory). Also these operations are not transactional in nature. That
means if a crash happens the data in server might be in an inconsistent
state. Depending upon the time of snapshot and which DHT operation is in
what state there can be an inconsistent snapshot.

**AFR**: AFR is the high-availability module in Gluster. AFR keeps track
of fresh and correct copy of data using extended attributes. Therefore
it is important that before taking snapshot these extended attributes
are written into the disk. To make sure these attributes are written to
disk snapshot module will issue explicit sync after the
barrier/quiescing.

The other issue with the current AFR is that it writes the volume name
to the extended attribute of all the files. AFR uses this for
self-healing. When snapshot is taken of such a volume the snapshotted
volume will also have the same volume name. Therefore AFR needs to
create a mapping of the real volume name and the extended entry name in
the volfile. So that correct name can be referred during self-heal.

Another dependency on AFR is that currently there is no direct API or
call back function which will tell that AFR self-healing is completed on
a volume. This feature is required to heal a snapshot volume before
restore.

Documentation
-------------

Status
------

In development

Comments and Discussion
-----------------------

<Follow here>
