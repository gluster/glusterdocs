# GlusterFS upgrade from 3.5.x to 3.6.x
Now that GlusterFS 3.6.0 is out, here is the process to upgrade from
earlier installed versions of GlusterFS.

If you are using GlusterFS replication ( \< 3.6) in your setup , please
note that the new afrv2 implementation is only compatible with 3.6
GlusterFS clients. If you are not updating your clients to GlusterFS
version 3.6 you need to disable client self healing process. You can
perform this by below steps.

```console
# gluster v set testvol cluster.entry-self-heal off
volume set: success
#
# gluster v set testvol cluster.data-self-heal off
volume set: success
# gluster v set testvol cluster.metadata-self-heal off
volume set: success
#
```

### GlusterFS upgrade from 3.5.x to 3.6.x

**a) Scheduling a downtime (Recommended)**

For this approach, schedule a downtime and prevent all your clients from
accessing ( umount your volumes, stop gluster Volumes..etc)the servers.

1.  Stop all glusterd, glusterfsd and glusterfs processes on your server.
2.  Install  GlusterFS 3.6.0
3.  Start glusterd.
4.  Ensure that all started volumes have processes online in “gluster volume status”.

You would need to repeat these steps on all servers that form your
trusted storage pool.

After upgrading the servers, it is recommended to upgrade all client
installations to 3.6.0

### GlusterFS upgrade from 3.4.x to 3.6.X

Upgrade from GlusterFS 3.4.x:

GlusterFS 3.6.0 is compatible with 3.4.x (yes, you read it right!). You
can upgrade your deployment by following one of the two procedures
below.

**a) Scheduling a downtime (Recommended)**

For this approach, schedule a downtime and prevent all your clients from
accessing ( umount your volumes, stop gluster Volumes..etc)the servers.

If you have quota configured, you need to perform step 1 and 6,
otherwise you can skip it.

If you have geo-replication session running, stop the session using the
geo-rep stop command (please refer to step 1 of geo-rep upgrade steps
provided below)

1.  Execute "pre-upgrade-script-for-quota.sh" mentioned under "Upgrade Steps For Quota" section.
2.  Stop all glusterd, glusterfsd and glusterfs processes on your server.
3.  Install  GlusterFS 3.6.0
4.  Start glusterd.
5.  Ensure that all started volumes have processes online in “gluster volume status”.
6.  Execute "Post-Upgrade Script" mentioned under "Upgrade Steps For Quota" section.

You would need to repeat these steps on all servers that form your
trusted storage pool.

To upgrade geo-replication session, please refer to geo-rep upgrade
steps provided below (from step 2)

After upgrading the servers, it is recommended to upgrade all client
installations to 3.6.0.

Do report your findings on 3.6.0 in gluster-users, \#gluster on Freenode
and bugzilla.

Please note that this may not work for all installations & upgrades. If
you notice anything amiss and would like to see it covered here, please
point the same.

### **Upgrade Steps For Quota**

The upgrade process for quota involves executing two upgrade scripts:

1.  pre-upgrade-script-for-quota.sh, and\
2.  post-upgrade-script-for-quota.sh

*Pre-Upgrade Script:*

What it does:

The pre-upgrade script (pre-upgrade-script-for-quota.sh) iterates over
the list of volumes that have quota enabled and captures the configured
quota limits for each such volume in a file under
/var/tmp/glusterfs/quota-config-backup/vol\_\<VOLNAME\> by executing
'quota list' command on each one of them.

Pre-requisites for running Pre-Upgrade Script:

1.  Make sure glusterd and the brick processes are running on all nodes
    in the cluster.
2.  The pre-upgrade script must be run prior to upgradation.
3.  The pre-upgrade script must be run on only one of the nodes in the
    cluster.

Location:

pre-upgrade-script-for-quota.sh must be retrieved from the source tree
under the 'extras' directory.

Invocation:

