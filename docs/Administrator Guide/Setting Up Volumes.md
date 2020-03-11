# Setting up GlusterFS Volumes

A volume is a logical collection of bricks where each brick is an export
directory on a server in the trusted storage pool.
To create a new volume in your storage environment, specify the bricks
that comprise the volume. After you have created a new volume, you must
start it before attempting to mount it.


See [Setting up Storage](./setting-up-storage.md) for how to set up bricks.


## Volume Types

-   Volumes of the following types can be created in your storage
    environment:

    -   **[Distributed](#creating-distributed-volumes)** - Distributed volumes
        distribute files across the bricks in the volume. You can use distributed
        volumes where the requirement is to scale storage and the redundancy is
        either not important or is provided by other hardware/software layers.

    -   **[Replicated](#creating-replicated-volumes)** – Replicated volumes replicate
        files across bricks in the volume. You can use replicated volumes in
        environments where high-availability and high-reliability are critical.

    -   **[Distributed Replicated](#creating-distributed-replicated-volumes)** -
        Distributed replicated volumes distribute files across replicated bricks in the
        volume. You can use distributed replicated volumes in environments where the
        requirement is to scale storage and high-reliability is critical. Distributed
        replicated volumes also offer improved read performance in most environments.

    -   **[Dispersed](#creating-dispersed-volumes)** - Dispersed volumes are based on
        erasure codes, providing space-efficient protection against disk or server
        failures. It stores an encoded fragment of the original file to each brick in a
        way that only a subset of the fragments is needed to recover the original file.
        The number of bricks that can be missing without losing access to data is
        configured by the administrator on volume creation time.

    -   **[Distributed Dispersed](#creating-distributed-dispersed-volumes)** -
        Distributed dispersed volumes distribute files across dispersed subvolumes. This
        has the same advantages of distribute replicate volumes, but using disperse to
        store the data into the bricks.

**To create a new volume**

-   Create a new volume :

    `# gluster volume create [stripe | replica | disperse] [transport tcp | rdma | tcp,rdma] `

    For example, to create a volume called test-volume consisting of
    server3:/exp3 and server4:/exp4:

        # gluster volume create test-volume server3:/exp3 server4:/exp4
        Creation of test-volume has been successful
        Please start the volume to access data.

## Creating Distributed Volumes

In a distributed volume files are spread randomly across the bricks in
the volume. Use distributed volumes where you need to scale storage and
redundancy is either not important or is provided by other
hardware/software layers.

> **Note**:
> Disk/server failure in distributed volumes can result in a serious
> loss of data because directory contents are spread randomly across the
> bricks in the volume.

![distributed_volume](https://cloud.githubusercontent.com/assets/10970993/7412364/ac0a300c-ef5f-11e4-8599-e7d06de1165c.png)

**To create a distributed volume**

1.  Create a trusted storage pool.

2.  Create the distributed volume:

    `# gluster volume create  [transport tcp | rdma | tcp,rdma] `

    For example, to create a distributed volume with four storage
    servers using tcp:

        # gluster volume create test-volume server1:/exp1 server2:/exp2 server3:/exp3 server4:/exp4
        Creation of test-volume has been successful
        Please start the volume to access data.

    (Optional) You can display the volume information:

        # gluster volume info
        Volume Name: test-volume
        Type: Distribute
        Status: Created
        Number of Bricks: 4
        Transport-type: tcp
        Bricks:
        Brick1: server1:/exp1
        Brick2: server2:/exp2
        Brick3: server3:/exp3
        Brick4: server4:/exp4

    For example, to create a distributed volume with four storage
    servers over InfiniBand:

        # gluster volume create test-volume transport rdma server1:/exp1 server2:/exp2 server3:/exp3 server4:/exp4
        Creation of test-volume has been successful
        Please start the volume to access data.

    If the transport type is not specified, *tcp* is used as the
    default. You can also set additional options if required, such as
    auth.allow or auth.reject.

    > **Note**:
    > Make sure you start your volumes before you try to mount them or
    > else client operations after the mount will hang.

## Creating Replicated Volumes

Replicated volumes create copies of files across multiple bricks in the
volume. You can use replicated volumes in environments where
high-availability and high-reliability are critical.

> **Note**:
> The number of bricks should be equal to of the replica count for a
> replicated volume. To protect against server and disk failures, it is
> recommended that the bricks of the volume are from different servers.

![replicated_volume](https://cloud.githubusercontent.com/assets/10970993/7412379/d75272a6-ef5f-11e4-869a-c355e8505747.png)

**To create a replicated volume**

1.  Create a trusted storage pool.

2.  Create the replicated volume:

    `# gluster volume create  [replica ] [transport tcp | rdma | tcp,rdma] `

    For example, to create a replicated volume with two storage servers:

        # gluster volume create test-volume replica 2 transport tcp server1:/exp1 server2:/exp2
        Creation of test-volume has been successful
        Please start the volume to access data.

    If the transport type is not specified, *tcp* is used as the
    default. You can also set additional options if required, such as
    auth.allow or auth.reject.

    > **Note**:

    > - Make sure you start your volumes before you try to mount them or
    > else client operations after the mount will hang.

    > - GlusterFS will fail to create a replicate volume if more than one brick of a replica set is present on the same peer. For eg. a four node replicated volume where more than one brick of a replica set is present on the same peer.
    > 

    >         # gluster volume create <volname> replica 4 server1:/brick1 server1:/brick2 server2:/brick3 server4:/brick4
    >         volume create: <volname>: failed: Multiple bricks of a replicate volume are present on the same server. This setup is not optimal. Use 'force' at the end of the command if you want to override this behavior.

    >  Use the `force` option at the end of command if you still want to create the volume with this configuration.

### Arbiter configuration for replica volumes

Arbiter  volumes are replica 3 volumes where the 3rd brick acts as the arbiter brick. This configuration has mechanisms that prevent occurrence of split-brains.

It can be created with the following command:

    `# gluster volume create  <VOLNAME>  replica 3 arbiter 1 host1:brick1 host2:brick2 host3:brick3`

More information about this configuration can be found at *Features : afr-arbiter-volumes*

Note that the arbiter configuration for replica 3 can be used to create distributed-replicate volumes as well.

## Creating Distributed Replicated Volumes

Distributes files across replicated bricks in the volume. You can use
distributed replicated volumes in environments where the requirement is
to scale storage and high-reliability is critical. Distributed
replicated volumes also offer improved read performance in most
environments.

> **Note**:
> The number of bricks should be a multiple of the replica count for a
> distributed replicated volume. Also, the order in which bricks are
> specified has a great effect on data protection. Each replica\_count
> consecutive bricks in the list you give will form a replica set, with
> all replica sets combined into a volume-wide distribute set. To make
> sure that replica-set members are not placed on the same node, list
> the first brick on every server, then the second brick on every server
> in the same order, and so on.

![distributed_replicated_volume](https://cloud.githubusercontent.com/assets/10970993/7412402/23a17eae-ef60-11e4-8813-a40a2384c5c2.png)

**To create a distributed replicated volume**

1.  Create a trusted storage pool.

2.  Create the distributed replicated volume:

    `# gluster volume create  [replica ] [transport tcp | rdma | tcp,rdma] `

    For example, a four node distributed (replicated) volume with a
    two-way mirror:

        # gluster volume create test-volume replica 2 transport tcp server1:/exp1 server2:/exp2 server3:/exp3 server4:/exp4
        Creation of test-volume has been successful
        Please start the volume to access data.

    For example, to create a six node distributed (replicated) volume
    with a two-way mirror:

        # gluster volume create test-volume replica 2 transport tcp server1:/exp1 server2:/exp2 server3:/exp3 server4:/exp4 server5:/exp5 server6:/exp6
        Creation of test-volume has been successful
        Please start the volume to access data.

    If the transport type is not specified, *tcp* is used as the
    default. You can also set additional options if required, such as
    auth.allow or auth.reject.

    > **Note**:
    > - Make sure you start your volumes before you try to mount them or
    > else client operations after the mount will hang.

    > - GlusterFS will fail to create a distribute replicate volume if more than one brick of a replica set is present on the same peer. For eg. for a four node distribute (replicated) volume where more than one brick of a replica set is present on the same peer.
    > 

    >         # gluster volume create <volname> replica 2 server1:/brick1 server1:/brick2 server2:/brick3 server4:/brick4
    >         volume create: <volname>: failed: Multiple bricks of a replicate volume are present on the same server. This setup is not optimal. Use 'force' at the end of the command if you want to override this behavior.

    >  Use the `force` option at the end of command if you want to create the volume in this case.

## Creating Dispersed Volumes

Dispersed volumes are based on erasure codes. It stripes the encoded data of
files, with some redundancy added, across multiple bricks in the volume. You
can use dispersed volumes to have a configurable level of reliability with 
minimum space waste.

**Redundancy**

Each dispersed volume has a redundancy value defined when the volume is
created. This value determines how many bricks can be lost without
interrupting the operation of the volume. It also determines the amount of
usable space of the volume using this formula:

    <Usable size> = <Brick size> * (#Bricks - Redundancy)

All bricks of a disperse set should have the same capacity, otherwise, when
the smallest brick becomes full, no additional data will be allowed in the
disperse set.

It's important to note that a configuration with 3 bricks and redundancy 1
will have less usable space (66.7% of the total physical space) than a
configuration with 10 bricks and redundancy 1 (90%). However the first one
will be safer than the second one (roughly the probability of failure of
the second configuration if more than 4.5 times bigger than the first one).

For example, a dispersed volume composed of 6 bricks of 4TB and a redundancy
of 2 will be completely operational even with two bricks inaccessible. However
a third inaccessible brick will bring the volume down because it won't be
possible to read or write to it. The usable space of the volume will be equal
to 16TB.

The implementation of erasure codes in GlusterFS limits the redundancy to a
value smaller than #Bricks / 2 (or equivalently, redundancy * 2 < #Bricks).
Having a redundancy equal to half of the number of bricks would be almost
equivalent to a replica-2 volume, and probably a replicated volume will
perform better in this case.

**Optimal volumes**

One of the worst things erasure codes have in terms of performance is the
RMW (Read-Modify-Write) cycle. Erasure codes operate in blocks of a certain
size and it cannot work with smaller ones. This means that if a user issues
a write of a portion of a file that doesn't fill a full block, it needs to
read the remaining portion from the current contents of the file, merge them,
compute the updated encoded block and, finally, writing the resulting data.

This adds latency, reducing performance when this happens. Some GlusterFS
performance xlators can help to reduce or even eliminate this problem for
some workloads, but it should be taken into account when using dispersed
volumes for a specific use case.

Current implementation of dispersed volumes use blocks of a size that depends
on the number of bricks and redundancy: 512 * (#Bricks - redundancy) bytes.
This value is also known as the stripe size.

Using combinations of #Bricks/redundancy that give a power of two for the
stripe size will make the disperse volume perform better in most workloads
because it's more typical to write information in blocks that are multiple of
two (for example databases, virtual machines and many applications).

These combinations are considered *optimal*.

For example, a configuration with 6 bricks and redundancy 2 will have a stripe
size of 512 * (6 - 2) = 2048 bytes, so it's considered optimal. A configuration
with 7 bricks and redundancy 2 would have a stripe size of 2560 bytes, needing
a RMW cycle for many writes (of course this always depends on the use case).

**To create a dispersed volume**

1.  Create a trusted storage pool.

2.  Create the dispersed volume:

    `# gluster volume create [disperse [<count>]] [redundancy <count>] [transport tcp | rdma | tcp,rdma]`

    A dispersed volume can be created by specifying the number of bricks in a
    disperse set, by specifying the number of redundancy bricks, or both.

    If *disperse* is not specified, or the _&lt;count&gt;_ is missing, the
    entire volume will be treated as a single disperse set composed by all
    bricks enumerated in the command line.

    If *redundancy* is not specified, it is computed automatically to be the
    optimal value. If this value does not exist, it's assumed to be '1' and a
    warning message is shown:

        # gluster volume create test-volume disperse 4 server{1..4}:/bricks/test-volume
        There isn't an optimal redundancy value for this configuration. Do you want to create the volume with redundancy 1 ? (y/n)

    In all cases where *redundancy* is automatically computed and it's not
    equal to '1', a warning message is displayed:

        # gluster volume create test-volume disperse 6 server{1..6}:/bricks/test-volume
        The optimal redundancy for this configuration is 2. Do you want to create the volume with this value ? (y/n)

    _redundancy_ must be greater than 0, and the total number of bricks must
    be greater than 2 * _redundancy_. This means that a dispersed volume must
    have a minimum of 3 bricks.

    If the transport type is not specified, *tcp* is used as the default. You
    can also set additional options if required, like in the other volume
    types.

    > **Note**:

    > - Make sure you start your volumes before you try to mount them or
    > else client operations after the mount will hang.

    > - GlusterFS will fail to create a dispersed volume if more than one brick of a disperse set is present on the same peer.

    > 

    >         # gluster volume create <volname> disperse 3 server1:/brick{1..3}
    >         volume create: <volname>: failed: Multiple bricks of a replicate volume are present on the same server. This setup is not optimal.
    >         Do you still want to continue creating the volume? (y/n)

    >  Use the `force` option at the end of command if you want to create the volume in this case.

## Creating Distributed Dispersed Volumes

Distributed dispersed volumes are the equivalent to distributed replicated
volumes, but using dispersed subvolumes instead of replicated ones.

**To create a distributed dispersed volume**

1.  Create a trusted storage pool.

2.  Create the distributed dispersed volume:

    `# gluster volume create disperse <count> [redundancy <count>] [transport tcp | rdma | tcp,rdma]`

    To create a distributed dispersed volume, the *disperse* keyword and
    &lt;count&gt; is mandatory, and the number of bricks specified in the
    command line must must be a multiple of the disperse count.

    *redundancy* is exactly the same as in the dispersed volume.

    If the transport type is not specified, *tcp* is used as the default. You
    can also set additional options if required, like in the other volume
    types.

    > **Note**:

    > - Make sure you start your volumes before you try to mount them or
    > else client operations after the mount will hang.

    > - GlusterFS will fail to create a distributed dispersed volume if more than one brick of a disperse set is present on the same peer.

    > 

    >         # gluster volume create <volname> disperse 3 server1:/brick{1..6}
    >         volume create: <volname>: failed: Multiple bricks of a replicate volume are present on the same server. This setup is not optimal.
    >         Do you still want to continue creating the volume? (y/n)

    > Use the `force` option at the end of command if you want to create the volume in this case.

## Starting Volumes

You must start your volumes before you try to mount them.

**To start a volume**

-   Start a volume:

    `# gluster volume start `

    For example, to start test-volume:

        # gluster volume start test-volume
        Starting test-volume has been successful
