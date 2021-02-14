Development workflow of Gluster
================================

This document provides a detailed overview of the development model
followed by the GlusterFS project. For a simpler overview visit
[Simplified development workflow](./Simplified-Development-Workflow.md).

##Basics
--------

The GlusterFS development model largely revolves around the features and
functionality provided by Git version control system, Github and Jenkins
continuous integration system. It is a primer for a contributor to the project.

### Git and Github

Git is an extremely flexible, distributed version control system.
GlusterFS's main repository is at [Git](http://git.gluster.org) and at
[GitHub](https://github.com/gluster/glusterfs).
A good introduction to Git can be found at
<http://www-cs-students.stanford.edu/~blynn/gitmagic/>.

### Jenkins

Jenkins is a Continuous Integration build system. Jenkins is hosted at
<http://build.gluster.org>. Jenkins is configured to work with Github by
setting up hooks. Every "Change" which is pushed to Github is
automatically picked up by Jenkins, built and smoke tested. The output of
all builds and tests can be viewed at
<http://build.gluster.org/job/smoke/>. Jenkins is also set up with a
'regression' job which is designed to execute test scripts provided as
part of the code change.

##Preparatory Setup
-------------------

Here is a list of initial one-time steps before you can start hacking on
code.

###Fork Repository

Fork [GlusterFS repository](https://github.com/gluster/glusterfs/fork)

### Clone a working tree

Get yourself a working tree by cloning the development repository from

```console
# git clone git@github.com:${username}/glusterfs.git
# cd glusterfs/
# git remote add upstream git@github.com:gluster/glusterfs.git
```

### Preferred email and set username

On the first login, add your git/work email to your identity. You will have
to click on the URL which is sent to your email and set up a proper Full
Name. Select yourself a username. Make sure you set your git/work email
as your preferred email. This should be the email address from which all your
code commits are associated.

### Watch glusterfs

In Github, watch the 'glusterfs' repository. Tick on suitable
(All activity, Ignore, participating, or custom) type of notifications to
get alerts.

### Email filters

Set up a filter rule in your mail client to tag or classify emails with
the header
```text
list: <glusterfs.gluster.github.com>
```
as mails originating from the github system.

##Development & Other flows
---------------------------

### Issue

- Make sure there is an issue filed for the task you are working on.
- If it is not filed, open the issue with all the description.
- If it is a bug fix, add label "Type:Bug".
- If it is an RFC, provide all the documentation, and request for "DocApproved", and "SpecApproved" label.

### Code

- Start coding
- Make sure clang-format is installed and is run on the patch.

### Keep up-to-date
- GlusterFS is a large project with many developers, so there would be one or the other patch everyday.
- It is critical for developer to be up-to-date with devel repo to be Conflict-Free when PR is opened.
- Git provides many options to keep up-to-date, below is one of them

```console
# git fetch upstream
# git rebase upstream/devel
```

##Branching policy
------------------

This section describes both, the branching policies on the public repo
as well as the suggested best-practice for local branching

### Devel/release branches

In glusterfs, the 'devel' branch is the forward development branch.
This is where new features come in first. In fact this is where almost
every change (commit) comes in first. The devel branch is always kept
in a buildable state and smoke tests pass.

Release trains (3.1.z, 3.2.z,..., 8.y, 9.y) each have a branch originating from
devel. Code freeze of each new release train is marked by the creation
of the `release-x.y` branch. At this point, no new features are added to
the release-x.y branch. All fixes and commits first get into devel.
From there, only bug fixes get backported to the relevant release
branches. From the release-x.y branch, actual release code snapshots
(e.g. glusterfs-3.2.2 etc.) are tagged (git annotated tag with 'git tag
-a') shipped as a tarball.

### Personal per-task branches

As a best practice, it is recommended you perform all code changes for a
task in a local branch in your working tree. The local branch should be
created from the upstream branch to which you intend to submit the
change. The name of the branch on your personal fork can start with issueNNNN,
followed by anything of your choice. If you are submitting changes to the devel
branch, first create a local task branch like this -

```console
# git checkout -b issueNNNN upstream/main
... <hack, commit>
```

##Building
----------

### Environment Setup

For details about the required packages for the build environment
refer : [Building GlusterFS](./Building-GlusterFS.md)

### Creating build environment

Once the required packages are installed for your appropiate system,
generate the build configuration:
```console
# ./autogen.sh
# ./configure --enable-fusermount
```

### Build and install
```console
# make && make install
```

##Commit policy / PR description
--------------------------------

Typically you would have a local branch per task. You will need to
sign-off your commit (git commit -s) before sending the
patch for review. By signing off your patch, you agree to the terms
listed under the "Developer's Certificate of Origin" section in the
CONTRIBUTING file available in the repository root.

Provide a meaningful commit message. Your commit message should be in
the following format

-   A short one-line title of format 'component: title', describing what the patch accomplishes
-   An empty line following the subject
-   Situation necessitating the patch
-   Description of the code changes
-   Reason for doing it this way (compared to others)
-   Description of test cases
-   When you open a PR, having a reference Issue for the commit is mandatory in GlusterFS.
-   Commit message can have, either Fixes: #NNNN or Updates: #NNNN in a separate line in the commit message.
    Here, NNNN is the Issue ID in glusterfs repository.
-   Each commit needs the author to have the 'Signed-off-by: Name <email>' line.
    Can do this by -s option for git commit.
-   If the PR is not ready for review, apply the label work-in-progress.
    Check the availability of "Draft PR" is present for you, if yes, use that instead.

##Push the change
-----------------

After doing the local commit, it is time to submit the code for review.
There is a script available inside glusterfs.git called rfc.sh. It is
recommended you keep pushing to your repo every day, so you don't loose
any work. You can submit your changes for review by simply executing

```console
# ./rfc.sh
```
or
```console
# git push origin HEAD:issueNNN
```

This script rfc.sh does the following:

-  The first time it is executed, it downloads a git hook from
   <http://review.gluster.org/tools/hooks/commit-msg> and sets it up
   locally to generate a Change-Id: tag in your commit message (if it
   was not already generated.)
-  Rebase your commit against the latest upstream HEAD. This rebase
   also causes your commits to undergo massaging from the just
   downloaded commit-msg hook.
-  Prompt for a Reference Id for each commit (if it was not already provided)
   and include it as a "fixes: #n" tag in the commit log. You can just hit
   <enter> at this prompt if your submission is purely for review
   purposes.
-  Push the changes for review. On a successful push, you will see a URL pointing to
   the change in [Pull requests](https://github.com/gluster/glusterfs/pulls) section.

## Test cases and Verification
------------------------------

### Auto-triggered tests

The integration between Jenkins and Github triggers an event in Jenkins
on every push of changes, to pick up the change and run build and smoke
test on it.
Part of the workflow is to aggregate and execute pre-commit test cases
that accompany patches, cumulatively for every new patch. This
guarantees that tests that are working till the present are not broken
with the new patch. This is so that code changes and accompanying test
cases are reviewed together. Once you upload the patch -

1. All the required smoke tests would be auto-triggered. You can retrigger
   the smoke tests using "/recheck smoke" as comment. Passing the automated
   smoke test is a necessary condition but not sufficient.

2. The regression tests would be triggered by a comment "/run regression"
   from developers in the @gluster organization once smoke test is passed.

If smoke/regression fails, it is a good reason to skip code review till
a fixed change is pushed later. You can click on the build URL
automatically to inspect the reason for auto verification failure.
In the Jenkins job page, you can click on the 'Console Output' link to
see the exact point of failure.

All code changes which are not trivial (typo fixes, code comment
changes) must be accompanied with either a new test case script or
extend/modify an existing test case script. It is important to review
the test case in conjunction with the code change to analyze whether the
code change is actually verified by the test case.

Regression tests (i.e, execution of all test cases accumulated with
every commit) is not automatically triggered as the test cases can be
extensive and is quite expensive to execute for every change submission
in the review/resubmit cycle. Passing the regression test is a
necessary condition for merge along with code review points.

To check and run all regression tests locally, run the below script
from glusterfs root directory.

```console
# ./run-tests.sh
```

To run a single regression test locally, run the below command.

```console
# prove -vf <path_to_the_file>
```

**NOTE:** The testing framework needs perl-Test-Harness package to be installed.
Ask for help as comment in PR if you have any questions about the process!

It is important to note that Jenkins verification is only a generic
verification of high-level tests. More concentrated testing effort for
the patch is necessary with manual verification.

### Glusto test framework

For any new feature that is posted for review, there should be
accompanying set of tests in
[glusto-tests](https://github.com/gluster/glusto-tests). These
tests will be run nightly and/or before release to determine the health
of the feature. Please go through glusto-tests project to understand
more information on how to write and execute the tests in glusto.

1. Extend/Modify old test cases in existing scripts - This is typically
when present behavior (default values etc.) of code is changed.

2. No test cases - This is typically when a code change is trivial
(e.g. fixing typos in output strings, code comments).

3. Only test case and no code change - This is typically when we are
adding test cases to old code (already existing before this regression
test policy was enforced). More details on how to work with test case
scripts can be found in tests/README.

##Reviewing / Commenting
------------------------

Code review with Github is relatively easy compared to other available
tools. Each change is presented as multiple files and each file can be
reviewed in Side-by-Side mode. While reviewing it is possible to comment
on each line by clicking on '+' icon and writing in your comments in
the text box. Such in-line comments are saved as drafts, till you
finally publish them by Starting a Review.

##Incorporate, rfc.sh, Reverify
--------------------------------------

Code review comments are notified via email. After incorporating the
changes in code, you can mark each of the inline comments as 'done'
(optional). After all the changes to your local files, create new
commits in the same branch with -

```console
# git commit -a -s
```
Push the commit by executing rfc.sh. If your previous push was an "rfc"
push (i.e, without a Issue Id) you will be prompted for a Issue Id
again. You can re-push an rfc change without any other code change too
by giving a Issue Id.

On the new push, Jenkins will re-verify the new change (independent of
what the verification result was for the previous push).

It is the Change-Id line in the commit log (which does not change) that
associates the new push as an update for the old push (even though they
had different commit ids) under the same Change.

If further changes are found necessary, changes can be requested or
comments can be made on the new patch as well, and the same cycle repeats.

If no further changes are necessary, the reviewer can approve the patch.

##Submission Qualifiers
-----------------------

GlusterFS project follows 'Squash and Merge' method.

- This is mainly to preserve the historic Gerrit method of one patch in git log for one URL link.
- This also makes every merge a complete patch, which has passed all tests.

For a change to get merged, there are two qualifiers that are enforced
by the Github system. They are -

1. A change should have at approver flag from Reviewers
2. A change should have passed smoke and regression tests.

The project maintainer will merge the changes once a patch
meets these qualifiers. If you feel there is delay, feel free
to add a comment, discuss the same in Slack channel, or send email.

##Submission Disqualifiers
--------------------------

- +2 : is equivalent to "Approve" from the people in the maintainer's group.
- +1 : can be given by a maintainer/reviewer by explicitly stating that in the comment.
- -1 : provide details on required changes and pick "Request Changes" while submitting your review.
- -2 : done by adding the DO-NOT-MERGE label.

Any further discussions can happen as comments in the PR.
