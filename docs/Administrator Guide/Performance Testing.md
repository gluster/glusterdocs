Gluster performance testing
===========================

Once you have created a Gluster volume, you need to verify that it has
adequate performance for your application, and if it does not, you need
a way to isolate the root cause of the problem.

There are two kinds of workloads:

* synthetic - run a test program such as ones below
* application - run existing application

# Profiling tools

Ideally it's best to use the actual application that you want to run on Gluster, but applications often don't tell the sysadmin much about where the performance problems are, particularly latency (response-time) problems.  So there are non-invasive profiling tools built into Gluster that can measure performance as seen by the application, without changing the application.  Gluster profiling methods at present are based on the io-stats translator, and include:

* client-side profiling - instrument a Gluster mountpoint or libgfapi process to sample profiling data.  In this case, the io-stats translator is at the "top" of the translator stack, so the profile data truly represents what the application (or FUSE mountpoint) is asking Gluster to do.  For example, a single application write is counted once as a WRITE FOP (file operation) call, and the latency for that WRITE FOP includes latency of the data replication done by the AFR translator lower in the stack.

* server-side profiling - this is done using the "gluster volume profile" command (and "gluster volume top" can be used to identify particular hot files in use as well).  Server-side profiling can measure the throughput of an entire Gluster volume over time, and can measure server-side latencies.  However, it does not incorporate network or client-side latencies.  It is also hard to infer application behavior because of client-side translators that alter the I/O workload (examples: erasure coding, cache tiering).

In short, use client-side profiling for understanding "why is my application unresponsive"? and use server-side profiling for understand how busy your Gluster volume is, what kind of workload is being applied to it (i.e. is it mostly-read?  is it small-file?), and how well the I/O load is spread across the volume.

## client-side profiling

To run client-side profiling,

- gluster volume profile your-volume start
- setfattr -n trusted.io-stats-dump -v /tmp/io-stats-pre.txt /your/mountpoint

