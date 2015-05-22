Troubleshooting FAQ
===================

**1. What ports does Gluster need?**

Preferably, your storage environment should be located on a safe segment
of your network where firewall is not necessary. In the real world, that
simply isn't possible for all environments. If you are willing to accept
the potential performance loss of running a firewall, you need to know
that Gluster makes use of the following ports:

-   24007 TCP for the Gluster Daemon
-   24008 TCP for Infiniband management (optional unless you are using
    IB)
-   One TCP port for each brick in a volume. So, for example, if you
    have 4 bricks in a volume, port 24009 – 24012 would be used in
    GlusterFS 3.3 & below, 49152 - 49155 from GlusterFS 3.4 & later.
-   38465, 38466 and 38467 TCP for the inline Gluster NFS server.
-   Additionally, port 111 TCP and UDP (since always) and port 2049
    TCP-only (from GlusterFS 3.4 & later) are used for port mapper and
    should be open.

Note: by default Gluster/NFS does not provide services over UDP, it is
TCP only. You would need to enable the nfs.mount-udp option if you want
to add UDP support for the MOUNT protocol. That's completely optional
and is up to your judgement to use.

**2. I am having issues trying to create a trusted pool**

Make sure to check the basics first:

-   Does nslookup show the expected values for the short, FQDN, and
    reverse lookup by IP?
-   Make sure not to use /etc/hosts! Although there is nothing wrong
    with this in theory, there is no way to track the countless hours
    that have been lost troubleshooting things only to find out that one
    server had an errant entry in /etc/hosts.
-   Can you reach port 24007 on the servers (e.g. via telnet)?
-   Are you able to issue any other gluster commands successfully? If
    not, the gluster daemon is most likely not running.

        /etc/init.d/glusterd status
        glusterd.service - LSB: glusterfs server
            Loaded: loaded (/etc/rc.d/init.d/glusterd)
            Active: inactive (dead)
            CGroup: name=systemd:/system/glusterd.service

**3. How can I tell if the gluster daemon running?**

Several commands can be used here:

        service glusterd status
        systemctl status glusterd.service
        /etc/init.d/glusterd status

**4. I can't mount the volume on the server**

Check the gluster volume info output and make sure the volume shows a
status of “Started”

        gluster volume info
        Status: Started

