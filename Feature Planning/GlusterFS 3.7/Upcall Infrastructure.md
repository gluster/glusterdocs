Feature
-------

Framework on the server-side, to handle certain state of the files
accessed and send notifications to the clients connected.

Summary
-------

A generic and extensible framework, used to maintain states in the
glusterfsd process for each of the files accessed (including the clients
info doing the fops) and send notifications to the respective glusterfs
clients incase of any change in that state.

Few of the use-cases (currently identified) of this infrastructure are:

-   Inode Update/Invalidation
-   Recall Delegations/lease locks
-   Maintain Share Reservations/Locks states.
-   Refresh attributes in md-cache

One of the initial consumers of this feature is NFS-ganesha.

Owners
------

Soumya Koduri <skoduri@redhat.com>

Poornima Gurusiddaiah <pgurusid@redhat.com>

Current status
--------------

-   Currently there is no such infra available in GlusterFS which can
    notify clients incase of any change in the file state.
-   There is no support of lease and shared locks.

Drawbacks
---------

-   NFS-ganesha cannot service as Multi-Head and have Active-Active HA
    support.
-   NFS-ganesha cannot support NFSv4 delegations and Open share
    reservations.

Related Feature Requests and Bugs
---------------------------------

<http://www.gluster.org/community/documentation/index.php/Features/Gluster_CLI_for_ganesha>

<http://www.gluster.org/community/documentation/index.php/Features/HA_for_ganesha>

Detailed Description
--------------------

There are various scenarios which require server processes notify
certain events/information to the clients connected to it (by means of
callbacks). Few of such cases are

Cache Invalidation:
:   Each of the GlusterFS clients/applications cache certain state of
    the files (for eg, inode or attributes). In a muti-node environment
    these caches could lead to data-integrity issues, for certain time,
    if there are multiple clients accessing the same file
    simulataneously.

:   To avoid such scenarios, we need server to notify clients incase of
    any change in the file state/attributes.

Delegations/Lease-locks:
:   Currently there is no support of lease locks/delegations in
    GlusterFS. We need a infra to maintain those locks state on server
    side and send notifications to recall those locks incase of any
    conflicting access by a different client. This can be acheived by
    using the Upcalls infra.

Similar to above use-cases, this framework could easily be extended to
handle any other event notifications required to be sent by server.

### Design Considerations

Upcall notifications are RPC calls sent from Gluster server process to
the client.

Note : A new rpc procedure has been added to "GlusterFS Callback"
program to send notifications. This rpc call support from gluster server
to client has been prototyped by Poornima Gurusiddaiah(multi-protocol
team). We have taken that support and enhanced it to suit our
requirements.

"clients" referred below are GlusterFS clients. GlusterFS server just
need to store the details of the clients accessing the file and these
clients when notified can lookup the corresponding file entry based on
the gfid, which it need to take action upon and intimate the application
accordingly.

A new upcall xlator is defined to maintain all the state required for
upcall notifications. This xlator is below io-threads xlator
(considering protocol/server xlator is on top). The reason for choosing
this xlator to be below io-threads is to be able to spawn new threads to
send upcall notifications, to detect conflicts or to do the cleanup etc.

At present we store all the state related to the file entries accessed
by the clients in the inode context. Each of these entries have 'gfid'
as the key value and list of client entries accessing that file.

For each of the file accessed, we create or update an existing entry and
append/update the clientinfo accessing that file.

Sample structure of the upcall and client entries are -

    struct _upcall_client_entry_t {
            struct list_head client_list;                                           
            char *client_uid; /* unique UID of the client */
            rpc_transport_t *trans; /* RPC transport object of the client */
            rpcsvc_t *rpc; /* RPC structure of the client */
            time_t access_time; /* time last accessed */
            time_t recall_time; /* time recall_deleg sent */
            deleg_type deleg;   /* Delegation granted to the client */
    };

    typedef struct _upcall_client_entry_t upcall_client_entry;                  

    struct _upcall_entry_t { 
            struct list_head list;                                
            uuid_t gfid; /* GFID of the file */
            upcall_client_entry client; /* list of clients */
            int deleg_cnt /* no. of delegations granted for this file */
    };

    typedef struct _upcall_entry_t upcall_entry;                      

