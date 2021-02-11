### Guidelines For Maintainers

GlusterFS has maintainers, sub-maintainers and release maintainers to
manage the project's codebase. Sub-maintainers are the owners for
specific areas/components of the source tree. Maintainers operate across
all components in the source tree.Release maintainers are the owners for
various release branches (release-x.y) present in the GlusterFS
repository.

In the guidelines below, release maintainers and sub-maintainers are
also implied when there is a reference to maintainers unless it is
explicitly called out.

### Guidelines that Maintainers are expected to adhere to

1. Ensure qualitative and timely management of patches sent for review.
2. For merging patches into the repository, it is expected of maintainers to:
    - Merge patches of owned components only.
    - Seek approvals from all maintainers before merging a patchset spanning
      multiple components.
    - Ensure that regression tests pass for all patches before merging.
    - Ensure that regression tests accompany all patch submissions.
    - Ensure the related Bug or GitHub Issue has sufficient details about the
      cause of the problem, or description of the introduction for the change.
    - Ensure that documentation is updated for a noticeable change in user
      perceivable behavior or design.
    - Encourage code unit tests from patch submitters to improve the overall
      quality of the codebase.
    - Not merge patches written by themselves until there is a +2 Code Review
      vote by other reviewers.
3. The responsibility of merging a patch into a release branch in normal
   circumstances will be that of the release maintainer's. Only in exceptional
   situations, maintainers & sub-maintainers will merge patches into a release
   branch.
4. Release maintainers will ensure approval from appropriate maintainers before
   merging a patch into a release branch.
5. Maintainers have a responsibility to the community, it is expected of
   maintainers to:
    - Facilitate the community in all aspects.
    - Be very active and visible in the community.
    - Be objective and consider the larger interests of the community ahead of
      individual interests.
    - Be receptive to user feedback.
    - Address concerns & issues affecting users.
    - Lead by example.

### Queries on Guidelines

Any questions or comments regarding these guidelines can be routed to
[gluster-devel](https://www.gluster.org/mailman/listinfo/gluster-devel/) or [slack channel](https://gluster.slack.com/).

### Patches in Github

Github can be used to list patches that need reviews and/or can get
merged from [Pull Requests](https://github.com/gluster/glusterfs/pulls)

