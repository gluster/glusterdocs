Feature
=======

Better SSL Support

1 Summary
=========

Our SSL support is currently incomplete in several areas. This "feature"
covers several enhancements (see Detailed Description below) to close
gaps and make it more user-friendly.

2 Owners
========

Jeff Darcy <jdarcy@redhat.com>

3 Current status
================

Some patches already submitted.

4 Detailed Description
======================

These are the items necessary to make our SSL support more of a useful
differentiating feature vs. other projects.

-   Enable SSL for the management plane (glusterd). There are currently
    several bugs and UI issues precluding this.

-   Allow SSL identities to be used for authorization as well as
    authentication (and encryption). At a minimum this would apply to
    the I/O path, restricting specific volumes to specific
    SSL-identified principals. It might also apply to the management
    path, restricting certain actions (and/or actions on certain
    volumes) to certain principals. Ultimately this could be the basis
    for full role-based access control, but that's not in scope
    currently.

-   Provide more options, e.g. for cipher suites or certificate-signing

-   Fix bugs related to increased concurrency levels from the
    multi-threaded transport.

5 Benefit to GlusterFS
======================

Sufficient security to support deployment in environments where security
is a non-negotiable requirement (e.g. government). Sufficient usability
to support deployment by anyone who merely desires additional security.
Improved performance in some cases, due to the multi-threaded transport.

6 Scope
=======

6.1. Nature of proposed change
------------------------------

Most of the proposed changes do not actually involve the SSL transport
itself, but are in surrounding components instead. The exception is the
addition of options, which should be pretty simple. However, bugs
related to increased concurrency levels could show up anywhere, most
likely in our more complex translators (e.g. DHT or AFR), and will need
to be fixed on a case-by-case basis.

6.2. Implications on manageability
----------------------------------

Additional configuration will be necessary to enable SSL for glusterd.
Additional commands will also be needed to manage certificates and keys;
the [HekaFS
documentation](https://git.fedorahosted.org/cgit/CloudFS.git/tree/doc)
can serve as an example of what's needed.

6.3. Implications on presentation layer
---------------------------------------

N/A

6.4. Implications on persistence layer
--------------------------------------

N/A

6.5. Implications on 'GlusterFS' backend
----------------------------------------

N/A

6.6. Modification to GlusterFS metadata
---------------------------------------

N/A

6.7. Implications on 'glusterd'
-------------------------------

Significant changes to how glusterd calls the transport layer (and
expects to be called in return) will be necessary to fix bugs and to
enable SSL on its connections.

7 How To Test
=============

New tests will be needed for each major change in the detailed
description. Also, to improve test coverage and smoke out all of the
concurrency bugs, it might be desirable to change the test framework to
allow running in a mode where SSL is enabled for all tests.

8 User Experience
=================

Correspondent to "implications on manageability" section above.

9 Dependencies
==============

Currently we use OpenSSL, so its idiosyncrasies guide implementation
choices and timelines. Sometimes it even affects the user experience,
e.g. in terms of what options exist for cipher suites or certificate
depth. It's possible that it will prove advantageous to switch to
another SSL/TLS package with a better interface, probably PolarSSL
(which often responds to new threats more quickly than OpenSSL).

10 Documentation
================

TBD, likely extensive (see "User Experience" section).

11 Status
=========

Awaiting approval.

12 Comments and Discussion
==========================
