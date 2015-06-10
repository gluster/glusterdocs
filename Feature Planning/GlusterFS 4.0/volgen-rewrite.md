Feature
-------

Volgen rewrite

Summary
-------

This module has become an important choke point for development of new
features, as each new feature needs to make changes here. Many previous
feature additions have been rushed in, by copying/pasting code or adding
special-case checks, instead of refactoring. The result is a big
hairball. Every new change that involves client translators has to deal
with various permutations of replication/EC, striping/sharding,
rebalance, self-heal, quota, snapshots, tiering, NFS, and so on. Each
new change at this point is almost certain to introduce subtle errors
that will only be caught when certain combinations of features and
operations are attempted. There aren't even enough tests to cover even
the basic combinations, and we'd need hundreds more to test the obscure
ones.

Owners
------

Jeff Darcy <jdarcy@redhat.com>

Current status
--------------

Just a proposal so far.

Related Feature Requests and Bugs
---------------------------------

TBD

Detailed Description
--------------------

Many of the problems stem from the fact that our internal volfiles need
to be consistent with, but slightly different from, one another. Instead
of generating them all separately, we should separate the generation
into two phases:

*  Generate a "core" or "vanilla" graph containing all of the translators, option settings, etc. common to all of the special-purpose volfiles.

*  For each special-purpose volfile, copy the core/vanilla graph (*not the code* that generated it) and modify the copy to get what's desired.

Some of the other problems in this module stem from lower-level issues
such as bad data- or control-structure choices (e.g. operating on a
linear list of bricks instead of a proper graph), or complex
object-lifecycle management (e.g. see
<https://bugzilla.redhat.com/show_bug.cgi?id=1211749>). Some of these
problems might be alleviated by using a higher-level language with
complex data structures and garbage collection. An infrastructure
already exists to do graph manipulation in Python, developed for HekaFS
and subsequently used in several other places (it's already in our
source tree).

Benefit to GlusterFS
--------------------

More correct, and more \*verifiably\* correct, volfile generation even
as the next dozen features are added. Also, accelerated development time
for those next dozen features.

Scope
-----

### Nature of proposed change

Pretty much limited to what currently exists in glusterd-volgen.c

### Implications on manageability

None.

### Implications on presentation layer

None.

### Implications on persistence layer

None.

### Implications on 'GlusterFS' backend

None.

### Modification to GlusterFS metadata

None.

### Implications on 'glusterd'

None, unless we decide to store volfiles in a different format (e.g.
JSON) so we can use someone else's parser instead of rolling our own.

How To Test
-----------

Practically every current test generates multiple volfiles, which will
quickly smoke out any differences. Ideally, we'd add a bunch more tests
(many of which might fail against current code) to verify correctness of
results for particularly troublesome combinations of features.

User Experience
---------------

None.

Dependencies
------------

None.

Documentation
-------------

None.

Status
------

Still just a proposal.

Comments and Discussion
-----------------------
