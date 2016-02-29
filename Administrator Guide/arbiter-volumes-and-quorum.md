Arbiter volumes and quorum options in gluster
=============================================
The arbiter volume is special subset of replica 3 volumes that is aimed at
preventing split-brains and providing the same consistency guarantees as a normal
replica 3 volume without consuming 3x space. Before we look at how to create one
and how they work etc. it is worthwhile to elaborate on the types of split-brain
in gluster parlance and how features like server-quorum and client-quorum help in
reducing the occurrence of split-brains to a certain extent.

Split-brains in replica volumes
================================
When a file is in split-brain, there is an inconsistency in either data or
metadata (permissions, uid/gid, extended attributes etc.)of the file amongst the
bricks of a replica *and* we do not have enough information to authoritatively
pick a copy as being pristine and heal to the bad copies, despite all bricks
being up and online. For directories, there
is also an entry-split brain where a file inside it has different gfids/
file-type (say one is a file and another is a directory of the same name)
across the bricks of a replica.

This [document](https://github.com/gluster/glusterfs-specs/blob/master/done/Features/heal-info-and-split-brain-resolution.md) 
describes how to resolve files that are in split-brain using gluster cli or the
mount point. Almost always, split-brains occur due to network disconnects (where
a client temporarily loses connection to the bricks) and very rarely due to
the gluster brick processes going down or returning an error.

Server-quorum and some pitfalls
================================
This [document] (http://www.gluster.org/community/documentation/index.php/Features/Server-quorum)
provides a detailed description of this feature.
The volume options for server-quorum are:

> Option:cluster.server-quorum-ratio                                              
  Value Description: 0 to 100           
 
> Option:cluster.server-quorum-type                                                  
  Value Description:  none | server                                                  
 If set to server, this  option enables the specified volume to participate in the server-side quorum.
 If set to none, that volume alone is not considered for volume checks.

The cluster.server-quorum-ratio is a percentage figure and is cluster wide- i.e.
you cannot have a different ratio for different volumes in the same trusted pool.

For a two-node trusted storage pool it is important to set this value to be
greater than 50% so that two nodes separated from each other do not both believe
they have quorum simultaneously. For a 2 node plain replica volume, this would
mean both nodes need to be up and running. So there is no notion of HA/failover.

There are users who create a replica 2 volume from 2 nodes and peer-probe
a 'dummy' node without bricks and enable server quorum with a ratio of 51%.
This does not prevent files from getting into split-brain. For example, if B1
and B2 are the bricks/nodes of the replica and B3 is the dummy node, we can
still end up in split-brain like so:

1. B1 goes down, B2 and B3 are up. server-quorum is still. File is modified
by the client.
2. B2 goes down, B1 comes back up. Server-quorum is met. Same file is modified
by the client.
3. We now have different contents for the file in B1 and B2 ==>split-brain.

In the author’s opinion, server quorum is useful if you want to avoid split-brains 
to the volume(s) configuration across the nodes and not in the I/O path.
Unlike in client-quorum where the volume becomes read-only when quorum is lost, loss of
server-quorum in a particular node makes glusterd kill the brick processes on that
node (for the participating volumes) making even reads impossible.

Client-quorum
==============
Client-quorum is a feature implemented in AFR to prevent split-brains in the I/O
path for replicate/distributed-replicate volumes. By default, if the client-quorum
is not met for a particular replica subvol, it becomes read-only. The other subvols
(in a dist-rep volume) will still have R/W access.

The following volume set options are used to configure it:
>Option: cluster.quorum-type  
  Default Value: none  
  Value Description: none|auto|fixed                                                         
    If set to "fixed", this option allows writes to a file only if the number of
    active bricks in that replica set (to which the file belongs) is greater
    than or equal to the count specified in the 'quorum-count' option.  
    If set to "auto", this option allows writes to the file only if number of
    bricks that are up >= ceil (of the total number of bricks that constitute that replica/2). 
    If the number of replicas is even, then there is a further check:
    If the number of up bricks is exactly equal to n/2, then the first brick must
    be one of the bricks that is up. If it is more than n/2 then it is not
    necessary that the first brick is one of the up bricks.
    
>Option: cluster.quorum-count  
>Value Description:                                                                 
    The number of bricks that must be active in a replica-set to allow writes.
    This option is used in conjunction with cluster.quorum-type *=fixed* option
    to specify the number of bricks to be active to participate in quorum.
    If the quorum-type is auto then this option has no significance.
                                                       
> Option: cluster.quorum-reads  
Default Value: no  
Value Description: yes|no  
If quorum-reads is set to 'yes' (or 'true' or 'on') then even reads will be allowed
only if quorum is met, without which the read (and writes) will return ENOTCONN.
If set to 'no' (or 'false' or 'off'), then reads will be served even when quorum is
not met, but writes will fail with EROFS.


Replica 2 and Replica  3 volumes
===============================
From the above descriptions, it is clear that client-quorum cannot really be applied
to a replica 2 volume:(without costing HA).
If the quorum-type is set to auto, then by the description
given earlier, the first brick must always be up, irrespective of the status of the
second brick. IOW, if only the second brick is up, the  subvol becomes EROFS, i.e. no HA.
If quorum-type is set to fixed, the the quorum-count *has* to be two
to prevent split-brains. (otherwise a write can succeed in brick1, another in brick2 =>split-brain).
So for all practical purposes, if you want high availabilty in a replica 2 volume,
it is recommended not to enable client-quorum.

In a replica 3 volume, client-quorum is enabled by default and set to 'auto'.
This means 2 bricks need to be up for the writes to succeed. Here is how this
configuration prevents files from ending up in split-brain:

Say B1, B2 and B3 are the bricks:
1. B3 is down, quorum is met, write happens on  the file on B1 and B2
2. B3 comes up, B2 is down, quorum is again met, a write happens on B1 and B3.
3. B2 comes up, B1 goes down, quorum is met. Now when a write is issued, AFR sees
that B2 and B3's pending xattrs blame each other and therefore the write is not
allowed and is failed with an EIO.

There is a corner case even with replica 3 volumes where the file can
end up in a split-brain. AFR usually takes range locks for the {offset, length}
of the write. If 3 writes happen on the same file at non-overlapping {offset, length}
and each write fails on (only) one different brick, then we have AFR xattrs of the
file blaming each other.

Arbiter configuration
======================
The arbiter configuration a.k.a. the arbiter volume is the perfect sweet spot
between a 2-way replica and 3-way replica to avoid files getting into split-brain,
***without the 3x storage space*** as mentioned earlier.
The syntax for creating the volume is:
>#gluster volume create <VOLNAME>  replica 3 arbiter 1 host1:brick1 host2:brick2 host3:brick3

For example:
>#gluster volume create testvol replica 3 arbiter 1  127.0.0.2:/bricks/brick{1..6}  force  
volume create: testvol: success: please start the volume to access data

>#gluster volume info
Volume Name: testvol  
Type: Distributed-Replicate  
Volume ID: ae6c4162-38c2-4368-ae5d-6bad141a4119  
Status: Created  
Number of Bricks: 2 x (2 + 1) = 6  
Transport-type: tcp  
Bricks:  
Brick1: 127.0.0.2:/bricks/brick1  
Brick2: 127.0.0.2:/bricks/brick2  
Brick3: 127.0.0.2:/bricks/brick3 (arbiter)  
Brick4: 127.0.0.2:/bricks/brick4  
Brick5: 127.0.0.2:/bricks/brick5  
Brick6: 127.0.0.2:/bricks/brick6 (arbiter)  
Options Reconfigured  :
transport.address-family: inet  
performance.readdir-ahead: on  `

Notice that the 3rd brick of every replica subvol is designated as the arbiter brick.
This brick will store only the file/directory names  (i.e. the tree structure)
and extended attributes (metadata) but not any data. i.e. the file size
(as shown by `ls -l`) will be zero bytes. It will also store other gluster 
metadata like the .glusterfs folder and its contents. Since the arbiter volume
is also a type of replica 3 volume, client-quourm is enabled by default and
set to 'auto'. This setting is **not** to be changed.

#Arbiter brick(s) sizing:  
Since the arbiter brick does not store file data, its disk usage will be considerably
lesser than the other bricks of the replica. The sizing of the brick will depend on
how many files you plan to store in the volume. A good estimate will be
4kb times the no.of files in the replica.

How it works:
-------------
There are 2 components to the arbiter volume. One is the arbiter xlator that is
loaded in the brick process of every 3rd (i.e. the arbiter) brick. The other is the
arbitration logic itself that is present in AFR (the replicate xlator) loaded 
on the clients.

The former acts as a sort of 'filter' translator for the FOPS- i.e. it allows 
entry operations to hit posix, blocks certain inode operations like 
read (unwinds the call with ENOTCONN) and unwinds other inode operations 
like write, truncate etc. with success without winding it down to posix.

The latter. i.e. the arbitration logic present in AFR does the following:

- Takes full file locks when writing to a file as opposed to range locks in a
normal replicate volume. This prevents the corner-case split-brain described 
earlier for 3 way replicas.

The behaviour of arbiter volumes in allowing/failing write FOPS in conjunction
with client-quorum can be summarized in the below steps:

- If all 3 bricks are up (happy case), then there is no issue and the FOPs are allowed.

- If 2 bricks are up and if one of them is the arbiter (i.e. the 3rd brick) *and*
 it blames the other up brick for a given file, then all write FOPS will fail
 with ENOTCONN. This is because in this scenario, the only true copy is on the 
 brick that is down. Hence we cannot allow writes until that brick is also up.
 If the arbiter doesn't blame the other brick, FOPS will be allowed to proceed.
 'Blaming' here is w.r.t the values of AFR changelog extended attributes.

- If 2 bricks are up and the arbiter is down, then FOPS will be allowed.
 When the arbiter comes up, the entry/metadata heals to it happen. Of course data
 heals are  not needed.

- If only one brick is up, then client-quorum is not met and the volume becomes EROFS.

- In all cases, if there is only one source before the FOP is initiated
 (even if all bricks are up) and if the FOP fails on that source, the
 application will receive ENOTCONN. For example, assume that a write failed on B2
 and B3, i.e. B1 is the only source. Now if for some reason, the second write
 failed on B1 (before there was a chance for selfheal to complete despite all brick
 being up), the application would receive failure (ENOTCONN) for that write.
 

The bricks being up or down described above does not necessarily mean the brick
process is offline. It can also mean the mount lost the connection to the brick
due to network disconnects etc.

