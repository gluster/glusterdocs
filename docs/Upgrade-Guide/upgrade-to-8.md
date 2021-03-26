# Upgrade procedure to Gluster 8, from Gluster 7.x, 6.x and 5.x

We recommend reading the [release notes for 8.0](../release-notes/8.0.md) to be
aware of the features and fixes provided with the release.

> **NOTE:** Before following the generic upgrade procedure checkout the "**Major Issues**" section given below.

> With version 8, there are certain changes introduced to the directory structure of changelog files in gluster geo-replication.
> Thus, before the upgrade of geo-rep packages, we need to execute the [upgrade script](https://github.com/gluster/glusterfs/commit/2857fe3fad4d2b30894847088a54b847b88a23b9) with the brick path as argument, as described below:
>1. Stop the geo-rep session
>2. Run the upgrade script with the brick path as the argument. Script can be used in loop for multiple bricks.
>3. Start the upgradation process.
>This script will update the existing changelog directory structure and the paths inside the htime files to a new format introduced in version 8.
>If the above mentioned script is not executed, the search algorithm, used during the history crawl will fail with the wrong result for upgradation from version 7 and below to version 8 and above.

Refer, to the [generic upgrade procedure](./generic-upgrade-procedure.md) guide and follow documented instructions.

## Major issues

### The following options are removed from the code base and require to be unset
before an upgrade from releases older than release 4.1.0,

    - features.lock-heal
    - features.grace-timeout

To check if these options are set use,

```console
# gluster volume info
```

and ensure that the above options are not part of the `Options Reconfigured:`
section in the output of all volumes in the cluster.

If these are set, then unset them using the following commands,

```console
# gluster volume reset <volname> <option>
```

### Make sure you are not using any of the following depricated features :

    - Block device (bd) xlator
    - Decompounder feature
    - Crypt xlator
    - Symlink-cache xlator
    - Stripe feature
    - Tiering support (tier xlator and changetimerecorder)
    - Glupy


**NOTE:** Failure to do the above may result in failure during online upgrades,
and the reset of these options to their defaults needs to be done **prior** to
upgrading the cluster.

### Deprecated translators and upgrade procedure for volumes using these features

[If you are upgrading from a release prior to release-6 be aware of deprecated xlators and functionality](https://docs.gluster.org/en/latest/Upgrade-Guide/upgrade_to_6/#deprecated-translators-and-upgrade-procedure-for-volumes-using-these-features).
