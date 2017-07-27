# Installation Guide

## Installation Overview
### Objective of this Guide

This document will get you up to speed with some hands-on experience
with Gluster by guiding you through the steps of setting it up for the
first time. If you are looking to get right into things, you are in the
right place. If you want just the bare minimum steps, see the [Quick Start Guide](./Quick_start.md).

If you want some in-depth information on each of the steps, you are in the right place.
Both the guides will get you
to a working Gluster cluster, so it depends on you how much time you
want to spend. The [Quick Start Guide](./Quick_start.md) should have you up and running in ten minutes
or less. This guide can easily be done in a lunch break, and still gives
you time to have a quick bite to eat. The Getting Started guide can be
done easily in a few hours, depending on how much testing you want to
do.

After you deploy Gluster by following these steps, we recommend that
you read the [Gluster Admin Guide](../Administrator Guide/) to learn how to administer Gluster and
how to select a volume type that fits your needs. Also, be sure to
enlist the help of the Gluster community via the IRC channel or Q&A
section . We want you to be successful in as short a time as possible.
Overview:

Before we begin, let’s talk about what Gluster is, dispel a few myths
and misconceptions, and define a few terms. This will help you to avoid
some of the common issues that others encounter most frequently.

### Understanding Gluster

Gluster is a distributed scale out filesystem that allows rapid
provisioning of additional storage based on your storage consumption
needs. It incorporates automatic failover as a primary feature. All of
this is accomplished without a centralized metadata server.

-   Gluster is an easy way to provision your own storage backend NAS
    using almost any hardware you choose.
-   You can add as much as you want to start with, and if you need more
    later, adding more takes just a few steps.
-   You can configure failover automatically, so that if a server goes
    down, you don’t lose access to the data. No manual steps are
    required for failover. When you fix the server that failed and bring
    it back online, you don’t have to do anything to get the data back
    except wait. In the mean time, the most current copy of your data
    keeps getting served from the node that was still running.
-   You can build a clustered filesystem in a matter of minutes…it is
    trivially easy for basic setups
-   It takes advantage of what we refer to as “commodity hardware”,
    which means, we run on just about any hardware you can think of,
    from that stack of decomm’s and gigabit switches in the corner no
    one can figure out what to do with (how many license servers do you
    really need, after all?), to that dream array you were speccing out
    online. Don’t worry, I won’t tell your boss.
-   It takes advantage of commodity software too. No need to mess with
    kernels or fine tune the OS to a tee. We run on top of most unix
    filesystems, with XFS and ext4 being the most popular choices. We do
    have some recommendations for more heavily utilized arrays, but
    these are simple to implement and you probably have some of these
    configured already anyway.
-   Gluster data can be accessed from just about anywhere – You can use
    traditional NFS, SMB/CIFS for Windows clients, or our own native
    GlusterFS (a few additional packages are needed on the client
    machines for this, but as you will see, they are quite small).
-   There are even more advanced features than this, but for now we will
    focus on the basics.
-   It’s not just a toy. Gluster is enterprise ready, and commercial
    support is available if you need it. It is used in some of the most
    taxing environments like media serving, natural resource
    exploration, medical imaging, and even as a filesystem for Big Data.

Question: Is Gluster going to work for me and what I need it to do?

Most likely, yes. People use Gluster for all sorts of things. You are
encouraged to ask around in our IRC channel or Q&A forums to see if
anyone has tried something similar. That being said, there are a few
places where Gluster is going to need more consideration than others. -
Accessing Gluster from SMB/CIFS is often going to be slow by most
people’s standards. If you only moderate access by users, then it most
likely won’t be an issue for you. On the other hand, adding enough
Gluster servers into the mix, some people have seen better performance
with us than other solutions due to the scale out nature of the
technology - Gluster does not support so called “structured data”,
meaning live, SQL databases. Of course, using Gluster to backup and
restore the database would be fine - Gluster is traditionally better
when using file sizes at of least 16KB (with a sweet spot around 128KB
or so).

Question: What is the cost and complexity required to set up cluster?

Question: How many billions of dollars is it going to cost to setup a cluster?
Don’t I need redundant networking, super fast SSD’s,
technology from Alpha Centauri delivered by men in black, etc…?

