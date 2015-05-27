Feature
-------

Object Count

Summary
-------

An efficient mechanism to retrieve the number of objects per directory
or volume.

Owners
------

Vijaikumar M <vmallika@redhat.com>  
Sachin Pandit <spandit@redhat.com>

Current status
--------------

Currently, the only way to retrieve the number of files/objects in a
directory or volume is to do a crawl of the entire directory/volume.
This is expensive and is not scalable.

The proposed mechanism will provide an easier alternative to determine
the count of files/objects in a directory or volume.

Detailed Description
--------------------

The new mechanism proposes to store count of objects/files as part of an
extended attribute of a directory. Each directory's extended attribute
value will indicate the number of files/objects present in a tree with
the directory being considered as the root of the tree.

The count value can be accessed by performing a getxattr(). Cluster
translators like afr, dht and stripe will perform aggregation of count
values from various bricks when getxattr() happens on the key associated
with file/object count.

Benefit to GlusterFS
--------------------

-   Easy to query number of objects present in a volume.
-   Can serve as an accounting mechanism for quota enforcement based on
    number of inodes.
-   This interface will be useful for integration with OpenStack Swift
    and Ceilometer.

Scope
-----

### Nature of proposed change

-   Marker translator to be modified to perform accounting on all
    create/delete operations.

-   A new volume option to enable/disable this feature.

### Implications on manageability

-   A new volume option to enable/disable this feature.
-   A new CLI interface to display this count at either a volume or
    directory level.

### Implications on presentation layer

None

### Implications on persistence layer

None

### Implications on 'GlusterFS' backend

None

### Modification to GlusterFS metadata

A new extended attribute for storing count of objects at each directory
level.

### Implications on 'glusterd'

TBD

How To Test
-----------

TBD

User Experience
---------------

TBD

Dependencies
------------

None

Documentation
-------------

TBD

Status
------

Design Ready

Comments and Discussion
-----------------------
