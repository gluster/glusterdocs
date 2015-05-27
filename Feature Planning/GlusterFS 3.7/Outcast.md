Feature
-------

This feature provides a way of preventing split-brains in time.

Summary
-------

Please see <http://review.gluster.org/#/c/9656/>

Owners
------

Pranith Kumar Karampuri  
Ravishankar N

Current status
--------------

Feature complete.

Code patches: <http://review.gluster.org/#/c/10257/> and
<http://review.gluster.org/#/c/10258/>

Detailed Description
--------------------

Benefit to GlusterFS
--------------------

It prevents split-brains in time.

Scope
-----

### Nature of proposed change

### Implications on manageability

None

### Implications on presentation layer

None

### Implications on persistence layer

None

### Implications on 'GlusterFS' backend

None

### Modification to GlusterFS metadata

None

### Implications on 'glusterd'

None

How To Test
-----------

If we bring down bricks and perform writes in such a way that arbiter
brick is the only source online, writes/reads will be made to fail with
ENOTCONN. See 'tests/basic/afr/arbiter.t' in the glusterfs tree for
examples.

User Experience
---------------

Similar to a normal replica 3 volume. The only change is the syntax in
volume creation. See
<https://github.com/gluster/glusterfs/blob/master/doc/features/afr-arbiter-volumes.md>

Dependencies
------------

None

Documentation
-------------

---

Status
------

Feature completed. See 'Current status' section for the patches.

Comments and Discussion
-----------------------

---
