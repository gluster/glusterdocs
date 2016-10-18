# Configuring NFS-Ganesha over GlusterFS

NFS-Ganesha is a user space file server for the NFS protocol with support for NFSv3, v4, v4.1, pNFS. It provides a FUSE-compatible File System Abstraction Layer(FSAL) to allow the file-system developers to plug in their own storage mechanism and access it from any NFS client. NFS-Ganesha can access the FUSE filesystems directly through its FSAL without copying any data to or from the kernel, thus potentially improving response times.

##  Installing nfs-ganesha

#### Gluster RPMs (>= 3.7)
> glusterfs-server

> glusterfs-api

> glusterfs-ganesha

#### Ganesha RPMs (>= 2.2)
> nfs-ganesha

> nfs-ganesha-gluster

## Start NFS-Ganesha manually

- To start NFS-Ganesha manually, use the command:
    -  *service nfs-ganesha start*
```sh
where:
/var/log/ganesha.log is the default log file for the ganesha process.
/etc/ganesha/ganesha.conf is the default configuration file
NIV_EVENT is the default log level.
```
- If user want to run ganesha in prefered mode, execute the following command :
     - *#ganesha.nfsd -f <location_of_nfs-ganesha.conf_file> -L <location_of_log_file> -N <log_level>*

```sh
For example:
#ganesha.nfsd -f nfs-ganesha.conf -L nfs-ganesha.log -N NIV_DEBUG
where:
nfs-ganesha.log is the log file for the ganesha.nfsd process.
nfs-ganesha.conf is the configuration file
NIV_DEBUG is the log level.
```
- By default exportlist for the server will be Null

```sh
Note : include following parameters in ganesha configuration file for exporting gluster volumes
NFS_Core_Param {
        #Use supplied name other tha IP In NSM operations
        NSM_Use_Caller_Name = true;
        #Copy lock states into "/var/lib/nfs/ganesha" dir
        Clustered = false;
        #Use a non-privileged port for RQuota
        Rquota_Port = 4501;
}
```
## Step by step procedures to exporting GlusterFS volume via NFS-Ganesha

#### step 1 :

To export any GlusterFS volume or directory inside volume, create the EXPORT block for each of those entries in a export configuration  file. The following parameters are required to export any entry.
- *#cat export.conf*

```sh
EXPORT{
	Export_Id = 1 ;   # Export ID unique to each export
	Path = "volume_path";  # Path of the volume to be exported. Eg: "/test_volume"

	FSAL {
		name = GLUSTER;
		hostname = "10.xx.xx.xx";  # IP of one of the nodes in the trusted pool
		volume = "volume_name";	 # Volume name. Eg: "test_volume"
	}

	Access_type = RW;	 # Access permissions
	Squash = No_root_squash; # To enable/disable root squashing
	Disable_ACL = TRUE;	 # To enable/disable ACL
	Pseudo = "pseudo_path";	 # NFSv4 pseudo path for this export. Eg: "/test_volume_pseudo"
	Protocols = "3","4" ;	 # NFS protocols supported
	Transports = "UDP","TCP" ; # Transport protocols supported
	SecType = "sys";	 # Security flavors supported
}
```

#### step 2 :

Now include the export configuration file in the ganesha configuration file(by default ).This can be done by adding the line below at the end of file
   - %include “<path of export configuration>”

#### step 3 :

   - To check if the volume is exported, run
       - *#showmount -e localhost*

## Using Highly Available Active-Active NFS-Ganesha And GlusterFS cli
In a highly available active-active environment, if a NFS-Ganesha server that is connected to a NFS client running a particular application crashes, the application/NFS client is seamlessly connected to another NFS-Ganesha server without any administrative intervention.
The cluster is maintained using Pacemaker and Corosync. Pacemaker acts a resource manager and Corosync provides the communication layer of the cluster.
Data coherency across the multi-head NFS-Ganesha servers in the cluster is achieved using the UPCALL infrastructure. UPCALL infrastructure is a generic and extensible framework that sends notifications to the respective glusterfs clients (in this case NFS-Ganesha server) in case of any changes detected in the backend filesystem.

The Highly Available cluster is configured in the following three stages:
### Creating the ganesha-ha.conf file
The ganesha-ha.conf.example is created in the following location /etc/ganesha when Gluster Storage is installed. Rename the file to ganesha-ha.conf and make the changes as suggested in the following example:
sample ganesha-ha.conf file:

> \# Name of the HA cluster created. must be unique within the subnet

> HA_NAME="ganesha-ha-360"

> \# The gluster server from which to mount the shared data volume.

> HA_VOL_SERVER="server1"

> \# The subset of nodes of the Gluster Trusted Pool that form the ganesha HA cluster.

> \# Hostname is specified.

> HA_CLUSTER_NODES="server1,server2,..."

> \#HA_CLUSTER_NODES="server1.lab.redhat.com,server2.lab.redhat.com,..."

> \# Virtual IPs for each of the nodes specified above.

> VIP_server1="10.0.2.1"

> VIP_server2="10.0.2.2"

### Configuring NFS-Ganesha using gluster CLI
The HA cluster can be set up or torn down using gluster CLI. In addition, it can export and unexport specific volumes. For more information, see section Configuring NFS-Ganesha using gluster CLI.

### Modifying the HA cluster using the `ganesha-ha.sh` script
Post the cluster creation any further modification can be done using the `ganesha-ha.sh` script. For more information, see the section Modifying the HA cluster using the `ganesha-ha.sh` script.

