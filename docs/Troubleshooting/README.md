Troubleshooting Guide
---------------------
This guide describes some commonly seen issues and steps to recover from them.
If that doesn’t help, reach out to the [Gluster community](https://www.gluster.org/community/), in which case the guide also describes what information needs to be provided in order to debug the issue. At minimum, we need the version of gluster running and the output of `gluster volume info`.


### Where Do I Start?

Is the issue already listed in the component specific troubleshooting sections?

- [CLI and Glusterd Issues](./troubleshooting-glusterd.md)
- [Heal related issues](./troubleshooting-afr.md)
- [Resolving Split brains](./resolving-splitbrain.md)
- [Geo-replication Issues](./troubleshooting-georep.md)
- [Gluster NFS Issues](./troubleshooting-gnfs.md)
- [File Locks](./troubleshooting-filelocks.md)


If that didn't help, here is how to debug further.

Identifying the problem and getting the necessary information to diagnose it is the first step in troubleshooting your Gluster setup. As Gluster operations involve interactions between multiple processes, this can involve multiple steps.

### What Happened?

- An operation failed
- [High Memory Usage](./troubleshooting-memory.md)
- [A Gluster process crashed](./gluster-crash.md)


