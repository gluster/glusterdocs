# Managing GlusterFS Volumes

This section describes how to perform common GlusterFS management
operations, including the following:

- [Tuning Volume Options](#tuning-options)
- [Configuring Transport Types for a Volume](#configuring-transport-types-for-a-volume)
- [Expanding Volumes](#expanding-volumes)
- [Shrinking Volumes](#shrinking-volumes)
- [Replacing Bricks](#replace-brick)
- [Rebalancing Volumes](#rebalancing-volumes)
- [Stopping Volumes](#stopping-volumes)
- [Deleting Volumes](#deleting-volumes)
- [Triggering Self-Heal on Replicate](#triggering-self-heal-on-replicate)
- [Non Uniform File Allocation(NUFA)](#non-uniform-file-allocation)

<a name="tuning-options"></a>
## Tuning Volume Options

You can tune volume options, as needed, while the cluster is online and
available.

> **Note**
>
> It is recommended to set server.allow-insecure option to ON if
> there are too many bricks in each volume or if there are too many
> services which have already utilized all the privileged ports in the
> system. Turning this option ON allows ports to accept/reject messages
> from insecure ports. So, use this option only if your deployment
> requires it.

Tune volume options using the following command:

`# gluster volume set <VOLNAME> <OPT-NAME> <OPT-VALUE>`

For example, to specify the performance cache size for test-volume:

    # gluster volume set test-volume performance.cache-size 256MB
    Set volume successful

The following table lists the Volume options along with its
description and default value:

> **Note**
>
> The default options given here are subject to modification at any
> given time and may not be the same for all versions.

Option | Description | Default Value | Available Options
--- | --- | --- | ---
auth.allow | IP addresses of the clients which should be allowed to access the volume. | \* (allow all) | Valid IP address which includes wild card patterns including \*, such as 192.168.1.\*
auth.reject | IP addresses of the clients which should be denied to access the volume. | NONE (reject none)  | Valid IP address which includes wild card patterns including \*, such as 192.168.2.\*
client.grace-timeout | Specifies the duration for the lock state to be maintained on the client after a network disconnection. | 10 | 10 - 1800 secs
cluster.self-heal-window-size | Specifies the maximum number of blocks per file on which self-heal would happen simultaneously. | 16 | 0 - 1025 blocks
cluster.data-self-heal-algorithm | Specifies the type of self-heal. If you set the option as "full", the entire file is copied from source to destinations. If the option is set to "diff" the file blocks that are not in sync are copied to destinations. Reset uses a heuristic model. If the file does not exist on one of the subvolumes, or a zero-byte file exists (created by entry self-heal) the entire content has to be copied anyway, so there is no benefit from using the "diff" algorithm. If the file size is about the same as page size, the entire file can be read and written with a few operations, which will be faster than "diff" which has to read checksums and then read and write. | reset | full/diff/reset
cluster.min-free-disk | Specifies the percentage of disk space that must be kept free. Might be useful for non-uniform bricks | 10% | Percentage of required minimum free disk space
cluster.stripe-block-size | Specifies the size of the stripe unit that will be read from or written to. | 128 KB (for all files) | size in bytes
cluster.self-heal-daemon | Allows you to turn-off proactive self-heal on replicated | On | On/Off
cluster.ensure-durability | This option makes sure the data/metadata is durable across abrupt shutdown of the brick. | On | On/Off
diagnostics.brick-log-level | Changes the log-level of the bricks. | INFO | DEBUG/WARNING/ERROR/CRITICAL/NONE/TRACE
diagnostics.client-log-level  |  Changes the log-level of the clients. | INFO | DEBUG/WARNING/ERROR/CRITICAL/NONE/TRACE
diagnostics.latency-measurement | Statistics related to the latency of each operation would be tracked. | Off | On/Off
diagnostics.dump-fd-stats | Statistics related to file-operations would be tracked. | Off | On
features.read-only | Enables you to mount the entire volume as read-only for all the clients (including NFS clients) accessing it. | Off | On/Off
features.lock-heal | Enables self-healing of locks when the network disconnects. | On | On/Off
features.quota-timeout | For performance reasons, quota caches the directory sizes on client. You can set timeout indicating the maximum duration of directory sizes in cache, from the time they are populated, during which they are considered valid | 0 |  0 - 3600 secs
geo-replication.indexing | Use this option to automatically sync the changes in the filesystem from Master to Slave. | Off | On/Off
network.frame-timeout | The time frame after which the operation has to be declared as dead, if the server does not respond for a particular operation. | 1800 (30 mins) | 1800 secs
network.ping-timeout | The time duration for which the client waits to check if the server is responsive. When a ping timeout happens, there is a network disconnect between the client and server. All resources held by server on behalf of the client get cleaned up. When a reconnection happens, all resources will need to be re-acquired before the client can resume its operations on the server. Additionally, the locks will be acquired and the lock tables updated. This reconnect is a very expensive operation and should be avoided. | 42 Secs | 42 Secs
nfs.enable-ino32 | For 32-bit nfs clients or applications that do not support 64-bit inode numbers or large files, use this option from the CLI to make Gluster NFS return 32-bit inode numbers instead of 64-bit inode numbers. | Off | On/Off
nfs.volume-access | Set the access type for the specified sub-volume. | read-write |  read-write/read-only
nfs.trusted-write | If there is an UNSTABLE write from the client, STABLE flag will be returned to force the client to not send a COMMIT request. In some environments, combined with a replicated GlusterFS setup, this option can improve write performance. This flag allows users to trust Gluster replication logic to sync data to the disks and recover when required. COMMIT requests if received will be handled in a default manner by fsyncing. STABLE writes are still handled in a sync manner. | Off | On/Off
nfs.trusted-sync | All writes and COMMIT requests are treated as async. This implies that no write requests are guaranteed to be on server disks when the write reply is received at the NFS client. Trusted sync includes trusted-write behavior. | Off | On/Off
nfs.export-dir | This option can be used to export specified comma separated subdirectories in the volume. The path must be an absolute path. Along with path allowed list of IPs/hostname can be associated with each subdirectory. If provided connection will allowed only from these IPs. Format: \<dir\>[(hostspec[hostspec...])][,...]. Where hostspec can be an IP address, hostname or an IP range in CIDR notation. **Note**: Care must be taken while configuring this option as invalid entries and/or unreachable DNS servers can introduce unwanted delay in all the mount calls. | No sub directory exported. | Absolute path with allowed list of IP/hostname
nfs.export-volumes | Enable/Disable exporting entire volumes, instead if used in conjunction with nfs3.export-dir, can allow setting up only subdirectories as exports. | On | On/Off
nfs.rpc-auth-unix | Enable/Disable the AUTH\_UNIX authentication type. This option is enabled by default for better interoperability. However, you can disable it if required. | On | On/Off
nfs.rpc-auth-null | Enable/Disable the AUTH\_NULL authentication type. It is not recommended to change the default value for this option. | On | On/Off
nfs.rpc-auth-allow\<IP- Addresses\> | Allow a comma separated list of addresses and/or hostnames to connect to the server. By default, all clients are disallowed. This allows you to define a general rule for all exported volumes. | Reject All | IP address or Host name
nfs.rpc-auth-reject\<IP- Addresses\> | Reject a comma separated list of addresses and/or hostnames from connecting to the server. By default, all connections are disallowed. This allows you to define a general rule for all exported volumes. | Reject All | IP address or Host name
nfs.ports-insecure | Allow client connections from unprivileged ports. By default only privileged ports are allowed. This is a global setting in case insecure ports are to be enabled for all exports using a single option. | Off | On/Off
nfs.addr-namelookup | Turn-off name lookup for incoming client connections using this option. In some setups, the name server can take too long to reply to DNS queries resulting in timeouts of mount requests. Use this option to turn off name lookups during address authentication. Note, turning this off will prevent you from using hostnames in rpc-auth.addr.\* filters. | On | On/Off
nfs.register-with-portmap | For systems that need to run multiple NFS servers, you need to prevent more than one from registering with portmap service. Use this option to turn off portmap registration for Gluster NFS. | On | On/Off
nfs.port \<PORT- NUMBER\> | Use this option on systems that need Gluster NFS to be associated with a non-default port number. | NA | 38465- 38467
nfs.disable | Turn-off volume being exported by NFS | Off | On/Off
performance.write-behind-window-size | Size of the per-file write-behind buffer. | 1MB | Write-behind cache size
performance.io-thread-count | The number of threads in IO threads translator. | 16 | 0-65
performance.flush-behind | If this option is set ON, instructs write-behind translator to perform flush in background, by returning success (or any errors, if any of previous writes were failed) to application even before flush is sent to backend filesystem. | On | On/Off
performance.cache-max-file-size | Sets the maximum file size cached by the io-cache translator. Can use the normal size descriptors of KB, MB, GB,TB or PB (for example, 6GB). Maximum size uint64. | 2 ^ 64 -1 bytes | size in bytes
performance.cache-min-file-size | Sets the minimum file size cached by the io-cache translator. Values same as "max" above | 0B | size in bytes
performance.cache-refresh-timeout | The cached data for a file will be retained till 'cache-refresh-timeout' seconds, after which data re-validation is performed. | 1s | 0-61
performance.cache-size | Size of the read cache. | 32 MB |  size in bytes
server.allow-insecure | Allow client connections from unprivileged ports. By default only privileged ports are allowed. This is a global setting in case insecure ports are to be enabled for all exports using a single option. | On | On/Off
server.grace-timeout | Specifies the duration for the lock state to be maintained on the server after a network disconnection. | 10 | 10 - 1800 secs
server.statedump-path | Location of the state dump file. | tmp directory of the brick |  New directory path
storage.health-check-interval | Number of seconds between health-checks done on the filesystem that is used for the brick(s). Defaults to 30 seconds, set to 0 to disable. | tmp directory of the brick |  New directory path

You can view the changed volume options using command:

`# gluster volume info`

<a name="configuring-transport-types-for-a-volume"></a>
## Configuring Transport Types for a Volume

A volume can support one or more transport types for communication between clients and brick processes.
There are three types of supported transport, which are tcp, rdma, and tcp,rdma.

To change the supported transport types of a volume, follow the procedure:

1.  Unmount the volume on all the clients using the following command:

    `# umount mount-point`

2.  Stop the volumes using the following command:

    `# gluster volume stop <VOLNAME>`

3.  Change the transport type. For example, to enable both tcp and rdma execute the followimg command:

    `# gluster volume set test-volume config.transport tcp,rdma OR tcp OR rdma`

4.  Mount the volume on all the clients. For example, to mount using rdma transport, use the following command:

    `# mount -t glusterfs -o transport=rdma server1:/test-volume /mnt/glusterfs`

<a name="expanding-volumes"></a>
## Expanding Volumes

You can expand volumes, as needed, while the cluster is online and
available. For example, you might want to add a brick to a distributed
volume, thereby increasing the distribution and adding to the capacity
of the GlusterFS volume.

Similarly, you might want to add a group of bricks to a distributed
replicated volume, increasing the capacity of the GlusterFS volume.

> **Note**
>
> When expanding distributed replicated and distributed dispersed volumes,
> you need to add a number of bricks that is a multiple of the replica
> or disperse count. For example, to expand a distributed replicated
> volume with a replica count of 2, you need to add bricks in multiples
> of 2 (such as 4, 6, 8, etc.).

**To expand a volume**

1.  If they are not already part of the TSP, probe the servers which contain the bricks you
    want to add to the volume using the following command:

    `# gluster peer probe <SERVERNAME>`

    For example:

        # gluster peer probe server4
        Probe successful

2.  Add the brick using the following command:

    `# gluster volume add-brick <VOLNAME> <NEW-BRICK>`

    For example:

        # gluster volume add-brick test-volume server4:/exp4
        Add Brick successful

3.  Check the volume information using the following command:

    `# gluster volume info <VOLNAME>`

    The command displays information similar to the following:

        Volume Name: test-volume
        Type: Distribute
        Status: Started
        Number of Bricks: 4
        Bricks:
        Brick1: server1:/exp1
        Brick2: server2:/exp2
        Brick3: server3:/exp3
        Brick4: server4:/exp4

4.  Rebalance the volume to ensure that files are distributed to the
    new brick.

    You can use the rebalance command as described in [Rebalancing Volumes](#rebalancing-volumes)

<a name="shrinking-volumes"></a>
## Shrinking Volumes

You can shrink volumes, as needed, while the cluster is online and
available. For example, you might need to remove a brick that has become
inaccessible in a distributed volume due to hardware or network failure.

> **Note**
>
> Data residing on the brick that you are removing will no longer be
> accessible at the Gluster mount point. Note however that only the
> configuration information is removed - you can continue to access the
> data directly from the brick, as necessary.

When shrinking distributed replicated and distributed dispersed volumes,
you need to remove a number of bricks that is a multiple of the replica
or stripe count. For example, to shrink a distributed replicate volume
with a replica count of 2, you need to remove bricks in multiples of 2
(such as 4, 6, 8, etc.). In addition, the bricks you are trying to
remove must be from the same sub-volume (the same replica or disperse
set).

Running remove-brick with the _start_ option will automatically trigger a rebalance
operation to migrate data from the removed-bricks to the rest of the volume.

**To shrink a volume**

1.  Remove the brick using the following command:

    `# gluster volume remove-brick <VOLNAME> <BRICKNAME> start`

    For example, to remove server2:/exp2:

        # gluster volume remove-brick test-volume server2:/exp2 start
        volume remove-brick start: success

2.  View the status of the remove brick operation using the
    following command:

    `# gluster volume remove-brick <VOLNAME> <BRICKNAME> status`

    For example, to view the status of remove brick operation on
    server2:/exp2 brick:

        # gluster volume remove-brick test-volume server2:/exp2 status
                                        Node  Rebalanced-files  size  scanned       status
                                   ---------  ----------------  ----  -------  -----------
        617c923e-6450-4065-8e33-865e28d9428f               34   340      162   in progress

3.  Once the status displays "completed", commit the remove-brick operation

        # gluster volume remove-brick <VOLNAME> <BRICKNAME> commit

    In this example:

        # gluster volume remove-brick test-volume server2:/exp2 commit
        Removing brick(s) can result in data loss. Do you want to Continue? (y/n) y
        volume remove-brick commit: success
        Check the removed bricks to ensure all files are migrated.
        If files with data are found on the brick path, copy them via a gluster mount point before re-purposing the removed brick.

4.  Check the volume information using the following command:

    `# gluster volume info `

    The command displays information similar to the following:

        # gluster volume info
        Volume Name: test-volume
        Type: Distribute
        Status: Started
        Number of Bricks: 3
        Bricks:
        Brick1: server1:/exp1
        Brick3: server3:/exp3
        Brick4: server4:/exp4


<a name="replace-brick"></a>
## Replace faulty brick

**Replacing a brick in a *pure* distribute volume**

To replace a brick on a distribute only volume, add the new brick and then remove the brick you want to replace. This will trigger a rebalance operation which will move data from the removed brick.

> NOTE: Replacing a brick using the 'replace-brick' command in gluster is supported only for distributed-replicate or *pure* replicate volumes.

Steps to remove brick Server1:/home/gfs/r2_1 and add Server1:/home/gfs/r2_2:

1.  Here is the initial volume configuration:

        Volume Name: r2
        Type: Distribute
        Volume ID: 25b4e313-7b36-445d-b524-c3daebb91188
        Status: Started
        Number of Bricks: 2
        Transport-type: tcp
        Bricks:
        Brick1: Server1:/home/gfs/r2_0
        Brick2: Server1:/home/gfs/r2_1


2.  Here are the files that are present on the mount:


        # ls
        1  10  2  3  4  5  6  7  8  9

3.  Add the new brick - Server1:/home/gfs/r2_2 now:

        # gluster volume add-brick r2 Server1:/home/gfs/r2_2
        volume add-brick: success

4.  Start remove-brick using the following command:

        # gluster volume remove-brick r2 Server1:/home/gfs/r2_1 start
        volume remove-brick start: success
        ID: fba0a488-21a4-42b7-8a41-b27ebaa8e5f4

5.  Wait until remove-brick status indicates that it is complete.


        # gluster volume remove-brick r2 Server1:/home/gfs/r2_1 status
                                        Node Rebalanced-files          size       scanned      failures       skipped               status   run time in secs
                                   ---------      -----------   -----------   -----------   -----------   -----------         ------------     --------------
                                   localhost                5       20Bytes            15             0             0            completed               0.00


6.  Now we can safely remove the old brick, so commit the changes:

        # gluster volume remove-brick r2 Server1:/home/gfs/r2_1 commit
        Removing brick(s) can result in data loss. Do you want to Continue? (y/n) y
        volume remove-brick commit: success

7.  Here is the new volume configuration.

        Volume Name: r2
        Type: Distribute
        Volume ID: 25b4e313-7b36-445d-b524-c3daebb91188
        Status: Started
        Number of Bricks: 2
        Transport-type: tcp
        Bricks:
        Brick1: Server1:/home/gfs/r2_0
        Brick2: Server1:/home/gfs/r2_2

8.  Check the contents of the mount:

        # ls
        1  10  2  3  4  5  6  7  8  9

**Replacing bricks in Replicate/Distributed Replicate volumes**

This section of the document describes how brick: `Server1:/home/gfs/r2_0` is replaced with brick: `Server1:/home/gfs/r2_5` in volume `r2` with replica count `2`.

        Volume Name: r2
        Type: Distributed-Replicate
        Volume ID: 24a0437a-daa0-4044-8acf-7aa82efd76fd
        Status: Started
        Number of Bricks: 2 x 2 = 4
        Transport-type: tcp
        Bricks:
        Brick1: Server1:/home/gfs/r2_0
        Brick2: Server2:/home/gfs/r2_1
        Brick3: Server1:/home/gfs/r2_2
        Brick4: Server2:/home/gfs/r2_3


Steps:

1.  Make sure there is no data in the new brick Server1:/home/gfs/r2_5
2.  Check that all the bricks are running. It is okay if the brick that is going to be replaced is down.
3.  Bring the brick that is going to be replaced down if not already.

    -  Get the pid of the brick by executing 'gluster volume <volname> status'

            # gluster volume status
            Status of volume: r2
            Gluster process                        Port    Online    Pid
            ------------------------------------------------------------------------------
            Brick Server1:/home/gfs/r2_0            49152    Y    5342
            Brick Server2:/home/gfs/r2_1            49153    Y    5354
            Brick Server1:/home/gfs/r2_2            49154    Y    5365
            Brick Server2:/home/gfs/r2_3            49155    Y    5376

    -  Login to the machine where the brick is running and kill the brick.

            # kill -15 5342

    -  Confirm that the brick is not running anymore and the other bricks are running fine.

            # gluster volume status
            Status of volume: r2
            Gluster process                        Port    Online    Pid
            ------------------------------------------------------------------------------
            Brick Server1:/home/gfs/r2_0            N/A      N    5342 <<---- brick is not running, others are running fine.
            Brick Server2:/home/gfs/r2_1            49153    Y    5354
            Brick Server1:/home/gfs/r2_2            49154    Y    5365
            Brick Server2:/home/gfs/r2_3            49155    Y    5376

4.  Using the gluster volume fuse mount (In this example: `/mnt/r2`) set up metadata so that data will be synced to new brick (In this case it is from `Server1:/home/gfs/r2_1` to `Server1:/home/gfs/r2_5`)

    -  Create a directory on the mount point that doesn't already exist. Then delete that directory, do the same for metadata changelog by doing setfattr. This operation marks the pending changelog which will tell self-heal damon/mounts to perform self-heal from `/home/gfs/r2_1` to `/home/gfs/r2_5`.

            mkdir /mnt/r2/<name-of-nonexistent-dir>
            rmdir /mnt/r2/<name-of-nonexistent-dir>
            setfattr -n trusted.non-existent-key -v abc /mnt/r2
            setfattr -x trusted.non-existent-key  /mnt/r2

    -  Check that there are pending xattrs on the replica of the brick that is being replaced:

            getfattr -d -m. -e hex /home/gfs/r2_1
            # file: home/gfs/r2_1
            security.selinux=0x756e636f6e66696e65645f753a6f626a6563745f723a66696c655f743a733000
            trusted.afr.r2-client-0=0x000000000000000300000002 <<---- xattrs are marked from source brick Server2:/home/gfs/r2_1
            trusted.afr.r2-client-1=0x000000000000000000000000
            trusted.gfid=0x00000000000000000000000000000001
            trusted.glusterfs.dht=0x0000000100000000000000007ffffffe
            trusted.glusterfs.volume-id=0xde822e25ebd049ea83bfaa3c4be2b440

5.  Volume heal info will show that '/' needs healing.(There could be more entries based on the work load. But '/' must exist)

            # gluster volume heal r2 info
            Brick Server1:/home/gfs/r2_0
            Status: Transport endpoint is not connected

            Brick Server2:/home/gfs/r2_1
            /
            Number of entries: 1

            Brick Server1:/home/gfs/r2_2
            Number of entries: 0

            Brick Server2:/home/gfs/r2_3
            Number of entries: 0

6.  Replace the brick with 'commit force' option. Please note that other variants of replace-brick command are not supported.

    -  Execute replace-brick command

            # gluster volume replace-brick r2 Server1:/home/gfs/r2_0 Server1:/home/gfs/r2_5 commit force
            volume replace-brick: success: replace-brick commit successful

    -  Check that the new brick is now online

            # gluster volume status
            Status of volume: r2
            Gluster process                        Port    Online    Pid
            ------------------------------------------------------------------------------
            Brick Server1:/home/gfs/r2_5            49156    Y    5731 <<<---- new brick is online
            Brick Server2:/home/gfs/r2_1            49153    Y    5354
            Brick Server1:/home/gfs/r2_2            49154    Y    5365
            Brick Server2:/home/gfs/r2_3            49155    Y    5376

    -  Users can track the progress of self-heal using: `gluster volume heal [volname] info`.
      Once self-heal completes the changelogs will be removed.

            # getfattr -d -m. -e hex /home/gfs/r2_1
            getfattr: Removing leading '/' from absolute path names
            # file: home/gfs/r2_1
            security.selinux=0x756e636f6e66696e65645f753a6f626a6563745f723a66696c655f743a733000
            trusted.afr.r2-client-0=0x000000000000000000000000 <<---- Pending changelogs are cleared.
            trusted.afr.r2-client-1=0x000000000000000000000000
            trusted.gfid=0x00000000000000000000000000000001
            trusted.glusterfs.dht=0x0000000100000000000000007ffffffe
            trusted.glusterfs.volume-id=0xde822e25ebd049ea83bfaa3c4be2b440

    -  `# gluster volume heal <VOLNAME> info` will show that no heal is required.

            # gluster volume heal r2 info
            Brick Server1:/home/gfs/r2_5
            Number of entries: 0

            Brick Server2:/home/gfs/r2_1
            Number of entries: 0

            Brick Server1:/home/gfs/r2_2
            Number of entries: 0

            Brick Server2:/home/gfs/r2_3
            Number of entries: 0

<a name="rebalancing-volumes"></a>
## Rebalancing Volumes

After expanding a volume using the add-brick command, you may need to rebalance the data
among the servers. New directories created after expanding or shrinking
of the volume will be evenly distributed automatically. For all the
existing directories, the distribution can be fixed by rebalancing the
layout and/or data.

This section describes how to rebalance GlusterFS volumes in your
storage environment, using the following common scenarios:

-   **Fix Layout** - Fixes the layout to use the new volume topology so that files can
    be distributed to newly added nodes.

-   **Fix Layout and Migrate Data** - Rebalances volume by fixing the layout
    to use the new volume topology and migrating the existing data.

### Rebalancing Volume to Fix Layout Changes

Fixing the layout is necessary because the layout structure is static
for a given directory. Even after new bricks are added to the volume, newly created
files in existing directories will still be distributed only among the original bricks.
The command `gluster volume rebalance <volname> fix-layout start` will fix the
layout information so that the files can be created on the newly added bricks.
When this command is issued, all the file stat information which is
already cached will get revalidated.

As of GlusterFS 3.6, the assignment of files to bricks will take into account
the sizes of the bricks.  For example, a 20TB brick will be assigned twice as
many files as a 10TB brick.  In versions before 3.6, the two bricks were
treated as equal regardless of size, and would have been assigned an equal
share of files.

A fix-layout rebalance will only fix the layout changes and does not
migrate data. If you want to migrate the existing data, 
use `gluster volume rebalance <volume> start` command to rebalance data among
the servers.

**To rebalance a volume to fix layout**

-   Start the rebalance operation on any Gluster server using the
    following command:

    `# gluster volume rebalance <VOLNAME> fix-layout start`

    For example:

        # gluster volume rebalance test-volume fix-layout start
        Starting rebalance on volume test-volume has been successful

### Rebalancing Volume to Fix Layout and Migrate Data

After expanding a volume using the add-brick respectively, you need to rebalance the data
among the servers. A remove-brick command will automatically trigger a rebalance.

**To rebalance a volume to fix layout and migrate the existing data**

-   Start the rebalance operation on any one of the server using the
    following command:

    `# gluster volume rebalance <VOLNAME> start`

    For example:

        # gluster volume rebalance test-volume start
        Starting rebalancing on volume test-volume has been successful

-   Start the migration operation forcefully on any one of the servers
    using the following command:

    `# gluster volume rebalance <VOLNAME> start force`

    For example:

        # gluster volume rebalance test-volume start force
        Starting rebalancing on volume test-volume has been successful

A rebalance operation will attempt to balance the diskusage across nodes, therefore it will skip 
files where the move will result in a less balanced volume. This leads to link files that are still 
left behind in the system and hence may cause performance issues. The behaviour can be overridden 
with the `force` argument.

### Displaying the Status of Rebalance Operation

You can display the status information about rebalance volume operation,
as needed.

-   Check the status of the rebalance operation, using the following
    command:

    `# gluster volume rebalance <VOLNAME> status`

    For example:

        # gluster volume rebalance test-volume status
                                        Node  Rebalanced-files  size  scanned       status
                                   ---------  ----------------  ----  -------  -----------
        617c923e-6450-4065-8e33-865e28d9428f               416  1463      312  in progress

    The time to complete the rebalance operation depends on the number
    of files on the volume along with the corresponding file sizes.
    Continue checking the rebalance status, verifying that the number of
    files rebalanced or total files scanned keeps increasing.

    For example, running the status command again might display a result
    similar to the following:

        # gluster volume rebalance test-volume status
                                        Node  Rebalanced-files  size  scanned       status
                                   ---------  ----------------  ----  -------  -----------
        617c923e-6450-4065-8e33-865e28d9428f               498  1783      378  in progress

    The rebalance status displays the following when the rebalance is
    complete:

        # gluster volume rebalance test-volume status
                                        Node  Rebalanced-files  size  scanned       status
                                   ---------  ----------------  ----  -------  -----------
        617c923e-6450-4065-8e33-865e28d9428f               502  1873      334   completed

### Stopping an Ongoing Rebalance Operation

You can stop the rebalance operation, if needed.

-   Stop the rebalance operation using the following command:

    `# gluster volume rebalance <VOLNAME> stop`

    For example:

        # gluster volume rebalance test-volume stop
                                        Node  Rebalanced-files  size  scanned       status
                                   ---------  ----------------  ----  -------  -----------
        617c923e-6450-4065-8e33-865e28d9428f               59   590      244       stopped
        Stopped rebalance process on volume test-volume

<a name="stopping-volumes"></a>
## Stopping Volumes

1.  Stop the volume using the following command:

    `# gluster volume stop <VOLNAME>`

    For example, to stop test-volume:

        # gluster volume stop test-volume
        Stopping volume will make its data inaccessible. Do you want to continue? (y/n)

2.  Enter `y` to confirm the operation. The output of the command
    displays the following:

        Stopping volume test-volume has been successful

<a name="deleting-volumes"></a>
## Deleting Volumes

1.  Delete the volume using the following command:

    `# gluster volume delete <VOLNAME>`

    For example, to delete test-volume:

        # gluster volume delete test-volume
        Deleting volume will erase all information about the volume. Do you want to continue? (y/n)

2.  Enter `y` to confirm the operation. The command displays the
    following:

        Deleting volume test-volume has been successful

<a name="triggering-self-heal-on-replicate"></a>
## Triggering Self-Heal on Replicate

In replicate module, previously you had to manually trigger a self-heal
when a brick goes offline and comes back online, to bring all the
replicas in sync. Now the pro-active self-heal daemon runs in the
background, diagnoses issues and automatically initiates self-healing
every 10 minutes on the files which requires*healing*.

You can view the list of files that need *healing*, the list of files
which are currently/previously *healed*, list of files which are in
split-brain state, and you can manually trigger self-heal on the entire
volume or only on the files which need *healing*.

-   Trigger self-heal only on the files which requires *healing*:

    `# gluster volume heal <VOLNAME>`

    For example, to trigger self-heal on files which requires *healing*
    of test-volume:

        # gluster volume heal test-volume
        Heal operation on volume test-volume has been successful

-   Trigger self-heal on all the files of a volume:

    `# gluster volume heal <VOLNAME> full`

    For example, to trigger self-heal on all the files of of
    test-volume:

        # gluster volume heal test-volume full
        Heal operation on volume test-volume has been successful

-   View the list of files that needs *healing*:

    `# gluster volume heal <VOLNAME> info`

    For example, to view the list of files on test-volume that needs
    *healing*:

        # gluster volume heal test-volume info
        Brick server1:/gfs/test-volume_0
        Number of entries: 0

        Brick server2:/gfs/test-volume_1
        Number of entries: 101
        /95.txt
        /32.txt
        /66.txt
        /35.txt
        /18.txt
        /26.txt
        /47.txt
        /55.txt
        /85.txt
        ...

-   View the list of files that are self-healed:

    `# gluster volume heal <VOLNAME> info healed`

    For example, to view the list of files on test-volume that are
    self-healed:

        # gluster volume heal test-volume info healed
        Brick Server1:/gfs/test-volume_0
        Number of entries: 0

        Brick Server2:/gfs/test-volume_1
        Number of entries: 69
        /99.txt
        /93.txt
        /76.txt
        /11.txt
        /27.txt
        /64.txt
        /80.txt
        /19.txt
        /41.txt
        /29.txt
        /37.txt
        /46.txt
        ...

-   View the list of files of a particular volume on which the self-heal
    failed:

    `# gluster volume heal <VOLNAME> info failed`

    For example, to view the list of files of test-volume that are not
    self-healed:

        # gluster volume heal test-volume info failed
        Brick Server1:/gfs/test-volume_0
        Number of entries: 0

        Brick Server2:/gfs/test-volume_3
        Number of entries: 72
        /90.txt
        /95.txt
        /77.txt
        /71.txt
        /87.txt
        /24.txt
        ...

-   View the list of files of a particular volume which are in
    split-brain state:

    `# gluster volume heal <VOLNAME> info split-brain`

    For example, to view the list of files of test-volume which are in
    split-brain state:

        # gluster volume heal test-volume info split-brain
        Brick Server1:/gfs/test-volume_2
        Number of entries: 12
        /83.txt
        /28.txt
        /69.txt
        ...

        Brick Server2:/gfs/test-volume_3
        Number of entries: 12
        /83.txt
        /28.txt
        /69.txt
        ...

<a name="non-uniform-file-allocation"></a>
## Non Uniform File Allocation

NUFA translator or Non Uniform File Access translator is designed for giving higher preference
to a local drive when used in a HPC type of environment. It can be applied to Distribute and Replica translators;
in the latter case it ensures that *one* copy is local if space permits.

When a client on a server creates files, the files are allocated to a brick in the volume based on the file name.
This allocation may not be ideal, as there is higher latency and unnecessary network traffic for read/write operations
to a non-local brick or export directory. NUFA ensures that the files are created in the local export directory
of the server, and as a result, reduces latency and conserves bandwidth for that server accessing that file.
This can also be useful for applications running on mount points on the storage server.

If the local brick runs out of space or reaches the minimum disk free limit, instead of allocating files
to the local brick, NUFA distributes files to other bricks in the same volume if there is
space available on those bricks.

NUFA should be enabled before creating any data in the volume.

Use the following command to enable NUFA:

`# gluster volume set <VOLNAME> cluster.nufa enable on`

**Important**

NUFA is supported under the following conditions:

- Volumes with only one brick per server.
- For use with a FUSE client. **NUFA is not supported with NFS or SMB**.
- A client that is mounting a NUFA-enabled volume must be present within the trusted storage pool.

The NUFA scheduler also exists, for use with the Unify translator; see below.

    volume bricks
      type cluster/nufa
      option local-volume-name brick1
      subvolumes brick1 brick2 brick3 brick4 brick5 brick6 brick7
    end-volume

##### NUFA additional options

-   lookup-unhashed

    This is an advanced option where files are looked up in all subvolumes if they are missing on the subvolume matching the hash value of the filename. The default is on.

-   local-volume-name

    The volume name to consider local and prefer file creations on. The default is to search for a volume matching the hostname of the system.

-   subvolumes

    This option lists the subvolumes that are part of this 'cluster/nufa' volume. This translator requires more than one subvolume.

## BitRot Detection

With BitRot detection in Gluster, it's possible to identify "insidious" type of disk
errors where data is silently corrupted with no indication from the disk to the storage
software layer than an error has occured. This also helps in catching "backend" tinkering
of bricks (where data is directly manipulated on the bricks without going through FUSE,
NFS or any other access protocol(s).

BitRot detection is disbled by default and needs to be enabled to make use of other
sub-commands.

1. To enable bitrot detection for a given volume <VOLNAME>:

    `# gluster volume bitrot <VOLNAME> enable`

    and similarly to disable bitrot use:

    `# gluster volume bitrot <VOLNAME> disable`

> NOTE: Enabling bitrot spanws the Signer & Scrubber daemon per node. Signer is responsible
      for signing (calculating checksum for each file) an object and scrubber verifies the
      calculated checksum against the objects data.

2. Scrubber daemon has three (3) throttling modes that adjusts the rate at which objects
   are verified. 

        # volume bitrot <VOLNAME> scrub-throttle lazy
        # volume bitrot <VOLNAME> scrub-throttle normal
        # volume bitrot <VOLNAME> scrub-throttle aggressive

3. By default scrubber scrubs the filesystem biweekly. It's possible to tune it to scrub
   based on predefined frequency such as monthly, etc. This can be done as shown below:

        # volume bitrot <VOLNAME> scrub-frequency daily
        # volume bitrot <VOLNAME> scrub-frequency weekly
        # volume bitrot <VOLNAME> scrub-frequency biweekly
        # volume bitrot <VOLNAME> scrub-frequency monthly

> NOTE: Daily scrubbing would not be available with GA release.

4. Scrubber daemon can be paused and later resumed when required. This can be done as
   shown below:

    `# volume bitrot <VOLNAME> scrub pause`

   and to resume scrubbing:

    `# volume bitrot <VOLNAME> scrub resume`

> NOTE: Signing cannot be paused (and resumed) and would always be active as long as
      bitrot is enabled for that particular volume.
