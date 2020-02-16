# Geo Replication
## Introduction

Geo-replication provides a continuous, asynchronous, and incremental
replication service from one site to another over Local Area Networks
(LANs), Wide Area Network (WANs), and across the Internet.

Geo-replication uses a master–slave model, whereby replication and
mirroring occurs between the following partners:

- **Master** – a GlusterFS volume

- **Slave** – a GlusterFS volume

- **Session** - Unique identifier of Geo-replication session `<MASTER_VOL> [<SLAVE_USER>@]<PRIMARY_SLAVE_HOST>::<SLAVE_VOL>`

```text
Where,

MASTER_VOL - Master Volume Name
SLAVE_USER - Slave user used to establish the session, Default is root
PRIMARY_SLAVE_HOST - Any one Slave node to which password-less
    SSH is setup to establish session
SLAVE_VOL - Slave Volume Name
```
    
## Replicated Volumes vs Geo-replication

The following table lists the difference between replicated volumes and
geo-replication:

  Replicated Volumes | Geo-replication
  --- | ---
  Mirrors data across clusters | Mirrors data across geographically distributed clusters
  Provides high-availability | Ensures backing up of data for disaster recovery
  Synchronous replication (each and every file operation is sent across all the bricks) | Asynchronous replication (checks for the changes in files periodically and syncs them on detecting differences)

## Exploring Geo-replication Deployment Scenarios

Geo-replication provides an incremental replication service over Local
Area Networks (LANs), Wide Area Network (WANs), and across the Internet.
This section illustrates the most common deployment scenarios for
Geo-replication, including the following:

-   Geo-replication over LAN
-   Geo-replication over WAN
-   Geo-replication over the Internet
-   Multi-site cascading Geo-replication

**Geo-replication over LAN**

You can configure Geo-replication to mirror data over a Local Area
Network.

