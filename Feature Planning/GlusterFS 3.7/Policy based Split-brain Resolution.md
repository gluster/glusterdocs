Feature
-------

This feature provides a way of resolving split-brains based on policies
from the gluster CLI.

Summary
-------

This feature provides a way of resolving split-brains based on policies.
Goal is to give different commands to resolve split-brains using
policies like 'choose a specific brick as source' and choose the biggest
files as source etc.

Owners
------

Ravishankar N  
Pranith Kumar Karampuri

Current status
--------------

Feature completed.

Detailed Description
--------------------

Till now, if there is a split-brain manual intervention is required to
resolve split-brain. But most of the times it so happens that files from
particular brick are chosen as source or the files with bigger file size
is chosen as source. This feature provides CLI that can be used to
resolve the split-brains in the system at that moment using these
policies.

Benefit to GlusterFS
--------------------

It improves manageability of resolving split-brains

Scope
-----

### Nature of proposed change

####Added new gluster CLIs:

1.```gluster volume heal <VOLNAME> split-brain bigger-file <FILE>.```

Locates the replica containing the FILE, selects bigger-file as source
and completes heal.

2.```gluster volume heal <VOLNAME> split-brain source-brick <HOSTNAME:BRICKNAME> <FILE>.```

Selects ```<FILE>``` present in ```<HOSTNAME:BRICKNAME>``` as source and completes
heal.

3.```gluster volume heal <VOLNAME> split-brain <HOSTNAME:BRICKNAME>.```

Selects **all** split-brained files in ```<HOSTNAME:BRICKNAME>``` as source
and completes heal.

Note: ```<FILE>``` can be either the full file name as seen from the root of
the volume (or) the gfid-string representation of the file, which
sometimes gets displayed in the heal info command's output.

### Implications on manageability

New CLIs are added to improve manageability of files in split-brain

### Implications on presentation layer

None

### Implications on persistence layer

None

### Implications on 'GlusterFS' backend

None

### Modification to GlusterFS metadata

None

### Implications on 'glusterd'

None

How To Test
-----------

Create files in data and metadata split-brain. Accessing the files from
clients gives EIO. Use the CLI commands to pick the source file and
trigger heal After the CLI returns success, the files should be
identical on the replica bricks and must be accessible again by the
clients

User Experience
---------------

New CLIs are introduced.

Dependencies
------------

None

Documentation
-------------

TODO: Add an md file in glusterfs/doc.

Status
------

Feature completed. Main and dependency patches:

<http://review.gluster.org/9377>  
<http://review.gluster.org/9375>  
<http://review.gluster.org/9376>  
<http://review.gluster.org/9439>  

Comments and Discussion
-----------------------

---
