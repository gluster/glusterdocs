The first level of analysis always starts with looking at the log files. Which ones, you ask?

- /var/log/glusterfs/$fuse-mount-point.log –> Fuse client log
- /var/log/glusterfs/glfsheal-$volname.log –> This is the log file to look at when you run the heal info/split-brain resolution commands.
- /var/log/glusterfs/glustershd.log –> This is the self-heal daemon log that prints the names of files undergoing heal, the sources and sinks for each file etc. It is common for all volumes.
- /var/log/glusterfs/bricks/$brick.log–>Some errors in clients are simply propagated from the bricks themselves, so correlating client log errors with the logs from the brick is necessary.

Sometimes, you might need more verbose logging to figure out what’s going on:
`gluster volume set $volname client-log-level $LEVEL`

where LEVEL can be any one of  `DEBUG, WARNING, ERROR, INFO, CRITICAL, NONE, TRACE`. This should ideally make all the log files mentioned above to start logging at `$LEVEL`. The default is `INFO` but you can temporarily toggle it to `DEBUG` or `TRACE` if you want to see under-the-hood messages. Useful when the normal logs don’t give a clue as to what is happening.

## Heal related issues:

Most issues I’ve seen on the mailing list and with customers can broadly fit into the following buckets:

(**Note:** Not discussing split-brains here. If they occur, you need to use split-brain resolution CLI or cluster.favorite-child-policy options to fix them. They usually occur in replica 2 volumes and can be prevented by using replica 3 or arbiter volumes.)

### i) Heal info appears to hang/takes a long time to complete

If the number of entries are large, then heal info will take longer than usual. While there are performance improvements to heal info being planned, a faster way to get an approx. count of the pending entries is to use the `gluster volume heal $VOLNAME statistics heal-count` command.

**Knowledge Hack:**  Since we know that during the write transaction. the xattrop folder will capture the gfid-string of the file if it needs heal, we can also do an `ls /brick/.glusterfs/indices/xattrop|wc -l` on each brick to get the approx. no of entries that need heal. If this number reduces over time,  it is a sign that the heal backlog is reducing. You will also see messages whenever a particular type of heal starts/ends for a given gfid, like so:

`[2019-05-07 12:05:14.460442] I [MSGID: 108026] [afr-self-heal-entry.c:883:afr_selfheal_entry_do] 0-testvol-replicate-0: performing entry selfheal on d120c0cf-6e87-454b-965b-0d83a4c752bb`

`[2019-05-07 12:05:14.474710] I [MSGID: 108026] [afr-self-heal-common.c:1741:afr_log_selfheal] 0-testvol-replicate-0: Completed entry selfheal on d120c0cf-6e87-454b-965b-0d83a4c752bb. sources=[0] 2  sinks=1`

`[2019-05-07 12:05:14.493506] I [MSGID: 108026] [afr-self-heal-common.c:1741:afr_log_selfheal] 0-testvol-replicate-0: Completed data selfheal on a9b5f183-21eb-4fb3-a342-287d3a7dddc5. sources=[0] 2  sinks=1`

`[2019-05-07 12:05:14.494577] I [MSGID: 108026] [afr-self-heal-metadata.c:52:__afr_selfheal_metadata_do] 0-testvol-replicate-0: performing metadata selfheal on a9b5f183-21eb-4fb3-a342-287d3a7dddc5`

`[2019-05-07 12:05:14.498398] I [MSGID: 108026] [afr-self-heal-common.c:1741:afr_log_selfheal] 0-testvol-replicate-0: Completed metadata selfheal on a9b5f183-21eb-4fb3-a342-287d3a7dddc5. sources=[0] 2  sinks=1`

### ii) Self-heal is stuck/ not getting completed.

If a file seems to be forever appearing in heal info and not healing, check the following:

- Examine the afr xattrs- Do they clearly indicate the good and bad copies? If there isn’t at least one good copy, then the file is in split-brain and you would need to use the split-brain resolution CLI.
- Identify which node’s shds would be picking up the file for heal. If a file is listed in the heal info output under brick1 and brick2, then the shds on the nodes which host those bricks would attempt (and one of them would succeed) in doing the heal.
 - Once the shd is identified, look at the shd logs to see if it is indeed connected to the bricks.

This is good:
`[2019-05-07 09:53:02.912923] I [MSGID: 114046] [client-handshake.c:1106:client_setvolume_cbk] 0-testvol-client-2: Connected to testvol-client-2, attached to remote volume '/bricks/brick3'`

This indicates a disconnect:
`[2019-05-07 11:44:47.602862] I [MSGID: 114018] [client.c:2334:client_rpc_notify] 0-testvol-client-2: disconnected from testvol-client-2. Client process will keep trying to connect to glusterd until brick's port is available`

`[2019-05-07 11:44:50.953516] E [MSGID: 114058] [client-handshake.c:1456:client_query_portmap_cbk] 0-testvol-client-2: failed to get the port number for remote subvolume. Please run 'gluster volume status' on server to see if brick process is running.`

