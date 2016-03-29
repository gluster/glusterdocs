Developers
==========

### From GlusterDocumentation

Contributing to the Gluster community
-------------------------------------

Are you itching to send in patches and participate as a developer in the
Gluster community? Here are a number of starting points for getting
involved. We don't require a signed contributor license agreement or
copyright assignment, but we do require a "signed-off-by" line on each
code check-in.

-   [Simplified Developer Workflow](./Simplified Development Workflow.md)
    - A simpler and faster intro to developing with GlusterFS, than the
    doc below.
-   [Developer Workflow](./Development Workflow.md) - this tells
    you about our patch requirements, tools we use, and more. Required
    reading if you want to contribute code.
-   [License
    Change](http://www.gluster.org/2012/05/glusterfs-license-change/) -
    we recently changed the client library code to a dual license under
    the GPL v2 and the LGPL v3 or later
-   [GlusterFS Coding Standards](./coding-standard.md)

Compiling Gluster
-----------------

-   [Compiling RPMS](./Compiling RPMS.md) - Step by step
    instructions for compiling Gluster RPMS
-   [Building GlusterFS](./Building GlusterFS.md) - How to compile
    Gluster from source code. Including instructions for Ubuntu.

Developing
----------

-   [Projects](./Projects.md) - Ideas for projects you could
    create
-   [Language Bindings](./Language Bindings.md) - Connect to
    GlusterFS using various language bindings
-   [EasyFix\_Bugs](./Easy Fix Bugs.md) - Easy to fix bugs of
    GlusterFS. One of the best place to start contributing to GlusterFS.
-   [Fixing issues reported by tools for static code
    analysis](./Fixing issues reported by tools for static code analysis.md)
    - This is a good starting point for developers to fix bugs in
    GlusterFS project.
-   [Backport Wishlist](./Backport Wishlist.md) - Problems fixed
    in the master branch might need to get fixed in stable release
    branches too.
    The [Backport Guidelines](./Backport Guidelines.md) describe the steps that
    branches too.

Adding File operations
----------------------

-   [Steps to be followed when adding a new FOP to GlusterFS ](./adding-fops.md)

Automatic File Replication
--------------------------

-   [Cluster/afr translator](./afr.md)
-   [History of Locking in AFR](./afr-locks-evolution.md)
-   [Self heal Daemon](./afr-self-heal-daemon.md)

Data Structures
---------------

-   [inode data structure](./datastructure-inode.md)
-   [iobuf data structure](./datastructure-iobuf.md)
-   [mem-pool data structure](./datastructure-mem-pool.md)

Find the gfapi symbol versions [here](./gfapi-symbol-versions.md)

Daemon Management Framework
---------------------------

-   [How to introduce new daemons using daemon management framework](./daemon-management-framework.md)

Translators
-----------

-   [Block Device Tanslator](./bd-xlator.md)
-   [Performance/write-Behind Translator](./write-behind.md)
-   [Translator Development](./translator-development.md)
-   [Storage/posix Translator](./posix.md)
-   [Compression translator](./network_compression.md)

Static Analysis
---------------

-   [Clang static analysis in gluster](./clang-static-analysis.md) -
    How to run clang static analysis before you submit a patch.

Testing
-------

-   [Unit Tests in GlusterFS](./unittest.md)
-   [Using the Gluster Test
    Framework](./Using Gluster Test Framework.md) - Step by
    step instructions for running the Gluster Test Framework
-   [Our Jenkins Infrastructure](./Jenkins Infrastructure.md) - A
    braindump of the Jenkins infrastructure we have in place for
    automated testing
-   [Manual steps for setting up a Jenkins slave VM in
    Rackspace](./Jenkins Manual Setup.md) - Steps for setting up a slave
    VM in Rackspace

Bug Handling
------------

-   [Bug reporting guidelines](./Bug Reporting Guidelines.md) -
    Guideline for reporting a bug in GlusterFS
-   [Bug triage guidelines](./Bug Triage.md) - Guideline on how to
    triage bugs for GlusterFS
-   [Bug report life cycle in
    Bugzilla](./Bug report Life Cycle.md) - Information about bug
    life cycle

Patch Acceptance
----------------

-   The [Guidelines For
    Maintainers](./Guidelines For Maintainers.md) explains when
    maintainers can merge patches.

Release Process
---------------

-   [Versioning](./versioning.md)
-   [GlusterFS Release Process](./GlusterFS Release process.md) -
    Our release process / checklist
