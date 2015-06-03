Feature
-------

File Snapshots in GlusterFS

### Summary

Ability to take snapshots of files in GlusterFS

### Owners

Anand Avati

### Source code

Patch for this feature - <http://review.gluster.org/5367>

### Detailed Description

The feature adds file snapshotting support to GlusterFS. '' To use this
feature the file format should be QCOW2 (from QEMU)'' . The patch takes
the block layer code from Qemu and converts it into a translator in
gluster.

### Benefit to GlusterFS

Better integration with Openstack Cinder, and in general ability to take
snapshots of files (typically VM images)

### Usage

*To take snapshot of a file, the file format should be QCOW2. To set
file type as qcow2 check step \#2 below*

​1. Turning on snapshot feature :

		gluster volume set `<vol_name>` features.file-snapshot on

​2. To set qcow2 file format:

		setfattr -n trusted.glusterfs.block-format -v qcow2:10GB <file_name>

​3. To create a snapshot:

		setfattr -n trusted.glusterfs.block-snapshot-create -v <image_name> <file_name>

​4. To apply/revert back to a snapshot:

		setfattr -n trusted.glusterfs.block-snapshot-goto -v <image_name> <file_name>

### Scope

#### Nature of proposed change

The work is going to be a new translator. Very minimal changes to
existing code (minor change in syncops)

#### Implications on manageability

Will need ability to load/unload the translator in the stack.

#### Implications on presentation layer

Feature must be presentation layer independent.

#### Implications on persistence layer

No implications

#### Implications on 'GlusterFS' backend

Internal snapshots - No implications. External snapshots - there will be
hidden directories added.

#### Modification to GlusterFS metadata

New xattr will be added to identify files which are 'snapshot managed'
vs raw files.

#### Implications on 'glusterd'

Yet another turn on/off feature for glusterd. Volgen will have to add a
new translator in the generated graph.

### How To Test

Snapshots can be tested by taking snapshots along with checksum of the
state of the file, making further changes and going back to old snapshot
and verify the checksum again.

### Dependencies

Dependent QEMU code is imported into the codebase.

### Documentation

<http://review.gluster.org/#/c/7488/6/doc/features/file-snapshot.md>

### Status

Merged in master and available in Gluster3.5