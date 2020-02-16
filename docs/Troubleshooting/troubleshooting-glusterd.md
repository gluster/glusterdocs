## Troubleshooting the gluster CLI and glusterd

The glusterd daemon runs on every trusted server node and is responsible for the management of the trusted pool and volumes.

The gluster CLI sends commands to the glusterd daemon on the local node, which executes the operation and returns the result to the user.

<br>

### Debugging glusterd

#### Logs
Start by looking at the log files for clues as to what went wrong when you hit a problem.
The default directory for Gluster logs is /var/log/glusterfs. The logs for the CLI and glusterd are:

 - glusterd    : /var/log/glusterfs/glusterd.log
 - gluster CLI : /var/log/glusterfs/cli.log


#### Statedumps
Statedumps are useful in debugging memory leaks and hangs.
See [Statedump](./statedump.md) for more details.

<br>

### Common Issues and How to Resolve Them


**"*Another transaction is in progress for volname*" or "*Locking failed on xxx.xxx.xxx.xxx"***

As Gluster is distributed by nature, glusterd takes locks when performing operations to ensure that configuration changes made to a volume are atomic across the cluster.
These errors are returned when:

* More than one transaction contends on the same lock.
> *Solution* :  These are likely to be transient errors and the operation will succeed if retried once the other transaction is complete.

* A stale lock exists on one of the nodes.
> *Solution* : Repeating the operation will not help until the stale lock is cleaned up. Restart the glusterd process holding the lock

    * Check the glusterd.log file to find out which node holds the stale lock. Look for the message:
     `lock being held by <uuid>`
    * Run `gluster peer status` to identify the node with the uuid in the log message.
    * Restart glusterd on that node.


<br>

**"_Transport endpoint is not connected_" errors but all bricks are up**

This is usually seen when a brick process does not shut down cleanly, leaving stale data behind in the glusterd process.
Gluster client processes query glusterd for the ports the bricks processes are listening on and attempt to connect to that port.
If the port information in glusterd is incorrect, the client will fail to connect to the brick even though it is up. Operations which
would need to access that brick may fail with "Transport endpoint is not connected".

*Solution* :  Restart the glusterd service.

<br>

**"Peer Rejected"**

`gluster peer status` returns "Peer Rejected" for a node.

```console
Hostname: <hostname>
Uuid: <xxxx-xxx-xxxx>
State: Peer Rejected (Connected)
```

This indicates that the volume configuration on the node is not in sync with the rest of the trusted storage pool. 
You should see the following message in the glusterd log for the node on which the peer status command was run:

```console
Version of Cksums <vol-name> differ. local cksum = xxxxxx, remote cksum = xxxxyx on peer <hostname>
```

*Solution*: Update the cluster.op-version

   * Run `gluster volume get all cluster.max-op-version` to get the latest supported op-version.
   * Update the cluster.op-version to the latest supported op-version by executing `gluster volume set all cluster.op-version <op-version>`.

<br>

**"Accepted Peer Request"**

If the glusterd handshake fails while expanding a cluster, the view of the cluster will be inconsistent. The state of the peer in `gluster peer status` will be  “accepted peer request” and subsequent CLI commands will fail with an error.
Eg. `Volume create command will fail with "volume create: testvol: failed: Host <hostname> is not in 'Peer in Cluster' state` 
    
In this case the value of the state field in `/var/lib/glusterd/peers/<UUID>` will be other than 3.

*Solution*:

* Stop glusterd
* Open `/var/lib/glusterd/peers/<UUID>`
* Change state to 3
* Start glusterd







