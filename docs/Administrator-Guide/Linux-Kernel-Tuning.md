Linux kernel tuning for GlusterFS
---------------------------------

Every now and then, questions come up here internally and with many
enthusiasts on what Gluster has to say about kernel tuning, if anything.

The rarity of kernel tuning is on account of the Linux kernel doing a
pretty good job on most workloads. But there is a flip side to this
design. The Linux kernel historically has eagerly eaten up a lot of RAM,
provided there is some, or driven towards caching as the primary way to
improve performance.

For most cases, this is fine, but as the amount of workload increases
over time and clustered load is thrown upon the servers, this turns out
to be troublesome, leading to catastrophic failures of jobs etc.

Having had a fair bit of experience looking at large memory systems with
heavily loaded regressions, be it CAD, EDA or similar tools, we've
sometimes encountered stability problems with Gluster. We had to
carefully analyse the memory footprint and amount of disk wait times
over days. This gave us a rather remarkable story of disk trashing, huge
iowaits, kernel oops, disk hangs etc.

This article is the result of my many experiences with tuning options
which were performed on many sites. The tuning not only helped with
overall responsiveness, but it dramatically stabilized the cluster
overall.

When it comes to memory tuning the journey starts with the 'VM'
subsystem which has a bizarre number of options, which can cause a lot
of confusion.

### vm.swappiness

vm.swappiness is a tunable kernel parameter that controls how much the
kernel favors swap over RAM. At the source code level, it’s also defined
as the tendency to steal mapped memory. A high swappiness value means
that the kernel will be more apt to unmap mapped pages. A low swappiness
value means the opposite, the kernel will be less apt to unmap mapped
pages. In other words, the higher the vm.swappiness value, the more the
system will swap.

High system swapping has very undesirable effects when there are huge
chunks of data being swapped in and out of RAM. Many have argued for the
value to be set high, but in my experience, setting the value to '0'
causes a performance increase.

Conforming with the details here - <http://lwn.net/Articles/100978/>

But again these changes should be driven by testing and due diligence
from the user for their own applications. Heavily loaded, streaming apps
should set this value to '0'. By changing this value to '0', the
system's responsiveness improves.

### vm.vfs\_cache\_pressure

This option controls the tendency of the kernel to reclaim the memory
which is used for caching of directory and inode objects.

At the default value of vfs\_cache\_pressure=100 the kernel will attempt
to reclaim dentries and inodes at a "fair" rate with respect to
pagecache and swapcache reclaim. Decreasing vfs\_cache\_pressure causes
the kernel to prefer to retain dentry and inode caches. When
vfs\_cache\_pressure=0, the kernel will never reclaim dentries and
inodes due to memory pressure and this can easily lead to out-of-memory
conditions. Increasing vfs\_cache\_pressure beyond 100 causes the kernel
to prefer to reclaim dentries and inodes.

With GlusterFS, many users with a lot of storage and many small files
easily end up using a lot of RAM on the server side due to
'inode/dentry' caching, leading to decreased performance when the kernel
keeps crawling through data-structures on a 40GB RAM system. Changing
this value higher than 100 has helped many users to achieve fair caching
and more responsiveness from the kernel.

### vm.dirty\_background\_ratio

### vm.dirty\_ratio

The first of the two (vm.dirty\_background\_ratio) defines the
percentage of memory that can become dirty before a background flushing
of the pages to disk starts. Until this percentage is reached no pages
are flushed to disk. However when the flushing starts, then it's done in
the background without disrupting any of the running processes in the
foreground.

Now the second of the two parameters (vm.dirty\_ratio) defines the
percentage of memory which can be occupied by dirty pages before a
forced flush starts. If the percentage of dirty pages reaches this
threshold, then all processes become synchronous, and they are not
allowed to continue until the io operation they have requested is
actually performed and the data is on disk. In cases of high performance
I/O machines, this causes a problem as the data caching is cut away and
all of the processes doing I/O become blocked to wait for I/O. This will
cause a large number of hanging processes, which leads to high load,
which leads to an unstable system and crappy performance.

Lowering them from standard values causes everything to be flushed to
disk rather than storing much in RAM. It helps large memory systems,
which would normally flush a 45G-90G pagecache to disk, causing huge
wait times for front-end applications, decreasing overall responsiveness
and interactivity.

### "1" \> /proc/sys/vm/pagecache

Page Cache is a disk cache which holds data from files and executable
programs, i.e. pages with actual contents of files or block devices.
Page Cache (disk cache) is used to reduce the number of disk reads. A
value of '1' indicates 1% of the RAM is used for this, so that most of
them are fetched from disk rather than RAM. This value is somewhat fishy
after the above values have been changed. Changing this option is not
necessary, but if you are still paranoid about controlling the
pagecache, this value should help.

