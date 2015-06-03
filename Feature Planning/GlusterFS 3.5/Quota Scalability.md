Feature
-------

Quota Scalability

Summary
-------

Support upto 65536 quota configurations per volume.

Owners
------

Krishnan Parthasarathi  
Vijay Bellur

Current status
--------------

Current implementation of Directory Quota cannot scale beyond a few
hundred configured limits per volume. The aim of this feature is to
support upto 65536 quota configurations per volume.

Detailed Description
--------------------

TBD

Benefit to GlusterFS
--------------------

More quotas can be configured in a single volume thereby leading to
support GlusterFS for use cases like home directory.

Scope
-----

### Nature of proposed change

-   Move quota enforcement translator to the server
-   Introduce a new quota daemon which helps in aggregating directory
    consumption on the server
-   Enhance marker's accounting to be modular
-   Revamp configuration persistence and CLI listing for better scale
-   Allow configuration of soft limits in addition to hard limits.

### Implications on manageability

Mostly the CLI will be backward compatible. New CLI to be introduced
needs to be enumerated here.

### Implications on presentation layer

None

### Implications on persistence layer

None

### Implications on 'GlusterFS' backend

None

### Modification to GlusterFS metadata

- Addition of a new extended attribute for storing configured hard and
soft limits on directories.

### Implications on 'glusterd'

- New file based configuration persistence

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

In development

Comments and Discussion
-----------------------
