# Split brain and the ways to deal with it

### Split brain:
Split brain is a situation where two or more replicated copies of a file become divergent. When a file is in split brain, there is an inconsistency in either data or metadata of the file amongst the bricks of a replica and do not have enough information to authoritatively pick a copy as being pristine and heal the bad copies, despite all bricks being up and online. For a directory, there is also an entry split brain where a file inside it can have different gfid/file-type across the bricks of a replica. Split brain can happen mainly because of 2 reasons:
1. Due to network disconnect:
Where a client temporarily loses connection to the bricks.
    - There is a replica pair of 2 bricks, brick1 on server1 and brick2 on server2.
    - Client1 loses connection to brick2 and client2 loses connection to brick1 due to network split.
    - Writes from client1 goes to brick1 and from client2 goes to brick2, which is nothing but split-brain.
2. Gluster brick processes going down or returning error:
    - Server1 is down and server2 is up: Writes happen on server 2.
    - Server1 comes up, server2 goes down (Heal not happened / data on server 2 is not replicated on server1): Writes happen on server1.
    - Server2 comes up: Both server1 and server2 has data independent of each other.

If we use the replica 2 volume, it is not possible to prevent split-brain without losing availability.

### Ways to deal with split brain:
In glusterfs there are ways to resolve split brain. You can see the detailed description of how to resolve a split-brain [here](../Troubleshooting/resolving-splitbrain.md). Moreover, there are ways to reduce the chances of ending up in split-brain situations. They are:
1. Replica 3 volume
2. Arbiter volume

Both of these uses the client-quorum option of glusterfs to avoid the split-brain situations.

### Client quorum:
This is a feature implemented in Automatic File Replication (AFR here on) module, to prevent split-brains in the I/O path for replicate/distributed-replicate volumes. By default, if the client-quorum is not met for a particular replica subvol, it becomes read-only. The other subvols (in a dist-rep volume) will still have R/W access. [Here](arbiter-volumes-and-quorum.md#client-quorum) you can see more details about client-quorum.

#### Client quorum in replica 2 volumes:
In a replica 2 volume it is not possible to achieve high availability and consistency at the same time, without sacrificing tolerance to partition. If we set the client-quorum option to auto, then the first brick must always be up, irrespective of the status of the second brick. If only the second brick is up, the subvolume becomes read-only.
If the quorum-type is set to fixed, and the quorum-count is set to 1, then we may end up in split brain.
    - Brick1 is up and brick2 is down. Quorum is met and write happens on brick1.
    - Brick1 goes down and brick2 comes up (No heal happened). Quorum is met, write happens on brick2.
    - Brick1 comes up. Quorum is met, but both the bricks have independent writes - split-brain.
To avoid this we have to set the quorum-count to 2, which will cost the availability. Even if we have one replica brick up and running, the quorum is not met and we end up seeing EROFS.

### 1. Replica 3 volume:
When we create a replicated or distributed replicated volume with replica count 3, the cluster.quorum-type option is set to auto by default. That means at least 2 bricks should be up and running to satisfy the quorum and allow the writes. This is the recommended setting for a replica 3 volume and this should not be changed. Here is how it prevents files from ending up in split brain:

B1, B2, and B3 are the 3 bricks of a replica 3 volume.
1. B1 & B2 are up and B3 is down. Quorum is met and write happens on B1 & B2.
2. B3 comes up and B2 is down. Quorum is met and write happens on B1 & B3.
3. B2 comes up and B1 goes down. Quorum is met. But when a write request comes, AFR sees that B2 & B3 are blaming each other (B2 says that some writes are pending on B3 and B3 says that some writes are pending on B2), therefore the write is not allowed and is failed with EIO.

Command to create a replica 3 volume:
```sh
$gluster volume create <volname> replica 3 host1:brick1 host2:brick2 host3:brick3
```

### 2. Arbiter volume:
Arbiter offers the sweet spot between replica 2 and replica 3, where user wants the split-brain protection offered by replica 3 but does not want to invest in 3x storage space. Arbiter is also an replica 3 volume where the third brick of the replica is automatically configured as an arbiter node. This means that the third brick stores only the file name and metadata, but not any data. This will help in avoiding split brain while providing the same level of consistency as a normal replica 3 volume.

Command to create a arbiter volume:
```sh
$gluster volume create <volname> replica 3 arbiter 1 host1:brick1 host2:brick2 host3:brick3
```

The only difference in the command is, we need to add one more keyword ``` arbiter 1 ``` after the replica count. Since it is also a replica 3 volume, the cluster.quorum-type option is set to auto by default and at least 2 bricks should be up to satisfy the quorum and allow writes.
Since the arbiter brick has only name and metadata of the files, there are some more checks to guarantee consistency. Arbiter works as follows:

1. Clients take full file locks while writing (replica 3 takes range locks).
2. If 2 bricks are up and if one of them is the arbiter, and it blames the other up brick, then all FOPs will fail with ENOTCONN (Transport endpoint is not connected). If the arbiter doesn't blame the other brick, FOPs will be allowed to proceed.
3. If 2 bricks are up and the arbiter is down, then FOPs will be allowed.
4. If only one brick is up, then client-quorum is not met and the volume becomes EROFS.
5. In all cases, if there is only one source before the FOP is initiated and if the FOP fails on that source, the application will receive ENOTCONN.

You can find more details on arbiter [here](arbiter-volumes-and-quorum.md).

### Differences between replica 3 and arbiter volumes:
1. In case of a replica 3 volume, we store the entire file in all the bricks and it is recommended to have bricks of same size. But in case of arbiter, since we do not store data, the size of the arbiter brick is comparatively lesser than the other bricks.
2. Arbiter is a state between replica 2 and replica 3 volume. If we have only arbiter and one of the other brick is up and the arbiter brick blames the other brick, then we can not proceed with the FOPs.
4. Replica 3 gives high availability compared to arbiter, because unlike in arbiter, replica 3 has a full copy of the data in all 3 bricks.
