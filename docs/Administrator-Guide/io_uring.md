# io_uring support in gluster

io_uring is an asynchronous I/O interface similar to linux-aio, but aims to be more performant.
Refer https://kernel.dk/io_uring.pdf and https://kernel-recipes.org/en/2019/talks/faster-io-through-io_uring/ for more details.

Incorporating io_uring in various layers of gluster is an ongoing activity but beginning with glusterfs-9.0, support has been added to the posix translator via the ```storage.linux-io_uring``` volume option. When this option is enabled, the posix translator in the glusterfs brick process (at the server side) will use io_uring calls for reads, writes and fsyncs as opposed to the normal pread/pwrite based syscalls.

#### Example:
    [server~]# gluster volume set testvol storage.linux-io_uring on
    volume set: success
    [server~]#
    [server~]# gluster volume set testvol storage.linux-io_uring off
    volume set: success


This option can be enabled/disabled only when the volume is not running.
i.e. you can toggle the option when the volume is `Created` or is `Stopped` as indicated in ```gluster volume status $VOLNAME```
