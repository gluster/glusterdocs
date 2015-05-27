SELinux Integration
-------------------

The work here is really to get SELinux to work with gluster (saving labels on gluster inodes etc.), and most of the work is really outside Gluster. There's really not any coding involved in the gluster side, but to push for things in the SELinux project to get the right policies and code changes in the kernel to deal with FUSE based filesystems. In the process we might discover issues in the gluster side (not sure what they are) - and I would like to fix those not-yet-known problems before 3.5.