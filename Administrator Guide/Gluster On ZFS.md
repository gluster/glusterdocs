Gluster On ZFS
--------------

This is a step-by-step set of instructions to install Gluster on top of ZFS as the backing file store. There are some commands which were specific to my installation, specifically, the ZFS tuning section. *Moniti estis.*

Preparation
-----------

-   Install CentOS 6.3
-   Assumption is that your hostname is `gfs01`
-   Run all commands as the root user
-   yum update
-   Disable IP Tables

```sh
chkconfig iptables off
service iptables stop
```

-   Disable SELinux
    -   edit ``/etc/selinux/config``
    -   set ``SELINUX=disabled``
    -   reboot

Install ZFS on Linux
--------------------

For RHEL6 or 7 and derivatives, you can install the ZFSoL repo (and EPEL) and use that to install ZFS

-   RHEL 6:
```sh
yum localinstall --nogpgcheck https://download.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm
yum localinstall --nogpgcheck http://archive.zfsonlinux.org/epel/zfs-release.el6.noarch.rpm
yum install kernel-devel zfs
```

-   RHEL 7:
```sh
yum localinstall --nogpgcheck https://download.fedoraproject.org/pub/epel/7/x86_64/e/epel-release-7-2.noarch.rpm
yum localinstall --nogpgcheck http://archive.zfsonlinux.org/epel/zfs-release.el7.noarch.rpm
yum install kernel-devel zfs
```

