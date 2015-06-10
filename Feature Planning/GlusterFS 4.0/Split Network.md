Goal
----

Better support for multiple networks, especially front-end vs. back-end.

Summary
-------

GlusterFS generally expects that all clients and servers use a common
set of network names and/or addresses. For many users, having a separate
network exclusively for servers is highly desirable for both performance
reasons (segregating administrative traffic and/or second-hop NFS
traffic from ongoing user I/O) and security reasons (limiting
administrative access to the private network). While such configurations
can already be created with routing/iptables trickery, full and explicit
support would be a great improvement.

Owners
------

Jeff Darcy <jdarcy@redhat.com>

Current status
--------------

Proposed, awaiting summit for approval.

Related Feature Requests and Bugs
---------------------------------

One proposal for the high-level syntax and semantics was made [on the
mailing
list](http://www.gluster.org/pipermail/gluster-users/2014-November/019463.html).

Detailed Description
--------------------

At the very least, we need to be able to define and keep track of
multiple names/addresses for the same node, one used on the back-end
network e.g. for "peer probe" and and NFS and the other used on the
front-end network by native-protocol clients. The association can be
done via the node UUID, but we still need a way for the user to specify
which name/address is to be used for which purpose.

Future enhancements could include multiple front-end (client) networks,
and network-specific access control.

Benefit to GlusterFS
--------------------

More flexible network network topologies, potentially enhancing
performance and/or security for some deployments.

Scope
-----

### Nature of proposed change

The information in /var/lib/glusterd/peers/\* must be enhanced to
include multiple names/addresses per peer, plus tags for roles
associated with each address/name.

The volfile-generation code must be enhanced to generate volfiles for
each purpose - server, native client, NFS proxy, self-heal/rebalance -
using the names/addresses appropriate to that purpose.

### Implications on manageability

CLI and GUI support must be added for viewing/changing the addresses
associated with each server and the roles associated with each address.

### Implications on presentation layer

None. The changes should be transparent to users.

### Implications on persistence layer

None.

### Implications on 'GlusterFS' backend

None.

### Modification to GlusterFS metadata

See [nature of proposed change](#Nature_of_proposed_change "wikilink").

### Implications on 'glusterd'

See [nature of proposed change](#Nature_of_proposed_change "wikilink").

How To Test
-----------

Set up a physical configuration with separate front-end and back-end
networks.

Use the new CLI/GUI features to define addresses and roles split across
the two networks.

Mount a volume using each of the several volfiles that result, and
generate some traffic.

Verify that the traffic is actually on the network appropriate to that
mount type.

User Experience
---------------

By default, nothing changes. If and only if a user wants to set up a
more "advanced" split-network configuration, they'll have new tools
allowing them to do that without having to "step outside" to mess with
routing tables etc.

Dependencies
------------

None.

Documentation
-------------

New documentation will be needed at both the conceptual and detail
levels, describing how (and why?) to set up a split-network
configuration.

Status
------

In design.

Comments and Discussion
-----------------------

Some use-cases in [Bug 764850](https://bugzilla.redhat.com/764850).
Feedback requested. Please jump in.

[Discussion on gluster-devel](https://mail.corp.redhat.com/zimbra/#16)
