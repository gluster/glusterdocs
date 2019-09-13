# Accessing GlusterFS using Cinder Hosts

*Note: GlusterFS driver was removed from Openstack since Ocata. This guide applies only to older Openstack releases.*

## 1. Introduction

GlusterFS and Cinder integration provides a system for data storage that enables users to access the same data, both as an object and as a file, thus simplifying management and controlling storage costs.

*GlusterFS* - GlusterFS is an open source, distributed file system capable of scaling to several petabytes and handling thousands of clients. GlusterFS clusters together storage building blocks over Infiniband RDMA or TCP/IP interconnect, aggregating disk and memory resources and managing data in a single global namespace. GlusterFS is based on a stackable user space design and can deliver exceptional performance for diverse workloads.

*Cinder* - Cinder is the OpenStack service which is responsible for handling persistent storage for virtual machines. This is persistent block storage for the instances running in Nova. Snapshots can be taken for backing up and data, either for restoring data, or to be used to create new block storage volumes.

With Enterprise Linux 6, configuring OpenStack Grizzly to use GlusterFS for its Cinder (block) storage is fairly simple.

These instructions have been tested with both GlusterFS 3.3 and GlusterFS 3.4. Other releases may also work, but have not been tested.

## 2. Prerequisites

### GlusterFS

For information on prerequisites and instructions for installing GlusterFS, see <http://www.gluster.org/community/documentation/index.php>.

### Cinder

For information on prerequisites and instructions for installing Cinder, see <http://docs.openstack.org/>.

Before beginning, you must ensure there are **no existing volumes** in Cinder. Use "cinder delete" to remove any, and "cinder list" to verify that they are deleted. If you do not delete the existing cinder volumes, it will cause errors later in the process, breaking your Cinder installation.

**NOTE** - Unlike other software, the "openstack-config" and "cinder" commands generally require you to run them as a root user. Without prior configuration, running them through sudo generally does not work. (This can be changed, but is beyond the scope of this HOW-TO.)

## 3 Installing GlusterFS Client on Cinder hosts

On each Cinder host, install the GlusterFS client packages:

		$ sudo yum -y install glusterfs-fuse

## 4. Configuring Cinder to Add GlusterFS

On each Cinder host, run the following commands to add GlusterFS to the Cinder configuration:

		# openstack-config --set /etc/cinder/cinder.conf DEFAULT volume_driver cinder.volume.drivers.glusterfs.GlusterfsDriver
		# openstack-config --set /etc/cinder/cinder.conf DEFAULT glusterfs_shares_config /etc/cinder/shares.conf
		# openstack-config --set /etc/cinder/cinder.conf DEFAULT glusterfs_mount_point_base /var/lib/cinder/volumes

## 5. Creating GlusterFS Volume List

On each of the Cinder nodes, create a simple text file **/etc/cinder/shares.conf**.

This file is a simple list of the GlusterFS volumes to be used, one per line, using the following format:

		GLUSTERHOST:VOLUME
		GLUSTERHOST:NEXTVOLUME
		GLUSTERHOST2:SOMEOTHERVOLUME

For example:

		myglusterbox.example.org:myglustervol

## 6. Updating Firewall for GlusterFS

You must update the firewall rules on each Cinder node to communicate with the GlusterFS nodes.

The ports to open are explained in Step 3:

<https://docs.gluster.org/en/latest/Install-Guide/Install/>

If you are using iptables as your firewall, these lines can be added under **:OUTPUT ACCEPT** in the "\*filter" section. You should probably adjust them to suit your environment (eg. only accept connections from your GlusterFS servers).

		-A INPUT -m state --state NEW -m tcp -p tcp --dport 111 -j ACCEPT
		-A INPUT -m state --state NEW -m tcp -p tcp --dport 24007 -j ACCEPT
		-A INPUT -m state --state NEW -m tcp -p tcp --dport 24008 -j ACCEPT
		-A INPUT -m state --state NEW -m tcp -p tcp --dport 24009 -j ACCEPT
		-A INPUT -m state --state NEW -m tcp -p tcp --dport 24010 -j ACCEPT
		-A INPUT -m state --state NEW -m tcp -p tcp --dport 24011 -j ACCEPT
		-A INPUT -m state --state NEW -m tcp -p tcp --dport 38465:38469 -j ACCEPT

Restart the firewall service:

		$ sudo service iptables restart

## 7. Restarting Cinder Services 

Configuration is complete and now you must restart the Cinder services to make it active.

		$ for i in api scheduler volume; do sudo service openstack-cinder-${i} start; done

Check the Cinder volume log to make sure that there are no errors:

		$ sudo tail -50 /var/log/cinder/volume.log

## 8. Verify GlusterFS Integration with Cinder 

To verify if the installation and configuration is successful, create a Cinder volume then check using GlusterFS.

Create a Cinder volume:

		# cinder create --display_name myvol 10

Volume creation takes a few seconds. Once created, run the following command:

		# cinder list

The volume should be in "available" status. Now, look for a new file in the GlusterFS volume directory:

		$ sudo ls -lah /var/lib/cinder/volumes/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/

(the XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX will be a number specific to your installation)

A newly created file should be inside that directory which is the new volume you just created. A new file will appear each time you create a volume.

For example:

		$ sudo ls -lah /var/lib/cinder/volumes/29e55f0f3d56494ef1b1073ab927d425/
		 total 4.0K
		 drwxr-xr-x. 3 root   root     73 Apr  4 15:46 .
		 drwxr-xr-x. 3 cinder cinder 4.0K Apr  3 09:31 ..
		 -rw-rw-rw-. 1 root   root    10G Apr  4 15:46 volume-a4b97d2e-0f8e-45b2-9b94-b8fa36bd51b9
