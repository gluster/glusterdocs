Feature
-------

Exports and Netgroups Authentication for NFS

Summary
-------

This feature adds Linux-style exports & netgroups authentication to
Gluster's NFS server. More specifically, this feature allows you to
restrict access to specific clients & netgroups for both Gluster volumes
and subdirectories within Gluster volumes.

Owners
------

Shreyas Siravara  
Richard Wareing

Current Status
--------------

Today, Gluster can restrict access to volumes through simple IP list.
This feature makes that capability more scalable by allowing large lists
of IPs to be managed through a netgroup. It also allows more granular
permission handling on volumes.

Related Feature Requests and Bugs
---------------------------------

-   [Bug 1143880](https://bugzilla.redhat.com/1143880): Exports and
    Netgroups Authentication for Gluster NFS mount

Patches ([Gerrit
link](http://review.gluster.org/#/q/project:glusterfs+branch:master+topic:bug-1143880,n,z)):

-   [\#1](http://review.gluster.org/9359): core: add generic parser
    utility
-   [\#2](http://review.gluster.org/9360): nfs: add structures and
    functions for parsing netgroups
-   [\#3](http://review.gluster.org/9361): nfs: add support for separate
    'exports' file
-   [\#4](http://review.gluster.org/9362): nfs: more fine grained
    authentication for the MOUNT protocol
-   [\#5](http://review.gluster.org/9363): nfs: add auth-cache for the
    MOUNT protocol
-   [\#6](http://review.gluster.org/8758): gNFS: Export / Netgroup
    authentication on Gluster NFS mount
-   [\#7](http://review.gluster.org/9364): glusterd: add new NFS options
    for exports/netgroups and related caching
-   [\#8](http://review.gluster.org/9365): glusterfsd: add
    "print-netgroups" and "print-exports" command

Detailed Description
--------------------

This feature allows users to restrict access to Gluster volumes (and
subdirectories within a volume) to specific IPs (exports authentication)
or a netgroup (netgroups authentication), or a combination of both.

Benefit to GlusterFS
--------------------

This is a scalable security model and allows more granular permissions.

Scope
-----

### Nature of proposed change

This change modifies the NFS server code and the mount daemon code. It
adds two parsers for the exports & netgroups files as well as some files
relating to caching to improve performance.

### Implications on manageability

The authentication can be turned off with a simply volume setting
('gluster vol set <VOLNAME> nfs.exports-auth-enable off'). The feature
has some tweakable parameters (how long authorizations should be cached,
etc.) that can be tweaked through the CLI interface.

### Implications on presentation layer

Adds per-fileop authentication to the NFS server. No other elements of
the presentation layer are affected.

### Implications on persistence layer

No implications.

### Implications on 'GlusterFS' backend

No implications.

### Modification to GlusterFS metadata

No modifications.

### Implications on 'glusterd'

Adds a few configuration options to NFS to tweak the authentication
model.

How To Test
-----------

Restrict some volume in the exports file to some IP, turn on the
authentication through the Gluster CLI and see mounts/file-operations
denied (or authorized depending on your setup).

User Experience
---------------

Authentication can be toggled through the command line.

Dependencies
------------

No external dependencies.

Documentation
-------------

TBD

Status
------

Feature complete, currently testing & working on enhancements.

Comments and Discussion
-----------------------

TBD
