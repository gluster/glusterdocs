GlusterFS 3.6 Release Planning
------------------------------

Tentative Dates:

4th Mar, 2014 - Feature proposal freeze

17th Jul, 2014 - Feature freeze & Branching

12th Sep, 2014 - Community Test Weekend \#1

21st Sep, 2014 - 3.6.0 Beta Release

22nd Sep, 2014 - Community Test Week

31st Oct, 2014 - 3.6.0 GA

Feature proposal for GlusterFS 3.6
----------------------------------

### Features in 3.6.0

-   [Features/better-ssl](./better-ssl.md):
     Various improvements to SSL support.

-   [Features/heterogeneous-bricks](./heterogeneous-bricks.md):
     Support different-sized bricks.

-   [Features/disperse](./disperse.md):
     Volumes based on erasure codes.

-   [Features/glusterd-volume-locks](./glusterd volume locks.md):
     Volume wide locks for glusterd

-   [Features/persistent-AFR-changelog-xattributes](./Persistent AFR Changelog xattributes.md):
     Persistent naming scheme for client xlator names and AFR changelog
    attributes.

-   [Features/better-logging](./Better Logging.md):
     Gluster logging enhancements to support message IDs per message

-   [Features/Better peer identification](./Better Peer Identification.md)

-   [Features/Gluster Volume Snapshot](./Gluster Volume Snapshot.md)

-   [Features/Gluster User Serviceable Snapshots](./Gluster User Serviceable Snapshots.md)

-   **[Features/afrv2](./afrv2.md)**: Afr refactor.

-   [Features/RDMA Improvements](./RDMA Improvements.md):
     Improvements for RDMA

-   [Features/Server-side Barrier feature](./Server-side Barrier feature.md):
     A supplementary feature for the
    [Features/Gluster Volume Snapshot](./Gluster Volume Snapshot.md) which maintains the consistency across the snapshots.

### Features beyond 3.6.0

-   [Features/Smallfile Perf](../GlusterFS 3.7/Small File Performance.md):
     Small-file performance enhancement.

-   [Features/data-classification](../GlusterFS 3.7/Data Classification.md):
     Tiering, rack-aware placement, and more.

-   [Features/new-style-replication](./New Style Replication.md):
     Log-based, chain replication.

-   [Features/thousand-node-glusterd](./Thousand Node Gluster.md):
     Glusterd changes for higher scale.

-   [Features/Trash](../GlusterFS 3.7/Trash.md):
     Trash translator for GlusterFS

-   [Features/Object Count](../GlusterFS 3.7/Object Count.md)
-   [Features/SELinux Integration](../GlusterFS 3.7/SE Linux Integration.md)
-   [Features/Easy addition of custom translators](../GlusterFS 3.7/Easy addition of Custom Translators.md)
-   [Features/Exports Netgroups Authentication](../GlusterFS 3.7/Exports and Netgroups Authentication.md)
    [Features/outcast](../GlusterFS 3.7/Outcast.md): Outcast

-   **[Features/Policy based Split-brain Resolution](../GlusterFS 3.7/Policy based Split-brain Resolution.md)**: Policy Based
Split-brain resolution

-   [Features/rest-api](../GlusterFS 3.7/rest-api.md):
     REST API for Gluster Volume and Peer Management

-   [Features/Archipelago Integration](../GlusterFS 3.7/Archipelago Integration.md):
     Improvements for integration with Archipelago

Release Criterion
-----------------

-   All new features to be documented in admin guide

-   Feature tested as part of testing days.

-   More to follow