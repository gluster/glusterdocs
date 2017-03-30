# Split brain and the ways to deal with it

### Split brain:
Split brain is a situation where two or more replicated copies of a file become divergent. When a file is in split brain, there is an inconsistancy in either data or metadata of the file amongst the bricks of a replica and do not have enough information to authoritatively pick a copy as being pristien and heal to the bad copies, dispite all bricks being up and online. For a directory, there is also an entry split brain where a file inside it has different gfid/file-type across the bricks of a replica. Split brain can happen mainly because of 2 reasons:
1. Due to network disconnect:
Where a client temporarily loses connection to the bricks.
2. Gluster brick processes going down or returning error:
Where server1 goes out of service and writes happen on server2. Server1 comes back but server2 goes out of service without the files having been healed. Write occures on server1 and when server2 is returned to service, each has writes independent of one another.

If we use the replica 2 volume, then there are high chances of ending up in split-brain.

### Ways to deal with split brain:
In glusterfs there are ways to resolve split brain. You can see the detailed description of automatically resolving split-brain [here](https://gluster.readthedocs.io/en/latest/Troubleshooting/heal-info-and-split-brain-resolution/) and manuall resolution [here](https://gluster.readthedocs.io/en/latest/Troubleshooting/split-brain/). Moreover, there are ways which can guard us from ending up in split brain situations. The ways which guards us against split brain are:
1. Replica 3 volume
2. Arbiter volume

Both of these uses the client-quorum option of glusterfs, avoid the split-brain situations.

### Client quorum:
This is a feature implemented in AFR to prevent split-brains in the I/O path for replicate/distributed-replicate volumes. By default, if the client-quorum is not met for a particular replica subvol, it becomes read-only. The other subvols (in a dist-rep volume) will still have R/W access. [Here](https://gluster.readthedocs.io/en/latest/Administrator%20Guide/arbiter-volumes-and-quorum/#client-quorum) you can see more details about client-quorum.

### Replica 2 volume:
In a replica 2 volume it is not possible to achieve high availability and consistancy, with the client-quorum. If we set the client-quorum option to auto, then the first brick must always be up, irrespective of the status of the second brick. If only the second brick is up, the subvolume becomes EROFS. If the quorum-type is set to fixed, then the quorum-count is 1, then we may end up in split brain. i.e., One write succeed on one brick and other write on another brick. To avoid this we have to set the quorum-count to 2, which will cost the availability. Even if we have one replica brick up and running, we will end up seeing EROFS.

#### 1. Replica 3 volume:
When we create a replicated or distributed replicated volume with replica count 3, the cluster.quorum-type option is set to auto by default. That means atleast 2 bricks should be up and running to satisfy the quorum and allow the writes. This is the recommended setting for a replica 3 volume and this should not be changed. Here is how it prevent files from ending up in split brain:

B1, B2, and B3 are the 3 bricks of a replica 3 volume.
1. B1 & B2 are up and B3 is down. Quorum is met and write happens on B1 & B2. Pending xattrs for B3 is set on B1 & B2.
2. B3 comes up and B2 is down. Quorum is met and write happens on B1 & B3 and pending xattrs are set for B2 on B1 & B3.
3. B2 comes up and B1 goes down. Quorum is met. But when a write request comes, AFR sees that B2 & B3's pending xattrs blame each other and therefore the write is not allowed and is failed with EIO.

Command to create a replica 3 volume:
```sh
$gluster volume create <volname> replica 3 host1:brick1 host2:brick2 host3:brick3
```
There is a corner case even with replica 3 volumes where the file can end up in a split-brain. AFR usually takes range locks for the {offset, length} of the write. If 3 writes happen on the same file at non-overlapping {offset, length} and each write fails on (only) one different brick, then we have AFR xattrs of the file blaming each other.

### 2. Arbiter volume:
This is also an replica 3 volume where the third brick of the replica is automatically configured as an arbiter node. This means that the third brick stores only the file name and metadata, but not any data. This will help in avoiding split brain while providing the same level of consistancy as a normal replica 3 volume.

Command to create a arbiter volume:
```sh
$gluster volume create <volname> replica 3 arbiter 1 host1:brick1 host2:brick2 host3:brick3
```

The only difference in the command is, we need to add one more keyword ``` arbiter 1 ``` after the replica count. Since it is also a replica 3 volume, the cluster.quorum-type option is set to auto by default and atleast 2 bricks should be up to satisfy the quorum and allow writes.
Since the arbiter brick has only name and metadata of the files, there are some more checks to guarrantee consistancy. Arbiter works as follows:

1. Clients take full file locks while writing (replica 3 takes range locks).
2. If 2 bricks are up and if one of them is the arbiter, and it blames the other up brick, then all FOPs will fail with ENOTCONN (Transport endpoint is not connected). If the arbiter doesn't blame the other brick, FOPs will be allowed to proceed.
3. If 2 bricks are up and the arbiter is down, then FOPs will be allowed.
4. If only one brick is up, then client-quorum is not met and the volume becomes EROFS.
5. In all cases, if there is only one source before the FOP is initiated and if the FOP fails on that source, the application will receive ENOTCONN.

You can find more details on arbiter [here](https://gluster.readthedocs.io/en/latest/Administrator%20Guide/arbiter-volumes-and-quorum/).

### Differences between replica 3 and arbiter volumes:
1. In case of a replica 3 volume, we store the entire file in all the bricks and it is recommended to have bricks of same size. But in case of arbiter, since we do not store data, the size of the arbiter brick is comparitively lesser than the other bricks.
2. Arbiter is a state between replica 2 and replica 3 volume. If we have only arbiter and one of the other brick is up and the arbiter brick blames the other brick, then we can not proceed with the FOPs.
3. Replica 3 gives high availability compared to arbiter.