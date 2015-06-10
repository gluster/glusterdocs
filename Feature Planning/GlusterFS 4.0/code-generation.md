Goal
----

Reduce internal duplication of code by generating from templates.

Summary
-------

The translator calling convention is based on long lists of
operation-specific arguments instead of a common "control block"
struct/union. As a result, many parts of our code are highly repetitive
both internally and with respect to one another. As an example of
internal redundancy, consider how many of the functions in
[defaults.c](https://github.com/gluster/glusterfs/blob/master/libglusterfs/src/defaults.c)
look similar. As an example of external redundancy, consider how the
[patch to add GF\_FOP\_IPC](http://review.gluster.org/#/c/8812/) has to
make parallel changes to 17 files - defaults, stubs, syncops, RPC,
io-threads, and so on. All of this duplication slows development of new
features, and creates huge potential for errors as definitions that need
to match don't. Indeed, during development of a code generator for NSR,
several such inconsistencies have already been found.

Owners
------

Jeff Darcy <jdarcy@redhat.com>

Current status
--------------

Proposed, awaiting approval.

Related Feature Requests and Bugs
---------------------------------

Code generation was already used successfully in the first generation of
[NSR](../GlusterFS 3.6/New Style Replication.md) and will continue to be
used in the second.

Detailed Description
--------------------

See Summary section above.

Benefit to GlusterFS
--------------------

-   Fewer bugs from inconsistencies between how similar operations are
    handled within one translator, or how a single operation is handled
    across many.

-   Greater ease of adding new operation types, or new translators which
    implement similar functionality for many operations.

Scope
-----

### Nature of proposed change

The code-generation infrastructure itself consists of three parts:

-   A list of operations and their associated arguments (both original
    and callback, with types).

-   A script to combine this list with a template to do the actual
    generation.

-   Modifications to makefiles etc. to do generation during a build.

The first and easiest target is auto-generated default functions. Stubs
and syncops could follow pretty quickly. Other possibilities include:

-   GFAPI (both C and Python)

-   glupy

-   RPC (replace rpcgen?)

-   io-threads

-   changelog (the [full-data-logging
    translator](https://forge.gluster.org/~jdarcy/glusterfs-core/jdarcys-glusterfs-data-logging)
    on the forge already uses this technique)

Even something as complicated as AFR/NSR/EC could use code generation to
handle quorum checks more consistently, wrap operations in transactions,
and so on. NSR already does; the others could.

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

None.

How To Test
-----------

This change is not intended to introduce any change visible except to
developers. Standard regression tests should be sufficient to verify
that no such change has occurred.

User Experience
---------------

None.

Dependencies
------------

None.

Documentation
-------------

Developer documentation should explain the format of the fop-description
and template files. In particular developers need to know what variables
are available for use in templates, and how to add new ones.

Status
------

Patch available to generate default functions. Others to follow.

Comments and Discussion
-----------------------
