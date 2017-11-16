Bugs often get fixed in master before release branches. When a bug is
fixed in the master branch, it might be desirable or necessary in a
stable branch. To put the fix in the stable branch we need to backport the
fix to the stable branch.

Anyone in the community can suggest a backport. If you are interested to
suggest a backport, please check the [Backport
Wishlist](./Backport-Wishlist.md).

This page describes the steps needed to backport simple changes. Changes
that do not apply cleanly will need some manual modifications and using
`git cherry-pick` may not always be the easiest solution.

## via Git command-line
1.  Git clone the GlusterFS code

                git clone ssh://username@review.gluster.org/glusterfs

2.  Create and checkout a new branch for your work, based on the branch
    for the backport version

                git checkout -t -b bug-123456/release-3.8 origin/release-3.8

3.  Cherry pick the change from the master branch.

                $ git cherry-pick -x a0b1c2d3e4f5
 -   verify that the change has been merged into the master branch.

4.  Update/correct the commit message.

                $ git commit -s --amend --date="$(date)"
[This is one example](https://github.com/gluster/glusterfs/commit/40407afb529f6e5fa2f79e9778c2f527122d75eb) of the commit message that has a good description for a backport. Notice the indention of the patch-metadata like BUG, Change-ID and Reviewed-on tags. There is also the original commit-id that was cherry-picked from the master branch.
 -make sure to quote the review tags
 -update the BUG reference, point to the BUG that is used for this
particular release-branch
 -add a Signed-off-by tag

5.  Run `./rfc.sh` to post the backport for review.

                ./rfc.sh

## via Gerrit web interface
1. Navigate to the required change in Gerrit from any web browser.

2. Click on 'Cherry Pick' button. You will now be presented with a dialogue box with two editable fields. First
   one is to specify the branch to which this particular change needs to be
cherry-picked and second one for modifying the already existing commit message.

3. Start entering the branch name in the corresponding field and you can select
   the required branch from the list of available branches.

4. Make sure that you only edit the following from the commit message:

   * BUG: Replace with the correct bug-id reported against the branch to which change is going to be backported.
   * Prefix all other lines except the commit message, Signed-off-by, cherry-picked and Change-Id lines with a greater than symbol and a whitespace '> ' and re-arrange as a whole to have the following format:

                <commit message>
                . . .
                </commit message>

                > Reviewed-on: http://review.gluster.org/<change-number>
                > Smoke: Gluster Build System <jenkins@build.gluster.com>
                > CentOS-regression: Gluster Build System <jenkins@build.gluster.com>
                > NetBSD-regression: NetBSD Build System <jenkins@build.gluster.org>
                > Reviewed-by: username1 <user1@example.com>
                > Reviewed-by: username2 <user2@domain.com>
                > Reviewed-by: username3 <user3@abcd.com>

                (cherry picked from commit <hash-key>)

                Change-Id: <change-id>
                BUG: <bug-id>
                Signed-off-by: username <user@example.com>

5. Click on 'Cherry Pick Change'. You will now be re-directed to the new change URL.

6. Click on the edit button adjacent to the field named 'Topic'.

7. Add the following as 'Topic':

        bug-<bug-id>
   Note:- Replace <bug-id> with the required bug-id for that branch.

8. Click on 'Update' or 'Submit'.

After submitting the patch(es), make sure to move the bug to the *POST*
status.