As upcall notifcations are rpc calls, Gluster server needs to store
client rpc details as well in the upcalls xlator. These rpc details are
passed from protocol/server xlator to upcall xlator via "client\_t"
structure stored as "frame-\>root-\>client".

Below is a brief overview of how each of the above defined use-cases are
handled.

#### Register for callback notifications

We shall provide APIs in gfapi to register and unregister, for receiving
specific callback events from the server. At present, we support below
upcall events.

-   Cache Invalidation
-   Recall Lease-Lock

#### Cache Invalidation

:   Whenever a client sends a fop, after processing the fop, in callback
    path, server

-   get/add upcall entry based on gfid.
-   lookup/add the client entry to that upcall entry based on
    client\_t-\>client\_uid, with timestamp updated
-   check if there are other clients which have accessed the same file
    within cache invalidation time (default 60sec and tunable)
-   if present, send notifications to those clients with the attributes
    info to be invalidated/refreshed on the client side.

:   For eg - WRITE fop would result in change in size, atime, ctime,
    mtime attributes.

###### Sequence diagram

                                                                      
            -------------       ----------------------             ------------             -----------------------              -------------                            
           |NFS-Client(C1)|     |NFS-Ganesha server(GC1)|         |Brick server|           |NFS-ganesha server(GC2)|            |NFS-Client(C2)|                      
            -------------       -----------------------            ------------             -----------------------              -------------                             
                 |                         |                           |                               |                               |                                    
                 |                         |                           |                               |                               |                                    
                 '                         '                           '                               '                               '                                    
                 '                         '                           '                               '                               '                                    
                 '  I/O on file1           '                           '                               '                               '                                    
                 '------------------------>'                           '                               '                               '                                    
                 '                         ' Send fop via rpc request  '                               '                               '                                    
                 '                         '-------------------------->'                               '                               '                                    
                 '                         '                           '                               '                               '                                    
                 '                         '                           '                               '                               '                                    
                 '                         '                     Make an upcall entry of               '                               '                                    
                 '                         '                     'GC1' for 'file1' in                  '                               '                                    
                 '                         '                      STACK_UNWIND path                    '                               '                                    
                 '                         '  Send fop response        '                               '                               '                                    
                 '                         '<------------------------- '                               '                               '                                    
                 '  Response to I/O        '                           '                               '                               '                                    
                 '<------------------------'                           '                               '                               '                                    
                 '                         '                           '                               '  Request an I/O on 'file1'    '                                    
                 '                         '                           '                               '<------------------------------'                                    
                 '                         '                           '                               '                               '                                    
                 '                         '                           '                               '                               '                                    
                 '                         '                           '  Send rpc request             '                               '                                    
                 '                         '                           '<------------------------------'                               '                                    
                 '                         '                           '                               '                               '                                    
                 '                         '                           '                               '                               '                                    
                 '                         '                      In STACK_UNWIND CBK path,            '                               '                                    
                 '                         '                      add upcall entry 'GC2' for           '                               '                                    
                 '                         '                       'file1'                             '                               '                                    
                 '                         '                           '                               '                               '                                    
                 '                         ' Send 'CACHE_INVALIDATE'   '                               '                               '                                    
                 '                         '        Upcall event       '                               '                               '                                    
                 '                         '<--------------------------'                               '                               '                                    
                 '                         '                           '   Send rpc response           '                               '                                    
                 '                         '                           '------------------------------>'                               '                                    
                 '                         '                           '                               '   Response to I/O             '                                    
                 '                         '                           '                               '------------------------------>'                                    
                 '                         '                           '                               '                               '                                    
                 '                         '                           '                               '                               '                                    
                 '                         '                           '                               '                               '                                    

Reaper thread
:   Incase of cache\_invalidation, the upcall states maintained are
    considered valid only if the corresponding client's last
    access\_time hasn't exceeded 60sec (default at present).
:   To clean-up the expired state entries, a new reaper thread will be
    spawned which will crawl through all the upcalls states, detect and
    cleanup the expired entries.

#### delegations/lease-locks

A file lease provides a mechanism whereby the process holding the lease
(the "lease holder") is notified when a process (the "lease breaker")
tries to perform a fop with conflicting access on the same file.

