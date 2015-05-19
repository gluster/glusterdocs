### Installing Gluster

For RPM based distributions, if you will be using InfiniBand, add the
glusterfs RDMA package to the installations. For RPM based systems, yum
is used as the install method in order to satisfy external depencies
such as compat-readline5

###### For Debian

Download the packages

		wget -nd -nc -r -A.deb http://download.gluster.org/pub/gluster/glusterfs/LATEST/Debian/wheezy/

(Note from reader: The above does not work. Check
<http://download.gluster.org/pub/gluster/glusterfs/LATEST/Debian/> for
3.5 version or use http://packages.debian.org/wheezy/glusterfs-server 

Install the Gluster packages (do this on both servers)

		dpkg -i glusterfs_3.5.2-4_amd64.deb

###### For Ubuntu

If you haven't already done so, install python-software-properties:

		sudo apt-get install python-software-properties

Then add the community GlusterFS PPA:

		sudo add-apt-repository ppa:gluster/glusterfs-3.5
		sudo apt-get update

Finally, install the packages:

		sudo apt-get install glusterfs-server

*Note: Packages exist for Ubuntu 12.04 LTS, 12.10, 13.10, and 14.04
LTS*

###### For Red Hat/CentOS

Download the packages (modify URL for your specific release and
architecture).

		wget -P /etc/yum.repos.d http://download.gluster.org/pub/gluster/glusterfs/LATEST/RHEL/glusterfs-epel.repo

Install the Gluster packages (do this on both servers)

		yum install glusterfs-server

###### For Fedora

Install the Gluster packages (do this on both servers)

		yum install glusterfs-server

Once you are finished installing, you can move on to [configuration](./Configure.md) section.
