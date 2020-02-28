# Backport Guidelines
In GlusterFS project, as a policy, any new change, bug fix, etc., are to be
fixed in 'master' branch before release branches. When a bug is fixed in
the master branch, it might be desirable or necessary in release branch.

This page describes the policy GlusterFS has regarding the backports. As
a user, or contributor, being aware of this policy would help you to
understand how to request for backport from community.

## Policy

* No feature from master would be backported to the release branch
* CVE ie., security vulnerability [(listed on the CVE database)](https://cve.mitre.org/cve/search_cve_list.html)
reported in the existing releases would be backported, after getting fixed
in master branch.
* Only topics which bring about data loss or, unavailability would be
backported to the release.
* For any other issues, the project recommends that the installation be
upgraded to a newer release where the specific bug has been addressed.
  - Gluster provides 'rolling' upgrade support, i.e., one can upgrade their
server version without stopping the application I/O, so we recommend migrating
to higher version.

## Things to pay attention to while backporting a patch.

If your patch meets the criteria above, or you are a user, who prefer to have a
fix backported, because your current setup is facing issues, below are the
steps you need to take care to submit a patch on release branch.

* The patch should have same 'Change-Id'.


### How to contact release owners?

All release owners are part of 'gluster-devel@gluster.org' mailing list.
Please write your expectation from next release there, so we can take that
to consideration while making the release.

