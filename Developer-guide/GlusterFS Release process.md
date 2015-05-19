Release Process for GlusterFS
=============================

Create tarball
--------------

1.  Add the release-notes to the docs/release-notes/ directory in the
    sources
2.  after merging the release-notes, create a tag like v3.6.2
3.  push the tag to git.gluster.org
4.  create the tarball with the [release job in
    Jenkins](http://build.gluster.org/job/release/)

Notify packagers
----------------

Notify the packagers that we need packages created

-   Fedora/EL RPMs - ndevos, kkeithley, hchiramm, lalatenduM
-   SuSE RPMs - kkeithley
-   Pidora RPMs - kkeithley
-   Debian/Ubuntu .debs - semiosis
-   MacOS X Homebrew - Justin Clift
-   NetBSD Port - Manu
-   FreeBSD Port - Craig Butler

Create Release Announcement
---------------------------

Create the Release Announcement (this is often done while people are
making the packages). The contents of the release announcement can be
based on the release notes, or should at least have a pointer to them.

Examples:

-   [blog](http://blog.gluster.org/2014/11/glusterfs-3-5-3beta2-is-now-available-for-testing/)
-   [release
    notes](https://github.com/gluster/glusterfs/blob/v3.5.3/doc/release-notes/3.5.3.md)

Send Release Announcement
-------------------------

Once the Fedora/EL RPMs are ready (and any others that are ready by
then), send the release announcement:

-   Gluster Mailing lists
    -   gluster-announce, gluster-devel, gluster-users
-   Gluster Blog
-   Gluster Twitter account
-   Gluster Facebook page
-   Gluster LinkedIn group - Justin has access
-   Gluster G+

Close Bugs
----------

Close the bugs that have all their patches included in the release.
Leave a note in the bug report with a pointer to the release
announcement.

Other things to consider
------------------------

-   Translations? - Are there strings needing translation?