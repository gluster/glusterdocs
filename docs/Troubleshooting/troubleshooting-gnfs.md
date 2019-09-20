## Troubleshooting Gluster NFS

This section describes the most common troubleshooting issues related to
NFS .

### mount command on NFS client fails with “RPC Error: Program not registered”

Start portmap or rpcbind service on the NFS server.

This error is encountered when the server has not started correctly.
On most Linux distributions this is fixed by starting portmap:

```console
# /etc/init.d/portmap start
```

On some distributions where portmap has been replaced by rpcbind, the
following command is required:

```console
# /etc/init.d/rpcbind start
```

After starting portmap or rpcbind, gluster NFS server needs to be
restarted.

### NFS server start-up fails with “Port is already in use” error in the log file.

Another Gluster NFS server is running on the same machine.

This error can arise in case there is already a Gluster NFS server
running on the same machine. This situation can be confirmed from the
log file, if the following error lines exist:

```text
[2010-05-26 23:40:49] E [rpc-socket.c:126:rpcsvc_socket_listen] rpc-socket: binding socket failed:Address already in use
[2010-05-26 23:40:49] E [rpc-socket.c:129:rpcsvc_socket_listen] rpc-socket: Port is already in use 
[2010-05-26 23:40:49] E [rpcsvc.c:2636:rpcsvc_stage_program_register] rpc-service: could not create listening connection 
[2010-05-26 23:40:49] E [rpcsvc.c:2675:rpcsvc_program_register] rpc-service: stage registration of program failed 
[2010-05-26 23:40:49] E [rpcsvc.c:2695:rpcsvc_program_register] rpc-service: Program registration failed: MOUNT3, Num: 100005, Ver: 3, Port: 38465 
[2010-05-26 23:40:49] E [nfs.c:125:nfs_init_versions] nfs: Program init failed 
[2010-05-26 23:40:49] C [nfs.c:531:notify] nfs: Failed to initialize protocols
```

To resolve this error one of the Gluster NFS servers will have to be
shutdown. At this time, Gluster NFS server does not support running
multiple NFS servers on the same machine.

### mount command fails with “rpc.statd” related error message

If the mount command fails with the following error message:

```console
mount.nfs: rpc.statd is not running but is required for remote locking.
mount.nfs: Either use '-o nolock' to keep locks local, or start statd.
```

For NFS clients to mount the NFS server, rpc.statd service must be
running on the clients. Start rpc.statd service by running the following command:

```console
# rpc.statd
```

### mount command takes too long to finish.

**Start rpcbind service on the NFS client**

The problem is that the rpcbind or portmap service is not running on the
NFS client. The resolution for this is to start either of these services
by running the following command:

```console
# /etc/init.d/portmap start
```

On some distributions where portmap has been replaced by rpcbind, the
following command is required:

```console
# /etc/init.d/rpcbind start
```

### NFS server glusterfsd starts but initialization fails with “nfsrpc- service: portmap registration of program failed” error message in the log.

NFS start-up can succeed but the initialization of the NFS service can
still fail preventing clients from accessing the mount points. Such a
situation can be confirmed from the following error messages in the log
file:

```text
[2010-05-26 23:33:47] E [rpcsvc.c:2598:rpcsvc_program_register_portmap] rpc-service: Could notregister with portmap 
[2010-05-26 23:33:47] E [rpcsvc.c:2682:rpcsvc_program_register] rpc-service: portmap registration of program failed
[2010-05-26 23:33:47] E [rpcsvc.c:2695:rpcsvc_program_register] rpc-service: Program registration failed: MOUNT3, Num: 100005, Ver: 3, Port: 38465
[2010-05-26 23:33:47] E [nfs.c:125:nfs_init_versions] nfs: Program init failed
[2010-05-26 23:33:47] C [nfs.c:531:notify] nfs: Failed to initialize protocols
[2010-05-26 23:33:49] E [rpcsvc.c:2614:rpcsvc_program_unregister_portmap] rpc-service: Could not unregister with portmap
[2010-05-26 23:33:49] E [rpcsvc.c:2731:rpcsvc_program_unregister] rpc-service: portmap unregistration of program failed
[2010-05-26 23:33:49] E [rpcsvc.c:2744:rpcsvc_program_unregister] rpc-service: Program unregistration failed: MOUNT3, Num: 100005, Ver: 3, Port: 38465
```

