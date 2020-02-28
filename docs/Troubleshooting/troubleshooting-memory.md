Troubleshooting High Memory Utilization
=======================================

If the memory utilization of a Gluster process increases significantly with time, it could be a leak caused by resources not being freed.
If you suspect that you may have hit such an issue, try using [statedumps](./statedump.md) to debug the issue.

If you are unable to figure out where the leak is, please [file an issue](https://github.com/gluster/glusterfs/issues/new) and provide the following details:

- Gluster version
- The affected process
- The output of `gluster volume info`
- Steps to reproduce the issue if available
- Statedumps for the process collected at intervals as the memory utilization increases
- The Gluster log files for the process (if possible)