## Step-by-step guide
### Configuring NFS-Ganesha using Gluster CLI⁠
#### Pre-requisites to run NFS-Ganesha
Ensure that the following pre-requisites are taken into consideration before you run NFS-Ganesha in your environment:

 * A Gluster Storage volume must be available for export and NFS-Ganesha rpms are installed.
 * IPv6 must be enabled on the host interface which is used by the NFS-Ganesha daemon. To enable IPv6 support, perform the following steps:
    - Comment or remove the line options ipv6 disable=1 in the /etc/modprobe.d/ipv6.conf file.
    - Reboot the system.

* Ensure that all the nodes in the cluster are DNS resolvable. For example, you can populate the /etc/hosts with the details of all the nodes in the cluster.
* Disable and stop NetworkManager service.
* Enable and start network service on all machines.
* Create and mount a gluster shared volume.
* Install Pacemaker and Corosync on all machines.
* Set the cluster auth password on all the machines.
* Passwordless ssh needs to be enabled on all the HA nodes. Follow these steps,

    - On one (primary) node in the cluster, run:
        - ssh-keygen -f /var/lib/glusterd/nfs/secret.pem
    - Deploy the pubkey ~root/.ssh/authorized keys on _all_ nodes, run:
        - ssh-copy-id -i /var/lib/glusterd/nfs/secret.pem.pub root@$node
    - Copy the keys to _all_ nodes in the cluster, run:
        - scp /var/lib/glusterd/nfs/secret.*  $node:/var/lib/glusterd/nfs/

#### Configuring the HA Cluster
To setup the HA cluster, enable NFS-Ganesha by executing the following command:

    #gluster nfs-ganesha enable

To tear down the HA cluster, execute the following command:

    #gluster nfs-ganesha disable

#### Exporting Volumes through NFS-Ganesha
To export a Red Hat Gluster Storage volume, execute the following command:

    #gluster volume set <volname> ganesha.enable on

To unexport a Red Hat Gluster Storage volume, execute the following command:

    #gluster volume set <volname> ganesha.enable off

This command unexports the Red Hat Gluster Storage volume without affecting other exports.

To verify the status of the volume set options, follow the guidelines mentioned below:

* Check if NFS-Ganesha is started by executing the following command:
    - ps aux | grep ganesha
* Check if the volume is exported.
    - showmount -e localhost

The logs of ganesha.nfsd daemon are written to /var/log/ganesha.log. Check the log file on noticing any unexpected behavior.

### Modifying the HA cluster using the ganesha-ha.sh script
To modify the existing HA cluster and to change the default values of the exports use the ganesha-ha.sh script located at /usr/libexec/ganesha/.
#### Adding a node to the cluster
Before adding a node to the cluster, ensure all the prerequisites mentioned in section `Pre-requisites to run NFS-Ganesha` is met. To add a node to the cluster. execute the following command on any of the nodes in the existing NFS-Ganesha cluster:

    #./ganesha-ha.sh --add <HA_CONF_DIR> <HOSTNAME> <NODE-VIP>
    where,
    HA_CONF_DIR: The directory path containing the ganesha-ha.conf file.
    HOSTNAME: Hostname of the new node to be added
    NODE-VIP: Virtual IP of the new node to be added.
#### Deleting a node in the cluster
To delete a node from the cluster, execute the following command on any of the nodes in the existing NFS-Ganesha cluster:

    #./ganesha-ha.sh --delete <HA_CONF_DIR> <HOSTNAME>

    where,
    HA_CONF_DIR: The directory path containing the ganesha-ha.conf file.
    HOSTNAME: Hostname of the new node to be added
#### Modifying the default export configuration
To modify the default export configurations perform the following steps on any of the nodes in the existing ganesha cluster:

* Edit/add the required fields in the corresponding export file located at `/etc/ganesha/exports`.

* Execute the following command:

        #./ganesha-ha.sh --refresh-config <HA_CONFDIR> <volname>

        where,
        HA_CONF_DIR: The directory path containing the ganesha-ha.conf file.
        volname: The name of the volume whose export configuration has to be changed.

    Note
        The export ID must not be changed.
⁠
## Configuring Gluster volume for pNFS
The Parallel Network File System (pNFS) is part of the NFS v4.1 protocol that allows compute clients to access storage devices directly and in parallel. The pNFS cluster consists of MDS(Meta-Data-Server) and DS (Data-Server). The client sends all the read/write requests directly to DS and all other operations are handle by the MDS.

### Step by step guide

  - Turn on feature.cache-invalidation for the volume.
       - gluster v set <volname> features.cache-invalidation on

-  Select one of nodes in cluster as MDS and configure it adding following block to ganesha configuration file
```sh
GLUSTER
{
 PNFS_MDS = true;
}
```
-  Mannually start NFS-Ganesha in every node in the cluster.

- Check whether volume is exported via nfs-ganesha in all the nodes.
    - *#showmount -e localhost*

-  Mount the volume using NFS version 4.1 protocol with the ip of MDS
    -  *#mount -t nfs4 -o minorversion=1 <ip of MDS>:/<volume name> <mount path>*

### Points to be Noted

   - Current architecture supports only single MDS and mulitple DS. The server with which client mounts will act as MDS and all severs including MDS can act as DS.

   - Currently HA is not supported for pNFS(more specifically MDS). Although it is configurable, but consistency is guaranteed across the cluster.

   - If any of the DS goes down, then MDS will handle those I/O's.

   - Hereafter, all the subsequent NFS clients need to use same server for mounting that volume via pNFS. i.e more than one MDS for a volume is not prefered

   - pNFS support is only tested with distributed, replicated or distribute-replicate volumes

   - It is tested and verified with RHEL 6.5 , fedora 20, fedora 21 nfs clients. It is always better to use latest nfs-clients

