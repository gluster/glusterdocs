Feature
-------

zerofill API for GlusterFS

Summary
-------

zerofill() API would allow creation of pre-allocated and zeroed-out
files on GlusterFS volumes by offloading the zeroing part to server
and/or storage (storage offloads use SCSI WRITESAME).

Owners
------

Bharata B Rao  
M. Mohankumar

Current status
--------------

Patch on gerrit: <http://review.gluster.org/5327>

Detailed Description
--------------------

Add support for a new ZEROFILL fop. Zerofill writes zeroes to a file in
the specified range. This fop will be useful when a whole file needs to
be initialized with zero (could be useful for zero filled VM disk image
provisioning or during scrubbing of VM disk images).

Client/application can issue this FOP for zeroing out. Gluster server
will zero out required range of bytes ie server offloaded zeroing. In
the absence of this fop, client/application has to repetitively issue
write (zero) fop to the server, which is very inefficient method because
of the overheads involved in RPC calls and acknowledgements.

WRITESAME is a SCSI T10 command that takes a block of data as input and
writes the same data to other blocks and this write is handled
completely within the storage and hence is known as offload . Linux ,now
has support for SCSI WRITESAME command which is exposed to the user in
the form of BLKZEROOUT ioctl. BD Xlator can exploit BLKZEROOUT ioctl to
implement this fop. Thus zeroing out operations can be completely
offloaded to the storage device , making it highly efficient.

The fop takes two arguments offset and size. It zeroes out 'size' number
of bytes in an opened file starting from 'offset' position.

Benefit to GlusterFS
--------------------

Benefits GlusterFS in virtualization by providing the ability to quickly
create pre-allocated and zeroed-out VM disk image by using
server/storage off-loads.

### Scope

Nature of proposed change
-------------------------

An FOP supported in libgfapi and FUSE.

Implications on manageability
-----------------------------

None.

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

N/A

Implications on 'glusterd'
--------------------------

N/A

How To Test
-----------

Test server offload by measuring the time taken for creating a fully
allocated and zeroed file on Posix backend.

Test storage offload by measuring the time taken for creating a fully
allocated and zeroed file on BD backend.

User Experience
---------------

Fast provisioning of VM images when GlusterFS is used as a file system
backend for KVM virtualization.

Dependencies
------------

zerofill() support in BD backend depends on the new BD translator -
<http://review.gluster.org/#/c/4809/>

Documentation
-------------

This feature add support for a new ZEROFILL fop. Zerofill writes zeroes
to a file in the specified range. This fop will be useful when a whole
file needs to be initialized with zero (could be useful for zero filled
VM disk image provisioning or during scrubbing of VM disk images).

Client/application can issue this FOP for zeroing out. Gluster server
will zero out required range of bytes ie server offloaded zeroing. In
the absence of this fop, client/application has to repetitively issue
write (zero) fop to the server, which is very inefficient method because
of the overheads involved in RPC calls and acknowledgements.

WRITESAME is a SCSI T10 command that takes a block of data as input and
writes the same data to other blocks and this write is handled
completely within the storage and hence is known as offload . Linux ,now
has support for SCSI WRITESAME command which is exposed to the user in
the form of BLKZEROOUT ioctl. BD Xlator can exploit BLKZEROOUT ioctl to
implement this fop. Thus zeroing out operations can be completely
offloaded to the storage device , making it highly efficient.

The fop takes two arguments offset and size. It zeroes out 'size' number
of bytes in an opened file starting from 'offset' position.

This feature adds zerofill support to the following areas:

-  libglusterfs
-  io-stats
-  performance/md-cache,open-behind
-  quota
-  cluster/afr,dht,stripe
-  rpc/xdr
-  protocol/client,server
-  io-threads
-  marker
-  storage/posix
-  libgfapi

Client applications can exploit this fop by using glfs\_zerofill
introduced in libgfapi.FUSE support to this fop has not been added as
there is no system call for this fop.

Here is a performance comparison of server offloaded zeofill vs zeroing
out using repeated writes.

		[root@llmvm02 remote]# time ./offloaded aakash-test log 20

		real    3m34.155s
		user    0m0.018s
		sys 0m0.040s


		 [root@llmvm02 remote]# time ./manually aakash-test log 20

		real    4m23.043s
		user    0m2.197s
		sys 0m14.457s
		 [root@llmvm02 remote]# time ./offloaded aakash-test log 25;

		real    4m28.363s
		user    0m0.021s
		sys 0m0.025s
		[root@llmvm02 remote]# time ./manually aakash-test log 25

		real    5m34.278s
		user    0m2.957s
		sys 0m18.808s

The argument log is a file which we want to set for logging purpose and
the third argument is size in GB .

As we can see there is a performance improvement of around 20% with this
fop.

Status
------

Patch : <http://review.gluster.org/5327> Status : Merged