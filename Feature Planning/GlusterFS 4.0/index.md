GlusterFS 4.0 Release Planning
------------------------------

Tentative Dates:

Feature proposal for GlusterFS 4.0
----------------------------------

This list has been seeded with features from <http://goo.gl/QyjfxM>
which provides some rationale and context. Feel free to add more. Some
of the individual feature pages are still incomplete, but should be
completed before voting on the final 4.0 feature set.

### Node Scaling Features

-   [Features/thousand-node-glusterd](../GlusterFS 3.6/Thousand Node Gluster.md):
     Glusterd changes for higher scale.

-   [Features/dht-scalability](./dht-scalability.md): 
     a.k.a. DHT2

-   [Features/sharding-xlator](../GlusterFS 3.7/Sharding xlator.md):
     Replacement for striping.

-   [Features/caching](./caching.md): Client-side caching, with coherency support.

### Technology Scaling Features

-   [Features/data-classification](../GlusterFS 3.7/Data Classification.md):
     Tiering, compliance, and more.

-   [Features/SplitNetwork](./Split Network.md):
     Support for public/private (or other multiple) networks.

-   [Features/new-style-replication](../GlusterFS 3.6/New Style Replication.md):
     Log-based, chain replication.

-   [Features/better-brick-mgmt](./Better Brick Mgmt.md):
     Flexible resource allocation + daemon infrastructure to handle
    (many) more bricks

-   [Features/compression-dedup](./Compression Dedup.md):
     Compression and/or deduplication

### Small File Performance Features

-   [Features/composite-operations](./composite-operations.md):
     Reducing round trips by wrapping multiple ops in one message.

-   [Features/stat-xattr-cache](./stat-xattr-cache.md):
     Caching stat/xattr information in (user-space) server memory.

### Technical Debt Reduction

-   [Features/code-generation](./code-generation.md):
     Code generation

-   [Features/volgen-rewrite](./volgen-rewrite.md):
     Technical-debt reduction

### Other Features

-   [Features/rest-api](../GlusterFS 3.7/rest-api.md):
     Fully generic API sufficient to support all CLI operations.

-   Features/mgmt-plugins:
     No more patching glusterd for every new feature.

-   Features/perf-monitoring:
     Always-on performance monitoring and hotspot identification.

Proposing New Features
----------------------

[New Feature Template](../Feature Template.md)

Use the template to create a new feature page, and then link to it from the "Feature Proposals" section above.

Release Criterion
-----------------

-  TBD
