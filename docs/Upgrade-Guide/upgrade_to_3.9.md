## Upgrade procedure from Gluster 3.8.x and 3.7.x

The steps to uprade to Gluster 3.9 are the same as for upgrading to Gluster
3.8. Please follow the detailed instructions from [the 3.8 upgrade
guide](upgrade_to_3.8.md).

Note that there is only a single difference, related to the `op-version`:

After the upgrade is complete on all servers, run the following command:

```console
# gluster volume set all cluster.op-version 30900
```
