Volume can be expanded by adding more bricks to the volume.

##Add brick
The minimum number of bricks to be added depends on the type of the volume. Also the volume will no

	**Distribute volume:**
	For a distributed volume, any number of bricks can be added to the volume. 
	`# gluster volume add-brick <VOLNAME> <Server IP/Hostname>:<brick path>... [force]`

	**Replicate volume:**
	Plain replicate volume cannot be expanded as there is no distribution, but the replica count can be increased:
	`# gluster volume add-brick replica <COUNT> <Server IP/Hostname>:<brick path>... [force]`

	**Distribute Replicate volume:**
	For a distributed replicate volume, both distribute and replicatei count can be changed by ading bricks.
	- To change the distribute count, the number of bricks added should be multiple of replica count.
	  Eg: To change 3 * 2 volume to 4 * 2 volume, we need to add 2 bricks, which will be replicas of each other.
	- To change the replica count, the number of bricks added should be the multiple of distribute count.
	  Eg: To change 4 * 2 volume to 4 * 3 volume, we need to add 4 bricks, each will be added as replicas to the existing bricks
	- To change both replica count and distribute count, the number of bricks added should be multiple of distribute count
	  Eg: To change 4 * 2 volume to 5 * 3 volume, we need to add 7 bricks

        `# gluster volume add-brick replica <COUNT> <Server IP/Hostname>:<brick path>... [force]`

	**Disperse volume:**

	**Distribute Disperse volume:**

	**Striped volume:**

	A simple rule to calculate the number of bricks to add is, find the difference between old and new distribute*(replicate|disperse|stripe) count.

##Rebalance the volume:
Once the bricks are added, the existing data is by default not migrated to the new brick.
New directories created after expanding the volume will be evenly distributed automatically.
For all the existing directories, the distribution can be fixed by rebalancing the file distribution layout and/or data.
For more details on how to perform rebalance, refer to [Rebalance](./rebalance.md)
