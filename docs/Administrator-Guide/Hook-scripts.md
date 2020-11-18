# Managing GlusterFS Volume Life-Cycle Extensions with Hook Scripts

Glusterfs allows automation of operations by user-written scripts. For every operation, you can execute a *pre* and a *post* script.

### Pre Scripts
These scripts are run before the occurrence of the event. You can write a script to automate activities like managing system-wide services. For example, you can write a script to stop exporting the SMB share corresponding to the volume before you stop the volume.

### Post Scripts
These scripts are run after execution of the event. For example, you can write a script to export the SMB share corresponding to the volume after you start the volume.

You can run scripts for the following events:

+ Creating a volume
+ Starting a volume
+ Adding a brick
+ Removing a brick
+ Tuning volume options
+ Stopping a volume
+ Deleting a volume

### Naming Convention
While creating the file names of your scripts, you must follow the naming convention followed in your underlying file system like XFS.

> Note: To enable the script, the name of the script must start with an S . Scripts run in lexicographic order of their names.

### Location of Scripts
This section provides information on the folders where the scripts must be placed. When you create a trusted storage pool, the following directories are created:

+ `/var/lib/glusterd/hooks/1/create/`
+ `/var/lib/glusterd/hooks/1/delete/`
+ `/var/lib/glusterd/hooks/1/start/`
+ `/var/lib/glusterd/hooks/1/stop/`
+ `/var/lib/glusterd/hooks/1/set/`
+ `/var/lib/glusterd/hooks/1/add-brick/`
+ `/var/lib/glusterd/hooks/1/remove-brick/`

After creating a script, you must ensure to save the script in its respective folder on all the nodes of the trusted storage pool. The location of the script dictates whether the script must be executed before or after an event. Scripts are provided with the command line argument `--volname=VOLNAME` to specify the volume. Command-specific additional arguments are provided for the following volume operations:

    Start volume
        --first=yes, if the volume is the first to be started
        --first=no, for otherwise
    Stop volume
        --last=yes, if the volume is to be stopped last.
        --last=no, for otherwise
    Set volume
        -o key=value
        For every key, value is specified in volume set command.

### Prepackaged Scripts
Gluster provides scripts to export Samba (SMB) share when you start a volume and to remove the share when you stop the volume. These scripts are available at: `/var/lib/glusterd/hooks/1/start/post` and `/var/lib/glusterd/hooks/1/stop/pre`. By default, the scripts are enabled.

When you start a volume using `gluster volume start VOLNAME`, the S30samba-start.sh script performs the following:

+ Adds Samba share configuration details of the volume to the smb.conf file
+ Mounts the volume through FUSE and adds an entry in /etc/fstab for the same.
+ Restarts Samba to run with updated configuration

When you stop the volume using `gluster volume stop VOLNAME`, the S30samba-stop.sh script performs the following:

+ Removes the Samba share details of the volume from the smb.conf file
+ Unmounts the FUSE mount point and removes the corresponding entry in
  /etc/fstab
+ Restarts Samba to run with updated configuration
