Feature
-------

Enable user-serviceable snapshots for GlusterFS Volumes based on
GlusterFS-Snapshot feature

Owners
------

Anand Avati  
Anand Subramanian <anands@redhat.com>  
Raghavendra Bhat  
Varun Shastry

Summary
-------

Each snapshot capable GlusterFS Volume will contain a .snaps directory
through which a user will be able to access previously point-in-time
snapshot copies of his data. This will be enabled through a hidden
.snaps folder in each directory or sub-directory within the volume.
These user-serviceable snapshot copies will be read-only.

Tests
-----

​1) Enable uss (gluster volume set <volume name> features.uss enable) A
snap daemon should get started for the volume. It should be visible in
gluster volume status command. 2) entering the snapshot world ls on
.snaps from any directory within the filesystem should be successful and
should show the list of snapshots as directories. 3) accessing the
snapshots One of the snapshots can be entered and it should show the
contents of the directory from which .snaps was entered, when the
snapshot was taken. NOTE: If the directory was not present when a
snapshot was taken (say snap1) and created later, then entering snap1
directory (or any access) will fail with stale file handle. 4) Reading
from snapshots Any kind of read operations from the snapshots should be
successful. But any modifications to snapshot data is not allowed.
Snapshots are read-only