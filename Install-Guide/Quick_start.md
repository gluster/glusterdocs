### Quick Start Guide

Here are the bare minimum steps you need to get Gluster up and running.
If this is your first time setting things up, it is recommended that you
choose your desired setup method i.e. [AWS](./Setup_aws.md),
[virtual machines](./Setup_virt.md) or [baremetal](./Setup_Bare_metal.md)
after step four, adding an entry to fstab. If you want to get right to
it (and don't need more information), the steps below are all you need
to get started.

You will need to have at least two nodes with a 64 bit OS and a working
network connection. At least one gig of RAM is the bare minimum
recommended for testing, and you will want at least 8GB in any system
you plan on doing any real work on. A single cpu is fine for testing, as
long as it is 64 bit.

###### Partition, Format and mount the bricks

Assuming you have a brick at /dev/sdb:

		fdisk /dev/sdb and create a single partition

###### Format the partition

		mkfs.xfs -i size=512 /dev/sdb1

###### Mount the partition as a Gluster "brick"

		mkdir -p /export/sdb1 && mount /dev/sdb1 /export/sdb1 && mkdir -p /export/sdb1/brick

###### Add an entry to /etc/fstab

		echo "/dev/sdb1 /export/sdb1 xfs defaults 0 0"  >> /etc/fstab

###### Install Gluster packages on both nodes

		rpm -Uvh  http://download.gluster.com/pub/gluster/glusterfs/LATEST/Fedora/glusterfs{,-server,-fuse,-geo-replication}-3.3.1-1.fc16.x86_64.rpm

*Note: This example assumes Fedora 16*

###### Run the gluster peer probe command

*Note: From one node to the other nodes (do not peer probe the first
node)*

		gluster peer probe <ip or hostname of second host>

###### Configure your Gluster volume

		gluster volume create testvol rep 2 transport tcp node01:/export/sdb1/brick node02:/export/sdb1/brick

###### Test using the volume

		mkdir /mnt/gluster; mount -t glusterfs node01:/testvol; cp -r /var/log /mnt/gluster
