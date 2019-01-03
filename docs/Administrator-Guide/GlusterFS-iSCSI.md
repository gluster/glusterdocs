# GlusterFS iSCSI


## Introduction

iSCSI on Gluster can be set up using the Linux Target driver. This is a user space daemon that accepts iSCSI (as well as iSER and FCoE.) It interprets iSCSI CDBs and converts them into some other I/O operation, according to user configuration. In our case, we can convert the CDBs into file operations that run against a gluster file. The file represents the LUN and the offset in the file the LBA.

A plug-in for the Linux target driver has been written to use the libgfapi. It is part of the Linux target driver (bs\_glfs.c). Using it, the datapath skips FUSE. This document will be updated to describe how to use it. You can see README.glfs in the Linux target driver's documentation subdirectory.

LIO is a replacement for the Linux Target Driver that is included in RHEL7. A user-space plug-in mechanism for it is under development. Once that piece of code exists a similar mechanism can be built for gluster as was done for the Linux target driver.

Below is a cookbook to set it up using the Linux Target Driver on the server. This has been tested on XEN and KVM instances within RHEL6, RHEL7, and Fedora 19 instances. In this setup a single path leads to gluster, which represents a performance bottleneck and single point of failure. For HA and load balancing, it is possible to setup two or more paths to different gluster servers using mpio; if the target name is equivalent over each path, mpio will coalless both paths into a single device.

For more information on iSCSI and the Linux target driver, see [1] and [2].

## Setup

Mount gluster locally on your gluster server. Note you can also run it on the gluster client. There are pros and cons to these configurations, described [below](#Running_the_target_on_the_gluster_client "wikilink").

		# mount -t glusterfs 127.0.0.1:gserver /mnt

Create a large file representing your block device within the gluster fs. In this case, the lun is 2G. (<i>You could also create a gluster "block device" for this purpose, which would skip the file system</i>).

		# dd if=/dev/zero of=disk3 bs=2G count=25

Create a target using the file as the backend storage.

If necessary, download the Linux SCSI target. Then start the service.

		# yum install scsi-target-utils
		# service tgtd start

You must give an iSCSI Qualified name (IQN), in the format : iqn.yyyy-mm.reversed.domain.name:OptionalIdentifierText

where:

yyyy-mm represents the 4-digit year and 2-digit month the device was started (for example: 2011-07)

		# tgtadm --lld iscsi --op new --mode target --tid 1 -T iqn.20013-10.com.redhat

You can look at the target:

		# tgtadm --lld iscsi --op show --mode conn --tid 1

		Session: 11  Connection: 0     Initiator iqn.1994-05.com.redhat:cf75c8d4274d

Next, add a logical unit to the target

		# tgtadm --lld iscsi --op new --mode logicalunit --tid 1 --lun 1 -b /mnt/disk3

Allow any initiator to access the target.

		# tgtadm --lld iscsi --op bind --mode target --tid 1 -I ALL

Now it’s time to set up your client.

Discover your targets. Note in this example's case, the target IP address is 192.168.1.2

		# iscsiadm --mode discovery --type sendtargets --portal 192.168.1.2

Login to your target session.

		# iscsiadm --mode node --targetname iqn.2001-04.com.example:storage.disk1.amiens.sys1.xyz --portal 192.168.1.2:3260 --login

You should have a new SCSI disk. You will see it created in /var/log/messages. You will see it in lsblk.

You can send I/O to it:

		# dd if=/dev/zero of=/dev/sda bs=4K count=100

To tear down your iSCSI connection:

		# iscsiadm  -m node -T iqn.2001-04.com.redhat  -p 172.17.40.21 -u

## Running the iSCSI target on the gluster client

You can run the Linux target daemon on the gluster client. The advantages to this setup is the client could run gluster and enjoy all of gluster's benefits. For example, gluster could "fan out" I/O to different gluster servers. The downside would be that the client would need to load and configure gluster. It is better to run gluster on the client if it is possible.

## References

[1] <http://www.linuxjournal.com/content/creating-software-backed-iscsi-targets-red-hat-enterprise-linux-6>

[2] <http://www.cyberciti.biz/tips/howto-setup-linux-iscsi-target-sanwith-tgt.html>