NFS Delegation (similar to lease\_locks) is a technique by which the
server delegates the management of a file to a client which guarantees
that no client can open the file in a conflicting mode.

Advantages of these locks is that it greatly reduces the interactions
between the server and the client for delegated files.

This feature now also provides the support to grant or process these
lease-locks/delegations for the files.

##### API to request lease

:   A new API has been introduced in "gfapi" for the applications to
    request or unlock the lease-locks.

:   This API will be an extension to the existing API "glfs\_posix\_lock
    (int fd, int cmd, struct flock fl)" which is used to request for
    posix locks, with below extra parameters -

-   lktype (byte-range or lease-lock or share-reservation)
-   lkowner (to differentiate between different application clients)

:   On receiving lease-lock request, the GlusterFS client uses existing
    rpc program "GFS3\_OP\_LK" to send lock request to the brick process
    but with lkflags denoting lease-lock set in the xdata of the
    request.

##### Leas-lock processing on the server-side

Add Lease
:   On receiving the lock request, the server (in the upcall xlator) now
    checks the lkflags first to determine if its lease-lock request.
    Once it identifies so and considering there are no lease-conflicts
    for that file, it

-   fetches the inode\_ctx for that inode entry
-   lookup/add the client entry to that upcall entry based on
    client\_t-\>client\_uid, with timestamp updated
-   checks whether there are any existing open-fds with conflicting
    access requests on that file. If yes bail out and do not grant the
    lease.
-   In addition, server now also need to keep-track and verify that
    there aren't any non-fd related fops (like SETATTR) being processed
    in parallel before granting lease. This is done by either

<!-- -->

     * not granting a lease irrespective of which client requested for those fops or
     * providing a mechanism for the applications to set clientid while doing each fop. Sever then can match the client-ids before deciding to grant lease.

-   Update the lease info in the client entry and mark it as lease
    granted.
-   Incase if there is already a lease-lock granted to the same client
    for the same fd, this request will be considered duplicate and a
    success is returned to the client.

Remove Lease
:   Similar to the above case "Add Lease", the server on receiving
    UNLOCK request for a lease-lock, it

-   fetches the inode\_ctx
-   lookup/add the client entry to that upcall entry based on
    client\_t-\>client\_uid, with timestamp updated
-   remove the lease granted to that client from that list.
-   Even if the lease not found, the server will return success (as done
    for POSIX locks).
-   After removing the lease, the server starts processing the fops from
    the blocked queue if there are any.

Lease-conflict check/Recalling lease-lock
:   For each fop issued by a client, server now first need to check if
    it conflicts with any exisiting lease-lock taken on that file. For
    that it first

-   fetches its inode\_ctx
-   verify if there are lease-locks granted with conflicting access to
    any other client for that file.

(Note: incase of same client, the assumption is that application will
handle all the conflict checks between its clients and block them if
necessary. However, in future we plan to provide a framework/API for
applications to set their client id, like lkwoner incase of locks,
before sending any fops for the server to identify and differentiate
them)

-   if yes, send upcall notifications to recall the lease-lock and
    either

`   * send EDELAY error incase if the fop is 'NON-BLOCKING'. Else`\
`   * add the fop to the blocking queue`

-   Trigger a timer event to notify if the recall doesn't happen within
    certain configured time.

Purge Lease

-   Incase if the client doesn't unlock the lease with in the recall
    timeout period, timer thread will trigger an event to purge that
    lease forcefully.
-   Post that, fops (if any) in the blocked queue are processed.

