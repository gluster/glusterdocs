
###op-version
op-version is the operating version of the Gluster which is running.

op-version was introduced to ensure gluster running with different versions do not end up in a problem and backward compatibility issues can be tackled.

After Gluster upgrade, it is advisable to have op-version updated.

###Updating op-version

Current op-version can be queried as below:

    [root@~]#gluster volume get  <volume name> cluster.op-version

op-version can be updated as below.
For example, after upgrading to glusterfs-3.7.1, set op-version as:

    [root@~]#gluster volume set all cluster.op-version 30701

Note: 
This is not mandatory, but advisable to have updated op-version if you want to make use of latest features in the updated gluster.

