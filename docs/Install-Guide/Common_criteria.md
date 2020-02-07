### Getting Started

This tutorial will cover different options for getting a Gluster
cluster up and running. Here is a rundown of the steps we need to do.

To start, we will go over some common things you will need to know for
setting up Gluster.

Next, choose the method you want to use to set up your first cluster:

-  Within a virtual machine
-  To bare metal servers
-  To EC2 instances in Amazon

Finally, we will install Gluster, create a few volumes, and test using
them.

#### General Setup Principles

No matter where you will be installing Gluster, it helps to understand a
few key concepts on what the moving parts are.

First, it is important to understand that GlusterFS isn’t really a
filesystem in and of itself. It concatenates existing filesystems into
one (or more) big chunks so that data being written into or read out of
Gluster gets distributed across multiple hosts simultaneously. This
means that you can use space from any host that you have available.
Typically, XFS is recommended but it can be used with other filesystems
as well. Most commonly EXT4 is used when XFS isn’t, but you can (and
many, many people do) use another filesystem that suits you. 

Now that we understand that, we can define a few of the common terms used in
Gluster.

-   A **trusted pool** refers collectively to the hosts in a given
    Gluster Cluster.
-   A **node** or “server” refers to any server that is part of a
    trusted pool. In general, this assumes all nodes are in the same
    trusted pool.
-   A **brick** is used to refer to any device (really this means
    filesystem) that is being used for Gluster storage.
-   An **export** refers to the mount path of the brick(s) on a given
    server, for example, /export/brick1
-   The term **Global Namespace** is a fancy way of saying a Gluster
    volume
-   A **Gluster volume** is a collection of one or more bricks (of
    course, typically this is two or more). This is analogous to
    /etc/exports entries for NFS.
-   **GNFS** and **kNFS**. GNFS is how we refer to our inline NFS
    server. kNFS stands for kernel NFS, or, as most people would say,
    just plain NFS. Most often, you will want kNFS services disabled on
    the Gluster nodes. Gluster NFS doesn't take any additional
    configuration and works just like you would expect with NFSv3. It is
    possible to configure Gluster and NFS to live in harmony if you want
    to.

Other notes:

-   For this test, if you do not have DNS set up, you can get away with
    using /etc/hosts entries for the two nodes. However, when you move
    from this basic setup to using Gluster in production, correct DNS
    entries (forward and reverse) and NTP are essential.
-   When you install the Operating System, do not format the Gluster
    storage disks! We will use specific settings with the mkfs command
    later on when we set up Gluster. If you are testing with a single
    disk (not recommended), make sure to carve out a free partition or
    two to be used by Gluster later, so that you can format or reformat
    at will during your testing.
-   Firewalls are great, except when they aren’t. For storage servers,
    being able to operate in a trusted environment without firewalls can
    mean huge gains in performance, and is recommended. In case you absolutely
    need to set up a firewall, have a look at
    [Setting up clients](../Administrator Guide/Setting Up Clients.md) for
    information on the ports used.

Click here to [get started](../Quick-Start-Guide/Quickstart.md)