##### Sequence Diagram

            -------------       ----------------------             ------------             -----------------------              -------------                            
           |NFS-Client(C1)|     |NFS-Ganesha server(GC1)|         |Brick server|           |NFS-ganesha server(GC2)|            |NFS-Client(C2)|                      
            -------------       -----------------------            ------------             -----------------------              -------------                             
                 |                         |                           |                               |                               |                                    
                 '  Open on file1          '                           '                               '                               '                                    
                 '------------------------>'                           '                               '                               '                                    
                 '                         ' Send OPEN on 'file1'      '                               '                               '                                    
                 '                         '-------------------------->'                               '                               '                                    
                 '                         '                           '                               '                               '                                    
                 '                         '   OPEN response           '                               '                               '                                    
                 '                         '<--------------------------'                               '                               '                                    
                 '                         '                           '                               '                               '                                    
                 '                         ' LOCK on 'file1' with      '                               '                               '                                    
                 '                         '    LEASE_LOCK type        '                               '                               '                                    
                 '                         '-------------------------->'                               '                               '                                    
                 '                         '                           '                               '                               '                                    
                 '                         '                   Take a lease_lock for                   '                               '                                    
                 '                         '                       entire file range.                  '                               '                                    
                 '                         '                   If it suceeds, add an upcall            '                               '                                    
                 '                         '                    lease entry 'GC1' for 'file1'          '                               '                                    
                 '                         '  Send Success             '                               '                               '                                    
                 '                         '<------------------------- '                               '                               '                                    
                 '  Response to OPEN       '                           '                               '                               '                                    
                 '<------------------------'                           '                               '                               '                                    
                 '                         '                           '                               '  Conflicting I/O on 'file1'   '                                    
                 '                         '                           '                               '<------------------------------'                                    
                 '                         '                           '  Send rpc request             '                               '                                    
                 '                         '                           '<------------------------------'                               '                                    
                 '                         ' Send Upcall event         '                               '                               '                                    
                 '                         '   'RECALL_LEASE'          '                               '                               '                                    
                 '                         '<--------------------------'                               '                               '                                    
                 ' RECALL_DELEGATION       '                     (a)Now either block I/O               '                               '                                    
                 '<------------------------'                           or                              '                               '                                    
                 '                         '                      (b)  '     Send EDELAY/ERETRY        '                               '                                    
                 '                         '                           '------------------------------>'                               '                                    
                 '                         '                           '                               ' (b)SEND EDELAY/ERETRY         '                                    
                 ' Send I/O to flush data  '                           '                               '------------------------------>'                                    
                 '------------------------>'                           '                               '                               '                                    
                 '                         '   RPC reqeust for all fops'                               '                               '                                    
                 '                         '-------------------------->'                               '                               '                                    
                 '                         '                           '                               '                               '                                    
                 '                         ' Send rpc response         '                               '                               '                                    
                 '                         '<--------------------------'                               '                               '                                    
                 ' Send success            '                           '                               '                               '                                    
                 '<------------------------'                           '                               '                               '                                    
                 '                         '                           '                               '                               '                                    
                 ' Return DELEGATION       '                           '                               '                               '                                    
                 '------------------------>'                           '                               '                               '                                    
                 '                         ' UNLOCK request with type  '                               '                               '                                    
                 '                         '     LEASE_LOCK            '                               '                               '                                    
                 '                         '-------------------------->'                               '                               '                                    
                 '                         '                           '                               '                               '                                    
                 '                         '                    Unlock the lease_lk.                   '                               '                                    
                 '                         '                    (a) Unblock the fop                    '                               '                                    
                 '                         '  Send Success             '                               '                               '                                    
                 '                         '<--------------------------'(a) Send response to I/O       '                               '                                    
                 '                         '                           '------------------------------>'                               '                                    
                 ' Return Success          '                           '                               ' (a) SEND RESPONSE             '                                    
                 '<------------------------'                           '                               '------------------------------>'                                    
                 '                         '                           '                               '                               '                                    
                 '                         '                           '                               '                               '                                    
                 '                         '                           '                               '                               '                                    
                 '                         '                           '                               '                               '                                    
                                                                                                                                                                            

#### Upcall notifications processing on the client side

:   The structure of the upcall data sent by the server is noted in the
    "Documentation" section.
:   On receiving the upcall notifications, protocol/client xlator
    detects that its a callback event, decodes the upcall data sent
    ('gfs3\_upcall\_req' noted in the Documentation section) and passes
    the same to the parent translators.
:   On receiving these notify calls from protocol/client, parent
    translators (planning to use this infra) have to first processes the
    event\_type of the upcall data received and accordingly take the
    action.
:   Currently as this infra is used by only nfs-ganesha, these notify
    calls are directly sent to gfapi from protocol/client xlator.
