GlusterFS 3.7 Release Planning
------------------------------

Tentative Dates:

9th Mar, 2015 - Feature freeze & Branching

28th Apr, 2015 - 3.7.0 Beta Release

14th May, 2015 - 3.7.0 GA

Features in GlusterFS 3.7
-------------------------

*  [Features/Smallfile Performance](./Small File Performance.md):
Small-file performance enhancement - multi-threaded epoll implemented.

*  [Features/Data-classification](./Data Classification.md):
Tiering, rack-aware placement, and more. - Policy based tiering
implemented

*  [Features/Trash](./Trash.md): Trash translator for
GlusterFS

*  [Features/Object Count](./Object Count.md)

*  [Features/SELinux Integration](./SE Linux Integration.md)

*  [Features/Exports Netgroups Authentication](./Exports and Netgroups Authentication.md)

*  [Features/Policy based Split-brain resolution](./Policy based Split-brain Resolution.md): Policy Based
Split-brain resolution

*  [Features/BitRot](./BitRot.md)

*  [Features/Gnotify](./Gnotify.md)

*  [Features/Improve Rebalance Performance](./Improve Rebalance Performance.md)

*  [Features/Upcall-infrastructure](./Upcall Infrastructure.md):
Support for delegations/lease-locks, inode-invalidation, etc..

*  [Features/Gluster CLI for ganesha](./Gluster CLI for NFS Ganesha.md): Gluster CLI
support to manage nfs-ganesha exports

*  [Features/Scheduling of Snapshot](./Scheduling of Snapshot.md): Schedule creation
of gluster volume snapshots from command line, using cron.

*  [Features/sharding-xlator](./Sharding xlator.md)

*  [Features/HA for ganesha](./HA for Ganesha.md): HA
support for NFS-Ganesha

*  [Features/Clone of Snapshot](./Clone of Snapshot.md)

Other big changes
-----------------

*  **GlusterD Daemon code
refactoring**: GlusterD
manages a lot of other daemons (bricks, NFS server, SHD, rebalance
etc.), and there are several more on the way. This refactoring will
introduce a common framework to manage all these daemons, which will
make maintainance easier.

*  **RCU in GlusterD**: GlusterD has issues
with thread synchronization and data access. This has been discussed on
<http://www.gluster.org/pipermail/gluster-devel/2014-December/043382.html>
. We will be using the RCU method to solve these issues and will be
using [Userspace-RCU](http://urcu.so) to help with the implementation.

Features beyond GlusterFS 3.7
-----------------------------

*  [Features/Easy addition of custom translators](./Easy addition of Custom Translators.md)

*  [Features/outcast](./Outcast.md): Outcast

*  [Features/rest-api](./rest-api.md): REST API for
Gluster Volume and Peer Management

*  [Features/Archipelago Integration](./Archipelago Integration.md):
Improvements for integration with Archipelago

Release Criterion
-----------------

-   All new features to be documented in admin guide

-   Regression tests added