Invoke the script by executing \`./pre-upgrade-script-for-quota.sh\`
from the shell on any one of the nodes in the cluster.

Example:

```console
[root@server1 extras]#./pre-upgrade-script-for-quota.sh
```

*Post-Upgrade Script:*

What it does:

The post-upgrade script (post-upgrade-script-for-quota.sh) picks the
volumes that have quota enabled.

Because the cluster must be operating at op-version 3 for quota to work,
the 'default-soft-limit' for each of these volumes is set to 80% (which
is its default value) via \`volume set\` operation as an explicit
trigger to bump up the op-version of the cluster and also to trigger a
re-write of volfiles which knocks quota off client volume file.

Once this is done, these volumes are started forcefully using \`volume
start force\` to launch the Quota Daemon on all the nodes.

Thereafter, for each of these volumes, the paths and the limits
configured on them are retrieved from the backed up file
/var/tmp/glusterfs/quota-config-backup/vol\_\<VOLNAME\> and limits are
set on them via the \`quota limit-usage\` interface.

Note:

In the new version of quota, the command \`quota limit-usage\` will fail
if the directory on which quota limit is to be set for a given volume
does not exist. Therefore, it is advised that you create these
directories first before running post-upgrade-script-for-quota.sh if you
want limits to be set on these directories.

Pre-requisites for running Post-Upgrade Script:

1.  The post-upgrade script must be executed after all the nodes in the
    cluster have upgraded.
2.  Also, all the clients accessing the given volume must also be
    upgraded before the script is run.
3.  Make sure glusterd and the brick processes are running on all nodes
    in the cluster post upgrade.
4.  The script must be run from the same node where the pre-upgrade
    script was run.

Location:

post-upgrade-script-for-quota.sh can be found under the 'extras'
directory of the source tree for glusterfs.

Invocation:

post-upgrade-script-for-quota.sh takes one command line argument. This
argument could be one of the following: ''the name of the volume which
has quota enabled; or' '' 'all'.''

In the first case, invoke post-upgrade-script-for-quota.sh from the
shell for each volume with quota enabled, with the name of the volume
passed as an argument in the command-line:

Example:

*For a volume "vol1" on which quota is enabled, invoke the script in the following way:*

```console
[root@server1 extras]#./post-upgrade-script-for-quota.sh vol1
```

In the second case, the post-upgrade script picks on its own, the
volumes on which quota is enabled, and executes the post-upgrade
procedure on each one of them. In this case, invoke
post-upgrade-script-for-quota.sh from the shell with 'all' passed as an
argument in the command-line:

Example:

```console
[root@server1 extras]#./post-upgrade-script-for-quota.sh all
```

Note:

In the second case, post-upgrade-script-for-quota.sh exits prematurely
upon failure to ugprade any given volume. In that case, you may run
post-upgrade-script-for-quota.sh individually (using the volume name as
command line argument) on this volume and also on all volumes appearing
after this volume in the output of \`gluster volume list\`, that have
quota enabled.

The backed up files under /var/tmp/glusterfs/quota-config-backup/ are
retained after the post-upgrade procedure for reference.

### **Upgrade steps for geo replication:**

Here are the steps to upgrade your existing geo-replication setup to new
distributed geo-replication in glusterfs-3.5. The new version leverges
all the nodes in your master volume and provides better performace.

Note:

Since new version of geo-rep very much different from the older one,
this has to be done offline.

New version supports only syncing between two gluster volumes via
ssh+gluster.

This doc deals with upgrading geo-rep. So upgrading the volumes are not
covered in detail here.

**Below are the steps to upgrade:**

​1.  Stop the geo-replication session in older version ( \< 3.5) using
the below command

        # gluster volume geo-replication `<master_vol>` `<slave_host>`::`<slave_vol>` stop

​2. Now since the new geo-replication requires gfids of master and slave
volume to be same, generate a file containing the gfids of all the files
in master

        # cd /usr/share/glusterfs/scripts/ ;
        # bash generate-gfid-file.sh localhost:`<master_vol>` $PWD/get-gfid.sh    /tmp/master_gfid_file.txt ;
        # scp /tmp/master_gfid_file.txt root@`<slave_host>`:/tmp

​3. Now go to the slave host and aplly the gfid to the slave volume.

        # cd /usr/share/glusterfs/scripts/
        # bash slave-upgrade.sh localhost:`<slave_vol>` /tmp/master_gfid_file.txt    $PWD/gsync-sync-gfid

This will ask you for password of all the nodes in slave cluster. Please
provide them, if asked.

​4. Also note that this will restart your slave gluster volume (stop and
start)

​5. Now create and start the geo-rep session between master and slave.
For instruction on creating new geo-rep seesion please refer
distributed-geo-rep admin guide.

        # gluster volume geo-replication `<master_volume>` `<slave_host>`::`<slave_volume>` create push-pem force
        # gluster volume geo-replication `<master_volume>` `<slave_host>`::`<slave_volume>` start

​6. Now your session is upgraded to use distributed-geo-rep
