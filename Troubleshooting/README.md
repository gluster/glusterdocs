Troubleshooting Guide
---------------------

This guide is intended to help the user understand and troubleshoot issues with a Gluster deployment. This document is being extended. If the topic/error is not found, please reach out to the [Gluster community](https://www.gluster.org/community/). 

The guide includes the aspects of information which are required to be provided in order to help debug the issue. If the initial conversation contains the version of gluster running and the output of `gluster volume info` that helps us get started.


### Where Do I Start?

Is the issue already listed in the component specific troubleshooting sections?

- [CLI and Glusterd Issues](./troubleshooting-glusterd.md)
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


