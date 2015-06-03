Feature
-------

readdir-ahead

Summary
-------

Provide read-ahead support for directories to improve sequential
directory read performance.

Owners
------

Brian Foster

Current status
--------------

Gluster currently does not attempt to improve directory read
performance. As a result, simple operations (i.e., ls) on large
directories are slow.

Detailed Description
--------------------

The read-ahead feature for directories is analogous to read-ahead for
files. The objective is to detect sequential directory read operations
and establish a pipeline for directory content. When a readdir request
is received and fulfilled, preemptively issue subsequent readdir
requests to the server in anticipation of those requests from the user.
If sequential readdir requests are received, the directory content is
already immediately available in the client. If subsequent requests are
not sequential or not received, said data is simply dropped and the
optimization is bypassed.

Benefit to GlusterFS
--------------------

Improved read performance of large directories.

### Scope

Nature of proposed change
-------------------------

readdir-ahead support is enabled through a new client-side translator.

Implications on manageability
-----------------------------

None beyond the ability to enable and disable the translator.

Implications on presentation layer
----------------------------------

N/A

Implications on persistence layer
---------------------------------

N/A

Implications on 'GlusterFS' backend
-----------------------------------

N/A

Modification to GlusterFS metadata
----------------------------------

N/A

Implications on 'glusterd'
--------------------------

N/A

How To Test
-----------

Performance testing. Verify that sequential reads of large directories
complete faster (i.e., ls, xfs\_io -c readdir).

User Experience
---------------

Improved performance on sequential read workloads. The translator should
otherwise be invisible and not detract performance or disrupt behavior
in any way.

Dependencies
------------

N/A

Documentation
-------------

Set the associated config option to enable or disable directory
read-ahead on a volume:

		gluster volume set <vol> readdir-ahead [enable|disable]

readdir-ahead is disabled by default.

Status
------

Development complete for the initial version. Minor changes and bug
fixes likely.

Future versions might expand to provide generic caching and more
flexible behavior.

Comments and Discussion
-----------------------