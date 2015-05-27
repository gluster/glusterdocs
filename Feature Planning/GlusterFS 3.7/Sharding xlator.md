Goal
----

Better support for striping.

Summary
-------

The current stripe translator, below DHT, requires that bricks be added
in a multiple of the stripe count times the replica/erasure count. It
also means that failures or performance anomalies in one brick
disproportionately affect one set of striped files (a fraction equal to
stripe count divided by total bricks) while the rest remain unaffected.
By moving above DHT, we can avoid both the configuration limit and the
performance asymmetry.

Owners
------

Vijay Bellur <vbellur@redhat.com>  
Jeff Darcy <jdarcy@redhat.com>  
Pranith Kumar Karampuri <pkarampu@redhat.com>  
Krutika Dhananjay <kdhananj@redhat.com>  

Current status
--------------

Proposed, waiting until summit for approval.

Related Feature Requests and Bugs
---------------------------------

None.

Detailed Description
--------------------

The new sharding translator sits above DHT, creating "shard files" that
DHT is then responsible for distributing. The shard translator is thus
oblivious to the topology under DHT, even when that changes (or for that
matter when the implementation of DHT changes). Because the shard files
will each be hashed and placed separately by DHT, we'll also be using
more combinations of DHT subvolumes and the effect of any imbalance
there will be distributed more evenly.

Benefit to GlusterFS
--------------------

More configuration flexibility and resilience to failures.

Data transformations such as compression or de-duplication would benefit
from sharding because portions of the file may be processed rather than
exclusively at whole-file granularity. For example, to read a small
extent from the middle of a compressed large file, only the shards
overlapping the extent would need to be decompressed. Sharding could
mean the "chunking" step is not needed at the dedupe level. For example,
if a small portion of a de-duplicated file was modified, only the shard
that changed would need to be reverted to an original non-deduped state.
The untouched shards could continue as deduped and their savings
maintained.

The cache tiering feature would benefit from sharding. Currently large
files must be migrated in full between tiers, even if only a small
portion of the file is accessed. With sharding, only the shard accessed
would need to be migrated.

Scope
-----

### Nature of proposed change

Most of the existing stripe translator remains applicable, except that
it needs to be adapted to its new location above DHT instead of below.
In particular, it needs to generate unique shard-file names and pass
them all down to the same (DHT) subvolume, instead of using the same
name across multiple (AFR/client) subvolumes.

### Implications on manageability

None, except perhaps the name change ("shard" vs. "stripe").

### Implications on presentation layer

None.

### Implications on persistence layer

None.

### Implications on 'GlusterFS' backend

None.

### Modification to GlusterFS metadata

Possibly some minor xattr changes.

### Implications on 'glusterd'

None.

How To Test
-----------

Current stripe tests should still be applicable. More should be written,
since it's a little used feature and not many exist currently.

User Experience
---------------

None, except the name change.

Dependencies
------------

None.

Documentation
-------------

TBD, probably minor.

Status
------

Work In Progress

Comments and Discussion
-----------------------
