# Upgrade procedure to Gluster 11, from Gluster 10.x, 9.x and 8.x

We recommend reading the [release notes for 11.0](../release-notes/11.0.md) to be
aware of the features and fixes provided with the release.

> **NOTE:** Before following the generic upgrade procedure checkout the "**Major Issues**" section given below.

Refer, to the [generic upgrade procedure](./generic-upgrade-procedure.md) guide and follow documented instructions.

## Major issues

### The following options are removed from the code base and require to be unset

before an upgrade from releases older than release 4.1.0,

    - features.lock-heal
    - features.grace-timeout

To check if these options are set use,

```console
gluster volume info
```

and ensure that the above options are not part of the `Options Reconfigured:`
section in the output of all volumes in the cluster.

If these are set, then unset them using the following commands,

```{ .console .no-copy }
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

Online Upgrade: User will obsrve "Peer Rejected" issues while upgrading if NFS Ganesha is not enabled as the nfs options
were made optional in this release causing checksum misamtch. Stopping and starting a server after upgrade should fix the issue.

### Deprecated translators and upgrade procedure for volumes using these features

[If you are upgrading from a release prior to release-6 be aware of deprecated xlators and functionality](https://docs.gluster.org/en/latest/Upgrade-Guide/upgrade-to-6/#deprecated-translators-and-upgrade-procedure-for-volumes-using-these-features).