### "deadline" \> /sys/block/sdc/queue/scheduler

The I/O scheduler is a component of the Linux kernel which decides how
the read and write buffers are to be queued for the underlying device.
Theoretically 'noop' is better with a smart RAID controller because
Linux knows nothing about (physical) disk geometry, therefore it can be
efficient to let the controller, well aware of disk geometry, handle the
requests as soon as possible. But 'deadline' seems to enhance
performance. You can read more about them in the Linux kernel source
documentation: linux/Documentation/block/\*iosched.txt . I have also
seen 'read' throughput increase during mixed-operations (many writes).

### "256" \> /sys/block/sdc/queue/nr\_requests

This is the size of I/O requests which are buffered before they are
communicated to the disk by the Scheduler. The internal queue size of
some controllers (queue\_depth) is larger than the I/O scheduler's
nr\_requests so that the I/O scheduler doesn't get much of a chance to
properly order and merge the requests. Deadline or CFQ scheduler likes
to have nr\_requests to be set 2 times the value of queue\_depth, which
is the default for a given controller. Merging the order and requests
helps the scheduler to be more responsive during huge load.

### echo "16" \> /proc/sys/vm/page-cluster

page-cluster controls the number of pages which are written to swap in a
single attempt. It defines the swap I/O size, in the above example
adding '16' as per the RAID stripe size of 64k. This wouldn't make sense
after you have used swappiness=0, but if you defined swappiness=10 or
20, then using this value helps when your have a RAID stripe size of
64k.

### blockdev --setra 4096 /dev/<devname> (eg:- sdb, hdc or dev\_mapper)

Default block device settings often result in terrible performance for
many RAID controllers. Adding the above option, which sets read-ahead to
4096 \* 512-byte sectors, at least for the streamed copy, increases the
speed, saturating the HD's integrated cache by reading ahead during the
period used by the kernel to prepare I/O. It may put in cached data
which will be requested by the next read. Too much read-ahead may kill
random I/O on huge files if it uses potentially useful drive time or
loads data beyond caches.

A few other miscellaneous changes which are recommended at filesystem
level but haven't been tested yet are the following. Make sure that your
filesystem knows about the stripe size and number of disks in the array.
E.g. for a raid5 array with a stripe size of 64K and 6 disks
(effectively 5, because in every stripe-set there is one disk doing
parity). These are built on theoretical assumptions and gathered from
various other blogs/articles provided by RAID experts.

-\> ext4 fs, 5 disks, 64K stripe, units in 4K blocks

mkfs -text4 -E stride=\$((64/4))

-\> xfs, 5 disks, 64K stripe, units in 512-byte sectors

mkfs -txfs -d sunit=\$((64\*2)) -d swidth=\$((5\*64\*2))

You may want to consider increasing the above stripe sizes for streaming
large files.

WARNING: Above changes are highly subjective with certain types of
applications. This article doesn't guarantee any benefits whatsoever
without prior due diligence from the user for their respective
applications. It should only be applied at the behest of an expected
increase in overall system responsiveness or if it resolves ongoing
issues.

More informative and interesting articles/emails/blogs to read

-   <http://dom.as/2008/02/05/linux-io-schedulers/>
-   <http://www.nextre.it/oracledocs/oraclemyths.html>
-   <https://lkml.org/lkml/2006/11/15/40>
-   <http://misterd77.blogspot.com/2007/11/3ware-hardware-raid-vs-linux-software.html>

`   Last updated by: `[`User:y4m4`](User:y4m4 "wikilink")

### comment:jdarcy

Some additional tuning ideas:

`   * The choice of scheduler is *really* hardware- and workload-dependent, and some schedulers have unique features other than performance.  For example, last time I looked cgroups support was limited to the cfq scheduler.  Different tests regularly do best on any of cfq, deadline, or noop.  The best advice here is not to use a particular scheduler but to try them all for a specific need.`

`   * It's worth checking to make sure that /sys/.../max_sectors_kb matches max_hw_sectors_kb.  I haven't seen this problem for a while, but back when I used to work on Lustre I often saw that these didn't match and performance suffered.`

`   * For read-heavy workloads, experimenting with /sys/.../readahead_kb is definitely worthwhile.`

`   * Filesystems should be built with -I 512 or similar so that more xattrs can be stored in the inode instead of requiring an extra seek.`

`   * Mounting with noatime or relatime is usually good for performance.`

