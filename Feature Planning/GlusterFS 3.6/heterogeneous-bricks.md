Feature
-------

Support heterogeneous (different size) bricks.

Summary
-------

DHT is currently very naive about brick sizes, assigning equal "weight"
to each brick/subvolume for purposes of placing new files even though
the bricks might actually have different sizes. It would be better if
DHT assigned greater weight (i.e. would create more files) on bricks
with more total or free space.

This proposal came out of a [mailing-list
discussion](http://www.gluster.org/pipermail/gluster-users/2014-January/038638.html)

Owners
------

-   Raghavendra G (rgowdapp@redhat.com)

Current status
--------------

There is a
[script](https://github.com/gluster/glusterfs/blob/master/extras/rebalance.py)
representing much of the necessary logic, using DHT's "custom layout"
feature and other tricks.

The most basic kind of heterogeneous-brick-friendly rebalancing has been
implemented. [patch](http://review.gluster.org/#/c/8020/)

Detailed Description
--------------------

There should be (at least) three options:

-   Assign subvolume weights based on **total** space.

-   Assign subvolume weights based on **free** space.

-   Assign all (or nearly all) weight to specific subvolumes.

The last option is useful for those who expand a volume by adding bricks
and intend to let the system "rebalance automatically" by directing new
files to the new bricks, without migrating any old data. Once the
appropriate weights have been calculated, the rebalance command should
apply the results recursively to all directories within the volume
(except those with custom layouts) and DHT should assign layouts to new
directories in accordance with the same weights.

Benefit to GlusterFS
--------------------

Better support for adding new bricks that are a different size than the
old, which is common as disk capacity tends to improve with each
generation (as noted in the ML discussion).

Better support for adding capacity without an expensive (data-migrating)
rebalance operation.

Scope
-----

This will involve changes to all current rebalance code - CLI, glusterd,
DHT, and probably others.

### Implications on manageability

New CLI options.

### Implications on presentation layer

None.

### Implications on persistence layer

None.

### Implications on 'GlusterFS' backend

None, unless we want to add a "policy" xattr on the root inode to be
consulted when new directories are created (could also be done via
translator options).

### Modification to GlusterFS metadata

Same as previous.

### Implications on 'glusterd'

New fields in rebalance-related RPCs.

How To Test
-----------

For each policy:

1.  Create a volume with small bricks (ramdisk-based if need be).

1.  Fill the bricks to varying degrees.

1.  (optional) Add more empty bricks.

1.  Rebalance using the target policy.

1.  Create some dozens/hundreds of new files.

1.  Verify that the distribution of new files matches what is expected
    for the given policy.

User Experience
---------------

New options for the "rebalance" command.

Dependencies
------------

None.

Documentation
-------------

TBD

Status
------

Original author has abandoned this change. If anyone else wants to make
a \*positive\* contribution to fix a long-standing user concern, feel
free.

Comments and Discussion
-----------------------