and skip to [Finish ZFS Configuration](#Finish ZFS Configuration) below.

Or you can roll your own if you want specific patches:
```sh
yum groupinstall "Development Tools"
```

-   Download & unpack latest SPL and ZFS tarballs from [zfsonlinux.org](http://www.zfsonlinux.org)

### Install DKMS

We want automatically rebuild the kernel modules when we upgrade the kernel, so you definitely want DKMS with ZFS on Linux.

-   Download latest RPM from <http://linux.dell.com/dkms>
-   Install DKMS
```sh
rpm -Uvh dkms*.rpm
```

### Build & Install SPL

-   Enter SPL source directory
-   The following commands create two source & three binary RPMs. Remove the static module RPM (we are using DKMS) and install the rest:
```sh
./configure
make rpm
rm spl-modules-0.6.0*.x86_64.rpm
rpm -Uvh spl*.x86_64.rpm spl*.noarch.rpm
```

### Build & Install ZFS

**Notice:**
If you plan to use the `xattr=sa` filesystem option, make sure you have the ZFS fix for <https://github.com/zfsonlinux/zfs/issues/1648> so your symlinks don't get corrupted.
(applies to ZFSoL before 0.6.3, `xattr=s` is safe to use on 0.6.3 and later)

-   Enter ZFS source directory
-   The following commands create two source & five binary RPMs. Remove the static module RPM and install the rest. Note we have a few preliminary packages to install before we can compile.
```sh
yum install zlib-devel libuuid-devel libblkid-devel libselinux-devel parted lsscsi
./configure
make rpm
rm zfs-modules-0.6.0*.x86_64.rpm
rpm -Uvh zfs*.x86_64.rpm zfs*.noarch.rpm
```

### Finish ZFS Configuration

-   Reboot to allow all changes to take effect, if desired
-   Create ZFS storage pool, in below examples it will be named `sp1`. This is a simple example of 4 HDDs in RAID10. NOTE: Check the latest [ZFS on Linux FAQ](http://zfsonlinux.org/faq.html) about configuring the `/etc/zfs/zdev.conf` file. You want to create mirrored devices across controllers to maximize performance. Make sure to run `udevadm trigger` after creating zdev.conf.
```sh
zpool create -f sp1 mirror A0 B0 mirror A1 B1
zpool status sp1
df -h
```

-   You should see the `/sp1` mount point
-   Enable ZFS compression to save disk space:

    `zfs set compression=on sp1`

-   you can also use `lz4` compression on later versions of ZFS as it can be faster, especially for incompressible workloads. It is safe to change this on the fly, as ZFS will compress new data with the current setting:

    `zfs set compression=lz4 sp1`

-   Set ZFS tunables. This is specific to my environment.
    -   Set ARC cache min to 33% and max to 75% of installed RAM. Since this is a dedicated storage node, I can get away with this. In my case my servers have 24G of RAM. More RAM is better with ZFS.
    -   We use SATA drives which do not accept command tagged queuing, therefore set the min and max pending requests to 1
    -   Disable read prefetch because it is almost completely useless and does nothing in our environment but work the drives unnecessarily. I see < 10% prefetch cache hits, so it's really not required and actually hurts performance.
    -   Set transaction group timeout to 5 seconds to prevent the volume from appearing to freeze due to a large batch of writes. 5 seconds is the default, but safe to force this.
    -   Ignore client flush/sync commands; let ZFS handle this with the transaction group timeout flush. NOTE: Requires a UPS backup solution unless you don't mind losing that 5 seconds worth of data.

```sh
echo "options zfs zfs_arc_min=8G zfs_arc_max=18G zfs_vdev_min_pending=1 zfs_vdev_max_pending=1 zfs_prefetch_disable=1 zfs_txg_timeout=5" > /etc/modprobe.d/zfs.conf
reboot
```

-   Setting the `acltype` property to `posixacl` indicates Posix ACLs should be used.

    `zfs set acltype=posixacl sp1`

Install GlusterFS
-----------------

```sh
wget -P /etc/yum.repos.d http://download.gluster.org/pub/gluster/glusterfs/LATEST/EPEL.repo/glusterfs-epel.repo
yum install glusterfs{-fuse,-server}
service glusterd start
service glusterd status
chkconfig glusterd on
```

-   Continue with your GFS peer probe, volume creation, etc.
-   To mount GFS volumes automatically after reboot, add these lines to `/etc/rc.local` (assuming your gluster volume is called `export` and your desired mount point is `/export`:

```sh
# Mount GFS Volumes
mount -t glusterfs gfs01:/export /export
```

Miscellaneous Notes & TODO
--------------------------

### Daily e-mail status reports

Python script source; put your desired e-mail address in the `toAddr` variable. Add a crontab entry to run this daily.

```python
#!/usr/bin/python
'''
Send e-mail to given user with zfs status
'''
import datetime
import socket
import smtplib
import subprocess


def doShellCmd(cmd):
    '''execute system shell command, return output as string'''
    subproc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE)
    cmdOutput = subproc.communicate()[0]
    return cmdOutput

hostname = socket.gethostname()
statusLine = "Status of " + hostname + " at " + str(datetime.datetime.now())
zpoolList = doShellCmd('zpool list')
zpoolStatus = doShellCmd('zpool status')
zfsList = doShellCmd('zfs list')
report = (statusLine + "\n" +
    "-----------------------------------------------------------\n" +
    zfsList +
    "-----------------------------------------------------------\n" +
    zpoolList +
    "-----------------------------------------------------------\n" +
    zpoolStatus)

fromAddr = "From: root@" + hostname + "\r\n"
toAddr = "To: user@your.com\r\n"
subject = "Subject: ZFS Status from " + hostname + "\r\n"
msg = (subject + report)
server = smtplib.SMTP('localhost')
server.set_debuglevel(1)
server.sendmail(fromAddr, toAddr, msg)
server.quit()

```

### Restoring files from ZFS Snapshots

Show which node a file is on (for restoring files from ZFS snapshots):

     `getfattr -n trusted.glusterfs.pathinfo <file>`

### Recurring ZFS Snapshots

Since the community site will not let me actually post the script due to some random bug with Akismet spam blocking, I'll just post links instead.

-   [Recurring ZFS Snapshots](http://community.spiceworks.com/how_to/show/15303-recurring-zfs-snapshots)
-   Or use <https://github.com/zfsonlinux/zfs-auto-snapshot>
