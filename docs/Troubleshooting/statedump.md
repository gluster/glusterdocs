# Statedump

A statedump is, as the name suggests, a dump of the internal state of a glusterfs process. It captures information about in-memory structures such as frames, call stacks, active inodes, fds, mempools, iobufs, and locks as well as xlator specific data structures. This can be an invaluable tool for debugging memory leaks and hung processes.



 - [Generate a Statedump](#generate-a-statedump)
 - [Read a Statedump](#read-a-statedump)
 - [Debug with a Statedump](#debug-with-statedumps)

************************


## Generate a Statedump
Run the command

```console
# gluster --print-statedumpdir
```

on a gluster server node to find out which directory the statedumps will be created in. This directory may need to be created if not already present.
For the rest of this document, we will refer to this directory as `statedump-directory`.

To generate a statedump for a process, run

```console
kill -USR1 <pid-of-gluster-process>
```

For client mounts:

Run the following command on the client system

```console
kill -USR1 <pid-of-gluster-mount-process>
```

There are specific commands to generate statedumps for all brick processes/nfs server/quotad which can be used instead of the above. Run the following
commands on one of the server nodes:


For bricks:

```console
gluster volume statedump <volname>
```

For the NFS server:

```console
gluster volume statedump <volname> nfs
```

For quotad:

```console
gluster volume statedump <volname> quotad
```

The statedumps will be created in `statedump-directory` on each node. The statedumps for brick processes will be created with the filename `hyphenated-brick-path.<pid>.dump.timestamp` while for all other processes it will be `glusterdump.<pid>.dump.timestamp`.

***

## Read a Statedump

Statedumps are text files and can be opened in any text editor. The first and last lines of the file contain the start and end time (in UTC)respectively of when the statedump file was written.

### Mallinfo
The mallinfo return status is printed in the following format. Please read _man mallinfo_ for more information about what each field means.

```
[mallinfo]
mallinfo_arena=100020224    /* Non-mmapped space allocated (bytes) */
mallinfo_ordblks=69467      /* Number of free chunks */
mallinfo_smblks=449         /* Number of free fastbin blocks */
mallinfo_hblks=13           /* Number of mmapped regions */
mallinfo_hblkhd=20144128    /* Space allocated in mmapped regions (bytes) */
mallinfo_usmblks=0          /* Maximum total allocated space (bytes) */
mallinfo_fsmblks=39264      /* Space in freed fastbin blocks (bytes) */
mallinfo_uordblks=96710112  /* Total allocated space (bytes) */
mallinfo_fordblks=3310112   /* Total free space (bytes) */
mallinfo_keepcost=133712    /* Top-most, releasable space (bytes) */
```

### Memory accounting stats
Each xlator defines data structures specific to its requirements. The statedump captures information about the memory usage and allocations of these structures for each xlator in the call-stack and prints them in the following format:

For the xlator with the name _glusterfs_

```
[global.glusterfs - Memory usage]   #[global.<xlator-name> - Memory usage]
num_types=119                       #The number of data types it is using
```


followed by the memory usage for each data-type for that translator. The following example displays a sample for the gf_common_mt_gf_timer_t type

```
[global.glusterfs - usage-type gf_common_mt_gf_timer_t memusage]
#[global.<xlator-name> - usage-type <tag associated with the data-type> memusage]
size=112          #Total size allocated for data-type when the statedump was taken i.e. num_allocs * sizeof (data-type)
num_allocs=2      #Number of allocations of the data-type which are active at the time of taking the statedump.
max_size=168      #max_num_allocs times the sizeof(data-type) i.e. max_num_allocs * sizeof (data-type)
max_num_allocs=3  #Maximum number of active allocations at any point in the life of the process.
total_allocs=7    #Number of times this data-type was allocated in the life of the process.
```

This information is useful while debugging high memory usage issues as steadily increasing values for num_allocs may indicate a memory leak for that data-type.

### Mempools

Mempools are an optimization intended to reduce the number of allocations of a data type. By creating a mempool of 1024 elements for a data-type, new elements of that type will be allocated from the heap using syscalls like calloc only if all the 1024 elements in the pool are in active use.

Memory pool allocations by each xlator are displayed in the following format:

```
[mempool] #Section name
-----=-----
pool-name=fuse:fd_t #pool-name=<xlator-name>:<data-type>
hot-count=1         #number of mempool elements in active use. i.e. for this pool it is the number of 'fd_t' elements in active use.
cold-count=1023     #number of mempool elements that are not in use. New allocation requests will be served from here until all the elements in the pool are in use i.e. cold-count becomes 0.
padded_sizeof=108   #Element size including padding. Each mempool element is padded with a doubly-linked-list + ptr of mempool + is-in-use info to operate the pool of elements
pool-misses=0       #Number of times the element was allocated from heap because all elements from the pool were in active use.
alloc-count=314     #Number of times this type of data was allocated through out the life of this process. This may include pool-misses as well.
max-alloc=3         #Maximum number of elements from the pool in active use at any point in the life of the process. This does *not* include pool-misses.
cur-stdalloc=0      #Number of allocations made from heap that are yet to be released via mem_put().
max-stdalloc=0      #Maximum number of allocations from heap that were in active use at any point in the life of the process.
```

This information is also useful while debugging high memory usage issues as large hot_count and cur-stdalloc values may point to an element not being freed after it has been used.


### Iobufs

```
[iobuf.global]
iobuf_pool=0x1f0d970                #The memory pool for iobufs
iobuf_pool.default_page_size=131072 #The default size of iobuf (if no iobuf size is specified the default size is allocated)
#iobuf_arena: One arena represents a group of iobufs of a particular size
iobuf_pool.arena_size=12976128       # The initial size of the iobuf pool (doesn't include the stdalloc'd memory or newly added arenas)
iobuf_pool.arena_cnt=8               #Total number of arenas in the pool
iobuf_pool.request_misses=0          #The number of iobufs that were stdalloc'd (as they exceeded the default max page size provided by iobuf_pool).
```

There are 3 lists of arenas

1. Arena list: arenas allocated during iobuf pool creation and the arenas that are in use(active_cnt != 0) will be part of this list.
2. Purge list: arenas that can be purged(no active iobufs, active_cnt == 0).
3. Filled list: arenas without free iobufs.

```
[purge.1]                        #purge.<S.No.>
purge.1.mem_base=0x7fc47b35f000  #The address of the arena structure
purge.1.active_cnt=0             #The number of iobufs active in that arena
purge.1.passive_cnt=1024         #The number of unused iobufs in the arena
purge.1.alloc_cnt=22853          #Total allocs in this pool(number of times the iobuf was allocated from this arena)
purge.1.max_active=7             #Max active iobufs from this arena, at any point in the life of this process.
purge.1.page_size=128            #Size of all the iobufs in this arena.

[arena.5] #arena.<S.No.>
arena.5.mem_base=0x7fc47af1f000
arena.5.active_cnt=0
arena.5.passive_cnt=64
arena.5.alloc_cnt=0
arena.5.max_active=0
arena.5.page_size=32768
```

If the active_cnt of any arena is non zero, then the statedump will also have the iobuf list.

```
[arena.6.active_iobuf.1]                  #arena.<S.No>.active_iobuf.<iobuf.S.No.>
arena.6.active_iobuf.1.ref=1              #refcount of the iobuf
arena.6.active_iobuf.1.ptr=0x7fdb921a9000 #address of the iobuf

[arena.6.active_iobuf.2]
arena.6.active_iobuf.2.ref=1
arena.6.active_iobuf.2.ptr=0x7fdb92189000
```

A lot of filled arenas at any given point in time could be a sign of iobuf leaks.


### Call stack

The fops received by gluster are handled using call stacks. A call stack contains information about the uid/gid/pid etc of the process that is executing the fop. Each call stack contains different call-frames for each xlator which handles that fop.

```
[global.callpool.stack.3]    #global.callpool.stack.<Serial-Number>
stack=0x7fc47a44bbe0         #Stack address
uid=0                        #Uid of the process executing the fop
gid=0                        #Gid of the process executing the fop
pid=6223                     #Pid of the process executing the fop
unique=2778                  #Some Xlators like afr do copy_frame and perform the operation in a different stack. This id is used to determine the stacks that are inter-related because of copy-frame
lk-owner=0000000000000000    #Some of the fuse fops have lk-owner.
op=LOOKUP                    #Fop
type=1                       #Type of the op i.e. FOP/MGMT-OP
cnt=9                        #Number of frames in this stack.
```

### Call-frame
Each frame will have information about which xlator the frame belongs to, which function it wound to/from and which it will be unwound to, and whether it has unwound.

```
[global.callpool.stack.3.frame.2] #global.callpool.stack.<stack-serial-number>.frame.<frame-serial-number>
frame=0x7fc47a611dbc              #Frame address
ref_count=0                       #Incremented at the time of wind and decremented at the time of unwind.
translator=r2-client-1            #Xlator this frame belongs to
complete=0                        #1 if this frame is already unwound. 0 if it is yet to unwind.
parent=r2-replicate-0             #Parent xlator of this frame
wind_from=afr_lookup              #Parent xlator function from which it was wound
wind_to=priv->children[i]->fops->lookup
unwind_to=afr_lookup_cbk          #Parent xlator function to unwind to
```

To debug hangs in the system, see which xlator has not yet unwound its fop by checking the value of the _complete_ tag in the statedump. (_complete=0_ indicates the xlator has not yet unwound).


### FUSE Operation History

Gluster Fuse maintains a history of the operations that it has performed.

```
[xlator.mount.fuse.history]
TIME=2014-07-09 16:44:57.523364
message=[0] fuse_release: RELEASE(): 4590:, fd: 0x1fef0d8, gfid: 3afb4968-5100-478d-91e9-76264e634c9f

TIME=2014-07-09 16:44:57.523373
message=[0] send_fuse_err: Sending Success for operation 18 on inode 3afb4968-5100-478d-91e9-76264e634c9f

TIME=2014-07-09 16:44:57.523394
message=[0] fuse_getattr_resume: 4591, STAT, path: (/iozone.tmp), gfid: (3afb4968-5100-478d-91e9-76264e634c9f)
```

### Xlator configuration

```
[cluster/replicate.r2-replicate-0] #Xlator type, name information
child_count=2                      #Number of children for the xlator
#Xlator specific configuration below
child_up[0]=1
pending_key[0]=trusted.afr.r2-client-0
child_up[1]=1
pending_key[1]=trusted.afr.r2-client-1
data_self_heal=on
metadata_self_heal=1
entry_self_heal=1
data_change_log=1
metadata_change_log=1
entry-change_log=1
read_child=1
favorite_child=-1
wait_count=1
```

### Graph/inode table

```
[active graph - 1]

conn.1.bound_xl./data/brick01a/homegfs.hashsize=14057
conn.1.bound_xl./data/brick01a/homegfs.name=/data/brick01a/homegfs/inode
conn.1.bound_xl./data/brick01a/homegfs.lru_limit=16384 #Least recently used size limit
conn.1.bound_xl./data/brick01a/homegfs.active_size=690 #Number of inodes undergoing some kind of fop ie., on which there is at least one ref.
conn.1.bound_xl./data/brick01a/homegfs.lru_size=183    #Number of inodes present in lru list
conn.1.bound_xl./data/brick01a/homegfs.purge_size=0    #Number of inodes present in purge list
```

### Inode

```
[conn.1.bound_xl./data/brick01a/homegfs.active.324] #324th inode in active inode list
gfid=e6d337cf-97eb-44b3-9492-379ba3f6ad42           #Gfid of the inode
nlookup=13                                          #Number of times lookups happened from the client or from fuse kernel
fd-count=4                                          #Number of fds opened on the inode
ref=11                                              #Number of refs taken on the inode
ia_type=1                                           #Type of the inode. This should be changed to some string :-(

[conn.1.bound_xl./data/brick01a/homegfs.lru.1] #1st inode in lru list. Note that ref count is zero for these inodes.
gfid=5114574e-69bc-412b-9e52-f13ff087c6fc
nlookup=5
fd-count=0
ref=0
ia_type=2
```

### Inode context
Each xlator can store information specific to it in the inode context. This context can also be printed in the statedump. Here is the inode context of the locks xlator

```
[xlator.features.locks.homegfs-locks.inode]
path=/homegfs/users/dfrobins/gfstest/r4/SCRATCH/fort.5102 - path of the file
mandatory=0
inodelk-count=5 #Number of inode locks
lock-dump.domain.domain=homegfs-replicate-0:self-heal #Domain on which the lock was taken. In this case, this domain is used by the selfheal to prevent more than one heal on the same file
inodelk.inodelk[0](ACTIVE)=type=WRITE, whence=0, start=0, len=0, pid = 18446744073709551615, owner=080b1ada117f0000, client=0xb7fc30, connection-id=compute-30-029.com-3505-2014/06/29-14:46:12:477358-homegfs-client-0-0-1, granted at Sun Jun 29 11:01:00 2014 #Active lock information

inodelk.inodelk[1](BLOCKED)=type=WRITE, whence=0, start=0, len=0, pid = 18446744073709551615, owner=c0cb091a277f0000, client=0xad4f10, connection-id=gfs01a.com-4080-2014/06/29-14:41:36:917768-homegfs-client-0-0-0, blocked at Sun Jun 29 11:04:44 2014 #Blocked lock information

lock-dump.domain.domain=homegfs-replicate-0:metadata #Domain name where metadata operations take locks to maintain replication consistency
lock-dump.domain.domain=homegfs-replicate-0 #Domain name where entry/data operations take locks to maintain replication consistency
inodelk.inodelk[0](ACTIVE)=type=WRITE, whence=0, start=11141120, len=131072, pid = 18446744073709551615, owner=080b1ada117f0000, client=0xb7fc30, connection-id=compute-30-029.com-3505-2014/06/29-14:46:12:477358-homegfs-client-0-0-1, granted at Sun Jun 29 11:10:36 2014 #Active lock information
```
 
*** 

## Debug With Statedumps
### Memory leaks

Statedumps can be used to determine whether the high memory usage of a process is caused by a leak. To debug the issue, generate statedumps for that process at regular intervals, or before and after running the steps that cause the memory used to increase. Once you have multiple statedumps, compare the memory allocation stats to see if any of them are increasing steadily as those could indicate a potential memory leak.

The following examples walk through using statedumps to debug two different memory leaks.

#### With the memory accounting feature:

[BZ 1120151](https://bugzilla.redhat.com/show_bug.cgi?id=1120151) reported high memory usage by the self heal daemon whenever one of the bricks was wiped in a replicate volume and a full self-heal was invoked to heal the contents. This issue was debugged using statedumps to determine which data-structure was leaking memory.

A statedump of the self heal daemon process was taken using 

```console
kill -USR1 `<pid-of-gluster-self-heal-daemon>`
```

On examining the statedump:

```
grep -w num_allocs glusterdump.5225.dump.1405493251
num_allocs=77078
num_allocs=87070
num_allocs=117376
....

grep hot-count glusterdump.5225.dump.1405493251
hot-count=16384
hot-count=16384
hot-count=4095
....
```

On searching for num_allocs with high values in the statedump, a `grep` of the statedump revealed a large number of allocations for the following data-types under the replicate xlator:
1. gf_common_mt_asprintf
2. gf_common_mt_char
3. gf_common_mt_mem_pool.

On checking the afr-code for allocations with tag `gf_common_mt_char`, it was found that the `data-self-heal` code path does not free one such allocated data structure. `gf_common_mt_mem_pool` suggests that there is a leak in pool memory. The `replicate-0:dict_t`, `glusterfs:data_t` and `glusterfs:data_pair_t` pools are using a lot of memory, i.e. cold_count is `0` and there are too many allocations. Checking the source code of dict.c shows that `key` in `dict` is allocated with `gf_common_mt_char` i.e. `2.` tag and value is created using gf_asprintf which in-turn uses `gf_common_mt_asprintf` i.e. `1.`. Checking the code for leaks in self-heal code paths led to a line which over-writes a variable with new dictionary even when it was already holding a reference to another dictionary. After fixing these leaks, we ran the same test to verify that none of the `num_allocs` values increased in the statedump of the self-daemon after healing 10,000 files.
Please check [http://review.gluster.org/8316](http://review.gluster.org/8316) for more info about the patch/code.


#### Leaks in mempools:
The statedump output of mempools was used to test and verify the fixes for [BZ 1134221](https://bugzilla.redhat.com/show_bug.cgi?id=1134221). On code analysis, dict_t objects were found to be leaking (due to missing unref's) during name self-heal. 

Glusterfs was compiled with the -DDEBUG flags to have cold count set to 0 by default. The test involved creating 100 files on plain replicate volume, removing them from one of the backend bricks, and then triggering lookups on them from the mount point. A statedump of the mount process was taken before executing the test case and after it was completed.

Statedump output of the fuse mount process before the test case was executed:

```

pool-name=glusterfs:dict_t
hot-count=0
cold-count=0
padded_sizeof=140
alloc-count=33
max-alloc=0
pool-misses=33
cur-stdalloc=14
max-stdalloc=18

```
Statedump output of the fuse mount process after the test case was executed:

```

pool-name=glusterfs:dict_t
hot-count=0
cold-count=0
padded_sizeof=140
alloc-count=2841
max-alloc=0
pool-misses=2841
cur-stdalloc=214
max-stdalloc=220

```
Here, as cold count was 0 by default, cur-stdalloc indicates the number of dict_t objects that were allocated from the heap using mem_get(), and are yet to be freed using mem_put(). After running the test case (named selfheal of 100 files), there was a rise in the cur-stdalloc value (from 14 to 214) for dict_t.

After the leaks were fixed, glusterfs was again compiled with -DDEBUG flags and the steps were repeated. Statedumps of the FUSE mount were taken before and after executing the test case to ascertain the validity of the fix. And the results were as follows:

Statedump output of the fuse mount process before executing the test case:

```
pool-name=glusterfs:dict_t
hot-count=0
cold-count=0
padded_sizeof=140
alloc-count=33
max-alloc=0
pool-misses=33
cur-stdalloc=14
max-stdalloc=18

```
Statedump output of the fuse mount process after executing the test case:

```
pool-name=glusterfs:dict_t
hot-count=0
cold-count=0
padded_sizeof=140
alloc-count=2837
max-alloc=0
pool-misses=2837
cur-stdalloc=14
max-stdalloc=119

```
The value of cur-stdalloc remained 14 after the test, indicating that the fix indeed does what it's supposed to do.

### Hangs caused by frame loss
[BZ 994959](https://bugzilla.redhat.com/show_bug.cgi?id=994959) reported that the Fuse mount hangs on a readdirp operation.
Here are the steps used to locate the cause of the hang using statedump.

Statedumps were taken for all gluster processes after reproducing the issue. The following stack was seen in the FUSE mount's statedump:

```
[global.callpool.stack.1.frame.1]
ref_count=1
translator=fuse
complete=0

[global.callpool.stack.1.frame.2]
ref_count=0
translator=r2-client-1
complete=1 <<----- Client xlator has completed the readdirp call and unwound to afr
parent=r2-replicate-0
wind_from=afr_do_readdir
wind_to=children[call_child]->fops->readdirp
unwind_from=client3_3_readdirp_cbk
unwind_to=afr_readdirp_cbk

[global.callpool.stack.1.frame.3]
ref_count=0
translator=r2-replicate-0
complete=0 <<---- But the Afr xlator is not unwinding for some reason.
parent=r2-dht
wind_from=dht_do_readdir
wind_to=xvol->fops->readdirp
unwind_to=dht_readdirp_cbk

[global.callpool.stack.1.frame.4]
ref_count=1
translator=r2-dht
complete=0
parent=r2-io-cache
wind_from=ioc_readdirp
wind_to=FIRST_CHILD(this)->fops->readdirp
unwind_to=ioc_readdirp_cbk

[global.callpool.stack.1.frame.5]
ref_count=1
translator=r2-io-cache
complete=0
parent=r2-quick-read
wind_from=qr_readdirp
wind_to=FIRST_CHILD (this)->fops->readdirp
unwind_to=qr_readdirp_cbk

```
`unwind_to` shows that call was unwound to `afr_readdirp_cbk` from the r2-client-1 xlator.
Inspecting that function revealed that afr is not unwinding the stack when fop failed.
Check [http://review.gluster.org/5531](http://review.gluster.org/5531) for more info about patch/code changes.
