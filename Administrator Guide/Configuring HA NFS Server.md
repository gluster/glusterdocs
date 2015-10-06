# Configuring Active-Active Highly Available NFS server on GlusterFS

NFS-Ganesha is a user space file server for the NFS protocol with support for NFSv3, v4, v4.1, pNFS. This document provides a step-by-step guide to configure Highly Available NFS-Ganesha server on GlusterFS.

## Highly Available Active-Active NFS-Ganesha
In a highly available active-active environment, if a NFS-Ganesha server that is connected to a NFS client running a particular application crashes, the application/NFS client is seamlessly connected to another NFS-Ganesha server without any administrative intervention.
The cluster is maintained using Pacemaker and Corosync. Pacemaker acts a resource manager and Corosync provides the communication layer of the cluster.
Data coherency across the multi-head NFS-Ganesha servers in the cluster is achieved using the UPCALL infrastructure. UPCALL infrastructure is a generic and extensible framework that sends notifications to the respective glusterfs clients (in this case NFS-Ganesha server) in case of any changes detected in the backend filesystem.

### Binaries to be installed
#### Gluster RPMs (>= 3.7)
> glusterfs-server

> glusterfs-ganesha

#### Ganesha RPMs (>= 2.2)
> nfs-ganesha

> nfs-ganesha-gluster

#### Pacemaker & pcs RPMs

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
⁠