Alternatively, take a statedump of the self-heal daemon (shd) and check if all client xlators are connected to the respective bricks. The shd must have `connected=1` for all the client xlators, meaning it can talk to all the bricks.

|                                       Shd’s statedump entry of a client xlator that is connected to the  3rd brick                                       |                                 Shd’s statedump entry of the same client xlator if it is diconnected from the  3rd brick                                 |
|:--------------------------------------------------------------------------------------------------------------------------------------------------------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------:|
| [xlator.protocol.client.testvol-client-2.priv] connected=1 total_bytes_read=75004 ping_timeout=42 total_bytes_written=50608 ping_msgs_sent=0 msgs_sent=0 | [xlator.protocol.client.testvol-client-2.priv] connected=0 total_bytes_read=75004 ping_timeout=42 total_bytes_written=50608 ping_msgs_sent=0 msgs_sent=0 |

If there are connection issues (i.e. `connected=0`), you would need to investigate and fix them. Check if the pid and the TCP/RDMA Port of the brick proceess from gluster volume status $VOLNAME matches that of `ps aux|grep glusterfsd|grep $brick-path`

`[root@tuxpad glusterfs]# gluster volume status`
Status of volume: testvol
Gluster process                       TCP Port RDMA Port Online Pid
------------------------------------------------------------------------------
Brick 127.0.0.2:/bricks/brick1        49152      0        Y   12527

`[root@tuxpad glusterfs]# ps aux|grep brick1`

`root 12527 0.0 0.1 1459208 20104 ? Ssl 11:20 0:01 /usr/local/sbin/glusterfsd -s 127.0.0.2 --volfile-id testvol.127.0.0.2.bricks-brick1 -p /var/run/gluster/vols/testvol/127.0.0.2-bricks-brick1.pid -S /var/run/gluster/70529980362a17d6.socket --brick-name /bricks/brick1 -l /var/log/glusterfs/bricks/bricks-brick1.log --xlator-option *-posix.glusterd-uuid=d90b1532-30e5-4f9d-a75b-3ebb1c3682d4 --process-name brick --brick-port 49152 --xlator-option testvol-server.listen-port=49152`

Though this will likely match, sometimes there could be a bug leading to stale port usage. A quick workaround would be to restart glusterd on that node and check if things match. Report the issue to the devs if you see this problem.

- I have seen some cases where a file is listed in heal info, and the afr xattrs indicate pending metadata or data heal but the file itself is not present on all bricks. Ideally, the parent directory of the file must have pending entry heal xattrs so that the file either gets created on the missing bricks or gets deleted from the ones where it is present. But if the parent dir doesn’t have xattrs, the entry heal can’t proceed. In such cases, you can
    -- Either do a lookup directly on the file from the mount so that name heal is triggered and then shd can pickup the data/metadata heal.
    -- Or manually set entry xattrs on the parent dir to emulate an entry heal so that the file gets created as a part of it.
     -- If a brick’s underlying filesystem/lvm was damaged and fsck’d to recovery, some files/dirs might be missing on it. If there is a lot of missing info on the recovered bricks, it might be better to just to a replace-brick or reset-brick and let the heal fully sync everything rather than fiddling with afr xattrs of individual entries.

**Hack:** How to trigger heal on *any* file/directory
Knowing about self-heal logic and index heal from the previous post, we can sort of emulate a heal with the following steps. This is not something that you should be doing on your cluster but it pays to at least know that it is possible when push comes to shove.

1. Picking one brick as good and setting the afr pending xattr on it blaming the bad bricks.
2. Capture the gfid inside .glusterfs/indices/xattrop so that the shd can pick it up during index heal.
3. Finally, trigger index heal: gluster volume heal $VOLNAME .

*Example:* Let us say a FILE-1 exists with `trusted.gfid=0x1ad2144928124da9b7117d27393fea5c` on all bricks of a replica 3 volume called testvol. It has no afr xattrs.  But you still need to emulate a heal. Let us say you choose brick-2 as the source. Let us do the steps listed above:

1. Make brick-2 blame the other 2 bricks:
[root@tuxpad fuse_mnt]# setfattr -n trusted.afr.testvol-client-2 -v 0x000000010000000000000000 /bricks/brick2/FILE-1
[root@tuxpad fuse_mnt]# setfattr -n trusted.afr.testvol-client-1 -v 0x000000010000000000000000 /bricks/brick2/FILE-1

