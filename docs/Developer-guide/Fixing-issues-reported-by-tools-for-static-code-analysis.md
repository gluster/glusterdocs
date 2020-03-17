Static Code Analysis Tools
--------------------------

Bug fixes for issues reported by *Static Code Analysis Tools* should
follow [Development Work Flow](./Development-Workflow.md)

### Coverity

GlusterFS is part of [Coverity's](https://scan.coverity.com/) scan
program.

-   To see Coverity issues you have to be a member of the GlusterFS
    project in Coverity scan website.
-   Here is the link to [Coverity scan
    website](https://scan.coverity.com/projects/987)
-   Go to above link and subscribe to GlusterFS project (as
    contributor). It will send a request to Admin for including you in
    the Project.
-   Once admins for the GlusterFS Coverity scan approve your request,
    you will be able to see the defects raised by Coverity.
-   [BZ 789278](https://bugzilla.redhat.com/show_bug.cgi?id=789278)
    can be used as a umbrella bug for Coverity issues in master
    branch unless you are trying to fix a specific issue.
-   When you decide to work on some issue, please assign it to your name
    in the same Coverity website. So that we don't step on each others
    work.
-   When marking a bug intentional in Coverity scan website, please put
    an explanation for the same. So that it will help others to
    understand the reasoning behind it.

*If you have more questions please send it to
[gluster-devel](https://lists.gluster.org/mailman/listinfo/gluster-devel) mailing
list*

### CPP Check

Cppcheck is available in Fedora and EL's EPEL repo

-   Install Cppcheck

        # dnf install cppcheck

-   Clone GlusterFS code

        # git clone https://github.com/gluster/glusterfs

-   Run Cpp check

        # cppcheck glusterfs/ 2>cppcheck.log


### Daily Runs

We now have daily runs of various static source code analysis tools on
the glusterfs sources. There are daily analyses of the master and 
on currently supported branches.

Results are posted at
<http://download.gluster.org/pub/gluster/glusterfs/static-analysis/>
