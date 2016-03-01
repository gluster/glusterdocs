##Replicate volume
Replicated volume is mainly for high availability. In this volume we overcome the data loss problem faced in the distributed volume. Here exact copies of the data are maintained on all bricks. Hence even if one brick fails, the data can still be accessed from its replicated bricks. Such a volume is used for better reliability and data redundancy.
The replication is synchronous in nature, i.e. the write from the client is complete only when it is complete on all the nodes. Hence it is adviced to not combine a brick in different geo location(or different latencies) as it may reduce the performance drastically.

![replicated_volume](https://cloud.githubusercontent.com/assets/10970993/7412379/d75272a6-ef5f-11e4-869a-c355e8505747.png)

**Create replica volume**

	The number of replicas should be mentioned while creating the volume, it can also be changed after creation, when necessary.

	`# gluster volume create <VOLNAME> [replica COUNT] [transport <tcp|rdma|tcp,rdma>] <Server IP/Hostname>:<brick path>... [force]`

	The number of bricks specified should be same as the replica count. And it is advised to have bricks on different servers, specify 'force' option to override this behaviour.

	Example: To create a replicated volume with two storage servers:

	`# gluster volume create test-volume replica 2 transport tcp server1:/exp1 server2:/exp2
	Creation of test-volume has been successful
	Please start the volume to access data

	#gluster volume info
        Volume Name: test-volume
        Type: Distributed-Replicate
	Volume ID: b558df08-6781-4de7-8c0d-131f348cb743
        Status: Created
        Number of Bricks: 2
        Transport-type: tcp
        Bricks:
        Brick1: server1:/exp1
        Brick2: server2:/exp2`
