Feature
-------

Trash translator for GlusterFS

Summary
-------

This feature will enable user to temporarily store deleted files from
GlusterFS for a specified time period.

Owners
------

Anoop C S <achiraya@redhat.com>

Jiffin Tony Thottan <jthottan@redhat.com>

Current status
--------------

In the present scenario deletion by a user results in permanent removal
of a file from the storage pool. An incompatible translator code for
trash is currently available as part of codebase. On the other side
gluster cli lacks a volume set option to load the trash translator in
volume graph.

Detailed Description
--------------------

Trash is a desired feature for users who accidentally delete some files
and may need to get back those in near future. Currently, GlusterFS
codebase includes a translator for trash which is not compatible with
the current version and so is not usable by users. Trash feature is
planned to be implemented as a separate directory in every single brick
inside a volume. This would be achieved by a volume set option from
gluster cli.

A file can only be deleted when all hard links to it has been completely
removed. This feature can be extended to operations like truncation
where we need to retain the original file.

Benefit to GlusterFS
--------------------

With the implementation of trash, accidental deletion of files can be
easily avoided.

Scope
-----

### Nature of proposed change

Proposed implementation mostly involves modifications to existing code
for trash translator.

### Implications on manageability

Gluster cli will provide an option for creating trash directories on
various bricks.

### Implications on presentation layer

None

### Implications on persistence layer

None

### Implications on 'GlusterFS' backend

The overall brick structure will include a separate section for trash in
which regular files will not be stored, i.e. space occupied by the trash
become unusable.

### Modification to GlusterFS metadata

The original path of files can be stored as an extended attribute.

### Implications on 'glusterd'

An alert can be triggered when trash exceeds a particular size limit.
Purging of a file from trash depends on its size and age attributes or
other policies.

### Implications on Rebalancing

Trash can act as an intermediate storage when a file is moved from one
brick to another during rebalancing of volumes.

### Implications on Self-healing

Self-healing must avoid the chance of re-creating a file which was
deleted from a brick while one among the other bricks were offline.
Trash can be used to track the deleted file inside a brick.

### Scope of Recovery

This feature can enhance the restoring of files to previous locations
through gluster cli with the help of extended attributes residing along
with the file.

How To Test
-----------

Functionality of this trash translator can be checked by the file
operations deletion and truncation or using gluster internal operations
like self heal and rebalance.

Steps :

1.)Create a glusterfs volume.

2.)Start the volume

3.)Mount the the volume

4.) Check whether ".trashcan" directory is created on mount or not.By
default the trash directory will be created when volume is started but
files are not moved to trash directory when deletion or truncation is
performed until trash translator is on.

5.) The name for trash directory is user configurable option and its
default value is ".trashcan".It can be configured only when volume is
started.We cannot remove and rename the trash directory from the
mount(like .glusterfs directory)

6.) Set features.trash on

7.) Create some files in the mount and perform deletion or truncation on
those files.Check whether these files are recreated under trash
directory appending time stamp on the file name. For example,

		       [root@rh-host ~]#mount -t glusterfs rh-host:/test /mnt/test
		       [root@rh-host ~]#mkdir /mnt/test/abc
		       [root@rh-host ~]#touch /mnt/test/abc/file
		       [root@rh-host ~]#rm /mnt/test/abc/filer
		       remove regular empty file ‘/mnt/test/abc/file’? y
		       [root@rh-host ~]#ls /mnt/test/abc
		       [root@rh-host ~]# 
		       [root@rh-host ~]#ls /mnt/test/.trashcan/abc/
		       file2014-08-21_123400

8.) Check whether files deleted from trash directory are permanently
removed

9.) Perform internal operations such as rebalance and self heal on the
volume.Check whether files are created under trash directory as result
of internal-ops[we can also make trash translator exclusively for
internal operations by setting the option features.trash-internal-op on]

10.) Reconfigure the trash directory name and check whether file are
retained in the new one.

11.) Check whether other options for trash translator such as eliminate
pattern and maxium file size is working or not.

User Experience
---------------

Users can access files which were deleted accidentally or intentionally
and can review the original file which was truncated.

Dependencies
------------

None

Documentation
-------------

None

Status
------

Under review

Comments and Discussion
-----------------------

Follow here
