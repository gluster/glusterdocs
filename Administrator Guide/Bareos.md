# Configuring Bareos to store backups on Gluster
[Bareos](http://bareos.org) contains a plugin for the Storage Daemon that uses
`libgfapi`. This makes it possible for Bareos to access the Gluster Volumes
without the need to have a FUSE mount available.

Here we will use one server that is dedicated for doing backups. This system is
called `backup.example.org`. The Bareos Director is running on this host,
together with the Bareos Storage Daemon. In the example, there is a File Daemon
running on the same server. This makes it possible to backup the Bareos
Director, which is useful as a backup of the Bareos database and configuration
is kept that way.
## Prerequisites
- Configured, operational Gluster environment
- Round Robin DNS name that can contact any available GlusterD process (example: ```storage.example.com```)
- Gluster volume (example: ```backups```)
- Client system access to mounted volume (FUSE command: ```mount -t glusterfs storage.example.org:/backups/mnt```)

# Bareos Installation

An absolute minimal Bareos installation needs a Bareos Director and a Storage
Daemon. To back up a filesystem, Bareos also needs a File Daemon. For the description in this document, CentOS-7 was used, with the
following packages and versions:

- [glusterfs-3.7.4](http://download.gluster.org)
- [bareos-14.2](http://download.bareos.org) with bareos-storage-glusterfs

The Gluster Storage Servers do not need to have any Bareos packages installed.
It is often better to keep applications (Bareos) and storage servers on
different systems. 
### To install Bareos on an application server
1. Configure the Bareos repository
2. Install the packages on the `backup.example.org` server:

    ```
     yum install bareos-director bareos-database-sqlite3 \
                  bareos-storage-glusterfs bareos-filedaemon \
                  bareos-bconsole
                  
3. In this example, we used SQlite. For production
deployments either MySQL or PostgrSQL is advised.  Create the 
initial database:
```
    # sqlite3 /var/lib/bareos/bareos.db < /usr/lib/bareos/scripts/ddl/creates/sqlite3.sql
    # chown bareos:bareos /var/lib/bareos/bareos.db
    # chmod 0660 /var/lib/bareos/bareos.db
```

4. The `bareos-bconsole` package is optional. `bconsole` is a terminal application
that can be used to initiate backups, check the status of different Bareos
components and the like. Testing the configuration with `bconsole` is
relatively simple.
### To start Bareos on an application server
5. Once the packages are installed, you will need to start and enable the daemons:
```
    # systemctl start bareos­sd
    # systemctl start bareos­fd
    # systemctl start bareos­dir
    # systemctl enable bareos­sd
    # systemctl enable bareos­fd
    # systemctl enable bareos­dir
```
# Gluster Volume preparation

There are a few steps needed to allow Bareos to access the Gluster Volume. By
default Gluster does not allow clients to connect from an unprivileged port.
Because the Bareos Storage Daemon does not run as root, permissions to connect
need to be opened up.

There are two processes involved when a client accesses a Gluster Volume. For
the initial phase, GlusterD is contacted, when the client received the layout
of the volume, the client will connect to the bricks directly. 

### To allow unprivileged processes to connect

1. In `/etc/glusterfs/glusterd.vol` add the `rpc-auth-allow-insecure on`
   option on all storage servers. 
2. After you modify the configuration file, restart the GlusterD process by entering
   `systemctl restart glusterd`.
3. Execute  `gluster volume set backups server.allow-insecure on` to configure the brick processes. 
4. Some versions of Gluster require a volume stop/start
   before the option is taken into account, for these versions you will need to
   execute `gluster volume stop backups` and `gluster volume start backups`.

Except for the network permissions, the Bareos Storage Daemon needs to be
allowed to write to the filesystem provided by the Gluster Volume. 
### To set permissions allowing the storage daemon to write
1. Set normal UNIX permissions/ownership so that the correct
user/group can write to the volume:
```
    # mount -t glusterfs storage.example.org:/backups /mnt
    # mkdir /mnt/bareos
    # chown bareos:bareos /mnt/bareos
    # chmod ug=rwx /mnt/bareos
    # umount /mnt
```
NOTE: Depending on how users/groups are maintained in the environment, the `bareos`
user and group may not be available on the storage servers. If that is the
case, the `chown` command above can be adapted to use the `uid` and `gid` of
the `bareos` user and group from `backup.example.org`. On the Bareos server,
the output would look similar to:
```
    # id bareos
    uid=998(bareos) gid=997(bareos) groups=997(bareos),6(disk),30(tape)
```
And that makes the `chown` command look like this:
```
    # chown 998:997 /mnt/bareos
```
<!--- That is a lot of information for a side item. Consider handling differently.--->
# Bareos Configuration

When `bareos-storage-glusterfs` was installed, an example configuration file
was also added. The `/etc/bareos/bareos-sd.d/device-gluster.conf` contains
the `Archive Device` directive, which is a URL for the Gluster Volume and path
where the backups should get stored. In our example, the entry should get set
to:

    Device {
      Name = GlusterStorage
      Archive Device = gluster://storage.example.org/backups/bareos
      Device Type = gfapi
      Media Type = GlusterFile
      ...
    }

The default configuration of the Bareos provided jobs is to write backups to
`/var/lib/bareos/storage`. 
### To write all the backups to the Gluster Volume
 1. Modify the configuration for the Bareos Director.
 2. In the `/etc/bareos/bareos-dir.conf` configuration, change the defaults for all jobs to use the `GlusterFile` storage:
```
    JobDefs {
      Name = "DefaultJob"
      ...
    #  Storage = File
      Storage = GlusterFile
      ...
    }
```
After changing the configuration files, the Bareos daemons need to apply them.

1. Instruct the processes to `reload` their configuration:
```
    # bconsole
    Connecting to Director backup:9101
    1000 OK: backup-dir Version: 14.2.2 (12 December 2014)
    Enter a period to cancel a command.
    *reload
```

1. Use  `bconsole`  to check if the configuration has been
applied. The `status` command can be used to show the URL of the storage that
is configured. When all is setup correctly, the result looks like this:
```
    *status storage=GlusterFile
    Connecting to Storage daemon GlusterFile at backup:9103
    ...
    Device "GlusterStorage" (gluster://storage.example.org/backups/bareos) is not open.
    ...
```

# Create your first backup

There are several default jobs configured in the Bareos Director. 
1. Run the `DefaultJob` which was modified in an earlier step. This job uses the
`SelfTest` FileSet, which backups `/usr/sbin`. Running this job will verify if
the configuration is working correctly. Additional jobs, other FileSets and
more File Daemons (clients that get backed up) can be added later.
```
    *run
    A job name must be specified.
    The defined Job resources are:
         1: BackupClient1
         2: BackupCatalog
         3: RestoreFiles
    Select Job resource (1-3): 1
    Run Backup job
    JobName:  BackupClient1
    Level:    Incremental
    Client:   backup-fd
    ...
    OK to run? (yes/mod/no): yes
    Job queued. JobId=1
```
The job will need a few seconds to complete, the `status` command can be used
to show the progress. Once done, the `messages` command will display the
result:

    *messages
    ...
      JobId:                  1
      Job:                    BackupClient1.2015-09-30_21.17.56_12
      ...
      Termination:            Backup OK

The archive that contains the backup is located on the Gluster Volume. 

2. To
check if the file is available, mount the volume on a storage server:
```
    # mount -t glusterfs storage.example.org:/backups /mnt
    # ls /mnt/bareos
```

# Further Reading

This document provides a quick start of configuring Bareos to use
Gluster as a storage backend. Bareos can be configured to create backups of
different clients (which run a File Daemon), run jobs at scheduled time and
intervals and much more. The excellent [Bareos
documentation](http://doc.bareos.org) can be consulted to find out how to
create backups in a much more useful way than can get expressed on this page.
