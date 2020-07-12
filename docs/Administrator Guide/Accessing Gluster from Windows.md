# Accessing Gluster volume via SMB Protocol

Layered product Samba is used to export the Gluster volume and ctdb
for providing the high availability Samba. Here are the steps to
configure Highly Available Samba cluster to export Gluster volume.

**Note**: These configuration steps are applicable to Samba version =
4.1.* and Gluster Version >= 3.7.* ctdb >= 2.5

## Step 1: Choose the servers that will export the Gluster volume.

The servers may/may not be part of the trusted storage
pool. Preferable number of servers is <=4. Install Samba and ctdb
packages on these servers.

## Step 2: Enable/Disable the auto export of Gluster volume via SMB

```
# gluster volume set VOLNAME user.smb disable/enable
```

## Step 3: Setup the CTDB Cluster:

1. Create a ctdb meta volume with replica N, N being the number of the
   servers that are used as Samba servers. This volume will host only
   a zero byte lock file, hence choose the minimal sized bricks. To
   create the n replica volume run the following command:

        # gluster volume create <volname> replica n <ipaddr/host name>:/<brick_patch>.... N times

2. In the following files, replace "all" in the statement "META=all"
   to the newly created volume name.

        /var/lib/glusterd/hooks/1/start/post/S29CTDBsetup.sh
        /var/lib/glusterd/hooks/1/stop/pre/S29CTDB-teardown.sh

3. Start the ctdb volume

        # gluster vol start <volname>

4. Verify the following:

    * If the following lines are added in smb.conf file in all the
      nodes running samba/ctdb:

            clustering = yes
            idmap backend = tdb2

    * If the ctdb volume is mounted at `/gluster/lock` on all the
      nodes that runs ctdb/samba
    * If the mount entry for ctdb volume is added in `/etc/fstab`
    * If file `/etc/sysconfig/ctdb` exists on all the nodes that runs
      ctdb/samba

5. Create `/etc/ctdb/nodes` files on all the nodes that runs ctdb/samba,
   and add the IPs of all these nodes in the file. For example,

        # cat /etc/ctdb/nodes
        10.16.157.0
        10.16.157.3
        10.16.157.6
        10.16.157.8
   The IPs listed here are the private IPs of Samba/ctdb servers,
   which should be a private non-routable subnet and are only used for
   internal cluster traffic. For more details refer to the ctdb man
   page.

6. Create `/etc/ctdb/public_addresses` files on all the nodes that runs
   ctdb/samba, and add the virtual IPs in the following format:

        <virtual IP><routing prefix> <node interface>
   Eg:

        # cat /etc/ctdb/public_addresses
        192.168.1.20/24 eth0
        192.168.1.21/24 eth0

7. Either uncomment `CTDB_SAMBA_SKIP_SHARE_CHECK=yes` or add
   `CTDB_SAMBA_SKIP_SHARE_CHECK=yes` in its absence inside
   `/etc/ctdb/script.options` to disable checking of the shares by
   ctdb.

8. If SELinux is enabled and enforcing, try the following command if
   ctdb fails.

        # setsebool -P use_fusefs_home_dirs 1
        # setsebool -P samba_load_libgfapi 1

## Step 4: Performance tunings before exporting the volume

1. To ensure lock and IO coherency:

        # gluster volume set VOLNAME storage.batch-fsync-delay-usec 0

2. If using Samba 4.X version add the following line in smb.conf in
   the global section

        kernel share modes = no
        kernel oplocks = no
        map archive = no
        map hidden = no
        map read only = no
        map system = no
        store dos attributes = yes
   **Note:** Setting 'store dos attributes = no' is recommended if
   archive/hidden/read-only dos attributes are not used. This can give
   better performance.

3. If you are using gluster5 or higher execute the following to
   improve performance:

        # gluster volume set VOLNAME group samba
   On older version, please execute the following:

        # gluster volume set VOLNAME features.cache-invalidation on
        # gluster volume set VOLNAME features.cache-invalidation-timeout 600
        # gluster volume set VOLNAME performance.cache-samba-metadata on
        # gluster volume set VOLNAME performance.stat-prefetch on
        # gluster volume set VOLNAME performance.cache-invalidation on
        # gluster volume set VOLNAME performance.md-cache-timeout 600
        # gluster volume set VOLNAME network.inode-lru-limit 200000
        # gluster volume set VOLNAME performance.nl-cache on
        # gluster volume set VOLNAME performance.nl-cache-timeout 600
        # gluster volume set VOLNAME performance.readdir-ahead on
        # gluster volume set VOLNAME performance.parallel-readdir on

4. Tune the number of threads in gluster for better performance:

        # gluster volume set VOLNAME client.event-threads 4
        # gluster volume set VOLNAME server.event-threads 4 # Increasing to a very high value will reduce the performance

## Step 5: Mount the volume using SMB

1. If no Active directory setup add the user on all the samba server
   and set the password

        # adduser USERNAME
        # smbpasswd -a USERNAME

2. Start the ctdb, smb and other related services:

        # systemctl re/start ctdb
        # ctdb status
        # ctdb ip
        # ctdb ping -n all

3. To verify if the volume exported by samba can be accessed by a
   user:
    
        # smbclient //<hostname>/gluster-<volname> -U <username>%<password>

4. To mount on a linux system:

        # mount -t cifs -o user=<username>,pass=<password> //<Virtual IP>/gluster-<volname> /<mountpoint>
   To mount on Windows system:

        >net use <device:> \\<Virtual IP>\gluster-<volname>
   OR
    
        \\<Virtual IP>\gluster-<volname>
   from windows explorer.
