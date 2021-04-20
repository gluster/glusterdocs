This doc contains information about the synchronous replication module in gluster and has two sections -Replication logic and Self-heal logic.

# 1. Replication logic
AFR is the module (translator) in glusterfs that provides all the features that you would expect of any synchronous replication system:

   1. Simultaneous updating of all copies of data on the replica bricks when a client modifies it.
   2. Providing continued data availability to clients when say one brick of the replica set goes down.
   3. Automatic self-healing of any data that was modified when the brick that was down, once it comes back up, ensuring consistency of data on all the bricks of the replica.

1 and 2 are in the I/O path while 3 is done either in the I/O path (in the background) or via the self-heal daemon.

Each gluster translator implements what are known as *File Operations (FOPs)* which are  mapped to the I/O syscalls which the application makes. For example, AFR has *afr_writev* that gets invoked when application does a *write(2)*. As is obvious, all FOPs fall into one of 2 types:

i) Read based FOPs which only get informtion from and don’t modify the file in any way.

viz: afr_readdir, afr_access, afr_stat, afr_fstat, afr_readlink, afr_getxattr, afr_fgetxattr,  afr_readv,afr_seek

ii) Write based FOPs which change the file or its attributes.

viz: afr_create, afr_mknod,afr_mkdir,afr_link, afr_symlink, afr_rename, afr_unlink, afr_rmdir, afr_do_writev, afr_truncate, afr_ftruncate, afr_setattr, afr_fsetattr, afr_setxattr, afr_fsetxattr, afr_removexattr, afr_fremovexattr, afr_fallocate, afr_discard, afr_zerofill, afr_xattrop, afr_fxattrop, afr_fsync.

AFR follows a transaction model for both types of FOPs.

### Read transactions:

For every file in the replica, AFR has an in-memory notion/array called ‘readables’ which indicate whether each brick of the replica is a good copy or a bad one (i.e. in need of a heal). In a healthy state, all bricks are readable and a read FOP will be served from any one of the readable bricks. The read-hash-mode volume option decides which brick is the chosen one.

    #[root@tuxpad glusterfs]# gluster volume set help|grep read-hash-mode -A7
    Option: cluster.read-hash-mode
    Default Value: 1
    Description: inode-read fops happen only on one of the bricks in replicate. AFR will prefer the one computed using the method specified using this option.
    0 = first readable child of AFR, starting from 1st child.
    1 = hash by GFID of file (all clients use same subvolume).
    2 = hash by GFID of file and client PID.
    3 = brick having the least outstanding read requests.

If the brick is bad for a given file (i.e. it is pending heal), then it won’t be marked readable to begin with. The readables array is populated based on the on-disk AFR xattrs for the file during lookup. These xattrs indicate which bricks are good and which ones are bad. We will see more about these xattrs in the write transactions section below. If the FOP fails on the chosen readable brick, AFR attempts it on the next readable one, until all are exhausted. If the FOP doesn’t succeed on any of the readables, then the  application receives an error.

### Write transactions:

Every write based FOP employs a write transaction model which consists of 5 phases:
**1) The lock phase**
Take locks on the file being modified on all bricks so that AFRs of other clients are blocked if they try to modify the same file simultaneously.

**2) The pre-op phase**
Increment the ‘dirty’ xattr (trusted.afr.dirty) by 1 on all participating bricks as an indication of an impending FOP (in the next phase)

**3) The FOP phase**
Perform the actual FOP (say a setfattr) on all bricks.

**4) The post-op phase**
Decrement the dirty xattr by 1 on bricks where the FOP was successful.
In addition, also increment the ‘pending’ xattr (trusted.afr.$VOLNAME-client-x) xattr on the success bricks to ‘blame’ the bricks where the FOP failed.

**5) The unlock phase**
Release the locks that were taken in phase 1. Any competing client can now go ahead with its own write transaction.

**Note**: There are certain optimizations done at the code level which reduce the no. of lock/unlock phases done for a transaction by piggybacking on the previous transaction’s locks. These optimizations (eager-locking, piggybacking and delayed post-op) beyond the scope of this post.

AFR returns sucess for these FOPs only if they meet quorum. For replica 2, this means it needs to suceed on any one brick. For replica 3, it is two out of theree and so on.

### More on the AFR xattrs:

We saw that AFR modifies the dirty and pending xattrs in the pre-op and post-op phases. To be more precise, only parts of the xattr are modified in a given transaction. Which bytes are modified depends on the type of write transaction which the FOP belongs to.

