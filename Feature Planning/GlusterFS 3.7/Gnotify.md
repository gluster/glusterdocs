Feature
=======

GlusterFS Backup API (a.k.a Gnotify)

1 Summary
=========

Gnotify is analogous to inotify(7) for Gluster distributed filesystem to
monitor filesystem events. Currently a similar mechanism exist via
libgfchangelog (per-brick), but that's more of notification + poll
based. This feature makes the notification purely callback based and
provides an API that resembles inotify's block on read() for events.
There may be efforts to support filesystem notifications on the client
at a volume level.

2 Owners
========

Venky Shankar <vshankar@redhat.com>  
Aravinda V K <avishwan@redhat.com>

3 Current Status
================

As of now, there exist "notification + poll" based event consumption
mechanism (used by Geo-replication). This has vastly improved
performance (as filesystem crawl goes away) and has a set of APIs that
respond to event queries by an application. We call this the "higher
level" API as the application needs to deal with changelogs (user
consumable journals) taking care of format, record position, etc..

Proposed change would be to make the API simple, elegant and "backup"
friendly apart from designing it to be "purely" notify based. Engaging
the community is a must so as to identify how various backup utilities
work and prototype APIs accordingly.

4 Detailed Description
======================

The idea is to have a set of APIs use by applications to retrieve a list
of changes in the filesystem. As of now, the changes are classified in
to three categories:

-   Entry operation
    -   Operations that act on filesystem namespace such as creat(),
        unlink(), rename(), etc. fall into this category. These
        operation require parent inode and the basename as part of the
        file operation method.

-   Data operation
    -   Operations that modify data blocks fall into this category:
        write(), truncate(), etc.

-   Metadata operation
    -   Operation that modify inode data such as setattr(), setxattr()
        [set extended attributes] etc. fall in this category.

Details of the record format and the consumer library (libgfchangelog)
is explained in this
[document](https://github.com/gluster/glusterfs/blob/master/doc/features/geo-replication/libgfchangelog.md).
Operations that are persisted in the journal can be notified. Therefore,
operations such as open(), close() are not notified (via journals
consumption). It's beneficial that notifications for such operations be
short circuited directly from the changelog translator to
libgfchangelog.

For gnotify, we introduce a set of low level APIs. Using the low level
interface relieves the application of knowing the record format and
other details such as journal state, leave alone periodic polling which
could be expensive at times. Low level interface induces callback based
programming model (and an intofy() type blocking read() call) with
minimum heavy loading from the application.

Now we list down the API prototype for the same (NOTE: prototype is
subjected to change)

-   changelog\_low\_level\_register()

-   changelog\_put\_buffer()

It's also necessary to provide an interface to get changes via
filesystem crawl based on changed time (xtime): beneficial for initial
crawl when journals are not available or after a stop/start.

5 Benefit to GlusterFS
======================

Integrating backup applications with GlusterFS to incrementally backup
the filesystem is a powerful functionality. Having notification back up
to \*each\* client adds up to the usefulness of this feature. Apart from
backup perspective, journals can be used by utilities such as self-heal
daemon and Geo-replication (which already uses the high level API).

6 Scope
=======

6.1. Nature of proposed change
------------------------------

Changes to the changelog translator and consumer library (plus
integration of parallel filesystem crawl and exposing a API)

6.2. Implications on manageability
----------------------------------

None

6.3. Implications on presentation layer
---------------------------------------

None

6.4. Implications on persistence layer
--------------------------------------

None

6.5. Implications on 'GlusterFS' backend
----------------------------------------

None

6.6. Modification to GlusterFS metadata
---------------------------------------

Introduction of 'xtime' extended attribute . This is nothing new as it's
already maintained by marker translator. Now with integrating 'xsync'
crawl with libgfchangelog, 'xtime' would be additionally maintained by
the library.

6.7. Implications on 'glusterd'
-------------------------------

None

7 How To Test
=============

Test backup scripts integrated with the API or use shipped 'gfind' tool
as an example.

8 User Experience
=================

Easy to use backup friendly API, well integrated with GlusterFS
ecosystem. Does away with polling or expensive duplication of filesystem
crawl code.

9 Dependencies
==============

None

10 Documentation
================

TBD

11 Status
=========

Design/Development in progress

12 Comments and Discussion
==========================

More than welcome :-)
