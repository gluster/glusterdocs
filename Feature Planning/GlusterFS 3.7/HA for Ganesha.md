Feature
-------

HA support for NFS-ganesha.

Summary
-------

Automated resource monitoring and fail-over of the ganesha.nfsd in a
cluster of GlusterFS and NFS-Ganesha servers.

Owners
------

Kaleb Keithley

Current status
--------------

Implementation is in progress.

Related Feature Requests and Bugs
---------------------------------

-   [Gluster CLI for
    Ganesha](Features/Gluster_CLI_for_ganesha "wikilink")
-   [Upcall Infrastructure](Features/Upcall-infrastructure "wikilink")

Detailed Description
--------------------

The implementation uses the Corosync and Pacemaker HA solution. The
implementation consists of three parts:
1.  a script for setup and
teardown of the clustering.
2.  three new Pacemaker resource agent files,
and
3.  use of the existing IPaddr and Dummy Pacemaker resource agents
for handling a floating Virtual IP address (VIP) and putting the
ganesha.nfsd into Grace.

The three new resource agents are tentatively named ganesha\_grace,
ganesha\_mon, and ganesha\_nfsd.

The ganesha\_nfsd resource agent is cloned on all nodes in the cluster.
Each ganesha\_nfsd resource agent is responsible for mounting and
unmounting a shared volume used for persistent storage of the state of
all the ganesha.nfsds in the cluster and starting the ganesha.nfsd
process on each node.

The ganesha\_mon resource agent is cloned on all nodes in the cluster.
Each ganesha\_mon resource agent monitors the state of its ganesha.nfsd.
If the daemon terminates for any reason it initiates the move of its VIP
to another node in the cluster. A Dummy resource agent is created which
represents the dead ganesha.nfsd. The ganesha\_grace resource agents use
this resource to send the correct hostname in the dbus event they send.

The ganesha\_grace resource agent is cloned on all nodes in the cluster.
Each ganesha\_grace resource agent monitors the states of all
ganesha.nfsds in the clustger. If any ganesha.nfsd has died, it sends a
DBUS event to its own ganesha.nfsd to put it into Grace.

IPaddr and Dummy resource agents are created on each node in the
cluster. Each IPaddr resource agent has a unique name derived from the
node name (e.g. mynodename-cluster\_ip-1) and manages an associated
virtual IP address. There is one virtual IP address for each node.
Initially each IPaddr and its virtual IP address is tied to its
respective node, and moves to another node when its ganesha.nfsd dies
for any reason. Each Dummy resource agent has a unique name derived from
the node name (e.g. mynodename-trigger\_ip-1) is used to ensure the
proper order of operations, i.e. move the virtual IP, then send the dbus
signal.

N.B. Originally fail-back was outside the scope for the Everglades
release. After a redesign we got fail-back for free. If the ganesha.nfsd
is restarted on a node its virtual IP will automatically fail back.

Benefit to GlusterFS
--------------------

GlusterFS is expected to be a common storage medium for NFS-Ganesha
NFSv4 storage solutions. GlusterFS has its own built-in HA feature.
NFS-Ganesha will ultimately support pNFS, a cluster-aware version of
NFSv4, but does not have its own HA functionality. This will allow users
to deploy HA NFS-Ganesha.

Scope
-----

TBD

### Nature of proposed change

TBD

### Implications on manageability

Simplifies setup of HA by providing a supported solution with a recipe
for basic configuration plus an automated setup.

### Implications on presentation layer

None

### Implications on persistence layer

A small shared volume is required. The NFSganesha resource agent mounts
and unmounts the volume when it starts and stops.

This volume is used by the ganesha.nfsd to persist things like its lock
state and is used by another ganesha.nfsd after a fail-over.

### Implications on 'GlusterFS' backend

A small shared volume is required. The NFSganesha resource agent mounts
and unmounts the volume when it starts and stops.

This volume must be created before HA setup is attempted.

### Modification to GlusterFS metadata

None

### Implications on 'glusterd'

None

How To Test
-----------

TBD

User Experience
---------------

The user experiences is intended to be as seamless and invisible as
possible. There are a few new CLI commands added that will invoke the
setup script. The Corosync/Pacemaker setup takes about 15-30 seconds on
a four node cluster, so there is a short delay between invoking the CLI
and the cluster being ready.

Dependencies
------------

GlusterFS CLI and Upcall Infrastructure (see related features).

Documentation
-------------

<Status of development - Design Ready, In development, Complete> In
development

Comments and Discussion
-----------------------

The feature page is not complete as yet. This will be updated regularly.
