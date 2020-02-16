# Overview 
### Purpose

The Install Guide (IG) is aimed at providing the sequence of steps needed for setting up Gluster. It contains a reasonable degree of detail which helps an administrator to understand the terminology, the choices and how to configure the deployment to the storage needs of their application workload. The [Quick Start Guide](../Quick-Start-Guide/Quickstart.md) (QSG) is designed to get a deployment with default choices and is aimed at those who want to spend less time to get to a deployment.

After you deploy Gluster by following these steps, we recommend that
you read the [Gluster Admin Guide](../Administrator Guide/index.md) (AG) to learn how to administer Gluster and
how to select a volume type that fits your needs. Also, be sure to
enlist the help of the Gluster community via the IRC or, Slack channels (see https://www.gluster.org/community/) or Q&A
section. 

### Overview

Before we begin, let’s talk about what Gluster is, address a few myths
and misconceptions, and define a few terms. This will help you to avoid
some of the common issues that others encounter as they start their journey with Gluster.

#### What is Gluster

Gluster is a distributed scale-out filesystem that allows rapid
provisioning of additional storage based on your storage consumption
needs. It incorporates automatic failover as a primary feature. All of
this is accomplished without a centralized metadata server.

#### What is Gluster without making me learn an extra glossary of terminology?

-   Gluster is an easy way to provision your own storage backend NAS
    using almost any hardware you choose.
-   You can add as much as you want to start with, and if you need more
    later, adding more takes just a few steps.
-   You can configure failover automatically, so that if a server goes
    down, you don’t lose access to the data. No manual steps are
    required for failover. When you fix the server that failed and bring
    it back online, you don’t have to do anything to get the data back
    except wait. In the meantime, the most current copy of your data
    keeps getting served from the node that was still running.
-   You can build a clustered filesystem in a matter of minutes… it is
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
-   It’s not just a toy. Gluster is enterprise-ready, and commercial
    support is available if you need it. It is used in some of the most
    taxing environments like media serving, natural resource
    exploration, medical imaging, and even as a filesystem for Big Data.

#### Is Gluster going to work for me and what I need it to do?

Most likely, yes. People use Gluster for storage needs of a variety of application workloads. You are
encouraged to ask around in our IRC or, Slack channels or Q&A forums to see if
anyone has tried something similar. That being said, there are a few
places where Gluster is going to need more consideration than others.

- Accessing Gluster from SMB/CIFS is often going to be slow by most
  people’s standards. If you only moderate access by users, then it most
  likely won’t be an issue for you. On the other hand, adding enough
  Gluster servers into the mix, some people have seen better performance
  with us than other solutions due to the scale out nature of the
  technology
- Gluster does not support so called “structured data”, meaning
  live, SQL databases. Of course, using Gluster to backup and
  restore the database would be fine
- Gluster is traditionally better when using file sizes of at least 16KB
  (with a sweet spot around 128KB or so).

#### What is the cost and complexity required to set up cluster?

Question: How many billions of dollars is it going to cost to setup a cluster?
Don’t I need redundant networking, super fast SSD’s,
technology from Alpha Centauri delivered by men in black, etc…?

I have never seen anyone spend even close to a billion, unless they got
the rust proof coating on the servers. You don’t seem like the type that
would get bamboozled like that, so have no fear. For the purpose of this
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

#### OK, but if I add servers on later, don’t they have to be exactly the same?

In a perfect world, sure. Having the hardware be the same means less
troubleshooting when the fires start popping up. But plenty of people
deploy Gluster on mix and match hardware, and successfully.

Get started by checking some [Common Criteria](./Common_criteria.md)
