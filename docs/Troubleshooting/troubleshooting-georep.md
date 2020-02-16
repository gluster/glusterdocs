## Troubleshooting Geo-replication

This section describes the most common troubleshooting scenarios related
to GlusterFS Geo-replication.

### Locating Log Files

For every Geo-replication session, the following three log files are
associated to it (four, if the slave is a gluster volume):

-   **Master-log-file** - log file for the process which monitors the Master
    volume
-   **Slave-log-file** - log file for process which initiates the changes in
    slave
-   **Master-gluster-log-file** - log file for the maintenance mount point
    that Geo-replication module uses to monitor the master volume
-   **Slave-gluster-log-file** - is the slave's counterpart of it

**Master Log File**

To get the Master-log-file for geo-replication, use the following
command:

```console
gluster volume geo-replication <session> config log-file
```

For example:

```console
# gluster volume geo-replication Volume1 example.com:/data/remote_dir config log-file
```

**Slave Log File**

To get the log file for geo-replication on slave (glusterd must be
running on slave machine), use the following commands:

1.  On master, run the following command:

        # gluster volume geo-replication Volume1 example.com:/data/remote_dir config session-owner 5f6e5200-756f-11e0-a1f0-0800200c9a66

    Displays the session owner details.

2.  On slave, run the following command:

        # gluster volume geo-replication /data/remote_dir config log-file /var/log/gluster/${session-owner}:remote-mirror.log

3.  Replace the session owner details (output of Step 1) to the output
    of Step 2 to get the location of the log file.

        /var/log/gluster/5f6e5200-756f-11e0-a1f0-0800200c9a66:remote-mirror.log

### Rotating Geo-replication Logs
 
Administrators can rotate the log file of a particular master-slave
session, as needed. When you run geo-replication's ` log-rotate`
command, the log file is backed up with the current timestamp suffixed
to the file name and signal is sent to gsyncd to start logging to a new
log file.

**To rotate a geo-replication log file**

-   Rotate log file for a particular master-slave session using the
    following command:

        # gluster volume geo-replication  log-rotate

    For example, to rotate the log file of master `Volume1` and slave
    `example.com:/data/remote_dir` :

        # gluster volume geo-replication Volume1 example.com:/data/remote_dir log rotate
        log rotate successful

-   Rotate log file for all sessions for a master volume using the
    following command:

        # gluster volume geo-replication  log-rotate

    For example, to rotate the log file of master `Volume1`:

        # gluster volume geo-replication Volume1 log rotate
        log rotate successful

-   Rotate log file for all sessions using the following command:

        # gluster volume geo-replication log-rotate

    For example, to rotate the log file for all sessions:

        # gluster volume geo-replication log rotate
        log rotate successful

### Synchronization is not complete

**Description**: GlusterFS geo-replication did not synchronize the data
completely but the geo-replication status displayed is OK.

**Solution**: You can enforce a full sync of the data by erasing the
index and restarting GlusterFS geo-replication. After restarting,
GlusterFS geo-replication begins synchronizing all the data. All files
are compared using checksum, which can be a lengthy and high resource
utilization operation on large data sets.


### Issues in Data Synchronization

**Description**: Geo-replication display status as OK, but the files do
not get synced, only directories and symlink gets synced with the
following error message in the log:

```console
[2011-05-02 13:42:13.467644] E [master:288:regjob] GMaster: failed to
sync ./some\_file\`
```

**Solution**: Geo-replication invokes rsync v3.0.0 or higher on the host
and the remote machine. You must verify if you have installed the
required version.

### Geo-replication status displays Faulty very often

**Description**: Geo-replication displays status as faulty very often
with a backtrace similar to the following:

```console
2011-04-28 14:06:18.378859] E [syncdutils:131:log\_raise\_exception]
\<top\>: FAIL: Traceback (most recent call last): File
"/usr/local/libexec/glusterfs/python/syncdaemon/syncdutils.py", line
152, in twraptf(\*aa) File
"/usr/local/libexec/glusterfs/python/syncdaemon/repce.py", line 118, in
listen rid, exc, res = recv(self.inf) File
"/usr/local/libexec/glusterfs/python/syncdaemon/repce.py", line 42, in
recv return pickle.load(inf) EOFError
```

**Solution**: This error indicates that the RPC communication between
the master gsyncd module and slave gsyncd module is broken and this can
happen for various reasons. Check if it satisfies all the following
pre-requisites:

-   Password-less SSH is set up properly between the host and the remote
    machine.
-   If FUSE is installed in the machine, because geo-replication module
    mounts the GlusterFS volume using FUSE to sync data.
-   If the **Slave** is a volume, check if that volume is started.
-   If the Slave is a plain directory, verify if the directory has been
    created already with the required permissions.
-   If GlusterFS 3.2 or higher is not installed in the default location
    (in Master) and has been prefixed to be installed in a custom
    location, configure the `gluster-command` for it to point to the
    exact location.
-   If GlusterFS 3.2 or higher is not installed in the default location
    (in slave) and has been prefixed to be installed in a custom
    location, configure the `remote-gsyncd-command` for it to point to
    the exact place where gsyncd is located.

### Intermediate Master goes to Faulty State

**Description**: In a cascading set-up, the intermediate master goes to
faulty state with the following log:

```console
raise RuntimeError ("aborting on uuid change from %s to %s" % \\
RuntimeError: aborting on uuid change from af07e07c-427f-4586-ab9f-
4bf7d299be81 to de6b5040-8f4e-4575-8831-c4f55bd41154
```

**Solution**: In a cascading set-up the Intermediate master is loyal to
the original primary master. The above log means that the
geo-replication module has detected change in primary master. If this is
the desired behavior, delete the config option volume-id in the session
initiated from the intermediate master.
