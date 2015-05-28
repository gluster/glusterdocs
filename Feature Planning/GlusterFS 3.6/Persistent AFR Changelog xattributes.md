Feature
-------

Provide a unique and consistent name for AFR changelog extended
attributes/ client translator names in the volume graph.

Summary
-------

Make AFR changelog extended attribute names independent of brick
position in the graph, which ensures that there will be no potential
misdirected self-heals during remove-brick operation.

Owners
------

Ravishankar N <ravishankar@redhat.com>  
Pranith Kumar K <pkarampu@redhat.com>

Current status
--------------

Patches merged in master.

<http://review.gluster.org/#/c/7122/>

<http://review.gluster.org/#/c/7155/>

Detailed Description
--------------------

BACKGROUND ON THE PROBLEM: =========================== AFR makes use of
changelog extended attributes on a per file basis which records pending
operations on that file and is used to determine the sources and sinks
when healing needs to be done. As of today, AFR uses the client
translator names (from the volume graph) as the names of the changelog
attributes. For eg. for a replica 3 volume, each file on every brick has
the following extended attributes:

        trusted.afr.<volname>-client-0-->maps to Brick0
        trusted.afr.<volname>-client-1-->maps to Brick1
        trusted.afr.<volname>-client-2-->maps to Brick2

​1) Now when any brick is removed (say Brick1), the graph is regenerated
and AFR maps the xattrs to the bricks so:

        trusted.afr.<volname>-client-0-->maps to Brick0
        trusted.afr.<volname>-client-1-->maps to Brick2 

Thus the xattr 'trusted.afr.testvol-client-1' which earlier referred to
Brick1's attributes now refer to Brick-2's. If there are pending
self-heals prior to the remove-brick happened, healing could possibly
happen in the wrong direction thereby causing data loss.

​2) The second problem is a dependency with Snapshot feature. Snapshot
volumes have new names (UUID based) and thus the (client)xlator names
are different. Eg: \<<volname>-client-0\> will now be
\<<snapvolname>-client-0\>. When AFR uses these names to query for its
changelog xattrs but the files on the bricks have the old changelog
xattrs. Hence the heal information is completely lost.

WHAT IS THE EXACT ISSUE WE ARE SOLVING OR OBJECTIVE OF THE
FEATURE/DESIGN?
==========================================================================
In a nutshell, the solution is to generate unique and persistent names
for the client translators so that even if any of the bricks are
removed, the translator names always map to the same bricks. In turn,
AFR, which uses these names for the changelog xattr names also refer to
the correct bricks.

SOLUTION:

The solution is explained as a sequence of steps:

-   The client translator names will still use the existing
    nomenclature, except that now they are monotonically increasing
    (<volname>-client-0,1,2...) and are not dependent on the brick
    position.Let us call these names as brick-IDs. These brick IDs are
    also written to the brickinfo files (in
    /var/lib/glusterd/vols/<volname>/bricks/\*) by glusterd during
    volume creation. When the volfile is generated, these brick
    brick-IDs form the client xlator names.

-   Whenever a brick operation is performed, the names are retained for
    existing bricks irrespective of their position in the graph. New
    bricks get the monotonically increasing brick-ID while names for
    existing bricks are obtained from the brickinfo file.

-   Note that this approach does not affect client versions (old/new) in
    anyway because the clients just use the volume config provided by
    the volfile server.

-   For retaining backward compatibility, We need to check two items:
    (a)Under what condition is remove brick allowed; (b)When is brick-ID
    written to brickinfo file.

For the above 2 items, the implementation rules will be thus:

​i) This feature is implemented in 3.6. Lets say its op-version is 5.

​ii) We need to implement a check to allow remove-brick only if cluster
opversion is \>=5

​iii) The brick-ID is written to brickinfo when the nodes are upgraded
(during glusterd restore) and when a peer is probed (i.e. during volfile
import).

Benefit to GlusterFS
--------------------

Even if there are pending self-heals, remove-brick operations can be
carried out safely without fear of incorrect heals which may cause data
loss.

Scope
-----

### Nature of proposed change

Modifications will be made in restore, volfile import and volgen
portions of glusterd.

### Implications on manageability

N/A

### Implications on presentation layer

N/A

### Implications on persistence layer

N/A

### Implications on 'GlusterFS' backend

N/A

### Modification to GlusterFS metadata

N/A

### Implications on 'glusterd'

As described earlier.

How To Test
-----------

remove-brick operation needs to be carried out on rep/dist-rep volumes
having pending self-heals and it must be verified that no data is lost.
snapshots of the volumes must also be able to access files without any
issues.

User Experience
---------------

N/A

Dependencies
------------

None.

Documentation
-------------

TBD

Status
------

See 'Current status' section.

Comments and Discussion
-----------------------

<Follow here>