#### reply:y4m4

`   Agreed i was about write those parameters you mentioned. I should write another elaborate article on FS changes. `

y4m4

### comment:eco

`       1 year ago`\
`   This article is the model on which all articles should be written.  Detailed information, solid examples and a great selection of references to let readers go more in depth on topics they choose.  Great benchmark for others to strive to attain.`\
`       Eco`\

### comment:y4m4

`   sysctl -w net.core.{r,w}mem_max = 4096000 - this helped us to Reach 800MB/sec with replicated GlusterFS on 10gige  - Thanks to Ben England for these test results. `\
`       y4m4`

### comment:bengland

`   After testing Gluster 3.2.4 performance with RHEL6.1, I'd suggest some changes to this article's recommendations:`

`   vm.swappiness=10 not 0 -- I think 0 is a bit extreme and might lead to out-of-memory conditions, but 10 will avoid just about all paging/swapping.  If you still see swapping, you need to probably focus on restricting dirty pages with vm.dirty_ratio.`

`   vfs_cache_pressure > 100 -- why?   I thought this was a percentage.`

`   vm.pagecache=1 -- some distros (e.g. RHEL6) don't have vm.pagecache parameter. `

`   vm.dirty_background_ratio=1 not 10 (kernel default?) -- the kernel default is a bit dependent on choice of Linux distro, but for most workloads it's better to set this parameter very low to cause Linux to push dirty pages out to storage sooner.    It means that if dirty pages exceed 1% of RAM then it will start to asynchronously write dirty pages to storage. The only workload where this is really bad: apps that write temp files and then quickly delete them (compiles) -- and you should probably be using local storage for such files anyway. `

`   Choice of vm.dirty_ratio is more dependent upon the workload, but in other contexts I have observed that response time fairness and stability is much better if you lower dirty ratio so that it doesn't take more than 2-5 seconds to flush all dirty pages to storage. `

`   block device parameters:`

`   I'm not aware of any case where cfq scheduler actually helps Gluster server.   Unless server I/O threads correspond directly to end-users, I don't see how cfq can help you.  Deadline scheduler is a good choice.  I/O request queue has to be deep enough to allow scheduler to reorder requests to optimize away disk seeks.  The parameters max_sectors_kb and nr_requests are relevant for this.  For read-ahead, consider increasing it to the point where you prefetch for longer period of time than a disk seek (on order of 10 msec), so that you can avoid unnecessary disk seeks for multi-stream workloads.  This comes at the expense of I/O latency so don't overdo it.`

`   network:`

`   jumbo frames can increase throughput significantly for 10-GbE networks.`

`   Raise net.core.{r,w}mem_max to 540000 from default of 131071  (not 4 MB above, my previous recommendation).  Gluster 3.2 does setsockopt() call to use 1/2 MB mem for TCP socket buffer space.`\
`       bengland`\

### comment:hjmangalam

`   Thanks very much for noting this info - the descriptions are VERY good.. I'm in the midst of debugging a misbehaving gluster that can't seem to handle small writes over IPoIB and this contains some useful pointers.`

`   Some suggestions that might make this more immediately useful:`

`   - I'm assuming that this discussion refers to the gluster server nodes, not to the gluster native client nodes, yes?  If that's the case, are there are also kernel parameters or recommended settings for the client nodes?`\
`   -  While there are some cases where you mention that a value should be changed to a particular # or %, in a number of cases you advise just increasing/decreasing the values, which for something like  a kernel parameter is probably not a useful suggestion.  Do I raise it by 10?  10%  2x? 10x?  `

`   I also ran across a complimentary page, which might be of  interest - it explains more of the vm variables, especially as it relates to writing.`\
`   "Theory of Operation and Tuning for Write-Heavy Loads" `\
`      ``   and refs therein.`
`       hjmangalam`

### comment:bengland

`   Here are some additional suggestions based on recent testing:`\
`   - scaling out number of clients -- you need to increase the size of the ARP tables on Gluster server if you want to support more than 1K clients mounting a gluster volume.  The defaults for RHEL6.3 were too low to support this, we used this:`

`   net.ipv4.neigh.default.gc_thresh2 = 2048`\
`   net.ipv4.neigh.default.gc_thresh3 = 4096`

`   In addition, tunings common to webservers become relevant at this number of clients as well, such as netdev_max_backlog, tcp_fin_timeout, and somaxconn.`

`   Bonding mode 6 has been observed to increase replication write performance, I have no experience with bonding mode 4 but it should work if switch is properly configured, other bonding modes are a waste of time.`

`       bengland`\
`       3 months ago`
