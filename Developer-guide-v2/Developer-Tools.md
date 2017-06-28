Tools
======

The GlusterFS development model largely revolves around the features and functionality provided by Git version control system, Gerrit code review system and Jenkins continuous integration system. It is a primer for a contributor to the project.


###  Git

Git is an extremely flexible, distributed version control system. The main Gluster git repository is at http://git.gluster.org with public mirrors at (GlusterForge)[https://forge.gluster.org/glusterfs-core/glusterfs] and at (GitHub)[https://github.com/gluster/glusterfs]. The development repo is hosted inside Gerrit and every code merge is instantly replicated to the public mirrors.

###  Gerrit

Gerrit is an excellent code review system which is developed with a git based workflow in mind. The GlusterFS project code review system is hosted at review.gluster.org. Gerrit works on "Change"s. A change is a set of modifications to various files in your repository to accomplish a task. It is essentially one large git commit with all the necessary changes which can be both built and tested.


###  Bugzilla

Bugzilla is a "Defect Tracking System" or "Bug-Tracking System" which allows of developers to keep track of outstanding bugs in their product effectively. Gluster uses http://bugzilla.redhat.com to track defects in the code. See [Bug reporting Guidelines](../Contributors-Guide/Bug-Reporting-Guidelines.md) and [Bug lifecycle](../Contributors-Guide/Bug-report-Life-Cycle.md) for more information on how Gluster uses Bugzilla.


###  Jenkins

Gluster uses Jenkins, a Continuous Integration build system hosted at http://build.gluster.org. Jenkins is configured to work with Gerrit by setting up hooks. Every "Change" which is pushed to Gerrit is automatically picked up by Jenkins, built and smoke tested. The results of all builds and tests can be viewed at http://build.gluster.org/job/smoke/. Jenkins is also setup with a 'regression' job which is designed to execute test scripts provided as part of the code change.

