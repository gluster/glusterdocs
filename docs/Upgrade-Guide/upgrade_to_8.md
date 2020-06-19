# Upgrade procedure to Gluster 8, from Gluster 7.x, 6.x and 5.x

We recommend reading the [release notes for 8.0](../release-notes/8.0.md) to be
aware of the features and fixes provided with the release.

> **NOTE:** Upgrade procedure remains the same as with 4.1.x release

Refer, to the [Upgrading to 4.1](./upgrade_to_4.1.md) guide and follow
documented instructions, replacing 8 when you encounter 4.1 in the guide as the
version reference.

### Major issues

1. The following options are removed from the code base and require to be unset
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

2. Make sure you are not using any of the following depricated features : 

    - Block device (bd) xlator
    - Decompounder feature
    - Crypt xlator
    - Symlink-cache xlator
    - Stripe feature
    - Tiering support (tier xlator and changetimerecorder)

   
**NOTE:** Failure to do the above may result in failure during online upgrades,
and the reset of these options to their defaults needs to be done **prior** to
upgrading the cluster.

### Deprecated translators and upgrade procedure for volumes using these features

[If you are upgrading from a release prior to release-6 be aware of deprecated xlators and functionality](https://docs.gluster.org/en/latest/Upgrade-Guide/upgrade_to_6/#deprecated-translators-and-upgrade-procedure-for-volumes-using-these-features). 