|     Transaction Type     |                                                FOPs that belong to it                                                |
|:------------------------:|:--------------------------------------------------------------------------------------------------------------------:|
| AFR_DATA_TRANSACTION     | afr_writev, afr_truncate, afr_ftruncate, afr_fsync, afr_fallocate, afr_discard, afr_zerofill                         |
| AFR_METADATA_TRANSACTION | afr_setattr, afr_fsetattr, afr_setxattr, afr_fsetxattr, afr_removexattr, afr_fremovexattr, afr_xattrop, afr_fxattrop |
| AFR_ENTRY_TRANSACTION    | afr_create, afr_mknod, afr_mkdir, afr_link, afr_symlink, afr_rename, afr_unlink, afr_rmdir                           |

Stop here and convince yourself that given a write based FOP, you can say which one of the 3 transaction types it belongs to.

**Note:** In the code, there is also a AFR_ENTRY_RENAME_TRANSACTION (used by afr_rename) but it is safe to assume that it is identical to AFR_ENTRY_TRANSACTION as far as interpreting the xattrs are concerned.

Consider the xttr:
```trusted.afr.dirty=0x000000000000000000000000```
The first 4 bytes of the xattr are used for data transactions, the next 4 bytes for metadata transactions and the last 4 for entry transactions. Let us see some examples of how the xattr would look like for various types of FOPs during a transaction:
| FOP         | Value after pre-op phase                       | Value after post-op phase                      |
|-------------|------------------------------------------------|------------------------------------------------|
| afr_writev  | trusted.afr.dirty=0x00000001 00000000 00000000 | trusted.afr.dirty=0x00000000 00000000 00000000 |
| afr_setattr | trusted.afr.dirty=0x00000000 00000001 00000000 | trusted.afr.dirty=0x00000000 00000000 00000000 |
| afr_create  | trusted.afr.dirty=0x00000000 00000000 00000001 | trusted.afr.dirty=0x00000000 00000000 00000000 |

Thus depending on the type of FOP (i.e. data/ metadata/ entry transaction), different set of bytes of the dirty xattr get incremented/ decremented. Modification of the pending xattr also follows the same pattern, execept it is incremented only in the post-op phase if the FOP fails on some bricks.

**Example:**
Let us say a write was performed on a file, say FILE1, on replica 3 volume called ‘testvol’. Suppose the lock and pre-op phase succeeded on all bricks. After that the 3rd brick went down, and the transaction completed successfully on the first 2 bricks.
What will be the state of the afr xattrs on all bricks?

`[root@tuxpad ravi]# getfattr -d -m . -e hex /bricks/brick1/FILE1|grep afr
getfattr: Removing leading '/' from absolute path names
trusted.afr.dirty=0x000000000000000000000000
trusted.afr.testvol-client-2=0x000000010000000000000000`

`[root@tuxpad ravi]# getfattr -d -m . -e hex /bricks/brick2/FILE1|grep afr
getfattr: Removing leading '/' from absolute path names
trusted.afr.dirty=0x000000000000000000000000
trusted.afr.testvol-client-2=0x000000010000000000000000`

`[root@tuxpad ravi]# getfattr -d -m . -e hex /bricks/brick3/FILE1|grep afr
getfattr: Removing leading '/' from absolute path names
trusted.afr.dirty=0x000000010000000000000000`


So Brick3 will still have the dirty xattr set because it went down before the post-op had a chance to decrement it. Bricks 1 and 2 will have a zero dirty xattr and in addition, a non-zero pending xattr set. The client-2 in trusted.afr.testvol-client-2 indicates that the 3rd brick is bad and has some pending data operations.


# 2. Self-heal logic.

We already know that AFR increments and/or decrements the dirty (i.e. `trusted.afr.dirty`) and pending (i.e. `trusted.afr.$VOLNAME-client-x`) xattrs during the different phases of the transaction.  For a given file (or directory), an all zero value of these xattrs or the total absence of these xattrs  on all bricks of the replica mean the file is healthy and does not need heal. If any of these xattrs are non-zero even on one of the bricks, then the file is a candidate for heal- it as simple as that.

When we say these xattrs are non-zero, it is in the context of no on-going I/O going from client(s) on the file. Otherwise the non-zero values that one observes might be transient as the write transaction is progressing through its five phases. Of course, as an admin, you wouldn’t need to figure out all of this. Just running the `heal info` set of commands should give you the list of files that need heal.

So if self-heal observes a file with non-zero xattrs, it does the following steps:

   1. Fetch the afr xattrs, examine which set of 8 bytes are non-zero and determine the corresponding heals that are needed on the file – i.e. **data heal/ metadata heal/ entry heal**.
   2. Determine which bricks are good (a.k.a. ‘sources’) and which ones are  bad (a.k.a. ‘sinks’) for each of those heals by interpretting the xattr values.
   3. Pick one source brick and heal the file on to all the sink bricks.
   4. If the heal is successful, reset the afr xattrs to zero.

