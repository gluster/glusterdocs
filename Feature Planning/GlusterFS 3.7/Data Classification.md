Goal
----

Support tiering and other policy-driven (as opposed to pseudo-random)
placement of files.

Summary
-------

"Data classification" is an umbrella term covering things:
locality-aware data placement, SSD/disk or
normal/deduplicated/erasure-coded data tiering, HSM, etc. They share
most of the same infrastructure, and so are proposed (for now) as a
single feature.

NB this has also been referred to as "DHT on DHT" in various places,
though "unify on DHT" might be more accurate.

Owners
------

Dan Lambright <dlambrig@redhat.com>

Joseph Fernandes <josferna@redhat.com>

Current status
--------------

Cache tiering under development upstream. Tiers may be added to existing
volumes. Tiers are made up of bricks.

Volume-granularity tiering has been prototyped (bugzilla \#9387) and
merged in a branch (origin/fix\_9387) to the cache tiering forge
project. This will allow existing volumes to be combined into a single
one offering both functionality.

Related Feature Requests and Bugs
---------------------------------

N/A

Detailed Description
--------------------

The basic idea is to layer multiple instances of a modified DHT
translator on top of one another, each making placement/rebalancing
decisions based on different criteria. The current consistent-hashing
method is one possibility. Other possibilities involve matching
file/directory characteristics to subvolume characteristics.

-   File/directory characteristics: size, age, access rate, type
    (extension), ...

-   Subvolume characteristics: physical location, storage type (e.g.
    SSD/disk/PCM, cache), encoding method (e.g. erasure coded or
    deduplicated).

-   Either (arbitrary tags assigned by user): owner, security level,
    HIPPA category

For example, a first level might redirect files based on security level,
a second level might match age or access rate vs. SSD-based or
disk-based subvolumes, and then a third level might use consistent
hashing across several similarly-equipped bricks.

### Cache tier

The cache tier will support data placement based on access frequency.
Frequently accessed files shall exist on a "hot" subvolume. Infrequently
accessed files shall reside on a "cold" subvolume. Files will migrate
between the hot and cold subvolumes according to observed usage.

Read caching is a desired future enhancement.

When the "cold" subvolume is expensive to use (e.g. erasure coded), this
feature will mitigate its overhead for many workloads.

Some use cases:

-   fast subvolumes are SSDs, slow subvolumes are normal disks
-   fast subvolumes are normal disks, slow subvolumes are erasure coded.
-   fast subvolume is backed up more frequently than slow tier.
-   read caching only , good in cases where migration overhead is
    unacceptable

Benefit to GlusterFS
--------------------

By itself, data classification can be used to improve performance (by
optimizing where "hot" files are placed) and security or regulatory
compliance (by placing sensitive data only on the most secure storage).
It also serves as an enabling technology for other enhancements by
allowing users to combine more cost-effective or archivally oriented
storage for the majority of their data with higher-performance storage
to absorb the majority of their I/O load. This enabling effect applies
e.g. to compression, deduplication, erasure coding, or bitrot detection.

Scope
-----

### Nature of proposed change

The most basic set of changes involves making the data-placement part of
DHT more modular, and providing modules/plugins to do the various kinds
of intelligent placement discussed above. Other changes will be
explained in subsequent sections.

### Implications on manageability

Eventually, the CLI must provide users with a way to arrange bricks into
a hierarchy, and assign characteristics such as storage type or security
level at any level within that hierarchy. They must also be able to
express which policy (plugin), with which parameters, should apply to
any level. A data classification language has been proposed to help
express these concepts, see link above.

The cache tier's graph is more rigid and can be expressed using the
"volume attach-cache" command described below. Both a "hot" tier and
"cold tier" are made up of dispersed / distributed / replicated bricks
in the same manner as a normal volume, and they are combined with the
tier translator.

#### Cache Tier

An "attach" command will declare an existing volume as "cold" and create
a new "hot" volume which is appended to it. Together, the combination is
a single "cache tiered" volume. For example:

gluser volume attach-tier [name] [redundancy \#] brick1 brick2 .. brickN

.. will attach a hot tier made up of brick[1..N] to existing volume
[name].

The tier can be detached. Data is first migrated off the hot volume, in
the same manner as brick removal, and then the hot volume is removed
from the volfile.

gluster volume detach-tier brick1,...,brickN

To start cache tiering:

gluster volume rebalance [name] tier start

Enable the change time recorder:

gluster voiume set [name] features.ctr-enabled on

Other cache parameters:

tier-demote-frequency - how often thread wakes up to demote data

tier-promote-frequency - as above , to promote data

To stop it:

gluster volume rebalance [name] tier stop

To get status:

gluster volume rebalance [name] tier status

upcoming:

A "pause-tier" command will allow users to stop using the hot tier.
While paused, data will be migrated off the hot tier to the cold tier,
and all I/Os will be forwarded to the cold tier. A status CLI will
indicate how much data remains to be "flushed" from the hot tier to the
cold tier.

### Implications on presentation layer

N/A

### Implications on persistence layer

N/A

### Implications on 'GlusterFS' backend

A tiered volume is a new volume type.

Simple rules may be represented using volume "options" key-value in the
volfile. Eventually, for more elaborate graphs, some information about a
brick's characteristics and relationships (within the aforementioned
hierarchy) may be stored on the bricks themselves as well as in the
glusterd configuration. In addition, the volume's "info" file may
include an adjacency list to represent more elaborate graphs.

### Modification to GlusterFS metadata

There are no plans to change meta-data for the cache tier. However in
the future, categorizing files and directories (especially with
user-defined tags) may require additional xattrs.

### Implications on 'glusterd'

Finally, volgen must be able to convert these specifications into a
corresponding hierarchy of translators and options for those
translators.

Adding and removing tiers dynamically closely resembles the add and
remove brick operations.

How To Test
-----------

Eventually, new tests will be needed to set up multi-layer hierarchies,
create files/directories, issue rebalance commands etc. and ensure that
files end up in the right place(s). Many of the tests are
policy-specific, e.g. to test an HSM policy one must effectively change
files' ages or access rates (perhaps artificially).

Interoperability tests between the Snap, geo-rep, and quota features are
necessary.

### Cache tier

Tests should include:

Automated tests are under development in the forge repository in file
tier.t

- The performance of "cache friendly" workloads (e.g. repeated access to
a small set of files) is improved.

- Performance is not substantially worse in "cache unfriendly" workloads
(e.g. sequential writes over large numbers of files.)

- Performance should not become substantially worse when the hot tier's
bricks become full.

User Experience
---------------

The hierarchical arrangement of bricks, with attributes and policies
potentially at many levels, represents a fundamental change to the
current "sea of identical bricks" model. Eventually, some commands that
currently apply to whole volumes will need to be modified to work on
sub-volume-level groups (or even individual bricks) as well.

The cache tier must provide statistics on data migration.

Dependencies
------------

Documentation
-------------

See below.

Status
------

Cache tiering implementation in progress for 3.7; some bits for more
general DC also done (fix 9387).

-   [Syntax
    proposal](https://docs.google.com/presentation/d/1e8tuh9DKNi9eCMrdt5vetppn1D3BiJSmfR7lDW2wRvA/edit#slide=id.p)
    (dormant).
-   [Syntax prototype](https://forge.gluster.org/data-classification)
    (dormant, not part of cache tiering).
-   [Cache tier
    design](https://docs.google.com/document/d/1cjFLzRQ4T1AomdDGk-yM7WkPNhAL345DwLJbK3ynk7I/edit)
-   [Bug 763746](https://bugzilla.redhat.com/763746) - We need an easy
    way to alter client configs without breaking DVM
-   [Bug 905747](https://bugzilla.redhat.com/905747) - [FEAT] Tier
    support for Volumes
-   [Working tree for
    tiering](https://forge.gluster.org/data-classification/data-classification)
-   [Volgen changes for general DC](http://review.gluster.org/#/c/9387/)
-   [d\_off changes to allow stacked
    DHTs](https://www.mail-archive.com/gluster-devel%40gluster.org/msg03155.html)
    (prototyped)
-   [Video on the concept](https://www.youtube.com/watch?v=V4cvawIv1qA)
    Efficient Data Maintenance in GlusterFS using DataBases : Data
    Classification as the case study

Comments and Discussion
-----------------------
