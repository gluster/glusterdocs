# Generic Upgrade procedure


### Pre-upgrade notes
- Online upgrade is only possible with replicated and distributed replicate volumes
- Online upgrade is not supported for dispersed or distributed dispersed volumes
- Ensure no configuration changes are done during the upgrade
- If you are using geo-replication, please upgrade the slave cluster(s) before upgrading the master
- Upgrading the servers ahead of the clients is recommended
- It is recommended to have the same client and server, major versions running eventually

### Online upgrade procedure for servers
This procedure involves upgrading **one server at a time**, while keeping the volume(s) online and client IO ongoing. This procedure assumes that multiple replicas of a replica set, are not part of the same server in the trusted storage pool.

> **ALERT:** If there are disperse or, pure distributed volumes in the storage pool being upgraded, this procedure is NOT recommended, use the [Offline upgrade procedure](#offline-upgrade-procedure) instead.

#### Repeat the following steps, on each server in the trusted storage pool, to upgrade the entire pool to new-version :
1. Stop all gluster services, either using the command below, or through other means.


        # systemctl stop glusterd
        # systemctl stop glustereventsd
        # killall glusterfs glusterfsd glusterd
        
2. Stop all applications that run on this server and access the volumes via gfapi (qemu, NFS-Ganesha, Samba, etc.)

3. Install Gluster new-version, below example shows how to create a repository on fedora and use it to upgrade : 

    3.1  Create a private repository (assuming /new-gluster-rpms/  folder has the new rpms ): 

        # createrepo /new-gluster-rpms/

    3.2  Create the .repo file in /etc/yum.d/ : 

        # cat /etc/yum.d/newglusterrepo.repo 
         [newglusterrepo]
         name=NewGlusterRepo
         baseurl="file:///new-gluster-rpms/"
         gpgcheck=0
         enabled=1

    3.3  Upgrade glusterfs, for example to upgrade glusterfs-server to x.y version : 
    
        # yum update glusterfs-server-x.y.fc30.x86_64.rpm 

4. Ensure that version reflects new-version in the output of,

        # gluster --version

5. Start glusterd on the upgraded server

        # systemctl start glusterd

6. Ensure that all gluster processes are online by checking the output of,

        # gluster volume status

7. If the glustereventsd service was previously enabled, it is required to start it using the commands below, or, through other means,

        # systemctl start glustereventsd

8. Invoke self-heal on all the gluster volumes by running,

        # for i in `gluster volume list`; do gluster volume heal $i; done

9. Verify that there are no heal backlog by running the command for all the volumes,

        # gluster volume heal <volname> info

> **NOTE:** Before proceeding to upgrade the next server in the pool it is recommended to check the heal backlog. If there is a heal backlog, it is recommended to wait until the backlog is empty, or, the backlog does not contain any entries requiring a sync to the just upgraded server.

10. Restart any gfapi based application stopped previously in step (2)

### Offline upgrade procedure
This procedure involves cluster downtime and during the upgrade window, clients are not allowed access to the volumes.

#### Steps to perform an offline upgrade:
1. On every server in the trusted storage pool, stop all gluster services, either using the command below, or through other means,

```sh
    
    # systemctl stop glusterd
    # systemctl stop glustereventsd
    # killall glusterfs glusterfsd glusterd
```
2. Stop all applications that access the volumes via gfapi (qemu, NFS-Ganesha, Samba, etc.), across all servers

3. Install Gluster new-version, on all servers

4. Ensure that version reflects new-version in the output of the following command on all servers,
```sh
    # gluster --version
```

5. Start glusterd on all the upgraded servers
```sh
    # systemctl start glusterd
```
6. Ensure that all gluster processes are online by checking the output of,
```sh
    # gluster volume status
```

7. If the glustereventsd service was previously enabled, it is required to start it using the commands below, or, through other means,
```sh
    # systemctl start glustereventsd
```

8. Restart any gfapi based application stopped previously in step (2)

### Post upgrade steps
Perform the following steps post upgrading the entire trusted storage pool,

- It is recommended to update the op-version of the cluster. Refer, to the [op-version](./op_version.md) section for further details
- Proceed to [upgrade the clients](#upgrade-procedure-for-clients) to new-version version as well
- Post upgrading the clients, for replicate volumes, it is recommended to enable the option `gluster volume set <volname> fips-mode-rchecksum on` to turn off usage of MD5 checksums during healing. This enables running Gluster on FIPS compliant systems.

### Upgrade procedure for clients
Following are the steps to upgrade clients to the new-version version,

1. Unmount all glusterfs mount points on the client
2. Stop all applications that access the volumes via gfapi (qemu, etc.)
3. Install Gluster new-version
4. Mount all gluster shares
5. Start any applications that were stopped previously in step (2)