1.  **Start portmap or rpcbind service on the NFS server**

    On most Linux distributions, portmap can be started using the
    following command:

        # /etc/init.d/portmap start

    On some distributions where portmap has been replaced by rpcbind,
    run the following command:

        # /etc/init.d/rpcbind start

    After starting portmap or rpcbind, gluster NFS server needs to be
    restarted.

2.  **Stop another NFS server running on the same machine**

    Such an error is also seen when there is another NFS server running
    on the same machine but it is not the Gluster NFS server. On Linux
    systems, this could be the kernel NFS server. Resolution involves
    stopping the other NFS server or not running the Gluster NFS server
    on the machine. Before stopping the kernel NFS server, ensure that
    no critical service depends on access to that NFS server's exports.

    On Linux, kernel NFS servers can be stopped by using either of the
    following commands depending on the distribution in use:

        # /etc/init.d/nfs-kernel-server stop
        # /etc/init.d/nfs stop

3.  **Restart Gluster NFS server**

### mount command fails with NFS server failed error.

mount command fails with following error

```console
mount: mount to NFS server '10.1.10.11' failed: timed out (retrying).
```

Perform one of the following to resolve this issue:

1.  **Disable name lookup requests from NFS server to a DNS server**

    The NFS server attempts to authenticate NFS clients by performing a
    reverse DNS lookup to match hostnames in the volume file with the
    client IP addresses. There can be a situation where the NFS server
    either is not able to connect to the DNS server or the DNS server is
    taking too long to responsd to DNS request. These delays can result
    in delayed replies from the NFS server to the NFS client resulting
    in the timeout error seen above.

    NFS server provides a work-around that disables DNS requests,
    instead relying only on the client IP addresses for authentication.
    The following option can be added for successful mounting in such
    situations:

    `option rpc-auth.addr.namelookup off `

    > **Note**: Remember that disabling the NFS server forces authentication
    > of clients to use only IP addresses and if the authentication
    > rules in the volume file use hostnames, those authentication rules
    > will fail and disallow mounting for those clients.

    **OR**

2.  **NFS version used by the NFS client is other than version 3**

    Gluster NFS server supports version 3 of NFS protocol. In recent
    Linux kernels, the default NFS version has been changed from 3 to 4.
    It is possible that the client machine is unable to connect to the
    Gluster NFS server because it is using version 4 messages which are
    not understood by Gluster NFS server. The timeout can be resolved by
    forcing the NFS client to use version 3. The **vers** option to
    mount command is used for this purpose:

        # mount  -o vers=3

### showmount fails with clnt\_create: RPC: Unable to receive

Check your firewall setting to open ports 111 for portmap
requests/replies and Gluster NFS server requests/replies. Gluster NFS
server operates over the following port numbers: 38465, 38466, and
38467.

### Application fails with "Invalid argument" or "Value too large for defined data type" error.

These two errors generally happen for 32-bit nfs clients or applications
that do not support 64-bit inode numbers or large files. Use the
following option from the CLI to make Gluster NFS return 32-bit inode
numbers instead: nfs.enable-ino32 \<on|off\>

Applications that will benefit are those that were either:

-   built 32-bit and run on 32-bit machines such that they do not
    support large files by default
-   built 32-bit on 64-bit systems

This option is disabled by default so NFS returns 64-bit inode numbers
by default.

Applications which can be rebuilt from source are recommended to rebuild
using the following flag with gcc:

```
-D_FILE_OFFSET_BITS=64
```
