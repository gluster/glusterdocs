
### op-version
op-version is the operating version of the Gluster which is running.

op-version was introduced to ensure gluster running with different versions do not end up in a problem and backward compatibility issues can be tackled.

After Gluster upgrade, it is advisable to have op-version updated.

### Updating op-version

Current op-version can be queried as below:

For 3.10 onwards:

```console
# gluster volume get all cluster.op-version
```

For release < 3.10:

```console
# gluster volume get <VOLNAME> cluster.op-version
```

To get the maximum possible op-version a cluster can support, the following query can be used (this is available 3.10 release onwards):

```console
# gluster volume get all cluster.max-op-version
```

For example, if some nodes in a cluster have been upgraded to X and some to X+, then the maximum op-version supported by the cluster is X, and the cluster.op-version can be bumped up to X to support new features.

op-version can be updated as below.
For example, after upgrading to glusterfs-4.0.0, set op-version as:

```console
# gluster volume set all cluster.op-version 40000
```

Note:
This is not mandatory, but advisable to have updated op-version if you want to make use of latest features in the updated gluster.

### Client op-version

When trying to set a volume option, it might happen that one or more of the connected clients cannot support the feature being set and might need to be upgraded to the op-version the cluster is currently running on.

To check op-version information for the connected clients and find the offending client, the following query can be used for 3.10 release onwards:

```console
# gluster volume status <all|VOLNAME> clients
```

The respective clients can then be upgraded to the required version.

This information could also be used to make an informed decision while bumping up the op-version of a cluster, so that connected clients can support all the new features provided by the upgraded cluster as well.

