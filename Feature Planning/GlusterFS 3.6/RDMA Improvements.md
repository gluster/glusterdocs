Feature
-------

**RDMA Improvements**

Summary
-------

This proposal is regarding getting RDMA volumes out of tech preview.

Owners
------

Raghavendra Gowdappa <rgowdapp@redhat.com>  
Vijay Bellur <vbellur@redhat.com>

Current status
--------------

Work in progress

Detailed Description
--------------------

Fix known & unknown issues in volumes with transport type rdma so that
RDMA can be used as the interconnect between client - servers & between
servers.

-   Performance Issues - Had found that performance was bad when
    compared with plain ib-verbs send/recv v/s RDMA reads and writes.
-   Co-existence with tcp - There seemed to be some memory corruptions
    when we had both tcp and rdma transports.
-   librdmacm for connection management - with this there is a
    requirement that the brick has to listen on an IPoIB address and
    this affects our current ability where a peer has the flexibility to
    connect to either ethernet or infiniband address. Another related
    feature Better peer identification will help us to resolve this
    issue.
-   More testing required

Benefit to GlusterFS
--------------------

Scope
-----

### Nature of proposed change

Bug-fixes to transport/rdma

### Implications on manageability

Remove the warning about creation of rdma volumes in CLI.

### Implications on presentation layer

TBD

### Implications on persistence layer

No impact

### Implications on 'GlusterFS' backend

No impact

### Modification to GlusterFS metadata

No impact

### Implications on 'glusterd'

No impact

How To Test
-----------

TBD

User Experience
---------------

TBD

Dependencies
------------

Better Peer identification

Documentation
-------------

TBD

Status
------

In development

Comments and Discussion
-----------------------
