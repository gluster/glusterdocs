        Work In Progress
        Author - Satheesaran Sundaramoorthi
        <sasundar@redhat.com>

**Purpose**
-----------

Gluster volume can be used to store VM Disk images. This usecase is
popularly known as 'Virt-Store' usecase. Earlier, gluster volume had to
be fuse mounted and images are created/accessed over the fuse mount.

With the introduction of GlusterFS libgfapi, QEMU supports glusterfs
through libgfapi directly. This we call as *QEMU driver for glusterfs*.
These document explains about the way to make use of QEMU driver for
glusterfs

Steps for the entire procedure could be split in to 2 views viz,the
document from

1.  Steps to be done on gluster volume side
2.  Steps to be done on Hypervisor side

**Steps to be done on gluster side**
------------------------------------

These are the steps that needs to be done on the gluster side Precisely
this involves

1.  Creating "Trusted Storage Pool"
2.  Creating a volume
3.  Tuning the volume for virt-store
4.  Tuning glusterd to accept requests from QEMU
5.  Tuning glusterfsd to accept requests from QEMU
6.  Setting ownership on the volume
7.  Starting the volume

##### Creating "Trusted Storage Pool"

Install glusterfs rpms on the NODE. You can create a volume with a
single node. You can also scale up the cluster, as we call as *Trusted
Storage Pool*, by adding more nodes to the cluster

        gluster peer probe <hostname>

##### Creating a volume

It is highly recommended to have replicate volume or
distribute-replicate volume for virt-store usecase, as it would add high
availability and fault-tolerance. Remember the plain distribute works
equally well

        gluster volume create replica 2 <brick1> .. <brickN>

where, <brick1> is <hostname>:/<path-of-dir> Note: It is recommended to
create sub-directories inside brick and that could be used to create a
volume.For example, say, */home/brick1* is the mountpoint of XFS, then
you can create a sub-directory inside it */home/brick1/b1* and use it
while creating a volume.You can also use space available in root
filesystem for bricks. Gluster cli, by default, throws warning in that
case. You can override by using *force* option

        gluster volume create replica 2 <brick1> .. <brickN> force

*If you are new to GlusterFS, you can take a look at
[QuickStart](http://gluster.readthedocs.org/en/latest/Quick-Start-Guide/Quickstart/) guide.*

##### Tuning the volume for virt-store

There are recommended settings available for virt-store. This provide
good performance characteristics when enabled on the volume that was
used for *virt-store*

Refer to
[Virt-store-usecase\#Tunables](Virt-store-usecase#Tunables "wikilink")
for recommended tunables and for applying them on the volume,
[Virt-store-usecase\#Applying\_the\_Tunables\_on\_the\_volume](Virt-store-usecase#Applying_the_Tunables_on_the_volume "wikilink")

##### Tuning glusterd to accept requests from QEMU

glusterd receives the request only from the applications that run with
port number less than 1024 and it blocks otherwise. QEMU uses port
number greater than 1024 and to make glusterd accept requests from QEMU,
edit the glusterd vol file, */etc/glusterfs/glusterd.vol* and add the
following,

        option rpc-auth-allow-insecure on

Note: If you have installed glusterfs from source, you can find glusterd
vol file at */usr/local/etc/glusterfs/glusterd.vol*

Restart glusterd after adding that option to glusterd vol file

        service glusterd restart

##### Tuning glusterfsd to accept requests from QEMU

Enable the option *allow-insecure* on the particular volume

        gluster volume set <volname> server.allow-insecure on

**IMPORTANT :** As of now(april 2,2014)there is a bug, as
*allow-insecure* is not dynamically set on a volume.You need to restart
the volume for the change to take effect

##### Setting ownership on the volume

Set the ownership of qemu:qemu on to the volume

        gluster volume set <vol-name> storage.owner-uid 107
        gluster volume set <vol-name> storage.owner-gid 107

**IMPORTANT :** The UID and GID can differ per Linux distribution, or
even installation. The UID/GID should be the one fomr the *qemu* or
'kvm'' user, you can get the IDs with these commands:

        id qemu
        getent group kvm

##### Starting the volume

Start the volume

        gluster volume start <vol-name>

**Steps to be done on Hypervisor Side**
---------------------------------------

Hypervisor is just the machine which spawns the Virtual Machines. This
machines should be necessarily the baremetal with more memory and
computing power. The following steps needs to be done on hypervisor,

1.  Install qemu-kvm
2.  Install libvirt
3.  Create a VM Image
4.  Add ownership to the Image file
5.  Create libvirt XML to define Virtual Machine
6.  Define the VM
7.  Start the VM
8.  Verification

##### Install qemu-kvm

##### Install libvirt

##### Create a VM Image

Images can be created using *qemu-img* utility

        qemu-img create -f <format> gluster://<server>/<vol-name>/ <image> <size>

-  format - This can be raw or qcow2
-  server - One of the gluster Node's IP or FQDN
-  vol-name - gluster volume name
-  image - Image File name
-  size - Size of the image

Here is sample,

        qemu-img create -f qcow2 gluster://host.sample.com/vol1/vm1.img 10G

##### Add ownership to the Image file

NFS or FUSE mount the glusterfs volume and change the ownership of the
image file to qemu:qemu

        mount -t nfs -o vers=3 <gluster-server>:/<vol-name> <mount-point>

Change the ownership of the image file that was earlier created using
*qemu-img* utility

        chown qemu:qemu <mount-point>/<image-file>

##### Create libvirt XML to define Virtual Machine

*virt-install* is python wrapper which is mostly used to create VM using
set of params. *virt-install* doesn't support any network filesystem [
<https://bugzilla.redhat.com/show_bug.cgi?id=1017308> ]

Create a libvirt xml - <http://libvirt.org/formatdomain.html> See to
that the disk section is formatted in such a way, qemu driver for
glusterfs is being used. This can be seen in the following example xml
description

        <disk type='network' device='disk'>
           <driver name='qemu' type='raw' cache='none'/>
           <source protocol='gluster' name='distrepvol/vm3.img'>
                <host name='10.70.37.106' port='24007'/>
            </source>
           <target dev='vda' bus='virtio'/>
           <address type='pci' domain='0x0000' bus='0x00' slot='0x04' function='0x0'/>
        </disk>

##### Define the VM from XML

Define the VM from the XML file that was created earlier

        virsh define <xml-file-description>

Verify that the VM is created successfully

        virsh list --all

##### Start the VM

Start the VM

        virsh start <VM>

##### Verification

You can verify the disk image file that is being used by VM

        virsh domblklist <VM-Domain-Name/ID>

The above should show the volume name and image name. Here is the
example,

        [root@test ~]# virsh domblklist vm-test2
        Target     Source
        ------------------------------------------------
        vda        distrepvol/test.img
        hdc        -