I have never seen anyone spend even close to a billion, unless they got
the rust proof coating on the servers. You don’t seem like the type that
would get bamboozled like that, so have no fear. For purpose of this
tutorial, if your laptop can run two VM’s with 1GB of memory each, you
can get started testing and the only thing you are going to pay for is
coffee (assuming the coffee shop doesn’t make you pay them back for the
electricity to power your laptop).

If you want to test on bare metal, since Gluster is built with commodity
hardware in mind, and because there is no centralized meta-data server,
a very simple cluster can be deployed with two basic servers (2 CPU’s,
4GB of RAM each, 1 Gigabit network). This is sufficient to have a nice
file share or a place to put some nightly backups. Gluster is deployed
successfully on all kinds of disks, from the lowliest 5200 RPM SATA to
mightiest 1.21 gigawatt SSD’s. The more performance you need, the more
consideration you will want to put into how much hardware to buy, but
the great thing about Gluster is that you can start small, and add on as
your needs grow.

Question: OK, but if I add servers on later, don’t they have to be exactly the same?

In a perfect world, sure. Having the hardware be the same means less
troubleshooting when the fires start popping up. But plenty of people
deploy Gluster on mix and match hardware, and successfully.

Get started by checking some [Common Criteria](./Common_criteria.md)
*Note: You only need one of the three setup methods!*

### Common Criteria

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

No matter where you will be installing Gluster, it helps to understand a
few key concepts on what the moving parts are.

First, it is important to understand that GlusterFS isn’t really a
filesystem in and of itself. It concatenates existing filesystems into
one (or more) big chunks so that data being written into or read out of
Gluster gets distributed across multiple hosts simultaneously. This
means that you can use space from any host that you have available.
Typically, XFS is recommended but it can be used with other filesystems
as well. Most commonly EXT4 is used when XFS isn’t, but you can (and
many, many people do) use another filesystem that suits you. Now that we
understand that, we can define a few of the common terms used in
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

## Installation Procedure

### Identify the system type
TODO
* Virtual Machines
* Physical servers
* Amazon Web Server

#### Virtual machines

As we just mentioned, to set up Gluster using virtual machines, you will
need at least two virtual machines with at least 1GB of RAM each. You
may be able to test with less but most users will find it too slow for
their tastes. The particular virtualization product you use is a matter
of choice. Platforms I have used to test on include Xen, VMware ESX and
Workstation, VirtualBox, and KVM. For purpose of this article, all steps
assume KVM but the concepts are expected to be simple to translate to
other platforms as well. The article assumes you know the particulars of
how to create a virtual machine and have installed a 64 bit linux
distribution already.

Create or clone two VM’s, with the following setup on each:

-   2 disks using the VirtIO driver, one for the base OS and one that we
    will use as a Gluster “brick”. You can add more later to try testing
    some more advanced configurations, but for now let’s keep it simple.

*Note: If you have ample space available, consider allocating all the
disk space at once.*

-   2 NIC’s using VirtIO driver. The second NIC is not strictly
    required, but can be used to demonstrate setting up a separate
    network for storage and management traffic.

*Note: Attach each NIC to a separate network.*

Other notes: Make sure that if you clone the VM, that Gluster has not
already been installed. Gluster generates a UUID to “fingerprint” each
system, so cloning a previously deployed system will result in errors
later on.

Once these are prepared, you are ready to move on to the
[install](./Install.md) section.
*Note: You only need one of the three setup methods!*
#### Physical servers

To set up Gluster on physical servers, I recommend two servers of very
modest specifications (2 CPU’s, 2GB of RAM, 1GBE). Since we are dealing
with physical hardware here, keep in mind, what we are showing here is
for testing purposes. In the end, remember that forces beyond your
control (aka, your bosses’ boss...) can force you to take that the “just
for a quick test” envinronment right into production, despite your
kicking and screaming against it. To prevent this, it can be a good idea
to deploy your test environment as much as possible the same way you
would to a production environment (in case it becomes one, as mentioned
above). That being said, here is a reminder of some of the best
practices we mentioned before:

-   Make sure DNS and NTP are setup, correct, and working
-   If you have access to a backend storage network, use it! 10GBE or
    InfiniBand are great if you have access to them, but even a 1GBE
    backbone can help you get the most out of you deployment. Make sure
    that the interfaces you are going to use are also in DNS since we
    will be using the hostnames when we deploy Gluster
