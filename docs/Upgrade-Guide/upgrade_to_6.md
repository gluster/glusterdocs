## Upgrade procedure to Gluster 6, from Gluster 5.x, 4.1.x, and 3.12.x

We recommend reading the [release notes for 6.0](../release-notes/6.0.md) to be
aware of the features and fixes provided with the release.

> **NOTE:** Upgrade procedure remains the same as with 4.1.x release

Refer, to the [Upgrading to 4.1](./upgrade_to_4.1.md) guide and follow
documented instructions, replacing 6 when you encounter 4.1 in the guide as the
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

**NOTE:** Failure to do the above may result in failure during online upgrades,
and the reset of these options to their defaults needs to be done **prior** to
upgrading the cluster.

### Deprecated translators and upgrade procedure for volumes using these features

With this release of Gluster, the following xlator/features are deprecated and
are not available in the distribution specific packages. If any of these xlators
or features are in use, refer to instructions on steps needed pre-upgrade to
plan for an upgrade to this release.

### Stripe volume

Stripe xlator, provided the ability to stripe data across bricks. This
functionality was used to create and support files larger than a single
brick and also to provide better disk utilization across large file IO,
by spreading the IO blocks across bricks and hence physical disks.

This functionality is now provided by the [shard xlator](https://access.redhat.com/documentation/en-us/red_hat_gluster_storage/3.4/html/administration_guide/sect-creating_replicated_volumes#sect-Managing_Sharding).

There is no in place upgrade feasible for volumes using the stripe
feature, and users are encouraged to migrate their data from existing
stripe based volumes to sharded volumes.

#### Tier volume

Tier feature is no longer supported with this release. There is no replacement
for the tiering feature as well.

Volumes using the existing Tier feature need to be converted to regular volumes
before upgrading to this release.

Command reference:

```console
volume tier <VOLNAME> detach <start|stop|status|commit|[force]>
```

### Other miscellaneous features

- BD xlator
- glupy

The above translators were not supported in previous versions as well, but users
had an option to create volumes using these features. If such volumes were in
use, data from the same need to me migrated into a new volume without the
feature, before upgrading the clusters.
