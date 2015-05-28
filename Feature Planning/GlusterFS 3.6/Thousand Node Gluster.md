Goal
----

Thousand-node scalability for glusterd

Summary
=======

This "feature" is really a set of infrastructure changes that will
enable glusterd to manage a thousand servers gracefully.

Owners
======

Krishnan Parthasarathi <kparthas@redhat.com>  
Jeff Darcy <jdarcy@redhat.com>

Current status
==============

Proposed, awaiting summit for approval.

Related Feature Requests and Bugs
=================================

N/A

Detailed Description
====================

There are three major areas of change included in this proposal.

-   Replace the current order-n-squared heartbeat/membership protocol
    with a much smaller "monitor cluster" based on Paxos or
    [Raft](https://ramcloud.stanford.edu/wiki/download/attachments/11370504/raft.pdf),
    to which I/O servers check in.

-   Use the monitor cluster to designate specific functions or roles -
    e.g. self-heal, rebalance, leadership in an NSR subvolume - to I/O
    servers in a coordinated and globally optimal fashion.

-   Replace the current system of replicating configuration data on all
    servers (providing practically no guarantee of consistency if one is
    absent during a configuration change) with storage of configuration
    data in the monitor cluster.

Benefit to GlusterFS
====================

Scaling of our management plane to 1000+ nodes, enabling competition
with other projects such as HDFS or Ceph which already have or claim
such scalability.

Scope
=====

Nature of proposed change
-------------------------

Functionality very similar to what we need in the monitor cluster
already exists in some of the Raft implementations, notably
[etcd](https://github.com/coreos/etcd). Such a component could provide
the services described above to a modified glusterd running on each
server. The changes to glusterd would mostly consist of removing the
current heartbeat and config-storage code, replacing it with calls into
(and callbacks from) the monitor cluster.

Implications on manageability
-----------------------------

Enabling/starting monitor daemons on those few nodes that have them must
be done separately from starting glusterd. Since the changes mostly are
to how each glusterd interacts with others and with its own local
storage back end, interactions with the CLI or with glusterfsd need not
change.

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

The monitor daemons need space for their data, much like that currently
maintained in /var/lib/glusterd currently.

Implications on 'glusterd'
--------------------------

Drastic. See sections above.

How To Test
===========

A new set of tests for the monitor-cluster functionality will need to be
developed, perhaps derived from those for the external project if we
adopt one. Most tests related to our multi-node testing facilities
(cluster.rc) will also need to change. Tests which merely invoke the CLI
should require little if any change.

User Experience
===============

Minimal change.

Dependencies
============

A mature/stable enough implementation of Raft or a similar protocol.
Failing that, we'd need to develop our own service along similar lines.

Documentation
=============

TBD.

Status
======

In design.

The choice of technology and approaches are being discussed on the
-devel ML.

-   "Proposal for Glusterd-2.0" -
    [1](http://www.gluster.org/pipermail/gluster-users/2014-September/018639.html)

:   Though the discussion has become passive, the question is whether we
    choose to implement consensus algorithm inside our project or depend
    on external projects that provide similar service.

-   "Management volume proposal" -
    [2](http://www.gluster.org/pipermail/gluster-devel/2014-November/042944.html)

:   This has limitations due to the circular dependency making it
    infeasible.

Comments and Discussion
=======================
