## Distribute Replicate volume:
 This type of volume provides both high availability of data due to redundancy, and scaling storage.
In this volume, files are distributed across replicated sets of bricks. The number of bricks must be a multiple of the replica count. Also the order in which we specify the bricks matters since adjacent bricks become replicas of each other.
![distributed_replicated_volume](https://cloud.githubusercontent.com/assets/10970993/7412402/23a17eae-ef60-11e4-8813-a40a2384c5c2.png)

**Create distribute replicate volume**

	`# gluster volume create <VOLNAME> [replica COUNT] [transport <tcp|rdma|tcp,rdma>] <Server IP/Hostname>:<brick path>... [force]`

	The number of bricks specified should be multiple pf replica count. As mentioned, the order of bricks determines the bricks that are replicated. i.e., if there were eight ricks and replica count 2 then the first two bricks become replicas of ach other then the next two and so on. This volume is denoted as 4x2. imilarly if there were eight bricks and replica count 4 then four ricks become replica of each other and we denote this volume as 2x4 volume.

	Example: Four node distribute replicate volume with a two-way replication:

	`# gluster volume create test-volume replica 2 transport tcp server1:/exp1 server2:/exp2 server3:/exp3 server4:/exp4
	Creation of test-volume has been successful
	Please start the volume to access data

	# gluster volume info
	Volume Name: test-volume
        Type: Distributed-Replicate
        Volume ID: b558df08-6781-4de7-8c0d-131f348cb743
        Status: Created
        Number of Bricks: 4
        Transport-type: tcp
        Bricks:
        Brick1: server1:/exp1
        Brick2: server2:/exp2
        Brick3: server3:/exp3
        Brick4: server4:/exp4`

	In this example, server1:/exp1 is replica of server2:/exp2, server3:/exp3 is replica of server4:/exp4