-   When it comes to disks, the more the merrier. Although you could
    technically fake things out with a single disk, there would be
    performance issues as soon as you tried to do any real work on the
    servers

With the explosion of commodity hardware, you don’t need to be a
hardware expert these days to deploy a server. Although this is
generally a good thing, it also means that paying attention to some
important, performance impacting BIOS settings is commonly ignored. A
few things I have seen cause issues when people didn't know to look for
them:

-   Most manufacturers enable power saving mode by default. This is a
    great idea for servers that do not have high performance
    requirements. For the average storage server, the performance impact
    of the power savings is not a reasonable trade off
-   Newer motherboards and processors have lots of nifty features!
    Enhancements in virtualization, newer ways of doing predictive
    algorithms and NUMA are just a few to mention. To be safe, many
    manufactures ship hardware with settings meant to work with as
    massive a variety of workloads and configurations as they have
    customers. One issue you could face is when you set up that blazing
    fast 10GBE card you were so thrilled about installing? In many
    cases, it would end up being crippled by a default 1x speed put in
    place on the PCI-E bus by the motherboard.

Thankfully, most manufactures show all the BIOS settings, including the
defaults, right in the manual. It only takes a few minutes to download,
and you don’t even have to power off the server unless you need to make
changes. More and more boards include the functionality to make changes
in the BIOS on the fly without even powering the box off. One word of
caution of course, is don’t go too crazy. Fretting over each tiny little
detail and setting is usually not worth the time, and the more changes
you make, the more you need to document and implement later. Try to find
the happy balance between time spent managing the hardware (which
ideally should be as close to zero after you setup initially) and the
expected gains you get back from it.

Finally, remember that some hardware really is better that others.
Without pointing fingers anywhere specifically, it is often true that
onboard components are not as robust as add-ons. As a general rule, you
can safely delegate the on-board hardware to things like management
network for the NIC’s, and for installing the OS onto a SATA drive. At
least twice a year you should check the manufacturers website for
bulletins about your hardware. Critical performance issues are often
resolved with a simple driver or firmware update. As often as not, these
updates affect the two most critical pieces of hardware on a machine you
want to use for networked storage - the RAID controller and the NIC's.

Once you have setup the servers and installed the OS, you are ready to
move on to the [install](./Install.md) section.
*Note: You only need one of the three setup methods!*

#### Amazon Web Server

Deploying in Amazon can be one of the fastest ways to get up and running
with Gluster. Of course, most of what we cover here will work with other
cloud platforms.

-   Deploy at least two instances. For testing, you can use micro
    instances (I even go as far as using spot instances in most cases).
    Debates rage on what size instance to use in production, and there
    is really no correct answer. As with most things, the real answer is
    “whatever works for you”, where the trade-offs betweeen cost and
    performance are balanced in a continual dance of trying to make your
    project successful while making sure there is enough money left over
    in the budget for you to get that sweet new ping pong table in the
    break room.
-   For cloud platforms, your data is wide open right from the start. As
    such, you shouldn’t allow open access to all ports in your security
    groups if you plan to put a single piece of even the least valuable
    information on the test instances. By least valuable, I mean “Cash
    value of this coupon is 1/100th of 1 cent” kind of least valuable.
    Don’t be the next one to end up as a breaking news flash on the
    latest inconsiderate company to allow their data to fall into the
    hands of the baddies. See Step 2 for the minimum ports you will need
    open to use Gluster
-   You can use the free “ephemeral” storage for the Gluster bricks
    during testing, but make sure to use some form of protection against
    data loss when you move to production. Typically this means EBS
    backed volumes or using S3 to periodically back up your data bricks.

Other notes:

-   In production, it is recommended to replicate your VM’s across
    multiple zones. For purpose of this tutorial, it is overkill, but if
    anyone is interested in this please let us know since we are always
    looking to write articles on the most requested features and
    questions.
-   Using EBS volumes and Elastic IP’s is also recommended in
    production. For testing, you can safely ignore these as long as you
    are aware that the data could be lost at any moment, so make sure
    your test deployment is just that, testing only.
-   Performance can fluctuate wildly in a cloud environment. If
    performance issues are seen, there are several possible strategies,
    but keep in mind that this is the perfect place to take advantage of
    the scale-out capability of Gluster. While it is not true in all
    cases that deploying more instances will necessarily result in a
    “faster” cluster, in general you will see that adding more nodes
    means more performance for the cluster overall.
