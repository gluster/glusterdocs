# Geo-Replication

## Introduction

Geo-replication provides a continuous, asynchronous, and incremental
replication service from one site to another over Local Area Networks
(LANs), Wide Area Network (WANs), and across the Internet.

## Prerequisites

* Primary and Secondary Volumes should be Gluster Volumes.
* Primary and Secondary clusters should have the same GlusterFS version.

## Replicated Volumes vs Geo-replication

The following table lists the difference between replicated volumes
and Geo-replication:

  Replicated Volumes | Geo-replication
  --- | ---
  Mirrors data across clusters | Mirrors data across geographically distributed clusters
  Provides high-availability | Ensures backing up of data for disaster recovery
  Synchronous replication (each and every file operation is sent across all the bricks) | Asynchronous replication (checks for the changes in files periodically and syncs them on detecting differences)

## Exploring Geo-replication Deployment Scenarios

Geo-replication provides an incremental replication service over Local
Area Networks (LANs), Wide Area Network (WANs), and across the
Internet.

This section illustrates the most common deployment scenarios for
Geo-replication, including the following:

### Geo-replication over Local Area Network(LAN)

![geo-rep_lan](https://cloud.githubusercontent.com/assets/10970993/7412281/a542e724-ef5e-11e4-8207-9e018c1e9304.png)

### Geo-replication over Wide Area Network(WAN)

![geo-rep_wan](https://cloud.githubusercontent.com/assets/10970993/7412292/c3816f76-ef5e-11e4-8daa-271f6efa1f58.png)

### Geo-replication over Internet

![geo-rep03_internet](https://cloud.githubusercontent.com/assets/10970993/7412305/d8660050-ef5e-11e4-9d1b-54369fb1e43f.png)

### Mirror data in a cascading fashion across multiple sites(Multi-site cascading Geo-replication)
![geo-rep04_cascading](https://cloud.githubusercontent.com/assets/10970993/7412320/05e131bc-ef5f-11e4-8580-a4dc592148ff.png)

## Secondary User setup

Setup an unprivileged user in Secondary nodes to secure the SSH
connectivity to those nodes. The unprivileged Secondary user uses the
mountbroker service of glusterd to set up an auxiliary gluster mount
for the user in a special environment, which ensures that the user is
only allowed to access with special parameters that provide
administrative level access to the particular Volume.

In all the Secondary nodes, create a new group as "geogroup".

```
# sudo groupadd geogroup
```

In all the Secondary nodes, create an unprivileged account. For example,
"geoaccount". Add geoaccount as a member of "geogroup" group.

```
# useradd -G geogroup geoaccount
```

In any one Secondary node, run the following command to setup the
mountbroker root directory and group.

```
gluster-mountbroker setup <MOUNT ROOT> <GROUP>
```

For example,

```
# gluster-mountbroker setup /var/mountbroker-root geogroup
```

In any one of Secondary node, Run the following commands to add Volume and
user to mountbroker service.

```
gluster-mountbroker add <VOLUME> <USER>
```

For example,

```
# gluster-mountbroker add gvol-secondary geoaccount
```

(**Note**: To remove a user, use `gluster-mountbroker remove` command)

Check the status of setup using,

```
# gluster-mountbroker status
```

Restart `glusterd` service on all Secondary nodes.

## Setting Up the Environment for Geo-replication

### Time Synchronization

On bricks of a geo-replication Primary volume, all the servers' time
must be uniform. You are recommended to set up NTP (Network Time
Protocol) or similar service to keep the bricks sync in time and avoid
the out-of-time sync effect.

For example: In a Replicated volume where brick1 of the Primary is at
12.20 hrs, and brick 2 of the Primary is at 12.10 hrs with 10 minutes
time lag, all the changes in brick2 between this period may go
unnoticed during synchronization of files with Secondary.

### Password-less SSH

Password-less login has to be set up between the host machine (where
geo-replication Create command will be issued) and one of the Secondary
node for the unprivileged account created above.

**Note**: This is required to run Create command. This can be disabled
once the session is established.(Required again while running create
force)

On one of the Primary node where geo-replication Create command will be
issued, run the following command to generate the SSH key(Press Enter
twice to avoid passphrase).

```
# ssh-keygen
```

Run the following command on the same node to one Secondary node which is
identified as the main Secondary node.

```
# ssh-copy-id geoaccount@snode1.example.com
```

### Creating secret pem pub file

Execute the below command from the node where you setup the
password-less ssh to Secondary. This will generate Geo-rep session
specific ssh-keys in all Primary peer nodes and collect public keys
from all peer nodes to the command initiated node.

```console
# gluster-georep-sshkey generate
```

This command adds extra prefix inside common_secret.pem.pub file to
each pub keys to prevent running extra commands using this key, to
disable that prefix,

```console
# gluster-georep-sshkey generate --no-prefix
```

## Creating the session

Create a geo-rep session between Primary and Secondary volume using the
following command. The node in which this command is executed and the
<Secondary_host> specified in the command should have password less ssh
setup between them. The push-pem option actually uses the secret pem
pub file created earlier and establishes geo-rep specific password
less ssh between each node in Primary to each node of Secondary.

```console
gluster volume geo-replication <primary_volume> \
    <secondary_user>@<secondary_host>::<secondary_volume> \
    create [ssh-port <port>] push-pem|no-verify [force]
```

For example,

```console
# gluster volume geo-replication gvol-primary \
    geoaccount@snode1.example.com::gvol-secondary \
    create push-pem
```

If custom SSH port is configured in Secondary nodes then,

```console
# gluster volume geo-replication gvol-primary  \
    geoaccount@snode1.example.com::gvol-secondary \
    create ssh-port 50022 push-pem
```

If the total available size in Secondary volume is less than the total
size of Primary, the command will throw error message. In such cases
'force' option can be used.

In use cases where the rsa-keys of nodes in Primary volume is
distributed to Secondary nodes through an external agent and following
Secondary side verifications are taken care of by the external agent, then

- if ssh port 22 or custom port is open in Secondary
- has proper passwordless ssh login setup
- Secondary volume is created and is empty
- if Secondary has enough memory

Then use following command to create Geo-rep session with `no-verify`
option.

```console
gluster volume geo-replication <primary_volume> \
    <secondary_user>@<secondary_host>::<secondary_volume> create no-verify [force]
```

For example,

```console
# gluster volume geo-replication gvol-primary  \
    geoaccount@snode1.example.com::gvol-secondary \
    create no-verify
```

In this case the Primary node rsa-key distribution to Secondary node does
not happen and above mentioned Secondary verification is not performed and
these two things has to be taken care externaly.

## Post Creation steps

Run the following command as root in any one of Secondary node.

```console
/usr/libexec/glusterfs/set_geo_rep_pem_keys.sh <secondary_user> \
    <primary_volume> <secondary_volume>
```

For example,

```
# /usr/libexec/glusterfs/set_geo_rep_pem_keys.sh geoaccount \
    gvol-primary gvol-secondary
```


## Configuration

Configuration can be changed anytime after creating the session. After
successful configuration change, Geo-rep session will be automatically
restarted.

To view all configured options of a session,

```console
gluster volume geo-replication <primary_volume> \
    <secondary_user>@<secondary_host>::<secondary_volume> config [option]
```

For Example,

```console
# gluster volume geo-replication gvol-primary  \
    geoaccount@snode1.example.com::gvol-secondary \
    config

# gluster volume geo-replication gvol-primary  \
    geoaccount@snode1.example.com::gvol-secondary \
    config sync-jobs
```

To configure Gluster Geo-replication, use the following command at the
Gluster command line

```console
gluster volume geo-replication <primary_volume> \
   <secondary_user>@<secondary_host>::<secondary_volume> config [option]
```

For example:

```console
# gluster volume geo-replication gvol-primary  \
    geoaccount@snode1.example.com::gvol-secondary \
    config sync-jobs 3
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
gluster volume geo-replication <primary_volume> \
    <secondary_user>@<secondary_host>::<secondary_volume> config
    use-meta-volume true
```

> **Note**: Meta Volume is shared replica 3 Gluster Volume. The name
> of the meta-volume should be `gluster_shared_storage` and should be
> mounted at `/var/run/gluster/shared_storage/`.

The following table provides an overview of the configurable options
for a geo-replication setting:

  Option                          | Description
  ---                             | ---
  log-level LOGFILELEVEL          | The log level for geo-replication.
  gluster-log-level LOGFILELEVEL  | The log level for glusterfs processes.
  changelog-log-level LOGFILELEVEL| The log level for Changelog processes.
  ssh-command COMMAND             | The SSH command to connect to the remote machine (the default is ssh). If ssh is installed in custom location, that path can be configured. For ex `/usr/local/sbin/ssh`
  rsync-command COMMAND           | The rsync command to use for synchronizing the files (the default is rsync).
  use-tarssh true                 | The use-tarssh command allows tar over Secure Shell protocol. Use this option to handle workloads of files that have not undergone edits.
  timeout SECONDS                 | The timeout period in seconds.
  sync-jobs N                     | The number of simultaneous files/directories that can be synchronized.
  ignore-deletes                  | If this option is set to 1, a file deleted on the primary will not trigger a delete operation on the secondary. As a result, the secondary will remain as a superset of the primary and can be used to recover the primary in the event of a crash and/or accidental delete.

## Starting Geo-replication

Use the following command to start geo-replication session,

```console
gluster volume geo-replication <primary_volume>  \
    <secondary_user>@<secondary_host>::<secondary_volume> \
    start [force]
```

For example,

```console
# gluster volume geo-replication gvol-primary  \
    geoaccount@snode1.example.com::gvol-secondary \
    start
```

> **Note**
>
> You may need to configure the session before starting Gluster
> Geo-replication.

## Stopping Geo-replication

Use the following command to stop geo-replication sesion,

```console
gluster volume geo-replication <primary_volume>  \
    <secondary_user>@<secondary_host>::<secondary_volume> \
    stop [force]
```

For example,

```console
# gluster volume geo-replication gvol-primary  \
    geoaccount@snode1.example.com::gvol-secondary \
    stop
```

## Status
To check the status of all Geo-replication sessions in the Cluster

```console
# gluster volume geo-replication status
```

To check the status of one session,

```console
gluster volume geo-replication <primary_volume> \
    <secondary_user>@<secondary_host>::<secondary_volume> status [detail]
```

Example,

```console
# gluster volume geo-replication gvol-primary \
    geoaccount@snode1::gvol-secondary status

# gluster volume geo-replication gvol-primary \
    geoaccount@snode1::gvol-secondary status detail
```

Example Status Output

```console
PRIMARY NODE    PRIMARY VOL          PRIMARY BRICK    SECONDARY USER    SECONDARY         SECONDARY NODE    STATUS    CRAWL STATUS       LAST_SYNCED
---------------------------------------------------------------------------------------------------------------------------------------------------------
mnode1         gvol-primary           /bricks/b1      root          snode1::gvol-secondary  snode1        Active    Changelog Crawl    2016-10-12 23:07:13
mnode2         gvol-primary           /bricks/b2      root          snode1::gvol-secondary  snode2        Active    Changelog Crawl    2016-10-12 23:07:13
```

Example Status detail Output

```console
PRIMARY NODE    PRIMARY VOL    PRIMARY BRICK    SECONDARY USER    SECONDARY        SECONDARY NODE    STATUS    CRAWL STATUS       LAST_SYNCED            ENTRY    DATA    META    FAILURES    CHECKPOINT TIME    CHECKPOINT COMPLETED    CHECKPOINT COMPLETION TIME
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
mnode1         gvol-primary           /bricks/b1      root          snode1::gvol-secondary  snode1        Active    Changelog Crawl    2016-10-12 23:07:13    0        0       0       0           N/A                N/A                     N/A
mnode2         gvol-primary           /bricks/b2      root          snode1::gvol-secondary  snode2        Active    Changelog Crawl    2016-10-12 23:07:13    0        0       0       0           N/A                N/A                     N/A
```

The `STATUS` of the session could be one of the following,

- **Initializing**: This is the initial phase of the Geo-replication
  session; it remains in this state for a minute in order to make
  sure no abnormalities are present.

- **Created**: The geo-replication session is created, but not
  started.

- **Active**: The gsync daemon in this node is active and syncing the
  data. (One worker among the replica pairs will be in Active state)

- **Passive**: A replica pair of the active node. The data
    synchronization is handled by active node. Hence, this node does
    not sync any data. If Active node goes down, Passive worker will
    become Active

- **Faulty**: The geo-replication session has experienced a problem,
    and the issue needs to be investigated further. Check log files
    for more details about the Faulty status. Log file path can be
    found using

        gluster volume geo-replication <primary_volume> \
            <secondary_user>@<secondary_host>::<secondary_volume> config log-file

- **Stopped**: The geo-replication session has stopped, but has not
  been deleted.

The `CRAWL STATUS` can be one of the following:

- **Hybrid Crawl**: The gsyncd daemon is crawling the glusterFS file
    system and generating pseudo changelog to sync data. This crawl is
    used during initial sync and if Changelogs are not available.

- **History Crawl**: gsyncd daemon syncs data by consuming Historical
  Changelogs. On every worker restart, Geo-rep uses this Crawl to
  process backlog Changelogs.

- **Changelog Crawl**: The changelog translator has produced the
    changelog and that is being consumed by gsyncd daemon to sync
    data.

The `ENTRY` denotes:
  **The number of pending entry operations** (create, mkdir, mknod, symlink, link, rename, unlink, rmdir)  per session.

The `DATA` denotes:
  **The number of pending Data operations** (write, writev, truncate, ftruncate) per session.

The `META` denotes:
  **The number of pending Meta operations** (setattr, fsetattr, setxattr, fsetxattr, removexattr, fremovexattr) per session.

The `FAILURE` denotes:
  **The number of failures per session**. On encountering failures, one can proceed to look at the log files.


## Deleting the session

Established Geo-replication session can be deleted using the following
command,

```console
gluster volume geo-replication <primary_volume> \
    <secondary_user>@<secondary_host>::<secondary_volume> delete [force]
```

For example,

```console
# gluster volume geo-replication gvol-primary \
    geoaccount@snode1.example.com::gvol-secondary delete
```

> Note: If the same session is created again then syncing will resume
> from where it was stopped before deleting the session. If the
> session to be deleted permanently then use reset-sync-time option
> with delete command. For example, `gluster volume geo-replication
> gvol-primary geoaccount@snode1::gvol-secondary delete reset-sync-time`


## Checkpoint

Using Checkpoint feature we can find the status of sync with respect
to the Checkpoint time. Checkpoint completion status shows "Yes" once
Geo-rep syncs all the data from that brick which are created or
modified before the Checkpoint Time.

Set the Checkpoint using,

```console
gluster volume geo-replication <primary_volume> \
    <secondary_user>@<secondary_host>::<secondary_volume> config checkpoint now
```

Example,

```console
# gluster volume geo-replication gvol-primary \
    geoaccount@snode1.example.com::gvol-secondary \
    config checkpoint now
```

Touch the Primary mount point to make sure Checkpoint completes even
though no I/O happening in the Volume

```console
# mount -t glusterfs <primaryhost>:<primaryvol> /mnt
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
Primary Log files are located in `/var/log/glusterfs/geo-replication`
directory in each Primary nodes. Secondary log files are located in
`/var/log/glusterfs/geo-replication-secondary` directory in Secondary nodes.

## Gluster Snapshots and Geo-replicated Volumes

Gluster snapshot of Primary and Secondary should not go out of order on
restore. So while taking snapshot take snapshot of both Primary and
Secondary Volumes.

- Pause the Geo-replication session using,

        gluster volume geo-replication <primary_volume> \
            <secondary_user>@<secondary_host>::<secondary_volume> pause

- Take Gluster Snapshot of Secondary Volume and Primary Volume(Use same
  name for snapshots)

        gluster snapshot create <snapname> <volname>

    Example,

        # gluster snapshot create snap1 gvol-secondary
        # gluster snapshot create snap1 gvol-primary

- Resume Geo-replication session using,

        gluster volume geo-replication <primary_volume> \
            <secondary_user>@<secondary_host>::<secondary_volume> resume

If we want to continue Geo-rep session after snapshot restore, we need
to restore both Primary and Secondary Volume and resume the Geo-replication
session using force option

```console
gluster snapshot restore <snapname>
gluster volume geo-replication <primary_volume> \
    <secondary_user>@<secondary_host>::<secondary_volume> resume force
```

Example,

```console
# gluster snapshot restore snap1 # Secondary Snap
# gluster snapshot restore snap1 # Primary Snap
# gluster volume geo-replication gvol-primary geoaccount@snode1::gvol-secondary \
    resume force
```