:   For each of such events received, gfapi creates an entry and queues
    it to the list of upcall events received.

:   Sample entry structure -

<!-- -->

    struct _upcall_events_list {
            struct list_head upcall_entries;
            uuid_t gfid;
            upcall_event_type event_type;
            uint32_t flags;
    };
    typedef struct _upcall_events_list upcall_events_list;

:   Now either the application could choose to regularly poll for such
    upcall events or the gfapi can notify application via a signal or a
    cond-variable.

### Extentions

:   This framework could easily be extended to send any other event
    notifications to the client process.
:   A new event has to be added to the list of upcall event types
    (mentioned in Documentation section) and any extra data which need
    to be sent has to be added to gfs3\_upcall\_req structure.
:   On the client side, the translator (interested) should check for the
    event type and the data passed to take action accordingly.
:   FUSE can also make use of this feature to support lease-locks
:   A new performance xlator can be added to take lease-locks and cache
    I/O.

### Limitations

Rebalancing
:   At present, after rebalance, locks states are not migrated.
    Similarly, the state maintained by this new xlator will also be not
    migrated.
:   However, after migrating the file, since DHT does delete of the file
    on the source brick, incase of

-   cache-invalidation, we may falsely notify the client that the file
    is deleted. (Note: to avoid this at present, we do not send any
    "Destroy Flag")
-   delegations/lease locks present, the 'delete' will be blocked till
    that delegation is recalled. This way, the clients holding those
    locks can flush their data which will now be redirected to the new
    brick.

Self-Heal
:   If a brick process goes down, the replica brick (which maintain the
    same state) will takeover processing of all the fops.
:   But if later the first brick process comes back up, the healing of
    the upcall/lease-lock states is not done on that process.

Network Partitions
:   Incase if there are any network partitions between glusterfsd brick
    process and glusterfs client process, similar to lock states, the
    upcalls/lease-lock state maintained by this new xlator will also be
    lost.
:   However if there is a replica brick present, clients will get
    re-directed to that process (which still has the states maintained).
    This brick process will take care of checking the conflicts and
    sending notifications.
:   Maybe client could try reconnecting with the same client\_uid and
    replay the locks. But if any of those operations fail, gfapi will
    return 'EBADFD' to the applications. This enhancement will be
    considered for future.

Directory leases are not yet supported.
:   This feature at present mainly targets file-level
    delegations/leases.

Lease Upgrade
:   Read-to-write lease upgrade is not supported currently.

Heuristics
:   Have to maintain heuristics in Gluster as well to determine when to
    grant the lease/delegations.

Benefit to GlusterFS
--------------------

This feature is definitely needed to support NFS-Ganesha Multi-head and
Active-Active HA support.

Along with it, this infra may potentially can be used for

-   multi-protocol access
-   small-file performance improvements.
-   pNFS support.

Scope
-----

### Nature of proposed change

-   A new xlator 'Upcalls' will be introduced in the server-side stack
    to maintain the states and send callbacks.

-   This xlator will be ON only when Ganesha feature is enabled.

-   "client\_t" structure is modified to contain rpc connection details.

-   New procedures have been added to "Glusterfs Callback" rpc program
    for each of the notify events.

-   There will be support added on gfapi side to handle these upcalls
    sent and inform the applications accordingly.

-   Probably md-cache may also add support to handle these upcalls.

### Implications on manageability

A new xlator 'Upcalls' is added to the server vol file.

### Implications on presentation layer

Applications planning to use Upcall Infra have to invoke new APIs
provided by gfapi to receive these notifications.

### Implications on persistence layer

None.

### Implications on 'GlusterFS' backend

None

### Modification to GlusterFS metadata

None

### Implications on 'glusterd'

This infra is supported currently only when the new CLI option
introduced to enable Ganesha is ON. May need to revisit on this incase
if there are other consumers of this feature.

How To Test
-----------

-   Bring up Multi-head Ganesha servers.
-   Test if the I/Os performed using one head are reflected on the
    another server.
-   Test if delegations are granted and successfully recalled when
    needed.

User Experience
---------------

-   This infra will be controlled by a tunable (currently
    'nfs-ganesha.enable' option as it is the only consumer). If the
    option is off, fops will just pass through without any additional
    processing done.
