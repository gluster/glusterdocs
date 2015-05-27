Feature
=======

BitRot Detection

1 Summary
=========

BitRot detection is a technique used to identify an “insidious” type of
disk error where data is silently corrupted with no indication from the
disk to the storage software layer that an error has occurred. BitRot
detection is exceptionally useful when using JBOD (which had no way of
knowing that the data is corrupted on disk) rather than RAID (esp. RAID6
which has a performance penalty for certain kind of workloads).

2 Use cases
===========

-   Archival/Compliance
-   Openstack cinder
-   Gluster health

Refer
[here](http://supercolony.gluster.org/pipermail/gluster-devel/2014-December/043248.html)
for an elaborate discussion on use cases.

3 Owners
========

Venky Shankar <vshankar@redhat.com, yknev.shankar@gmail.com>  
Raghavendra Bhat <rabhat@redhat.com>  
Vijay Bellur <vbellur@redhat.com>  

4 Current Status
================

Initial approach is [here](http://goo.gl/TSjLJn). The document goes into
some details on why one could end up with "rotten" data and approaches
taken by block level filesystems to detect and recover from bitrot. Some
of the design goals are carry forwarded and made to fit with GlusterFS.

Status as of 11th Feb 2015:

Done

-   Object notification
-   Object expiry tracking using timer-wheel

In Progress

-   BitRot server stub
-   BitRot Daemon

5 Detailed Description
======================

**NOTE: Points marked with [NIS] are "Not in Scope" for 3.7 release.**

The basic idea is to maintain file data/metadata checksums as an
extended attribute. Checksum granularity is per file for now, however
this can be extended to be per "block-size" blocks (chunks). A BitRot
daemon per brick is responsible for checksum maintenance for files local
to the brick. "Distributifying" enables scale and effective resource
utilization of the cluster (memory, disk, etc..).

BitD (BitRot Deamon)

-   Daemon per brick takes care of maintaining checksums for data local
    to the brick.
-   Checksums are SHA256 (default) hash
    -   Of file data (regular files only)
    -   "Rolling" metadata checksum of extended attributes (GlusterFS
        xattrs) **[NIS]**
    -   Master checksum: checksum of checksums (data + metadata)
        **[NIS]**
    -   Hashtype is persisted along side the checksum and can be tuned
        per file type

-   Checksum maintenance is "lazy"
    -   "not" inline to the data path (expensive)
    -   List of changed files is notified by the filesystem although a
        single filesystem scan is needed to get to the current state.
        BitD is built over existing journaling infrastructure (a.k.a
        changelog)
    -   Laziness is governed by policies that determine when to
        (re)calculate checksum. IOW, checksum is calculated when a file
        is considered "stable"
        -   Release+Expiry: on a file descriptor release and an
            inactivity for "X" seconds.

-   Filesystem scan
    -   Required once after stop/start or for initial data set
    -   Xtime based scan (marker framework)
    -   Considerations
        -   Parallelize crawl
        -   Sort by inode \# to reduce disk seek
        -   Integrate with libgfchangelog

Detection

-   Upon file/data access (expensive)
    -   open() or read() (disabled by default)
-   Data scrubbing
    -   Filesystem checksum validation
        -   "Bad" file marking
    -   Deep: validate data checksum
    -   Timestamp of last validity - used for replica repair **[NIS]**
    -   Repair **[NIS]**
    -   Shallow: validate metadata checksum **[NIS]**

Repair/Recover stratergies **[NIS]**

-   Mirrored file data
    -   self-heal
-   Erasure Codes (ec xlator)

It would also be beneficial to use inbuilt bitrot capabilities of
backend filesystems such as btrfs. For such cases, it's better to
"handover" bulk of the work of the backend filesystem and have
minimalistic implementation on the daemon side. This area needs to be
explored more (i.e., ongoing and not for 3.7).

6 Benefit to GlusterFS
======================

By the ability of detect silent corruptions (and even backend tinkering
of a file), reading bad data could be avoided and possibly using it as a
truthful source to heal other copies and may be even remotely replicate
to a backup node damaging a good copy. Scrubbing allows pro-active
detection of corrupt files and repairing them before access.

7 Design and CLI specification
==============================

-   [Design document](http://goo.gl/Mjy4mD)
-   [CLI specification](http://goo.gl/2o12Fn)

8 Scope
=======

8.1. Nature of proposed change
------------------------------

The most basic changes being introduction of a server side daemon (per
brick) to maintain file data checksums. Changes to changelog and
consumer library would be needed to support requirements for bitrot
daemon.

8.2. Implications on manageability
----------------------------------

Introduction of new CLI commands to enable bitrot detection, trigger
scrub, query file status, etc.

8.3. Implications on presentation layer
---------------------------------------

N/A

8.4. Implications on persistence layer
--------------------------------------

Introduction of new extended attributes.

8.5. Implications on 'GlusterFS' backend
----------------------------------------

As in 8.4

8.6. Modification to GlusterFS metadata
---------------------------------------

BitRot related extended attributes

8.7. Implications on 'glusterd'
-------------------------------

Supporting changes to CLI.

9 How To Test
=============

10 User Experience
==================

Refer to Section \#7

11 Dependencies
===============

Enhancement to changelog translator (and libgfchangelog) is the most
prevalent change. Other dependencies include glusterd.

12 Documentation
================

TBD

13 Status
=========

-   Initial set of patches merged
-   Bug fixing/enhancement in progress

14 Comments and Discussion
==========================

More than welcome :-)

-   [BitRot tracker Bug](https://bugzilla.redhat.com/1170075)
-   [BitRot hash computation](https://bugzilla.redhat.com/914874)