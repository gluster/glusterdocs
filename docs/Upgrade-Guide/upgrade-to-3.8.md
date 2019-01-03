## Upgrade procedure from Gluster 3.7.x

### Pre-upgrade Notes 
  - Online upgrade is only possible with replicated and distributed replicate volumes.
  - Online upgrade is not yet supported for dispersed or distributed dispersed volumes.
  - Ensure no configuration changes are done during the upgrade.
  - If you are using geo-replication, please upgrade the slave cluster(s) before upgrading the master.
  - Upgrading the servers ahead of the clients is recommended.
  - Upgrade the clients after the servers are upgraded. It is recommended to have the same client and server major versions.

### Online Upgrade Procedure for Servers

The procedure involves upgrading one server at a time . On every storage server in your trusted storage pool:

- Stop all gluster services using the below command or through your favorite way to stop them.

        # killall glusterfs glusterfsd glusterd

- If you are using gfapi based applications (qemu, NFS-Ganesha, Samba etc.) on the servers, please stop those applications too.

- Install Gluster 3.8

- Ensure that version reflects 3.8.x in the output of

        # gluster --version

- Start glusterd on the upgraded server

        # glusterd

- Ensure that all gluster processes are online by executing

        # gluster volume status

- Self-heal all gluster volumes by running

        # for i in `gluster volume list`; do gluster volume heal $i; done

- Ensure that there is no heal backlog by running the below command for all volumes

        # gluster volume heal <volname> info

- Restart any gfapi based application stopped previously.

- After the upgrade is complete on all servers, run the following command:

        # gluster volume set all cluster.op-version 30800

### Offline Upgrade Procedure 

For this procedure, schedule a downtime and prevent all your clients from accessing the servers.

On every storage server in your trusted storage pool:
- Stop all gluster services using the below command or through your favorite way to stop them.

        # killall glusterfs glusterfsd glusterd

- If you are using gfapi based applications (qemu, NFS-Ganesha, Samba etc.) on the servers, please stop those applications too.

- Install Gluster 3.8

- Ensure that version reflects 3.8.x in the output of

        # gluster --version

- Start glusterd on the upgraded server

        # glusterd

- Ensure that all gluster processes are online by executing

        # gluster volume status

- Restart any gfapi based application stopped previously.

- After the upgrade is complete on all servers, run the following command:

        # gluster volume set all cluster.op-version 30800

### Upgrade Procedure for Clients


- Unmount all glusterfs mount points on the client
- Stop applications using gfapi (qemu etc.)
- Install Gluster 3.8
- Mount all gluster shares
- Start applications using libgfapi that were stopped previously
