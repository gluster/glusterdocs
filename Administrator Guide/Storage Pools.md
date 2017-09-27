# Managing Trusted Storage Pools

A storage pool is a trusted network of storage servers.  Before you can configure a
GlusterFS volume, you must create a trusted storage pool consisting of the storage servers
that will provide bricks to the volume.

When you start the first server, the storage pool consists of that server alone. To add
additional storage servers to the storage pool, run the `peer probe` command on that server.


**Note**: Do not self-probe the first server/localhost from itself.


**Before you start**:

- The servers used to create the storage pool must be resolvable by hostname.

- The glusterd daemon must be running on all storage servers that you
want to add to the storage pool. See [Managing the glusterd Service](./Start Stop Daemon.md) for details.

- The firewall on the servers must be configured to allow access to port 24007.


### Adding Servers to a Trusted Storage Pool

1. To add a server to a storage pool, peer probe it from a server already in the pool.
   When you start the first server, the storage pool consists of that server alone.

        # gluster peer probe <server>

    For example, to create a trusted storage pool of four servers - server1, server2, server3
    and server4 - probe the other three servers from server1:

        server1#  gluster peer probe server2
        Probe successful

        server1# gluster peer probe server3
        Probe successful

        server1# gluster peer probe server4
        Probe successful

2.  Verify the peer status from the first server (server1):

        server1# gluster peer status
        Number of Peers: 3

        Hostname: server2
        Uuid: 5e987bda-16dd-43c2-835b-08b7d55e94e5
        State: Peer in Cluster (Connected)

        Hostname: server3
        Uuid: 1e0ca3aa-9ef7-4f66-8f15-cbc348f29ff7
        State: Peer in Cluster (Connected)

        Hostname: server4
        Uuid: 3e0caba-9df7-4f66-8e5d-cbc348f29ff7
        State: Peer in Cluster (Connected)


3.  Assign the hostname to the first server (server1) by probing it from another server:

        server2# gluster peer probe server1
        Probe successful


4.  Verify the peer status from the same server you used in step 3:

        server2# gluster peer status
        Number of Peers: 3

        Hostname: server1
        Uuid: ceed91d5-e8d1-434d-9d47-63e914c93424
        State: Peer in Cluster (Connected)

        Hostname: server3
        Uuid: 1e0ca3aa-9ef7-4f66-8f15-cbc348f29ff7
        State: Peer in Cluster (Connected)

        Hostname: server4
        Uuid: 3e0caba-9df7-4f66-8e5d-cbc348f29ff7
        State: Peer in Cluster (Connected)

You now have a trusted storage pool with four servers.


### Removing Servers from the Trusted Storage Pool

To remove a server from the storage pool, run the following command from another server in the pool:

        # gluster peer detach <server>

For example, to remove server4 from the trusted storage pool:

        server1# gluster peer detach server4
        Detach successful


Verify the peer status:

        server1# gluster peer status
        Number of Peers: 2

        Hostname: server2
        Uuid: 5e987bda-16dd-43c2-835b-08b7d55e94e5
        State: Peer in Cluster (Connected)

        Hostname: server3
        Uuid: 1e0ca3aa-9ef7-4f66-8f15-cbc348f29ff7
        State: Peer in Cluster (Connected)