This will generate the specified file on the client.  A script like [gvp-client.sh](https://github.com/bengland2/gluster-profile-analysis)  can automate collection of this data.  

TBS: what the different FOPs are and what they mean.

## server-side profiling

To run it:

- gluster volume profile your-volume start
- repeat this command periodically: gluster volume profile your-volume info
- gluster volume profile your-volume stop

A script like [gvp.sh](https://github.com/bengland2/gluster-profile-analysis) can help you automate this procedure.

Scripts to post-process this data are in development now, let us know what you need and what would be a useful format for presenting the data.

# Testing tools

In this section, we suggest some basic workload tests that can be used to
measure Gluster performance in an application-independent way for a wide
variety of POSIX-like operating systems and runtime environments. We
then provide some terminology and conceptual framework for interpreting
these results.

The tools that we suggest here are designed to run in a distributed
filesystem. This is still a relatively rare attribute for filesystem
benchmarks, even now! There is a much larger set of benchmarks available
that can be run from a single system. While single-system results are
important, they are far from a definitive measure of the performance
capabilities of a distributed filesystem.

-   [fio](http://freecode.com/projects/fio) - for large file I/O tests.
-   [smallfile](https://github.com/bengland2/smallfile) - for
    pure-workload small-file tests
-   [iozone](http://www.iozone.org) - for pure-workload large-file tests
-   [parallel-libgfapi](https://github.com/bengland2/parallel-libgfapi) - for pure-workload libgfapi tests

The "netmist" mixed-workload generator of SPECsfs2014 may be suitable in some cases, but is not technically an open-source tool. This tool was written by Don Capps, who was an author of iozone. 

### fio

fio is extremely powerful and is easily installed from traditional distros, unlike iozone, and has increasingly powerful distributed test capabilities described in its --client parameter upstream as of May 2015. To use this mode, start by launching an fio "server" instance on each workload generator host using: 

        fio --server --daemonize=/var/run/fio-svr.pid
        
And make sure your firewall allows port 8765 through for it. You can now run tests on sets of hosts using syntax like:

        fio --client=workload-generator.list --output-format=json my-workload.fiojob

You can also use it for distributed testing, however, by launching fio instances on separate hosts, taking care to start all fio instances as close to the same time as possible, limiting per-thread throughput, and specifying the run duration rather than the amount of data, so that all fio instances end at around the same time. You can then aggregate the fio results from different hosts to get a meaningful aggregate result.

fio also has different I/O engines, in particular Huamin Chen authored the ***libgfapi*** engine for fio so that you can use fio to test Gluster performance without using FUSE.

Limitations of fio in distributed mode:

-   stonewalling - fio calculates throughput based on when the last thread finishes a test run. In contrast, iozone calculates throughput by default based on when the FIRST thread finishes the workload. This can lead to (deceptively?) higher throughput results for iozone, since there are inevitably some "straggler" threads limping to the finish line later than others. It is possible in some cases to overcome this limitation by specifying a time limit for the test. This works well for random I/O tests, where typically you do not want to read/write the entire file/device anyway.
-   inaccuracy when response times > 1 sec - at least in some cases fio has reported excessively high IOPS when fio threads encounter response times much greater than 1 second, this can happen for distributed storage when there is unfairness in the implementation. 
-   io engines are not integrated.

### smallfile Distributed I/O Benchmark

[Smallfile](https://github.com/distributed-system-analysis/smallfile) is a python-based small-file distributed POSIX workload generator which can be used to quickly measure performance for a variety of metadata-intensive workloads across an entire cluster. It has no dependencies on any specific filesystem or implementation AFAIK. It runs on Linux, Windows and should work on most Unixes too. It is intended to complement use of iozone benchmark for measuring performance of large-file workloads, and borrows certain concepts from iozone and Ric Wheeler's fs_mark. It was developed by Ben England starting in March 2009, and is now open-source (Apache License v2).

Here is a typical simple sequence of tests where files laid down in an initial create test are then used in subsequent tests. There are many more smallfile operation types than these 5 (see doc), but these are the most commonly used ones. 

        SMF="./smallfile_cli.py --top /mnt/glusterfs/smf --host-set h1,h2,h3,h4 --threads 8 --file-size 4 --files 10000 --response-times Y "
        $SMF --operation create
        for s in $SERVERS ; do ssh $h 'echo 3 > /proc/sys/vm/drop_caches' ; done
        $SMF --operation read
        $SMF --operation append
        $SMF --operation rename
        $SMF --operation delete

### iozone

This tool has limitations but does distributed testing well using -+m
option (below).

The "-a" option for automated testing of all use cases is discouraged,
because:

-   this does not allow you to drop the read cache in server before a
    test.
-   most of the data points being measured will be irrelevant to the
    problem you are solving.

Single-thread testing is an important use case, but to fully utilize the
available hardware you typically need to do multi-thread and even
multi-host testing.

Consider using "-c -e" options to measure the time it takes for data to
reach persistent storage. "-C" option lets you see how much each thread
participated in the test. "-+n" allows you to save time by skipping
re-read and re-write tests. "-w" option tells iozone not to delete any
files that it accessed, so that subsequent tests can use them. Specify
these options with each test:

-   -i -- test type, 0=write, 1=read, 2=random read/write
-   -r -- data transfer size -- allows you to simulate I/O size used by
    application
-   -s -- per-thread file size -- choose this to be large enough for the
    system to reach steady state (typically multiple GB needed)
-   -t -- number of threads -- how many subprocesses will be
    concurrently issuing I/O requests
-   -F -- list of files -- what files to write/read. If you do not
    specify then the filenames iozone.DUMMY.\* will be used in the
    default directory.

Example of an 8-thread sequential write test with 64-KB transfer size
and file size of 1 GB to shared Gluster mountpoint directory
/mnt/glusterfs , including time to fsync() and close() the files in the
throughput calculation:

        iozone -w -c -e -i 0 -+n -C -r 64k -s 1g -t 8 -F /mnt/glusterfs/f{0,1,2,3,4,5,6,7,8}.ioz

WARNING: random I/O testing in iozone is very restricted by iozone
constraint that it must randomly read then randomly write the entire
file! This is not what we want - instead it should randomly read/write
for some fraction of file size or time duration, allowing us to spread
out more on the disk while not waiting too long for test to finish. This
is why fio (below) is the preferred test tool for random I/O workloads.

Distributed testing is a strength of the iozone utility, but this
requires use of "-+m" option in place of "-F" option. The configuration
file passed with "-+m" option contains a series of records that look
like this:

        hostname   directory   iozone-pathname

Where hostname is a host name or IP address of a test driver machine
that iozone can use, directory is the pathname of a directory to use
within that host, and iozone-pathname is the full pathname of the iozone
executable to use on that host. Be sure that every target host can
resolve the hostname of host where the iozone command was run. All
target hosts must permit password-less ssh access from the host running
the command. 

For example: (Here, my-ip-address refers to the machine from where the iozone is being run)

        export RSH=ssh
        iozone -+m ioz.cfg -+h my-ip-address -w -c -e -i 0 -+n -C -r 64k -s 1g -t 4

And the file ioz.cfg contains these records (where /mnt/glusterfs is the
Gluster mountpoint on each test machine and test-client-ip is the IP address of a client). Also note that, Each record in the file is a thread in IOZone terminology. Since we have defined the number of threads to be 4 in the above example, we have four records(threads) for a single client.

        test-client-ip  /mnt/glusterfs  /usr/local/bin/iozone
        test-client-ip  /mnt/glusterfs  /usr/local/bin/iozone
        test-client-ip  /mnt/glusterfs  /usr/local/bin/iozone
        test-client-ip  /mnt/glusterfs  /usr/local/bin/iozone

Restriction: Since iozone uses non-privileged ports it may be necessary
to temporarily shut down or alter iptables on some/all of the hosts.
slave machines must support password-less access from master machine via
ssh.

Note that the -+h option is undocumented but it tells the slave host
what IP address to use so that the slave does not have to be able to
resolve the hostname of the test driver. my-ip-address is the IP address
that the slaves should connect to in order to report results back to the
host. This need not be the same as the host's hostname.

Typically you run the sequential write test first to lay down the file,
drop cache on the servers (and clients if necessary), do the sequential
read test, drop cache, do random I/O test if desired. Using above
example:

        export RSH=ssh
        IOZ="iozone -+m ioz.cfg -+h my-ip-address -w -C -c -e -r 64k -+n "
         hosts="`awk '{ print $1 }' ioz.cfg`"
        $IOZ -i 0 -s 1g -t 4`\
        for n in $hosts $servers ; do \
           ssh $n 'sync; echo 1 > /proc/sys/vm/drop_caches' ; done
        $IOZ -i 1 -s 1g -t 4
        for n in $hosts $servers ; do \
           ssh $n 'sync; echo 1 > /proc/sys/vm/drop_caches' ; done
        $IOZ -i 2 -s 1g -t 4

If you use client with buffered I/O (the default), drop cache on the
client machines first, then the server machines also as shown above.

### parallel-libgfapi

This test exercises Gluster performance using the libgfapi API,
bypassing FUSE - no mountpoints are used. Available
[here](https://github.com/bengland2/parallel-libgfapi).

To use it, you edit the script parameters in parallel\_gfapi\_test.sh
script - all of them are above the comment "NO EDITABLE PARAMETERS BELOW
THIS LINE". These include such things as the Gluster volume name, a host
serving that volume, number of files, etc. You then make sure that the
gfapi\_perf\_test executable is distributed to the client machines at
the specified directory, and then run the script. The script starts all
libgfapi workload generator processes in parallel in such a way that
they all start the test at the same time. It waits until they all
complete, and then it collects and aggregates the results for you.

Note that libgfapi processes consume one socket per brick, so in Gluster
volumes with high brick counts, there can be constraints on the number
of libgfapi processes that can run concurrently. Specifically, each host
can only support up to about 30000 concurrent TCP ports. You may need to
adjust "ulimit -n" parameter (see /etc/security/limits.conf "nofile"
parameter for persistent tuning).

### Object Store tools

[COSBench](http://www.snia.org/sites/default/files/files2/files2/SDC2013/presentations/Cloud/YaguangWang__COSBench_Final.pdf)
was developed by Intel employees and is very useful for both Swift and
S3 workload generation.

[ssbench](https://pypi.python.org/pypi/ssbench) is
part of OpenStack Swift toolset and is command-line tool with a workload
definition file format.

Workload
--------

An application can be as simple as writing some files, or it can be as
complex as running a cloud on top of Gluster. But all applications have
performance requirements, whether the users are aware of them or not,
and if these requirements aren't met, the system as a whole is not
functional from the user's perspective. The activities that the
application spends most of its time doing with Gluster are called the
"workload" below. For the Gluster filesystem, the "workload" consists of
the filesystem requests being delivered to Gluster by the application.
There are two ways to look at workload:

-   top-down - what is the application trying to get the filesystem to
    do?
-   bottom-up - what requests is the application actually generating to
    the filesystem?

### data vs metadata

In this page we frequently refer to "large-file" or "small-file"
workloads. But what do we mean by the terms "large-file" or
"small-file"? "large-file" is a deliberately vague but descriptive term
that refers to workloads where most of the application time is spent
reading/writing the file. This is in contrast to a "small-file"
workload, where most of the application's time is spent opening/closing
the file or accessing metadata about the file. Metadata means "data
about data", so it is information that describes the state of the file,
rather than the contents of the file. For example, a filename is a type
of metadata, as are directories and extended attributes.

### Top-down workload analysis

Often this is what users will be able to help you with -- for example, a
workload might consist of ingesting a billion .mp3 files. Typical
questions that need to be answered (approximately) are:

-   what is file size distribution? Averages are often not enough - file
    size distributions can be bi-modal (i.e. consist mostly of the very
    large and very small file sizes). TBS: provide pointers to scripts
    that can collect this.
-   what fraction of file accesses are reads vs writes?
-   how cache-friendly is the workload? Do the same files get read
    repeatedly by different Gluster clients, or by different
    processes/threads on these clients?
-   for large-file workloads, what fraction of accesses are
    sequential/random? Sequential file access means that the application
    thread reads/writes the file from start to finish in byte offset
    order, and random file access is the exact opposite -- the thread
    may read/write from any offset at any time. Virtual machine disk
    images are typically accessed randomly, since the VM's filesystem is
    embedded in a Gluster file.

Why do these questions matter? For example, if you have a large-file
sequential read workload, network configuration + Gluster and Linux
readahead is important. If you have a small-file workload, storage
configuration is important, and so on. You will not know what tuning is
appropriate for Gluster unless you have a basic understanding the
workload.

### Bottom-up analysis

Even a complex application may have a very simple workload from the
point of view of the filesystem servicing its requests. If you don't
know what your application spends its time doing, you can start by
running the "gluster volume profile" and "gluster volume top" commands.
These extremely useful tools will help you understand both the workload
and the bottlenecks which are limiting performance of that workload.

TBS: links to documentation for these tools and scripts that reduce the data to usable form. 

Configuration
-------------

There are 4 basic hardware dimensions to a Gluster server, listed here
in order of importance:

-   network - possibly the most important hardware component of a
    Gluster site
    -   access protocol - what kind of client is used to get to the
        files/objects?
-   storage - this is absolutely critical to get right up front
-   cpu - on client, look for hot threads (see below)
-   memory - can impact performance of read-intensive, cacheable
    workloads

### network testing

Network configuration has a huge impact on performance of distributed storage, but is often not given the
attention it deserves during the planning and installation phases of the
cluster lifecycle. Fortunately,
[network configuration](./Network Configurations Techniques.md)
can be enhanced significantly, often without additional hardware.

To measure network performance, consider use of a
[netperf-based](http://www.cs.kent.edu/~farrell/dist/ref/Netperf.html)
script.

The purpose of these two tools is to characterize the capacity of your entire network infrastructure to support the desired level of traffic induced by distributed storage, using multiple network connections in parallel.   The latter script is probably the most realistic network workload for distributed storage.

The two most common hardware problems impacting distributed storage are,
not surprisingly, disk drive failures and network failures. Some of
these failures do not cause hard errors, but instead cause performance
degradation. For example, with a bonded network interface containing two
physical network interfaces, if one of the physical interfaces fails
(either port on NIC/switch, or cable), then the bonded interface will
stay up, but will have less performance (how much less depends on the
bonding mode). Another error would be failure of an 10-GbE Ethernet
interface to autonegotiate speed to 10-Gbps -- sometimes network
interfaces auto-negotiate to 1-Gbps instead. If the TCP connection is
experiencing a high rate of packet loss or is not tuned correctly, it
may not reach the full network speed supported by the hardware.

So why run parallel netperf sessions instead of just one? There are a
variety of network performance problems relating to network topology
(the way in which hosts are interconnected), particularly network switch
and router topology, that only manifest when several pairs of hosts are
attempting to transmit traffic across the same shared resource, which
could be a trunk connecting top-of-rack switches or a blade-based switch
with insufficient bandwidth to switch backplane, for example. Individual
netperf/iperf sessions will not find these problems, but this script
will.

This test can be used to simulate flow of data through a distributed
filesystem, for example. If you want to simulate 4 Gluster clients, call
them c1 through c4, writing large files to a set of 2 servers, call them
s1 and s2, you can specify these (sender, receiver) pairs:

        (c1,s1), (c2, s2), (c3, s1), (c4, s2)

If on the other hand you want to simulate reads, you can use these
(sender, receiver) pairs:

        (s1, c1), (s2, c2), (s1, c3), (s2, c4)

To simulate a mixed read-write workload, use both sets of pairs:

        (c1,s1), (c2, s2), (c3, s1), (c4, s2), (s1, c1), (s2, c2), (s1, c3), (s2, c4)

More complicated flows can model behavior of non-native protocols, where a cluster node acts as a proxy server- it is a server (for non-native protocol) and a client (for native protocol).   For example, such protocols often induce full-duplex traffic which can stress the network differently than unidirectional in/out traffic.  For example, try adding this set of flows to preceding flow:

        (s1, s2),.(s2, s3),.(s3, s4),.(s4, s1)

The comments at the top of the script describe the input syntax, but
here are some suggestions on how to best utilize it. You typically run
this script from a head node or test driver that has password-less ssh
access to the set of machines being tested. The hosts running the test
do not need ssh access to each other -- they only have to allow
password-less ssh access from the head node. The script does not rely on
root privileges, so you can run it from a non-root account. Just create
a public key on the head node in the right account (usually in
\$HOME/.ssh/id\_rsa.pub ) and then append this public key to
\$HOME/.ssh/authorized\_keys on each host participating in the test.

We input senders and receivers using separate text files, 1 host per
line. For pair (sender[j], receiver[j]), you get sender[j] from line j
in the sender file, and receiver[j] from line j in the receiver file.
You have to use the IP address/name that corresponds to the interface
you want to test, and you have to be able to ssh to each host from the
head node using this interface.

Results
-------

There are 3 basic forms of performance results, not in order of
importance:

-   throughput -- how much work is done in a unit of time? Best metrics
    typically are workload-dependent:
    -   for large-file random: IOPS
    -   for large-file sequential: MB/s
    -   for small-file: files/sec
-   response time -- IMPORTANT, how long does it take for filesystem
    request to complete?
-   utilization -- how busy is the hardware while the workload is
    running?
-   scalability -- can we linearly scale throughput without sacrificing
    response time as we add servers to a Gluster volume?

Typically throughput results get the most attention, but in a
distributed-storage environment, the hardest goal to achieve may well be
CONSISTENTLY LOW RESPONSE TIME, not throughput.

While there are non-interactive workloads where response time does not
matter as much, you should pay attention to response time in any
situation where a user has to directly interact with the filesystem.
Tuning the filesystem to achieve the absolute highest throughput can
result in a filesystem that is unusable because of high response time.
Unless you are in a benchmarking situation, you want to achieve a
balance of good throughput and response time. Typically an interactive
user wants to see a response time under 5 seconds always, with most
response times much lower than this. To keep response times under
control (including system management!), you do not want any hardware
component to run at maximum utilization, typically 60-80% utilization is
a good peak utilization target. On the other hand, to avoid wasting
hardware, you want all of the hardware to be utilized to some extent.
