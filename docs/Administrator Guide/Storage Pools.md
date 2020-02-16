# Managing Trusted Storage Pools


### Overview

A trusted storage pool (TSP) is a trusted network of storage servers. Before you can configure a
GlusterFS volume, you must create a trusted storage pool of the storage servers
that will provide bricks to the volume by peer probing the servers.
The servers in a TSP are peers of each other.

After installing Gluster on your servers and before creating a trusted storage pool,
each server belongs to a storage pool consisting of only that server.

-  [Adding Servers](#adding-servers)
-  [Listing Servers](#listing-servers)
-  [Viewing Peer Status](#peer-status)
-  [Removing Servers](#removing-servers)


**Before you start**:

- The servers used to create the storage pool must be resolvable by hostname.

- The glusterd daemon must be running on all storage servers that you
want to add to the storage pool. See [Managing the glusterd Service](./Start Stop Daemon.md) for details.

- The firewall on the servers must be configured to allow access to port 24007.

The following commands were run on a TSP consisting of 3 servers - server1, server2,
and server3.

<a name="adding-servers"></a>
### Adding Servers

To add a server to a TSP, peer probe it from a server already in the pool.

```console
# gluster peer probe <server>
```

For example, to add a new server4 to the cluster described above, probe it from one of the other servers:

```console
server1#  gluster peer probe server4
Probe successful
```

Verify the peer status from the first server (server1):

```console
server1# gluster peer status
Number of Peers: 3

Hostname: server2
Uuid: 5e987bda-16dd-43c2-835b-08b7d55e94e5
State: Peer in Cluster (Connected)

Hostname: server3
Uuid: 1e0ca3aa-9ef7-4f66-8f15-cbc348f29ff7
State: Peer in Cluster (Connected)

Hostname: server4
Uuid: 3e0cabaa-9df7-4f66-8e5d-cbc348f29ff7
State: Peer in Cluster (Connected)
```

<a name="listing-servers"></a>
### Listing Servers

To list all nodes in the TSP:

```console
server1# gluster pool list
UUID                                    Hostname        State
d18d36c5-533a-4541-ac92-c471241d5418    localhost       Connected
5e987bda-16dd-43c2-835b-08b7d55e94e5    server2         Connected
1e0ca3aa-9ef7-4f66-8f15-cbc348f29ff7    server3         Connected
3e0cabaa-9df7-4f66-8e5d-cbc348f29ff7    server4         Connected
```

<a name="peer-status"></a>
### Viewing Peer Status

To view the status of the peers in the TSP:

```console
server1# gluster peer status
Number of Peers: 3

Hostname: server2
Uuid: 5e987bda-16dd-43c2-835b-08b7d55e94e5
State: Peer in Cluster (Connected)

Hostname: server3
Uuid: 1e0ca3aa-9ef7-4f66-8f15-cbc348f29ff7
State: Peer in Cluster (Connected)

Hostname: server4
Uuid: 3e0cabaa-9df7-4f66-8e5d-cbc348f29ff7
State: Peer in Cluster (Connected)
```

<a name="removing-servers"></a>
### Removing Servers

To remove a server from the TSP, run the following command from another server in the pool:

```console
# gluster peer detach <server>
```

For example, to remove server4 from the trusted storage pool:

```console
server1# gluster peer detach server4
Detach successful
```

Verify the peer status:

```console
server1# gluster peer status
Number of Peers: 2

Hostname: server2
Uuid: 5e987bda-16dd-43c2-835b-08b7d55e94e5
State: Peer in Cluster (Connected)

Hostname: server3
Uuid: 1e0ca3aa-9ef7-4f66-8f15-cbc348f29ff7
State: Peer in Cluster (Connected)
```

