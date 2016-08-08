# Release Process for GlusterFS


The GlusterFS release process aims to provide regular, stable releases, with the ability to also ship new features quickly, while also attempting to reduce the complexity for release maintainers.

## GlusterFS releases

GlusterFS has 2 types of major releases, Long Term Maintenance (LTM) and Short Term Maintenance (STM). Major releases happen once every 3 months. Check [Release Schedule](https://www.gluster.org/community/release-schedule/) for more information on the schedule for major releases.

Major releases don't guarantee complete backwards compatability with the previous major release.

Minor releases will have guaranteed backwards compatibilty with earlier minor releases of the same branch.

- LTM and STM state alternates with every release.
- LTM and STM releases differ in the period of updates provided.

### Long Term Maintenance (LTM) releases

An LTM release reaches EOL when a LTM+2 release is done, 1 year later. LTM releases may get monthly minor releases for bug-fixes.

### Short Term Maintenance (STM) releases

STM releases are only supported until the next major release. STM releases may get monthly updates for bug fixes.

The discussions around release schedules and lifecycles happened in the following mail threads on the GlusterFS maintainers mailing list.

- https://www.gluster.org/pipermail/maintainers/2016-June/000892.html
- https://www.gluster.org/pipermail/maintainers/2016-August/001174.html


## GlusterFS major release window
Each GlusterFS major release has a 3 month release window, in which changes get merged. The 3 month release window is split into two phases.

1. A Open phase, where all changes get merged
1. A Stability phase, where only changes that stabilize the release get merged.

The first 2 months of a release window will be the Open phase, and the last month will be the stability phase.

The release engineer (or team doing the release) is responsible for messaging.

#### Open phase
Any changes are accepted during this phase. New features that are introduced in this phase, need to be capable of being selectively built. All changes in the master branch are automatically incuded in the next release.

All changes will be accepted during the Open phase. The changes have a few requirements,

- a change fixing a bug SHOULD have public test case
- a change introducing a new feature MUST have a disable switch that can disable the feature during a build


#### Stability phase
This phase is used to stabilize any new features introduced in the open phase, or general bug fixes for already existing features.

A new release-<version> branch is created at the beginning of this phase. All changes need to be sent to the master branch before getting backported to the new release branch.

No new features will be merged in this phase. At the end of this phase, any new feature introduced that hasn't been declared stable will be disabled, if possible removed, to prevent confusion and set clear expectations towards users and developers.

Patches accepted in the Stability phase have the following requirements:

- a change MUST fix a bug that users have reported or are very likely to hit
- each change SHOULD have a public test-case (.t or DiSTAF)
- a change MUST NOT add a new FOP
- a change MUST NOT add a new xlator
- a change SHOULD NOT add a new volume option, unless a public discussion was kept and several maintainers agree that this is the only right approach
- a change MAY add new values for existing volume options, these need to be documented in the release notes and be marked as a 'minor feature enhancement' or similar
- it is NOT RECOMMENDED to modify the contents of existing log messages, automation and log parsers can depend on the phrasing
- a change SHOULD NOT have more than approx. 100 lines changed, additional public discussion and agreement among maintainers is required to get big changes approved
- a change SHOULD NOT modify existing structures or parameters that get sent over the network, unless a public discussion was kept and several maintainers agree that this is the only right approach
- existing structures or parameters MAY get extended with additional values (i.e. new flags in a bitmap/mask) if the extensions are optional and do not affect older/newer client/server combinations

Patches that do not satisfy the above requirements can still be submitted for review, but cannot be merged.

### GlusterFS minor release window
GlusterFS minor releases have a 1 month release window, which is the same as the stability phase of the major releases.

Patches for a minor release have the following requirements:

- a change MUST fix a bug that users have reported or are very likely to hit
- each change SHOULD have a public test-case (.t or DiSTAF)
- a change MUST NOT add a new FOP
- a change MUST NOT add a new xlator
- a change SHOULD NOT add a new volume option, unless a public discussion was kept and several maintainers agree that this is the only right approach
- a change MAY add new values for existing volume options, these need to be documented in the release notes and be marked as a 'minor feature enhancement' or similar
- it is NOT RECOMMENDED to modify the contents of existing log messages, automation and log parsers can depend on the phrasing
- a change SHOULD NOT have more than approx. 100 lines changed, additional public discussion and agreement among maintainers is required to get big changes approved
- a change MUST NOT modify existing structures or parameters that get sent over the network
- existing structures or parameters MAY get extended with additional values (i.e. new flags in a bitmap/mask) if the extensions are optional and do not affect older/newer client/server combinations

NOTE: Changes to experimental features (as announced on the roadmap and in the release notes) are exempted from these criteria, except for the MOST NOT requirements. These features explicitly may change their behaviour, configuration and management interface while experimenting to find the optimal solution.

Component maintainers may merge changes, as long as they stick to the patch acceptance criteria, until 1 week before the release. After this point only the release-maintainer can merge changes.

## Release procedure
This procedure is followed by a release maintainer/manager, to perform the actual release.

The release procedure for both major releases and minor releases is nearly the same.

The procedure for the major releases starts at the beginning of the Stability phase, and for the minor release at the start of the release window.

_TODO: Add the release verification procedure_

### Release steps
The release-manager needs to follow the following steps, to actually perform the release once ready.

#### Create tarball

1.  Add the release-notes to the docs/release-notes/ directory in the sources
2.  after merging the release-notes, create a tag like v3.6.2
3.  push the tag to git.gluster.org
4.  create the tarball with the [release job in Jenkins](http://build.gluster.org/job/release/)

#### Notify packagers
Notify the packagers that we need packages created. Provide the link to the source tarball from the Jenkins release job to the [packagers mailinglist](mailto:packaging@gluster.org). A list of the people involved in the package maintenance for the different distributions is in the `MAINTAINERS` file in the sources, all of them should be subscribed to the packagers mailinglist.

#### Create a new Tracker Bug for the next release
The tracker bugs are used as guidance for blocker bugs and should get created when a release is made. To create one

- file a [new bug in Bugzilla](https://bugzilla.redhat.com/enter_bug.cgi?product=GlusterFS)
- base the contents on previous tracker bugs, like the one for [glusterfs-3.5.5](https://bugzilla.redhat.com/show_bug.cgi?id=glusterfs-3.5.5)
- set the '''Alias''' (it is a text-field) of the bug to 'glusterfs-a.b.c' where a.b.c is the next minor version
- save the new bug
- you should now be able to use the 'glusterfs-a.b.c' to access the bug, use the alias to replace the BZ# in URLs, or '''blocks''' fields
- bugs that were not fixed in this release, but were added to the tracker should be moved to the new tracker

#### Create Release Announcement
Create the Release Announcement (this is often done while people are making the packages). The contents of the release announcement can be based on the release notes, or should at least have a pointer to them.

Examples:
- [blog](http://blog.gluster.org/2014/11/glusterfs-3-5-3beta2-is-now-available-for-testing/)
- [release notes](https://github.com/gluster/glusterfs/blob/v3.5.3/doc/release-notes/3.5.3.md)

#### Send Release Announcement

Once the Fedora/EL RPMs are ready (and any others that are ready by then), send the release announcement:

- Gluster Mailing lists
  - [gluster-announce](https://www.gluster.org/mailman/listinfo/announce/)
  - [gluster-devel](https://www.gluster.org/mailman/listinfo/gluster-devel/)
  - [gluster-users](https://www.gluster.org/mailman/listinfo/gluster-users/)
- [Gluster Blog](https://blog.gluster.org)
- [Gluster Twitter account](https://twitter.com/gluster)
- [Gluster Facebook page](https://www.facebook.com/GlusterInc)
- [Gluster LinkedIn group]()
- [Gluster G+](https://plus.google.com/communities/110022816028412595292)

For help with posting to the social media pages, please reach out to Amye.

#### Close Bugs

Close the bugs that have all their patches included in the release. Leave a note in the bug report with a pointer to the release announcement.
The [close-bugs.sh](https://github.com/gluster/release-tools/blob/master/close-bugs.sh) in the glusterfs [release-tools](https://github.com/gluster/release-tools/) repository can be used to do this.



### Other things to consider

#### Upgrade documentation

If required, an upgrade document having any upgrade instructions specific the the release needs to be prepared. This document must be added under the [Upgrade Guide](https://github.com/gluster/glusterdocs/tree/master/Upgrade-Guide) section of the [glusterdocs](https://github.com/gluster/glusterdocs) repository.
