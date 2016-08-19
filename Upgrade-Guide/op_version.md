
###op-version
op-version is the operating version of the Gluster which is running.

After Gluster upgrade, it is advisable to have op-version updated.

###Updating op-version

Current op-version can be queried as below:

    [root@~]#gluster volume get  <volume name> cluster.op-version

op-version can be updated as below.
For example, after upgrading to glusterfs-3.7.1, set op-version as:

    [root@~]#gluster volume set all cluster.op-version 30701

Note: 
This is not mandatory, but advisable to have updated op-version if you wants to make use of latest features in the updated gluster.

### Understanding op-version

The op-version for a given X.Y.Z release will be an integer XYZ, with
Y and Z 2 digit always 2 digits wide and padded with 0 when needed. This
should allow for some gaps between two Y releases for backports of features
in Z releases.
So, for glusterfs-X.Y.Z, the op-version is X0Y0Z.

For example, glusterfs-3.7.1, the op-version is 30701.
