##Setting up Trusted Storage Pool

A storage pool is a trusted network of storage servers.

**Step 1**: Start the gluster service on all the storage servers that you wish to add to the storage pool:

	`# systemctl start glusterd
	OR
	# service glusterd start`

**Step 2**: When you start the first server, the storage pool consists of that server alone. Add additional storage servers to the storage pool. You can use the probe command from a storage server that is already trusted.

	`# gluster peer probe <server IP/Hostname>`

        For example, to create a trusted storage pool of four servers, add
        three servers to the storage pool from server1:

        `# gluster peer probe server2
        Probe successful

        # gluster peer probe server3
        Probe successful

        # gluster peer probe server4
        Probe successful`

	**Note**: Do not self-probe the first server/localhost from itself.
	Thus the trusted storage pool is created. You can scale up the cluster as and when necessary, by adding more nodes, using the probe command.

**Step 3**: Verify the peer status from any of the servers in the trusted storage pool, using the following command:

	`# gluster peer status`

	For example, executing this command from server 2:
        `server2# gluster peer status
        Number of Peers: 3

        Hostname: server1
        Uuid: ceed91d5-e8d1-434d-9d47-63e914c93424
        State: Peer in Cluster (Connected)

        Hostname: server3
        Uuid: 1e0ca3aa-9ef7-4f66-8f15-cbc348f29ff7
        State: Peer in Cluster (Connected)

        Hostname: server4
        Uuid: 3e0caba-9df7-4f66-8e5d-cbc348f29ff7
        State: Peer in Cluster (Connected)`

##Removing Servers from the Trusted Storage Pool

	To remove a server from the storage pool:

	`# gluster peer detach`

	For example, to remove server4 from the trusted storage pool:

	`# gluster peer detach server4
	Detach successful`