![geo-rep_lan](https://cloud.githubusercontent.com/assets/10970993/7412281/a542e724-ef5e-11e4-8207-9e018c1e9304.png)

**Geo-replication over WAN**

You can configure Geo-replication to replicate data over a Wide Area
Network.

![geo-rep_wan](https://cloud.githubusercontent.com/assets/10970993/7412292/c3816f76-ef5e-11e4-8daa-271f6efa1f58.png)

**Geo-replication over Internet**

You can configure Geo-replication to mirror data over the Internet.

![geo-rep03_internet](https://cloud.githubusercontent.com/assets/10970993/7412305/d8660050-ef5e-11e4-9d1b-54369fb1e43f.png)

**Multi-site cascading Geo-replication**

You can configure Geo-replication to mirror data in a cascading fashion
across multiple sites.

![geo-rep04_cascading](https://cloud.githubusercontent.com/assets/10970993/7412320/05e131bc-ef5f-11e4-8580-a4dc592148ff.png)

##Checking Geo-replication Minimum Requirements

Before deploying GlusterFS Geo-replication, verify that your systems
match the minimum requirements.

The following table outlines the minimum requirements for both master
and slave nodes within your environment:

  Component                | Master                           | Slave
  ---                      | ---                              | ---
  Operating System         | GNU/Linux                        | GNU/Linux
  Filesystem               | GlusterFS 3.6 or higher          | GlusterFS 3.6 or higher
  Python                   | Python 2.6 (or higher)           | Python 2.6 (or higher)
  Secure shell             | OpenSSH version 4.0 (or higher)  | SSH2-compliant daemon
  Remote synchronization   | rsync 3.0.7 or higher            | rsync 3.0.7 or higher
  FUSE                     | GlusterFS supported versions     | GlusterFS supported versions

## Slave User setup
Geo-replication supports both root and non-root users at Slave
side. If Slave user is root, then skip this section.

A request from the user, the unprivileged slave user use the
mountbroker service of glusterd to set up an auxiliary gluster mount for
the user in a special environment which ensures that the user is only
allowed to access with special parameters that provide administrative
level access to the particular volume.

Following steps to be performed to setup Non root Slave user

***New in 3.9***

1. In all Slave nodes, create a new group. For example, `geogroup`.

2. In all Slave nodes, create a unprivileged account. For example, ` geoaccount`. Make it a
    member of `geogroup`.

3. In any one Slave node, run the following command to setup
    mountbroker root directory and group.

        gluster-mountbroker setup <MOUNT ROOT> <GROUP>

    For example,

        # gluster-mountbroker setup /var/mountbroker-root geogroup

4. In any one of Slave node, Run the following commands to add Volume
   and user to mountbroker service.

        gluster-mountbroker add <VOLUME> <USER>

    For example,

        # gluster-mountbroker add slavevol geoaccount

    Remove user or Volume using,

        gluster-mountbroker remove [--volume <VOLUME>] [--user <USER>]

    Example,

        # gluster-mountbroker remove --volume slavevol --user geoaccount
        # gluster-mountbroker remove --user geoaccount
        # gluster-mountbroker remove --volume slavevol

    Check the status of setup using,

        # gluster-mountbroker status

5.  Restart `glusterd` service on all Slave nodes.

***Version 3.8 and below***

1.  In all Slave nodes, create a new group. For example, `geogroup`.

2.  In all Slave nodes, create a unprivileged account. For example, ` geoaccount`. Make it a
    member of ` geogroup`.

3.  In all Slave nodes, Create a new directory owned by root and with permissions *0711.*
    For example, create a create mountbroker-root directory
    `/var/mountbroker-root`.

4.  In any one of Slave node, Run the following commands to add options to glusterd vol
file(`/etc/glusterfs/glusterd.vol`)
    in rpm installations and `/usr/local/etc/glusterfs/glusterd.vol` in Source installation.

        # gluster system:: execute mountbroker opt mountbroker-root /var/mountbroker-root
        # gluster system:: execute mountbroker opt geo-replication-log-group geogroup
        # gluster system:: execute mountbroker opt rpc-auth-allow-insecure on

5.  In any one of the Slave node, Add Mountbroker user to glusterd vol file using,

        # gluster system:: execute mountbroker user geoaccount slavevol

    where slavevol is the Slave Volume name

    If you host multiple slave volumes on Slave, for each of them and add the following options to the volfile using,

        # gluster system:: execute mountbroker user geoaccount2 slavevol2
        # gluster system:: execute mountbroker user geoaccount3 slavevol3

    To add multiple volumes per mountbroker user,

        # gluster system:: execute mountbroker user geoaccount1 slavevol11,slavevol12,slavevol13
        # gluster system:: execute mountbroker user geoaccount2 slavevol21,slavevol22
        # gluster system:: execute mountbroker user geoaccount3 slavevol31

6.  Restart `glusterd` service on all Slave nodes.

## Setting Up the Environment for Geo-replication

**Time Synchronization**

-   On bricks of a geo-replication master volume, all the servers' time
    must be uniform. You are recommended to set up NTP (Network Time
    Protocol) service to keep the bricks sync in time and avoid
    out-of-time sync effect.

    For example: In a Replicated volume where brick1 of the master is at
    12.20 hrs and brick 2 of the master is at 12.10 hrs with 10 minutes
    time lag, all the changes in brick2 between this period may go
    unnoticed during synchronization of files with Slave.

**Password-less SSH**
Password-less login has to be set up between the host machine (where
geo-replication Create command will be issued) and one of the Slave node

**Note**: This is required to run Create command. This can be disabled
once session is established.(Required again while running create force)

1.  On one of the Master node where geo-replication Create command
    will be issued, run the following command to generate the SSH key.

        # ssh-keygen

    Press Enter twice to avoid passphrase.

2.  Run the following command on the same node to one Slave node which
    is identified as primary Slave

        ssh-copy-id <SLAVE_USER>@<SLAVE_HOST>

**Creating secret pem pub file**

Execute the below command from the node where you setup the
password-less ssh to slave. This will generate Geo-rep session
specific ssh-keys in all Master peer nodes and collect public keys
from all peer nodes to the command initiated node.

***New in 3.9***

```console
# gluster-georep-sshkey generate
```

This command adds extra prefix inside common_secret.pem.pub file to
each pub keys to prevent running extra commands using this key, to
disable that prefix,

```console
# gluster-georep-sshkey generate --no-prefix
```

***Version 3.8 and below***

```console
# gluster system:: execute gsec_create
```

This command adds extra prefix inside common_secret.pem.pub file to
each pub keys to prevent running extra commands using this key, to
disable that prefix,

```console
# gluster system:: execute gsec_create container
```

## Creating the session
Create a geo-rep session between master and slave volume using the
following command. The node in which this command is executed and the
<slave_host> specified in the command should have password less ssh
setup between them. The push-pem option actually uses the secret pem
pub file created earlier and establishes geo-rep specific password
less ssh between each node in master to each node of slave.

```console
gluster volume geo-replication <master_volume> \
    [<slave_user>@]<slave_host>::<slave_volume> \
    create [ssh-port <port>] push-pem|no-verify [force]
```

For example(Root user in Slave)

```console
# gluster volume geo-replication gv1 snode1::gv2 create push-pem
```

Non Root user,

```console
# gluster volume geo-replication gv1 geoaccount@snode1::gv2 create push-pem
```

If custom SSH port is configured in Slave nodes then,

```console
# gluster volume geo-replication gv1 snode1::gv2 create ssh-port 50022 push-pem
```

If the total available size in slave volume is less than the total
size of master, the command will throw error message. In such cases
'force' option can be used.

In use cases where the rsa-keys of nodes in master volume is
distributed to slave nodes through an external agent and following
slave side verifications are taken care of by the external agent, then

- if ssh port 22 or custom port is open in slave
- has proper passwordless ssh login setup
- slave volume is created and is empty
- if slave has enough memory

Then use following command to create Geo-rep session with `no-verify`
option.

```console
gluster volume geo-replication <master_volume> \
    [<slave_user>@]<slave_host>::<slave_volume> create no-verify [force]
```

For example,

```console
# gluster volume geo-replication gv1 snode1::gv2 create no-verify
```

In this case the master node rsa-key distribution to slave node does
not happen and above mentioned slave verification is not performed and
these two things has to be taken care externaly.

## Post Creation steps
In case of non root user, run the following command as root in any one
of Slave node.

```console
/usr/libexec/glusterfs/set_geo_rep_pem_keys.sh <slave_user> \
    <master_volume> <slave_volume>
```

## Configuration
Configuration can be changed anytime after creating the session. After
successful configuration change, Geo-rep session will be automatically
restarted.

To view all configured options of a session,

```console
gluster volume geo-replication <master_volume> \
    [<slave_user>@]<slave_host>::<slave_volume> config [option]
```

For Example,

```console
# gluster volume geo-replication gv1 snode1::gv2 config
# gluster volume geo-replication gv1 snode1::gv2 config sync-jobs
```

To configure Gluster Geo-replication, use the following command at the
Gluster command line

```console
gluster volume geo-replication <master_volume> \
   [<slave_user>@]<slave_host>::<slave_volume> config [option]
```

For example:

```console
# gluster volume geo-replication gv1 snode1::gv2 config sync-jobs 3
```

> **Note**: If Geo-rep is in between sync, restart due to configuration
>  change may cause resyncing a few entries which are already synced.

## Configurable Options

**Meta Volume**

In case of Replica bricks, one brick worker will be Active and
participate in syncing and others will be waiting as Passive. By
default Geo-rep uses `node-uuid`, if `node-uuid` of worker present in
first up subvolume node ids list then that worker will become
Active. With this method, multiple workers of same replica becomes
Active if multiple bricks used from same machine.

To prevent this, Meta Volume(Extra Gluster Volume) can be used in
Geo-rep. With this method, Each worker will try to acquire lock on a
file inside meta volume. Lock file name pattern will be different for
each sub volume. If a worker acquire lock, then it will become Active
else remain as Passive.

```console
gluster volume geo-replication <master_volume> \
    [<slave_user>@]<slave_host>::<slave_volume> config
    use-meta-volume true
```

> **Note**: Meta Volume is shared replica 3 Gluster Volume. The name
> of the meta-volume should be `gluster_shared_storage` and should be
> mounted at `/var/run/gluster/shared_storage/`.

The following table provides an overview of the configurable options for a geo-replication setting:

  Option                          | Description
  ---                             | ---
  log-level LOGFILELEVEL 	      | The log level for geo-replication.
  gluster-log-level LOGFILELEVEL  | The log level for glusterfs processes.
  changelog-log-level LOGFILELEVEL| The log level for Changelog processes.
  ssh-command COMMAND 	          | The SSH command to connect to the remote machine (the default is ssh). If ssh is installed in custom location, that path can be configured. For ex `/usr/local/sbin/ssh`
  rsync-command COMMAND 	      | The rsync command to use for synchronizing the files (the default is rsync).
  use-tarssh true 	              | The use-tarssh command allows tar over Secure Shell protocol. Use this option to handle workloads of files that have not undergone edits.
  timeout SECONDS 	              | The timeout period in seconds.
  sync-jobs N 	                  | The number of simultaneous files/directories that can be synchronized.
  ignore-deletes 	              | If this option is set to 1, a file deleted on the master will not trigger a delete operation on the slave. As a result, the slave will remain as a superset of the master and can be used to recover the master in the event of a crash and/or accidental delete.

## Starting Geo-replication

Use the following command to start geo-replication session,

```console
gluster volume geo-replication <master_volume> \
    [<slave_user>@]<slave_host>::<slave_volume> start [force]
```

For example,

```console
# gluster volume geo-replication gv1 snode1::gv2 start
# gluster volume geo-replication gv1 geoaccount@snode1::gv2 start
```

> **Note**
>
> You may need to configure the session before starting Gluster
> Geo-replication.

## Stopping Geo-replication

Use the following command to stop geo-replication sesion,

```console
gluster volume geo-replication <master_volume> \
    [<slave_user>@]<slave_host>::<slave_volume> stop [force]
```

For example,

```console
# gluster volume geo-replication gv1 snode1::gv2 stop
# gluster volume geo-replication gv1 geoaccount@snode1::gv2 stop
```

## Status
To check the status of all Geo-replication sessions in the Cluster

```console
# gluster volume geo-replication status
```

To check the status of one session,

```console
gluster volume geo-replication <master_volume> \
    [<slave_user>@]<slave_host>::<slave_volume> status [detail]
```

Example,

```console
# gluster volume geo-replication gv1 snode1::gv2 status
# gluster volume geo-replication gv1 snode1::gv2 status detail
# gluster volume geo-replication gv1 geoaccount@snode1::gv2 status
# gluster volume geo-replication gv1 geoaccount@snode1::gv2 status detail
```

Example Status Output

```console
MASTER NODE    MASTER VOL    MASTER BRICK    SLAVE USER    SLAVE        SLAVE NODE    STATUS    CRAWL STATUS       LAST_SYNCED
-------------------------------------------------------------------------------------------------------------------------------------
mnode1         gv1           /bricks/b1      root          snode1::gv2  snode1        Active    Changelog Crawl    2016-10-12 23:07:13
mnode2         gv1           /bricks/b2      root          snode1::gv2  snode2        Active    Changelog Crawl    2016-10-12 23:07:13
```

Example Status detail Output

```console
MASTER NODE    MASTER VOL    MASTER BRICK    SLAVE USER    SLAVE        SLAVE NODE    STATUS    CRAWL STATUS       LAST_SYNCED            ENTRY    DATA    META    FAILURES    CHECKPOINT TIME    CHECKPOINT COMPLETED    CHECKPOINT COMPLETION TIME
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
mnode1         gv1           /bricks/b1      root          snode1::gv2  snode1        Active    Changelog Crawl    2016-10-12 23:07:13    0        0       0       0           N/A                N/A                     N/A
mnode2         gv1           /bricks/b2      root          snode1::gv2  snode2        Active    Changelog Crawl    2016-10-12 23:07:13    0        0       0       0           N/A                N/A                     N/A
```

The `STATUS` of the session could be one of the following,

- **Initializing**: This is the initial phase of the Geo-replication session;
    it remains in this state for a minute in order to make sure no abnormalities are present.

- **Created**: The geo-replication session is created, but not started.

- **Active**: The gsync daemon in this node is active and syncing the data. (One worker among the replica pairs will be in Active state)

- **Passive**: A replica pair of the active node. The data synchronization is handled by active node.
    Hence, this node does not sync any data. If Active node goes down, Passive worker will become Active

- **Faulty**: The geo-replication session has experienced a problem, and the issue needs to be
    investigated further. Check log files for more details about the
    Faulty status. Log file path can be found using

        gluster volume geo-replication <master_volume> [<slave_user>@]<slave_host>::<slave_volume> config log-file

- **Stopped**: The geo-replication session has stopped, but has not been deleted.

The `CRAWL STATUS` can be one of the following:

- **Hybrid Crawl**: The gsyncd daemon is crawling the glusterFS file system and generating pseudo
    changelog to sync data. This crawl is used during initial sync and
    if Changelogs are not available.

- **History Crawl**: gsyncd daemon syncs data by consuming Historical
  Changelogs. On every worker restart, Geo-rep uses this Crawl to
  process backlog Changelogs.

- **Changelog Crawl**: The changelog translator has produced the changelog and that is being consumed
    by gsyncd daemon to sync data.

## Deleting the session
Established Geo-replication session can be deleted using the following
command,

```console
gluster volume geo-replication <master_volume> \
    [<slave_user>@]<slave_host>::<slave_volume> delete [force]
```

For example,

```console
# gluster volume geo-replication gv1 snode1::gv2 delete
```

> Note: If the same session is created again then syncing will resume
> from where it was stopped before deleting the session. If the
> session to be deleted permanently then use reset-sync-time option
> with delete command. For example, `gluster volume geo-replication
> gv1 snode1::gv2 delete reset-sync-time`


## Checkpoint
Using Checkpoint feature we can find the status of sync with respect
to the Checkpoint time. Checkpoint completion status shows "Yes" once
Geo-rep syncs all the data from that brick which are created or
modified before the Checkpoint Time.

Set the Checkpoint using,

```console
gluster volume geo-replication <master_volume> \
    [<slave_user>@]<slave_host>::<slave_volume> config checkpoint now
```

Example,

```console
# gluster volume geo-replication gv1 snode1::gv2 config checkpoint now
```

Touch the Master mount point to make sure Checkpoint completes even
though no I/O happening in the Volume

```console
# mount -t glusterfs <masterhost>:<mastervol> /mnt
# touch /mnt
```

Checkpoint status can be checked using Geo-rep status
command. Following columns in status output gives more information
about Checkpoint

- **CHECKPOINT TIME**: Checkpoint Set Time
- **CHECKPOINT COMPLETED**: Yes/No/NA, Status of Checkpoint
- **CHECKPOINT COMPLETION TIME**: Checkpoint Completion Time if
  completed, else N/A

## Log Files
Master Log files are located in `/var/log/glusterfs/geo-replication`
directory in each master nodes. Slave log files are located in
`/var/log/glusterfs/geo-replication-slaves` directory in Slave nodes.

## Gluster Snapshots and Geo-replicated Volumes

Gluster snapshot of Master and Slave should not go out of order on
restore. So while taking snapshot take snapshot of both Master and
slave Volumes.

- Pause the Geo-replication session using,

        gluster volume geo-replication <master_volume> \
            [<slave_user>@]<slave_host>::<slave_volume> pause

- Take Gluster Snapshot of Slave Volume and Master Volume(Use same
  name for snapshots)

        gluster snapshot create <snapname> <volname>

    Example,

        # gluster snapshot create snap1 gv2
        # gluster snapshot create snap1 gv1

- Resume Geo-replication session using,

        gluster volume geo-replication <master_volume> \
            [<slave_user>@]<slave_host>::<slave_volume> resume

If we want to continue Geo-rep session after snapshot restore, we need
to restore both Master and Slave Volume and resume the Geo-replication
session using force option

```console
gluster snapshot restore <snapname>
gluster volume geo-replication <master_volume> \
    [<slave_user>@]<slave_host>::<slave_volume> resume force
```

Example,

```console
# gluster snapshot restore snap1 # Slave Snap
# gluster snapshot restore snap1 # Master Snap
# gluster volume geo-replication gv1 snode1::gv2 resume force
```
