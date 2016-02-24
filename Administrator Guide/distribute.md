##Distribute volume
Distributed volumes distributes files across various bricks in the volume. (Exmaple: file1 may be stored only in brick1 or brick2 but not on both.) Hence there is no data redundancy. The purpose for such a storage volume is to easily & cheaply scale the volume size. However this also means that a brick failure will lead to complete loss of data and one must rely on the underlying hardware for data loss protection.

![](https://cloud.githubusercontent.com/assets/10970993/7412364/ac0a300c-ef5f-11e4-8599-e7d06de1165c.png)

**Create distribute volume:**
	`# gluster volume create <VOLNAME> [transport <tcp|rdma|tcp,rdma>] <Server IP/Hostname>:<brick path>... [force]`

	This is the default glusterfs volume i.e, while creating a volume if you do not specify the type of the volume, the default option is to create a distributed volume.

	Example: To create a distributed volume with four storage servers using TCP.
	`# gluster volume create test-volume server1:/exp1 server2:/exp2 server3:/exp3 server4:/exp4
	Creation of test-volume has been successful
	Please start the volume to access data

	# gluster volume info
	Volume Name: test-volume
	Type: Distribute
	Volume ID: b558df08-6781-4de7-8c0d-131f348cb743
	Status: Created
	Number of Bricks: 4
	Transport-type: tcp
	Bricks:
	Brick1: server1:/exp1
	Brick2: server2:/exp2
	Brick3: server3:/exp3
	Brick4: server4:/exp4`
