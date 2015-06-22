        Work In Progress
        Author - Satheesaran Sundaramoorthi
        <sasundar@redhat.com>

**Introduction**
----------------

Gluster volumes are used to host Virtual Machines Images. (i.e) Virtual
machines Images are stored on gluster volumes. This usecase is popularly
known as *virt-store* usecase.

This document explains more about,

1.  Enabling gluster volumes for virt-store usecase
2.  Common Pitfalls
3.  FAQs
4.  References

**Enabling gluster volumes for virt-store**
-------------------------------------------

This section describes how to enable gluster volumes for virt store
usecase

#### Volume Types

Ideally gluster volumes serving virt-store, should provide
high-availability for the VMs running on it. If the volume is not
avilable, the VMs may move in to unusable state. So, its best
recommended to use **replica** or **distribute-replicate** volume for
this usecase

*If you are new to GlusterFS, you can take a look at
[QuickStart](http://gluster.readthedocs.org/en/latest/Quick-Start-Guide/Quickstart/) guide or the [admin
guide](http://gluster.readthedocs.org/en/latest/Administrator%20Guide/README/)*

#### Tunables

The set of volume options are recommended for virt-store usecase, which
adds performance boost. Following are those options,

        quick-read=off
        read-ahead=off
        io-cache=off
        stat-prefetch=off
        eager-lock=enable
        remote-dio=enable
        quorum-type=auto
        server-quorum-type=server

-   quick-read is meant for improving small-file read performance,which
    is no longer reasonable for VM Image files
-   read-ahead is turned off. VMs have their own way of doing that. This
    is pretty usual to leave it to VM to determine the read-ahead
-   io-cache is turned off
-   stat-prefetch is turned off. stat-prefetch, caches the metadata
    related to files and this is no longer a concern for VM Images (why
    ?)
-   eager-lock is turned on (why?)
-   remote-dio is turned on,so in open() and creat() calls, O\_DIRECT
    flag will be filtered at the client protocol level so server will
    still continue to cache the file.
-   quorum-type is set to auto. This basically enables client side
    quorum. When client side quorum is enabled, there exists the rule
    such that atleast half of the bricks in the replica group should be
    UP and running. If not, the replica group would become read-only
-   server-quorum-type is set to server. This basically enables
    server-side quorum. This lays a condition that in a cluster, atleast
    half the number of nodes, should be UP. If not the bricks ( read as
    brick processes) will be killed, and thereby volume goes offline

#### Applying the Tunables on the volume

There are number of ways to do it.

1.  Make use of group-virt.example file
2.  Copy & Paste

##### Make use of group-virt.example file

This is the method best suited and recommended.
*/etc/glusterfs/group-virt.example* has all options recommended for
virt-store as explained earlier. Copy this file,
*/etc/glusterfs/group-virt.example* to */var/lib/glusterd/groups/virt*

        cp /etc/glusterfs/group-virt.example /var/lib/glusterd/groups/virt

Optimize the volume with all the options available in this *virt* file
in a single go

        gluster volume set <vol-name> group virt

NOTE: No restart of the volume is required Verify the same with the
command,

        gluster volume info

In forthcoming releases, this file will be automatically put in
*/var/lib/glusterd/groups/* and you can directly apply it on the volume

##### Copy & Paste

Copy all options from the above
section,[Virt-store-usecase\#Tunables](Virt-store-usecase#Tunables "wikilink")
and put in a file named *virt* in */var/lib/glusterd/groups/virt* Apply
all the options on the volume,

        gluster volume set <vol-name> group virt

NOTE: This is not recommended, as the recommended volume options may/may
not change in future.Always stick to *virt* file available with the rpms

#### Adding Ownership to Volume

You can add uid:gid to the volume,

        gluster volume set <vol-name> storage.owner-uid <number>
        gluster volume set <vol-name> storage.owner-gid <number>

For example, when the volume would be accessed by qemu/kvm, you need to
add ownership as 107:107,

        gluster volume set <vol-name> storage.owner-uid 107
        gluster volume set <vol-name> storage.owner-gid 107

It would be 36:36 in the case of oVirt/RHEV, 165:165 in the case of
OpenStack Block Service (cinder),161:161 in case of OpenStack Image
Service (glance) is accessing this volume

NOTE: Not setting the correct ownership may lead to "Permission Denied"
errors when accessing the image files residing on the volume

**Common Pitfalls**
-------------------

**FAQs**
--------

**References**
--------------