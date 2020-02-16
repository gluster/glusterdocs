## Upgrade procedure to Gluster 3.13, from Gluster 3.12.x, and 3.10.x

**NOTE:** Upgrade procedure remains the same as with 3.12 and 3.10 releases

### Pre-upgrade notes
- Online upgrade is only possible with replicated and distributed replicate volumes
- Online upgrade is not supported for dispersed or distributed dispersed volumes
- Ensure no configuration changes are done during the upgrade
- If you are using geo-replication, please upgrade the slave cluster(s) before upgrading the master
- Upgrading the servers ahead of the clients is recommended
- It is recommended to have the same client and server, major versions running eventually

### Online upgrade procedure for servers
This procedure involves upgrading **one server at a time**, while keeping the volume(s) online and client IO ongoing. This procedure assumes that multiple replicas of a replica set, are not part of the same server in the trusted storage pool.

> **ALERT**: If any of your volumes, in the trusted storage pool that is being upgraded, uses disperse or is a pure distributed volume, this procedure is **NOT** recommended, use the [Offline upgrade procedure](#offline-upgrade-procedure) instead.

#### Repeat the following steps, on each server in the trusted storage pool, to upgrade the entire pool to 3.13 version:
1. Stop all gluster services, either using the command below, or through other means,

        # killall glusterfs glusterfsd glusterd

2. Stop all applications that run on this server and access the volumes via gfapi (qemu, NFS-Ganesha, Samba, etc.)

3. Install Gluster 3.13

4. Ensure that version reflects 3.13.x in the output of,
    
        # gluster --version

**NOTE:** x is the minor release number for the release

5. Start glusterd on the upgraded server

        # glusterd

6. Ensure that all gluster processes are online by checking the output of,

        # gluster volume status

7. Self-heal all gluster volumes by running

        # for i in `gluster volume list`; do gluster volume heal $i; done

8. Ensure that there is no heal backlog by running the below command for all volumes

        # gluster volume heal <volname> info

    > NOTE: If there is a heal backlog, wait till the backlog is empty, or the backlog does not have any entries needing a sync to the just upgraded server, before proceeding to upgrade the next server in the pool

9. Restart any gfapi based application stopped previously in step (2)

### Offline upgrade procedure
This procedure involves cluster downtime and during the upgrade window, clients are not allowed access to the volumes.

#### Steps to perform an offline upgrade:
1. On every server in the trusted storage pool, stop all gluster services, either using the command below, or through other means,

        # killall glusterfs glusterfsd glusterd

2. Stop all applications that access the volumes via gfapi (qemu, NFS-Ganesha, Samba, etc.), across all servers

3. Install Gluster 3.13, on all servers

4. Ensure that version reflects 3.13.x in the output of the following command on all servers,

        # gluster --version

**NOTE:** x is the minor release number for the release

5. Start glusterd on all the upgraded servers

        # glusterd

6. Ensure that all gluster processes are online by checking the output of,

        # gluster volume status

7. Restart any gfapi based application stopped previously in step (2)

### Post upgrade steps
Perform the following steps post upgrading the entire trusted storage pool,

- It is recommended to update the op-version of the cluster. Refer, to the [op-version](./op_version.md) section for further details
- Proceed to [upgrade the clients](#upgrade-procedure-for-clients) to 3.13 version as well

### Upgrade procedure for clients
Following are the steps to upgrade clients to the 3.13.x version,

**NOTE:** x is the minor release number for the release

1. Unmount all glusterfs mount points on the client
2. Stop all applications that access the volumes via gfapi (qemu, etc.)
3. Install Gluster 3.13
4. Mount all gluster shares
5. Start any applications that were stopped previously in step (2)
