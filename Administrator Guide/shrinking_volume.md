## Shrinking the volume

You can shrink volumes while the trusted storage pool is online and available. The volume can be shrinked by removing the bricks from the volume. The number of bricks to be removed depends on the type of volume.
- In case of distribute, replicate any number of bricks can be removed.
- In case of distribute-disperse, the number of bricks removed should be the multiple of the disperse count.
- In case of distribute-replicate, the number of bricks removed should be the multiple of replica count if not changing the replica count with this operation. If replica count is also being reduced with remove-brick then the number of bricks should be chosen accordingly.
- In case of disperse volume, no bricks can be removed.
- In case of striped volume, the number of bricks removed should be multiple of stripe count


**Method 1:** You can remove a brick forcefully without migrating the data on that brick to other bricks. Note that removing the brick forcefully will not erase the contents of the brick, one can access the removed brick from backend for data.
	`# gluster volume remove-brick <VOLNAME> [replica <COUNT>] <Server IP/Hostname>:<brick path>... [force]`

**Method 2:** You can remove a brick by initiating the migration of data from this brick to other bricks in the volume.
	**Step 1:** Start remove brick
	`# gluster volume remove-brick <VOLNAME> [replica <COUNT>] <Server IP/Hostname>:<brick path> start`

	You can view the status of the remove brick operation using the following command:
	`#gluster volume remove-brick <VOLNAME> [replica <COUNT>] <Server IP/Hostname>:<brick path>... status`

	**Step 2:** When the data migration shown in the previous status command is complete, run the following command to commit the brick removal:
	`# gluster volume remove-brick <VOLNAME> [replica <COUNT>] <Server IP/Hostname>:<brick path> commit`

	To stop the brick migration in the middle on can execute the following command:
        `# gluster volume remove-brick <VOLNAME> [replica <COUNT>] <Server IP/Hostname>:<brick path> stop`
	Note: Files that were already migrated during remove-brick operation will not be migrated back to the same brick when the operation is stopped. 

	**Spet 3:** Verify that the bricks are removed successfully:
	`# gluster volume info`


## Shrinking a Geo-replicated Volume
