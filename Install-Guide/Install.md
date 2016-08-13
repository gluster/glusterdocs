### Installing Gluster

For RPM based distributions, if you will be using InfiniBand, add the
glusterfs RDMA package to the installations. For RPM based systems, yum
is used as the install method in order to satisfy external depencies
such as compat-readline5

###### For Debian

Add the GPG key to apt:

    wget -O - http://download.gluster.org/pub/gluster/glusterfs/LATEST/rsa.pub | apt-key add -

Add the source:

    DEBVER=$(grep 'VERSION_ID' /etc/os-release | cut -d '=' -f 2 | tr -d '"')
    echo deb https://download.gluster.org/pub/gluster/glusterfs/LATEST/Debian/${DEBVER}/apt ${DEBVER} main > /etc/apt/sources.list.d/gluster.list 

Update package list:

    apt-get update

Install:

    apt-get install glusterfs-server


###### For Ubuntu

Ubuntu 10 and 12: install python-software-properties:

		sudo apt-get install python-software-properties
		
Ubuntu 14: install software-properties-common:

		sudo apt-get install software-properties-common

Then add the community GlusterFS PPA:

		sudo add-apt-repository ppa:gluster/glusterfs-3.8
		sudo apt-get update

Finally, install the packages:

		sudo apt-get install glusterfs-server

*Note: Packages exist for Ubuntu 12.04 LTS, 12.10, 13.10, and 14.04
LTS*

###### For Red Hat/CentOS

RPMs for CentOS and other RHEL clones are available from the
CentOS Storage SIG mirrors.

For more installation details refer [Gluster Quick start guide](https://wiki.centos.org/SpecialInterestGroup/Storage/gluster-Quickstart) from CentOS Storage SIG.

###### For Fedora

Install the Gluster packages:

		yum install glusterfs-server

Once you are finished installing, you can move on to [configuration](./Configure.md) section.

###### For Arch Linux

Install the Gluster package:

        pacman -S glusterfs
