### Installing Gluster

For RPM based distributions, if you will be using InfiniBand, add the
glusterfs RDMA package to the installations. For RPM based systems, yum/dnf
is used as the install method in order to satisfy external depencies
such as compat-readline5

###### Community Packages

Packages are provided according to this [table](./Community_Packages.md).

###### For Debian

Add the GPG key to apt:

```console
# wget -O - https://download.gluster.org/pub/gluster/glusterfs/LATEST/rsa.pub | apt-key add -
```

If the rsa.pub is not available at the above location, please look here https://download.gluster.org/pub/gluster/glusterfs/3.12/rsa.pub and add the GPG key to apt:

```console
# wget -O - https://download.gluster.org/pub/gluster/glusterfs/3.12/rsa.pub | apt-key add -
```

Add the source:

```console
# DEBID=$(grep 'VERSION_ID=' /etc/os-release | cut -d '=' -f 2 | tr -d '"')
# DEBVER=$(grep 'VERSION=' /etc/os-release | grep -Eo '[a-z]+')
# DEBARCH=$(dpkg --print-architecture)
# echo deb https://download.gluster.org/pub/gluster/glusterfs/LATEST/Debian/${DEBID}/${DEBARCH}/apt ${DEBVER} main > /etc/apt/sources.list.d/gluster.list
```

Update package list:

```console
# apt-get update
```

Install:

```console
# apt-get install glusterfs-server
```

###### For Ubuntu

Install software-properties-common:

```console
# sudo apt-get install software-properties-common
```

Then add the community GlusterFS PPA:

```console
# sudo add-apt-repository ppa:gluster/glusterfs-3.8
# sudo apt-get update
```

Finally, install the packages:

```console
# sudo apt-get install glusterfs-server
```

*Note: Packages exist for Ubuntu 12.04 LTS, 12.10, 13.10, and 14.04
LTS*

###### For Red Hat/CentOS

RPMs for CentOS and other RHEL clones are available from the
CentOS Storage SIG mirrors.

For more installation details refer [Gluster Quick start guide](https://wiki.centos.org/SpecialInterestGroup/Storage/gluster-Quickstart) from CentOS Storage SIG.

###### For Fedora

Install the Gluster packages:

```console
# dnf install glusterfs-server
```

Once you are finished installing, you can move on to [configuration](./Configure.md) section.

###### For Arch Linux

Install the Gluster package:

```console
# pacman -S glusterfs
```