2. Store the gfid string inside xattrop folder as a hardlink to the base entry:
root@tuxpad ~]# cd /bricks/brick2/.glusterfs/indices/xattrop/
[root@tuxpad xattrop]# ls -li
total 0
17829255 ----------. 1 root root 0 May 10 11:20 xattrop-a400ca91-cec9-4463-a183-aca9eaff9fa7`
[root@tuxpad xattrop]# ln xattrop-a400ca91-cec9-4463-a183-aca9eaff9fa7 1ad21449-2812-4da9-b711-7d27393fea5c
[root@tuxpad xattrop]# ll
total 0
----------. 2 root root 0 May 10 11:20 1ad21449-2812-4da9-b711-7d27393fea5c
----------. 2 root root 0 May 10 11:20 xattrop-a400ca91-cec9-4463-a183-aca9eaff9fa7

3. Trigger heal: gluster volume heal testvol
The glustershd.log of node-2 should log about the heal.
[2019-05-10 06:10:46.027238] I [MSGID: 108026] [afr-self-heal-common.c:1741:afr_log_selfheal] 0-testvol-replicate-0: Completed data selfheal on 1ad21449-2812-4da9-b711-7d27393fea5c. sources=[1] sinks=0 2
So the data was healed from the second brick to the first and third brick.

### iii) Self-heal is too slow

If the heal backlog is decreasing and you see glustershd logging heals but you’re not happy with the rate of healing, then you can play around with shd-max-threads and shd-wait-qlength volume options.

    Option: cluster.shd-max-threads
    Default Value: 1
    Description: Maximum number of parallel heals SHD can do per local brick. This can substantially lower heal times, but can also crush your bricks if you don’t have the storage hardware to support this.
     
    Option: cluster.shd-wait-qlength
    Default Value: 1024
    Description: This option can be used to control number of heals that can wait in SHD per subvolume

I’m not covering it here but it is possible to launch multiple shd instances (and kill them later on) on your node for increasing heal throughput. It is documented at https://access.redhat.com/solutions/3794011.

### iv) Self-heal is too aggressive and slows down the system.

If  shd-max-threads are at the lowest value (i.e. 1) and you see if CPU usage of the bricks is too high, you can check if the volume’s profile info shows a lot of RCHECKSUM fops. Data self-heal does checksum calculation (i.e the `posix_rchecksum()` FOP) which can be CPU intensive. You can the `cluster.data-self-heal-algorithm` option to full. This does a full file copy instead of computing rolling checksums and syncing only the mismatching blocks. The tradeoff is that the network consumption will be increased.

You can also disable all client-side heals if they are turned on so that the client bandwidth is consumed entirely by the application FOPs and not the ones by client side background heals. i.e. turn off `cluster.metadata-self-heal, cluster.data-self-heal and cluster.entry-self-heal`. 
Note: In recent versions of gluster,  client-side heals are disabled by  default.

## Mount related issues:
 ### i) All fops are failing with ENOTCONN

Check mount log/ statedump for loss of quorum, just like for glustershd. If this is a fuse client (as opposed to an nfs/ gfapi client), you can also check the .meta folder to check the connection status to the bricks.
`[root@tuxpad ~]# cat /mnt/fuse_mnt/.meta/graphs/active/testvol-client-*/private |grep connected`

`connected = 0`
`connected = 1`
`connected = 1`

If `connected=0`, the connection to that brick is lost.  Find out why. If the client is not connected to quorum number of bricks, then AFR fails lookups (and therefore any subsequent FOP) with Transport endpoint is not connected

### ii) FOPs on some files are failing with ENOTCONN

Check mount log for the file being unreadable:
`[2019-05-10 11:04:01.607046] W [MSGID: 108027] [afr-common.c:2268:afr_attempt_readsubvol_set] 13-testvol-replicate-0: no read subvols for /FILE.txt`
`[2019-05-10 11:04:01.607775] W [fuse-bridge.c:939:fuse_entry_cbk] 0-glusterfs-fuse: 234: LOOKUP() /FILE.txt => -1 (Transport endpoint is not connected)`

This means there was only  1 good copy and the client has lost connection to that brick.  You need to ensure that the client is connected to all bricks.

### iii) Mount is hung

It can be difficult to pin-point the issue immediately and might require assistance from the developers but the first steps to debugging could be to

  -  strace the fuse mount; see where it is hung.
  - Take a statedump of the mount to see which xlator has frames that are not wound (i.e. complete=0) and for which FOP. Then check the source code to see if there are any unhanded cases where the xlator doesn’t wind the FOP to its child.
  - Take statedump of bricks to see if there are any stale locks. An indication of stale locks is the same lock being present in multiple statedumps or the ‘granted’ date being very old.

Excerpt from a brick statedump:

    [xlator.features.locks.testvol-locks.inode]
    path=/FILE
    mandatory=0
    inodelk-count=1
    lock-dump.domain.domain=testvol-replicate-0:self-heal
    lock-dump.domain.domain=testvol-replicate-0
    inodelk.inodelk[0](ACTIVE)=type=WRITE, whence=0, start=0, len=0,
    pid = 18446744073709551610, owner=700a0060037f0000, client=0x7fc57c09c1c0,
    connection-id=vm1-17902-2018/10/14-07:18:17:132969-testvol-client-0-0-0, granted at 2018-10-14 07:18:40

While stale lock issues are candidates for bug reports, the locks xlator on the brick releases locks from a particular client upon a network disconnect. That can be used as a workaround to release the stale locks- i.e. restart the brick or restart the client or induce a network disconnect between them.
