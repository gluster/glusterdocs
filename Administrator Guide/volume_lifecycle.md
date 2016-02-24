## Start the volume
	Once the volume is created, run the following command to start the volume and make it accessible.
	`# gluster volume start <VOLNAME>`

## Display the volume information
	To list all the volumes in the trusted storage pool:
	`# gluster volume list`

	To list all the volumes and their information, in the trusted storage pool:
	`# gluster volume info`

	To get the information of a specific volume:
	`# gluster volume info <VOLNAME>`

	To get the status of the volume, bricks, and other information:
	`# gluster volume status <VOLNAME>`

	To display the clients accessing the volume:
	`# gluster volume status <VOLNAME> clients`

	Above are the few widely used commands, you can execute the help command to get a list of all volume commands
	`# gluster volume help`

## Stop the volume
	Stopping the volume will make the data hosted in that volume inaccessible to the clients
	`# gluster volume stop <VOLNAME>`

## Delete the volume
	Deleting the volume will delete all the data in the bricks????. Once the volume is deleted, the volume cannot be recovered, i.e. volume cannot be recreated with same bricks and data.
	`# gluster volume delete <VOLNAME>`
