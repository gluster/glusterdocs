# Release Process for GlusterFS

The GlusterFS release process aims to provide regular, stable releases, with the ability to also ship new features quickly, while also attempting to reduce the complexity for release maintainers.

## GlusterFS releases

GlusterFS Major releases happen once every 4-6 months. Check [Release Schedule](https://www.gluster.org/community/release-schedule/) for more information on the schedule for major releases. Minor releases happen every month for corresponding branch of major release. Each major release is supported till we have N+2 version is made available.

Major releases don't guarantee complete backwards compatability with the previous major release.

Minor releases will have guaranteed backwards compatibilty with earlier minor releases of the same branch.

## GlusterFS major release

Each GlusterFS major release has a 4-6 month release window, in which changes get merged. This window is split into two phases.

1. A Open phase, where all changes get merged
1. A Stability phase, where only changes that stabilize the release get merged.

The first 2-4 months of a release window will be the Open phase, and the last month will be the stability phase.

The release engineer (or team doing the release) is responsible for messaging.

#### Open phase

Any changes are accepted during this phase. New features that are introduced in this phase, need to be capable of being selectively built. All changes in the master branch are automatically incuded in the next release.

All changes will be accepted during the Open phase. The changes have a few requirements,

- a change fixing a bug SHOULD have public test case
- a change introducing a new feature MUST have a disable switch that can disable the feature during a build


#### Stability phase
This phase is used to stabilize any new features introduced in the open phase, or general bug fixes for already existing features.

A new `release-<version>` branch is created at the beginning of this phase. All changes need to be sent to the master branch before getting backported to the new release branch.

No new features will be merged in this phase. At the end of this phase, any new feature introduced that hasn't been declared stable will be disabled, if possible removed, to prevent confusion and set clear expectations towards users and developers.

Patches accepted in the Stability phase have the following requirements:

- a change MUST fix an issue that users have reported or are very likely to hit
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

- Create a [new milestone](https://github.com/gluster/glusterfs/milestones/new)
- base the contents on open issues, like the one for [glusterfs-8](https://github.com/gluster/glusterfs/milestone/10)
- issues that were not fixed in previous release, but in milestone should be moved to the new milestone.

#### Create Release Announcement
(Major releases) 
The Release Announcement is based off the release notes. This needs to indicate:
 * What this release's overall focus is
 * Which versions will stop receiving updates as of this release
 * Links to the direct download folder 
 * Feature set 
 
Best practice as of version-8 is to create a collaborative version of the release notes that both the release manager and community lead work on together, and the release manager posts to the mailing lists (gluster-users@, gluster-devel@, announce@). 


#### Create Upgrade Guide
(Major releases) 
If required, as in the case of a major release, an upgrade guide needs to be available at the same time as the release. 
This document should go under the [Upgrade Guide](https://github.com/gluster/glusterdocs/tree/master/Upgrade-Guide) section of the [glusterdocs](https://github.com/gluster/glusterdocs) repository.

#### Send Release Announcement

Once the Fedora/EL RPMs are ready (and any others that are ready by then), send the release announcement:

- Gluster Mailing lists
  - [gluster-announce](https://www.gluster.org/mailman/listinfo/announce/)
  - [gluster-devel](https://www.gluster.org/mailman/listinfo/gluster-devel/)
  - [gluster-users](https://www.gluster.org/mailman/listinfo/gluster-users/)
  
- [Gluster Blog](https://blog.gluster.org) 
The blog will automatically post to both Facebook and Twitter. Be careful with this! 
  - [Gluster Twitter account](https://twitter.com/gluster)
  - [Gluster Facebook page](https://www.facebook.com/GlusterInc)
- [Gluster LinkedIn group](https://www.linkedin.com/company-beta/4822513)