-   If a node reboots, you will typically need to do some extra work to
    get Gluster running again using the default EC2 configuration. If a
    node is shut down, it can mean absolute loss of the node (depending
    on how you set things up). This is well beyond the scope of this
    document, but is discussed in any number of AWS related forums and
    posts. Since I found out the hard way myself (oh, so you read the
    manual every time?!), I thought it worth at least mentioning.


### Download Gluster
TODO

Once you have both instances up, you can proceed to the [install](./Install.md) page.

### Download and Install GDeploy
TODO

### Install Gluster with GDeploy
TODO

## Configure the Installation
### Configure Firewall

For the Gluster to communicate within a cluster either the firewalls
have to be turned off or enable communication for each server.

		iptables -I INPUT -p all -s `<ip-address>` -j ACCEPT

### Configure the trusted pool

Remember that the trusted pool is the term used to define a cluster of
nodes in Gluster. Choose a server to be your “primary” server. This is
just to keep things simple, you will generally want to run all commands
from this tutorial. Keep in mind, running many Gluster specific commands
(like `gluster volume create`) on one server in the cluster will
execute the same command on all other servers.

Replace `nodename` with hostname of the other server in the cluster,
or IP address if you don’t have DNS or `/etc/hosts` entries.
Let say we want to connect to `node02`:

		gluster peer probe node02

Notice that running `gluster peer status` from the second node shows
that the first node has already been added.

### Partition the disk

Assuming you have a empty disk at `/dev/sdb`:

		fdisk /dev/sdb 

And then create a single XFS partition using fdisk

### Format the partition

		mkfs.xfs -i size=512 /dev/sdb1

### Add an entry to /etc/fstab

		echo "/dev/sdb1 /export/sdb1 xfs defaults 0 0"  >> /etc/fstab

### Mount the partition as a Gluster "brick"

		mkdir -p /export/sdb1 && mount -a && mkdir -p /export/sdb1/brick

#### Set up a Gluster volume

The most basic Gluster volume type is a “Distribute only” volume (also
referred to as a “pure DHT” volume if you want to impress the folks at
the water cooler). This type of volume simply distributes the data
evenly across the available bricks in a volume. So, if I write 100
files, on average, fifty will end up on one server, and fifty will end
up on another. This is faster than a “replicated” volume, but isn’t as
popular since it doesn’t give you two of the most sought after features
of Gluster — multiple copies of the data, and automatic failover if
something goes wrong.

To set up a replicated volume:

		gluster volume create gv0 replica 2 node01.mydomain.net:/export/sdb1/brick node02.mydomain.net:/export/sdb1/brick

Breaking this down into pieces:

- the first part says to create a gluster volume named gv0
(the name is arbitrary, gv0 was chosen simply because
it’s less typing than gluster\_volume\_0).
- make the volume a replica volume
- keep a copy of the data on at least 2 bricks at any given time.
Since we only have two bricks total, this
means each server will house a copy of the data.
- we specify which nodes to use, and which bricks on those nodes. The order here is
important when you have more bricks.

It is possible (as of the most current release as of this writing, Gluster 3.3)
to specify the bricks in a such a way that you would make both copies of the data reside on a
single node. This would make for an embarrassing explanation to your
boss when your bulletproof, completely redundant, always on super
cluster comes to a grinding halt when a single point of failure occurs.

Now, we can check to make sure things are working as expected:

		gluster volume info

And you should see results similar to the following:

	    Volume Name: gv0
	    Type: Replicate
	    Volume ID: 8bc3e96b-a1b6-457d-8f7a-a91d1d4dc019
	    Status: Created
	    Number of Bricks: 1 x 2 = 2
	    Transport-type: tcp
	    Bricks:
	    Brick1: node01.yourdomain.net:/export/sdb1/brick
	    Brick2: node02.yourdomain.net:/export/sdb1/brick

This shows us essentially what we just specified during the volume
creation. The one this to mention is the `Status`. A status of `Created`
means that the volume has been created, but hasn’t yet been started,
which would cause any attempt to mount the volume fail.

Now, we should start the volume.

		gluster volume start gv0

Find all documentation [here](../index.md)