Make sure you can see the volume by running the command \`showmount -e
<gluster node>

        showmount -e econode01
        Export list for econode01:
        /communitytest *

**5. I can't mount the volume from a client**

-   Make sure you are able to connect to the machine you are trying to
    mount the volume from (not just ping it)
-   Make sure that glusterd is running on all servers
-   Make sure that the volume is started

**6. I upgraded Gluster, and now a client seems to be have issues
connecting**

Check whether the client is using the same version of Gluster when using
the native client

        glusterfsd --version
        glusterfs 3.3.1 built on Oct 11 2012 21:22:46

In many cases, it may be enough to remount the volume

**7. Not all of the hosts have the same output when i run “gluster peer
probe”**

This is generally a good thing, with some caveats -

-   The output from each server should show all OTHER servers, but NOT
    itself
-   Each server should have the same UUID, for example, the UUID of
    server2 should always be the same no matter which server you run
    gluster peer status from
-   The Status should always show “Peer in Cluster (Connected)”
-   The value should match what you see in
    /var/lib/glusterd/glusterd.info for server2

**8. I accidentally killed the Gluster daemon while some data was
transferring!**

All is not lost. In fact, nothing is. Glusterd is used to manage the
cluster as a whole, for example, to create new volumes or modify
existing ones. If it dies, you will not be able to start or stop
volumes, but data will still keep chugging right on through.

**9. I accidentally uninstalled Gluster!**

You are in luck. Hopefully. If you left your configuration directory in
place, just reinstall and everything should come up just as it was
before.'''

        1) yum erase glusterfs-server
        ...
        Running Transaction
         Erasing    : glusterfs-server-3.3.1-1.fc17.x86_64    
          ...
        2) yum install glusterfs-server
        ...
        Installed:
         glusterfs-server.x86_64 0:3.3.1-1.fc17                                                                                                                     
        
        Complete!
        
        3) service glusterd start
        
        4) gluster volume info
        
         Volume Name: communitytest
         Type: Replicate
         Volume ID: 5c26bcfe-7db4-40fe-ade4-a2755d53a19d
         Status: Started

The precending commands show gluster being uninstalled and reinstalled.
After the glusterd service is started, all that was left was to run
gluster volume info to shoe ther state of the volume is just like we
left it.

-   If for some reason you DID delete the configuration directory, you
    can still get things back in no time if you know EXACTLY how the
    volumes were laid out before. You DID document that, right?
-   Ah. You didn't. Well, you are in for a headache, but all is not
    lost. You can create new volumes and import the data back in with
    your favorite commands like rsync, tar, mv or even scp (if you are
    paid by the hour).

**10. I can't mount with NFS**

-   Make sure that the kernel NFS service isn't running on the servers
-   Make sure that the rpcbind or portmap service is running
-   For newer linux distributions, you can add the option vers=3 like
    so:

        mount -t nfs -o vers=3 server2:/myglustervolume /gluster/mount/point

**11. One of the nodes in a replicated pair went down. The issue is
resolved, but how can I get my data back in sync?**

Check again, it may be already! Gluster has automatic failover and
self-heal as two of its' most powerful features

**12. I don't have a lot of money, but I love to read...where are the
Gluster logs?**

        /var/log/glusterfs

**13. How can I rotate the logs?**

        gluster volume log rotate myglustervolume

**14. Where are the configuration files?**

        /var/lib/glusterd for newer versions, /etc/glusterd/ for older ones

**15. I am getting weird errors and inconsistencies from a database I am
running in a Gluster volume**

Unless your database does almost nothing, this is expected. Gluster does
not support structured data (like databases) due to issues you will
likely encounter when you have a high number of transactions being
persisted, lots of concurrent connections, etc. Gluster \*IS\*, however,
a perfect place to store your database backups.

**16. Gluster is acting strangely, so i restarted the daemon, but the
issue is still there.**

Halloween is just around the corner as this is being written, so make
sure that whatever is supposed to be dead, actually IS, with the command

        ps -ax | grep glu

If any gluster processes are still running after you shut down a host,
use

        killall gluster{,d,fs,fsd}

**17. Do I need to run commands on every host?**

It depends on the command.

-   As mentioned elsewhere in the Getting Started guides, for Gluster
    CLI commands like \`gluster volume create\`, you should specify one
    server only to run the commands from to make troubleshooting
    simpler.
-   For commands like \`gluster peer status\`, you want to make sure and
    check each server individually since Gluster, like all clustered
    systems, needs to have consistent configurations between all
    servers.

**18. Is there any way to check all the nodes quicker?**

You can run commands on a remote host using the --remote-host switch

        gluster --remote-host=server2 peer status

-   If you have CTDB configured, you can use the \`onnode\` command to
    specify all hosts at once, or just from one or two individually
-   Depending on how safe your environment is, you can use the
    ssh-keygen and ssh-copy-id commands to login or run commands
    remotely without needing a password

**19. Gluster caused my {network, kernel, filesystem,luxurious alpaca
farm} to have issues!!!**

Possibly. But, in most cases, Gluster, or any software that taxes your
network or storage infrastructure resources, isn't causing the
issue...it's simply exposing it. If you do find an issue that you feel
is legitimately caused by Gluster, we want to know! Filing a bug,
submitting a patch, sending an email to the gluster-users list, or
chatting with us in IRC are all great ways to help make Gluster better
for everyone.

**20. What is a transport endpoint, and why isn't it connected?**

If you spend a fair amount of time reading your Gluster logs (and who
wouldn't?!), you will regularly see this error message. On the surface,
it is fairly generic, and roughly translates as “Gluster isn't
communicating for some reason”. Most often, this is caused by saturation
of either storage or network resources somewhere in the cluster. One or
two instances here and there are expected, if not exactly desired. When
should you worry? If you see the message repeated over a sustained
period of time, or several times a day the logs flood with it, you
probably need to fix that. Using the techniques covered here will work
for the vast majority of cases. If not, we have commonly seen issues
like:

-   RAID or NIC drivers or firmware needed to be updated
-   Third-party backup applications were running at the same time
-   The /etc/cron.daily/mlocate script was never told to prune the
    bricks or networked filesystem
-   Aggressive use of rsync jobs on the gluster bricks or mount points

**21. Error:Errno 107**

This means that there are network issues so check if any of the
following scenarios exist and try again after rebooting the system:

-   Firewall is not disabled.
-   SELINUX is not set to disable.
-   IP Addresses are not added to the Iptables of the respective
    servers.

**22. Error:gluster is not operational**

For this sort of error restart the system and accordingly the gluster
daemon / service with the command:

        sudo reboot
        service gluster start
        gluster peer status 

Then do the peer probing:

        gluster peer probe ipaddress/hostname

Check the peer status whenever you add a peer or when you create a new
volume.

**23.Accepted peer request - disconnected**

It is the same error as errno 107. Refer no. 21.

'''24. GlusterFS Geo-replication did not synchronize the data completely
but still the geo-replication status display OK. '''

You can enforce a full sync of the data by erasing the index and
restarting GlusterFS Geo-replication. After restarting, GlusterFS
Geo-replication begins synchronizing all the data, that is, all files
will be compared with by means of being checksummed, which can be a
lengthy /resource high utilization operation, mainly on large data sets
(however, actual data loss will not occur).

**25. Gluster mount fails when provided in
CONFIG\_CINDER\_GLUSTER\_MOUNTS during packstack installation.**

This generally means that the Gluster server/volume couldn't be reached
for some reason. There should be a log file in /var/log/gluster
corresponding to that mount point that will give a more precise reason
for the failure.

**26.Mount command on NFS client fails with “RPC Error: Program not
registered**

Start portmap or rpcbind service on the NFS server.

This error is encountered when the server has not started correctly.

On most Linux distributions this is fixed by starting portmap:

        $ /etc/init.d/portmap start

On some distributions where portmap has been replaced by rpcbind, the
following command is required:

        $ /etc/init.d/rpcbind start

After starting portmap or rpcbind, gluster NFS server needs to be
restarted.

**27.NFS server start-up fails with “Port is already in use” error in
the log file.**

Another Gluster NFS server is running on the same machine.

This error can arise in case there is already a Gluster NFS server
running on the same machine. This situation can be confirmed from the
log file, if the following error lines exist:

        [2010-05-26 23:40:49] E [rpc-socket.c:126:rpcsvc_socket_listen] rpc-socket: binding socket failed: Address already in use
        [2010-05-26 23:40:49] E [rpc-socket.c:129:rpcsvc_socket_listen] rpc-socket: Port is already in use
        [2010-05-26 23:40:49] E [rpcsvc.c:2636:rpcsvc_stage_program_register] rpc-service: could not create listening connection
        [2010-05-26 23:40:49] E [rpcsvc.c:2675:rpcsvc_program_register] rpc-service: stage registration of program failed
        [2010-05-26 23:40:49] E [rpcsvc.c:2695:rpcsvc_program_register] rpc-service:Program registration failed:MOUNT3,Num:100005,Ver:3,Port:38465
        [2010-05-26 23:40:49] E [nfs.c:125:nfs_init_versions] nfs: Program init failed
        [2010-05-26 23:40:49] C [nfs.c:531:notify] nfs: Failed to initialize protocols

To resolve this error one of the Gluster NFS servers will have to be
shutdown. At this time, Gluster NFS server does not support running
multiple NFS servers on the same machine.

**28.Mount command fails with “rpc.statd” related error message**

If the mount command fails with the following error message:

        mount.nfs: rpc.statd is not running but is required for remote locking.
        mount.nfs: Either use '-o nolock' to keep locks local, or start statd.

Start rpc.statd For NFS clients to mount the NFS server, rpc.statd
service must be running on the clients. Start rpc.statd service by
running the following command:

        $ rpc.statd 

**29.Mount command takes too long to finish.**

Start rpcbind service on the NFS client.

The problem is that the rpcbind or portmap service is not running on the
NFS client. The resolution for this is to start either of these services
by:

        $ /etc/init.d/portmap start<

On some distributions where portmap has been replaced by rpcbind, the
following command is required:

        $ /etc/init.d/rpcbind start

**30.Showmount fails with clnt\_create: RPC: Unable to receive**

Check your firewall setting to open ports 111 for portmap
requests/replies and Gluster NFS server requests/replies. Gluster NFS
server operates over the following port numbers: 38465, 38466, and
38467.

**31.How to get the log-file(master and slave) for geo-replication?**

        gluster volume geo-replication config log-file

For example:

        # gluster volume geo-replication Volume1 example.com:/data/remote_dir config log-fil

To get the log file for Geo-replication on slave (glusterd must be
running on slave machine), use the following commands:

On master, run the following command:

        # gluster volume geo-replication Volume1 example.com:/data/remote_dir config session-owner 5f6e5200-756f-11e0-a1f0-0800200c9a66

Displays the session owner details.

On slave, run the following command:

        # gluster volume geo-replication /data/remote_dir config log-file /var/log/gluster/${session-owner}:remote-mirror.log

Replace the session owner details (output of Step 1) to the output of
the Step 2 to get the location of the log file.

        /var/log/gluster/5f6e5200-756f-11e0-a1f0-0800200c9a66:remote-mirror.log