-   But incase if its ON, the consumers of this infra may see some
    performance hit due to the additional state maintained, processed
    and more RPCs sent over wire incase of notifications.

Dependencies
------------

Gluster CLI to enable ganesha
:   It depends on the new [Gluster CLI
    option](http://www.gluster.org/community/documentation/index.php/Features/Gluster_CLI_for_ganesha)
    which is to be added to enable Ganesha.

Wireshark
:   In addition, the new RPC procedure introduced to send callbacks has
    to be added to the list of Gluster RPC Procedures supported by
    [Wireshark](https://forge.gluster.org/wireshark/pages/Todo).

Rebalance/Self-Heal/Tiering
:   This upcall state maintained is anologous to the locks state. Hence,

-   During rebalance or tiering of the files, along with the locks
    state, the state maintained by this xlator also need to be migrated
    to the new subvolume.

-   When there is self-heal support for the locks state, this xlator
    state also needs to be considered.

Filter-out duplicate notifications
:   Incase of replica bricks maintained by AFR/EC, the upcalls state is
    maintained and processed on all the replica bricks. This will result
    in duplicate notifications to be sent by all those bricks incase of
    non-idempotent fops. Also in case of distributed volumes, cache
    invalidation notifications on a directory entry will be sent by all
    the bricks part of that volume. Hence We need support to filter out
    such duplicate callback notifications.

:   The approach we shall take to address it is that,

-   add a new xlator on the client-side to track all the fops. Maybe
    create a unique transaction id and send it to the server.
-   Server needs to store this transaction id in the client info as part
    of upcall state.
-   While sending any notifications, add this transaction id too to the
    request.
-   Client (the new xlator) has to filter out duplicate requests based
    on the transaction ids received.

Special fops
:   During rebalance/self-heal, though it is not the client application
    which is doing the fops, brick process may still send the
    notifications. To avoid that, we need a register mechanism to let
    only those clients who register, to receive upcall notifications.

Cleanup during network disconnect - protocol/server
:   At present, incase of network disconnects between the
    glusterfs-server and the client, the protocol/server looks up the fd
    table associated with that client and sends 'flush' op for each of
    those fds to cleanup the locks associated with it.

:   We need similar support to flush the lease locks taken. Hence, while
    granting the lease-lock, we plan to associate that upcall\_entry
    with the corresponding fd\_ctx or inode\_ctx so that they can be
    easily tracked if needed to be cleaned up. Also it will help in
    faster lookup of the upcall entry while trying to process the fops
    using the same fd/inode.

Note: Above cleanup is done for the upcall state associated with only
lease-locks. For the other entries maintained (for eg:, for
cache-invalidations), the reaper thread will anyways clean-up those
stale entries once they get expired (i.e, access\_time \> 1min)

Replay the lease-locks taken
:   At present, replay of locks by the client xlator seems to have been
    disabled.
:   But when it is being enabled, we need to add support to replay
    lease-locks taken as well.

Documentation
-------------

Sample upcall request structure sent to the clients-

    struct gfs3_upcall_req {
            char gfid[16];  
            u_int event_type;
            u_int flags;
    };                      
    typedef struct gfs3_upcall_req gfs3_upcall_req;

    enum upcall_event_type_t {
            CACHE_INVALIDATION,
            RECALL_READ_DELEG,
            RECALL_READ_WRITE_DELEG
    };
    typedef enum upcall_event_type_t upcall_event_type;

    flags to be sent for inode update/invalidation-
    #define UP_NLINK   0x00000001   /* update nlink */
    #define UP_MODE    0x00000002   /* update mode and ctime */
    #define UP_OWN     0x00000004   /* update mode,uid,gid and ctime */
    #define UP_SIZE    0x00000008   /* update fsize */
    #define UP_TIMES   0x00000010   /* update all times */
    #define UP_ATIME   0x00000020   /* update atime only */
    #define UP_PERM    0x00000040   /* update fields needed for
                                       permission checking */
    #define UP_RENAME  0x00000080   /* this is a rename op -
                                       delete the cache entry */
    #define UP_FORGET  0x00000100   /* inode_forget on server side -
                                       invalidate the cache entry */
    #define UP_PARENT_TIMES   0x00000200   /* update parent dir times */
    #define UP_XATTR-FLAGS   0x00000400   /* update xattr */

    /* for fops - open, read, lk, which do not trigger upcalll notifications
     * but need to update to client info in the upcall state */
    #define UP_UPDATE_CLIENT        (UP_ATIME)

    /* for fop - write, truncate */
    #define UP_WRITE_FLAGS          (UP_SIZE | UP_TIMES)

    /* for fop - setattr */  
    #define UP_ATTR_FLAGS           (UP_SIZE | UP_TIMES | UP_OWN |        \
                                     UP_MODE | UP_PERM)
    /* for fop - rename */
    #define UP_RENAME_FLAGS         (UP_RENAME)

    /* to invalidate parent directory entries for fops -rename, unlink,
     * rmdir, mkdir, create */
    #define UP_PARENT_DENTRY_FLAGS  (UP_PARENT_TIMES)
            
    /* for fop - unlink, link, rmdir, mkdir */
    #define UP_NLINK_FLAGS          (UP_NLINK | UP_TIMES)

List of fops currently identified which trigger inode update/Invalidate
notifications to be sent are :

    fop                 -   flags to be sent                                   - UPDATE/          - Entries
                                                                                 INVALIDATION       affected
    ----------------------------------------------------------------------------
    writev              -   UP_WRITE_FLAGS                                      - INODE_UPDATE     - file
    truncate            -   UP_WRITE_FLAGS                                      - INODE_UPDATE     - file
    lk/lock             -   UP_UPDATE_CLIENT                                    - INODE_UPDATE     - file
    setattr             -   UP_ATTR_FLAGS                                       - INODE_UPDATE/INVALIDATE   - file
    rename              -  UP_RENAME_FLAGS, UP_PARENT_DENTRY_FLAGS              - INODE_INVALIDATE - both file and parent dir
    unlink              - UP_NLINK_FLAGS, UP_PARENT_DENTRY_FLAGS                - INODE_INVALIDATE - file & parent_dir
    rmdir               - UP_NLINK_FLAGS, UP_PARENT_DENTRY_FLAGS                - INODE_INVALIDATE - file & parent_dir
    link                - UP_NLINK_FLAGS, UP_PARENT_DENTRY_FLAGS                - INODE_UPDATE     - file & parent_dir 
    create              - UP_TIMES, UP_PARENT_DENTRY_FLAGS                      - INODE_UPDATE     - parent_dir
    mkdir               - UP_TIMES, UP_PARENT_DENTRY_FLAGS                      - INODE_UPDATE     - parent_dir
    setxattr            - UP_XATTR_FLAGS                                        - INODE_UPDATE     - file
    removexattr         - UP_UPDATE_CLIENT                                      - INODE_UPDATE     - file
    mknod               - UP_TIMES, UP_PARENT_DENTRY_FLAGS                      - INODE_UPDATE     - parent_dir
    symlink             - UP_TIMES, UP_PARENT_DENTRY_FLAGS                      - INODE_UPDATE     - file 

List of fops which result in delegations/lease-lock recall are:

    open
    read
    write
    truncate
    setattr
    lock
    link
    remove
    rename

Comments and Discussion
-----------------------

### TODO

-   Lease-locks implementation is currently work in progress [BZ
    1200268](https://bugzilla.redhat.com/show_bug.cgi?id=1200268)
-   Clean up expired client entries (in case of cache-invalidation).
    Refer to the section 'Cache Invalidation' [BZ
    1200267](https://bugzilla.redhat.com/show_bug.cgi?id=1200267)
-   At present, for cache-invalidation, callback notifications are sent
    in the fop path. Instead to avoid brick latency, have a mechanism to
    send it asynchronously. [BZ
    1200264](https://bugzilla.redhat.com/show_bug.cgi?id=1200264)
-   Filer out duplicate callback notifications [BZ
    1200266](https://bugzilla.redhat.com/show_bug.cgi?id=1200266)
-   Support for Directory leases.
-   Support for read-write Lease Upgrade
-   Have to maintain heuristics in Gluster as well to determine when to
    grant the lease/delegations.