This is a rather simplified description and I have omitted details about various locks that each of these steps need to take because self-heal and client I/O can happen in parallel on the file. Or even multiple self-heal daemons (described later) can attempt to heal the same file.

**Data heal**: Happens only for files. The contents of the file are copied from the source to the sink bricks.

**Entry heal**: Happens only for directories.  Entries (i.e. files and subdirs) under a given directory are deleted from the sinks if they are not present in the source. Likewise, entries are created on the sinks if they are not present in the source.

**Metadata  heal:**  Happens for both files and directories. File ownership, file permissions and extended attributes are copied from the source to the sink bricks.

It can be possible that for a given file, one set of bricks can be the source for data heal while another set could be the source for metadata heals. It all depends on which FOPs failed on what bricks and therefore what set of bytes are non-zero for the afr xattrs.

## When do self-heals happen?

There are two places from which the steps described above for healing can be carried out:
### i) From the client side.

Client-side heals are triggered when the file is accessed from the client (mount).  AFR uses a monotonically increasing generation number to keep track of disconnect/connect of its children (i.e. the client translators) to the bricks.  When this ‘event generation’ number changes, the file’s inode is marked as a candidate for refresh. When the next FOP comes on such an inode, a refresh is triggered to update the readables during which a heal is launched (if the AFR xattrs indicate that a heal is needed, that is). This heal happens in the background, meaning it does not block the actual FOP which will continue as usual post the refresh.  Specific client-side heals can be turned off  by disabling the 3 corresponding volume options:

    cluster.metadata-self-heal
    cluster.data-self-heal
    cluster.entry-self-heal

The number of client-side heals that happen in the background can be tuned via the following volume options:

    background-self-heal-count
    heal-wait-queue-length

See the `gluster volume set help` for more information on all the above options.

***Name heal***: Name heal is just healing of the file/directory name when it is accessed. For example, say a file is created and written to when a brick is down and all the 3 client side heals are disabled. When the brick comes up and the next I/O comes on it, the file name is created on it as  a part of lookup. Its contents/metadata are not healed though. Name heal cannot be disabled. It is there to ensure that the namespace is consistent on all bricks as soon as the file is accessed.

### ii) By the self-heal daemon.

There is a self-heal daemon process (glutershd) that runs on every node of the trusted storage pool.  It is a light weight client process consisting mainly of AFR ant the protocol/client translators. It can talk to all bricks of all the replicate volume(s) of the pool. It periodically crawls (every 10 minutes by default; tunable via the `heal-timeout` volume option) the list of files that need heal and does their healing.  As you can see, client side heal is done upon file access but glustershd processes the heal backlog pro-actively.

### Index heal:

But how does glustershd know which files it needs to heal? Where does it get the list from? So in part-1, while we saw the five phases of the AFR write transaction, we left out one detail:

- In the pre-op phase, in addition to marking the dirty xattr, each brick also stores the gfid string of the file inside its `.glusterfs/indices/dirty` directory.
 - Likewise, in the post-op phase,  it removes the gfid string from its `.glusterfs/indices/dirty` If addition, if the write failed on some brick, the good bricks will stores the gfid string inside the `.glusterfs/indices/xattrop` directory.

Thus when no I/O is happening on a file and you still find its gfid inside `.glusterfs/indices/dirty` of a particular brick, it means the brick went down before the post-op phase. If you find the gfid inside `.glusterfs/indices/xattrop`, it means the write failed on some other brick and this brick has captured it.

The glustershd simply reads the list of entries inside `.glusterfs/indices/*` and triggers heal on them. This is referred to as **index heal**.  While this happens automcatically every heal-timeout seconds, we can also manaully trigger it via the CLI using `gluster volume heal $VOLNAME` .

### Full heal:

A full heal, triggered from the CLI with `gluster volume heal $VOLNAME  full`, does just what the name implies. It does not process a particular list of entries like index heal, but crawls the whole gluster filesystem beginning with root, examines if files have non zero afr xattrs and triggers heal on them.

### Of missing xattrs and split-brains:

You might now realise how AFR pretty much relies on its xattr values of a given file- from using it to find the good copies to serve a read to finding out the source and sink bricks to heal the file. But what if there is inconsistency in data/metadata of a file and

(a) there are zero/ no AFR xattrs (or)

(b) if the xattrs all blame each other (i.e. no good copy=>split-brain)?

For (a),  AFR uses heuristics like picking a local (to that specfic glustershd process) brick, picking the bigger file, picking the file with latest ctime etc. and then does the heal.

For (b) you need to resort to using the gluster split-brain resolution CLI or setting the favorite-child-policy volume option to choose a good copy and trigger the heal.



