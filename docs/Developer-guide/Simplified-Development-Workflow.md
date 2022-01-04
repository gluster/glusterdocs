Simplified development workflow for GlusterFS
=============================================

This page gives a simplified model of the development workflow used by
the GlusterFS project. This will give the steps required to get a patch
accepted into the GlusterFS source.

Visit [Development Work Flow](./Development-Workflow.md) a more
detailed description of the workflow.

##Initial preparation
---------------------

The GlusterFS development workflow revolves around
[GitHub](http://github.com/gluster/glusterfs/) and
[Jenkins](http://build.gluster.org).
Using these both tools requires some initial preparation.

### Get the source
Git clone the GlusterFS source using

```console
   git clone git@github.com:${username}/glusterfs.git
   cd glusterfs/
   git remote add upstream git@github.com:gluster/glusterfs.git
```
This will clone the GlusterFS source into a subdirectory named glusterfs
with the devel branch checked out.

### Dev system setup

You should install and setup Git on your development system. Use your
distribution specific package manger to install git. After installation
configure git. At the minimum, set a git user email. To set the email
do,

```console
git config --global user.name <name>
git config --global user.email <email address>
```

Next, install the build requirements for GlusterFS. Refer
[Building GlusterFS - Build Requirements](./Building-GlusterFS.md#Build Requirements)
for the actual requirements.

##Actual development
--------------------

The commands in this section are to be run inside the glusterfs source
directory.

### Create a development branch

It is recommended to use separate local development branches for each
change you want to contribute to GlusterFS. To create a development
branch, first checkout the upstream branch you want to work on and
update it. More details on the upstream branching model for GlusterFS
can be found at [Development Work Flow - Branching\_policy](./Development-Workflow.md#branching-policy).
For example if you want to develop on the devel branch,

```console
# git checkout devel
# git pull
```

Now, create a new branch from devel and switch to the new branch. It is
recommended to have descriptive branch names. Do,

```console
git branch issueNNNN
git checkout issueNNNN
```
or,
```console
git checkout -b issueNNNN upstream/main
```

to do both in one command. Here, NNNN is the Issue ID in glusterfs repository.

### Hack

Once you've switched to the development branch, you can perform the
actual code changes. [Build](./Building-GlusterFS.md) and test to
see if your changes work.

### Tests

Unless your changes are very minor and trivial, you should also add a
test for your change. Tests are used to ensure that the changes you did
are not broken inadvertently. More details on tests can be found at
[Development Workflow - Test cases](./Development-Workflow.md#test-cases)
and
[Development Workflow - Regression tests and test cases.](./Development-Workflow.md#regression-tests-and-test-cases)

### Regression test

Once your change is working, locally you can run the regression test suite
to make sure you haven't broken anything. The regression test suite requires a
working GlusterFS installation and needs to be run as root. To run the
regression test suite, do

```console
# make install
# ./run-tests.sh
```

or, After uploading the patch The regression tests would be triggered
by a comment "/run regression" from developers in the @gluster organization.

### Commit your changes

If you haven't broken anything, you can now commit your changes. First
identify the files that you modified/added/deleted using git-status and
stage these files.

```console
git status
git add <list of modified files>
```

Now, commit these changes using

```console
# git commit -s
```

Provide a meaningful commit message. The commit message policy is
described at [Development Work Flow - Commit policy](./Development-Workflow.md#commit-policy).
It is essential that you commit with the '-s' option, which will
sign-off the commit with your configured email.

### Submit for review

To submit your change for review, run the rfc.sh script,

```console
# ./rfc.sh
```
or
```console
git push origin HEAD:issueNNN
```

More details on the rfc.sh script are available at
[Development Work Flow - rfc.sh](./Development-Workflow.md#rfc.sh).

##Review process
----------------

Your change will now be reviewed by the GlusterFS maintainers and
component owners. You can follow and take part in the review process
on the change at the review url. The review process involves several steps.

To know component owners , you can check the "MAINTAINERS" file in root
of glusterfs code directory

### Automated verification

Every change submitted to github triggers an initial automated
verification on [jenkins](http://build.gluster.org) known as smoke tests.
The automated verification ensures that your change doesn't break the build
and has an associated bug-id. Developers get a chance to retrigger the smoke tests using "/recheck smoke" as comment.

More details can be found at [Development Work Flow - Auto verification](./Development-Workflow.md#auto-verification).

### Formal review

Once the auto verification is successful, the component owners will
perform a formal review. If they are okay with your change, they will
give a positive review. If not they will give a negative review and add
comments on the reasons.

More information regarding the review qualifiers and disqualifiers is
available at [Development Work Flow - Submission Qualifiers](./Development-Workflow.md#submission-qualifiers)
and
[Development Work Flow - Submission Disqualifiers](./Development-Workflow.md#submission-disqualifiers).

If your change gets a negative review, you will need to address the
comments and resubmit your change.

### Resubmission

Switch to your development branch and make new changes to address the
review comments. Build and test to see if the new changes are working.

Stage your changes and commit your new changes in new commits using,

```console
# git commit -a -s
```
Now you can resubmit the commit for review using the rfc.sh script or git push.

The formal review process could take a long time. To increase chances
for a speedy review, you can add the component owners as reviewers on
the pull request. This will ensure they notice the change. The
list of component owners can be found in the MAINTAINERS file present in
the GlusterFS source

### Verification

After a component owner has given a positive review, a developer will
run the regression test suite on your change to verify that your change
works and hasn't broken anything. This verification is done with the
help of jenkins.

If the verification fails, you will need to make necessary changes and
resubmit an updated commit for review.

### Acceptance

After successful verification, a maintainer will Squash and merge
your change into the upstream GlusterFS source. Your change
will now be available in the upstream git repo for everyone to use.
