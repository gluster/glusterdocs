# Handling of users that belong to many groups

Users can belong to many different (UNIX) groups. These groups are generally
used to allow or deny permissions for executing commands or access to files and
directories.

The number of groups a user can belong to depends on the operating system, but
there are also components that support fewer groups. In Gluster, there are
different restrictions on different levels in the stack. The explanations in
this document should clarify which restrictions exist, and how these can be
handled.


## tl;dr

- if users belong to more than 90 groups, the brick processes need to resolve
  the secondary/auxiliary groups with the `server.manage-gids` volume option
- the linux kernels `/proc` filesystem provides up to 32 groups of a running
  process, if this is not sufficient the mount option `resolve-gids` can be
  used
- Gluster/NFS needs `nfs.server-aux-gids` when users accessing a Gluster volume
  over NFS belong to more than 16 groups

For all of the above options counts that the system doing the group resolving
must be configured (`nsswitch`, `sssd`, ..) to be able to get all groups when
only a UID is known.


## Limit in the GlusterFS protocol

When a Gluster client does some action on a Gluster volume, the operation is
sent in an RPC packet. This RPC packet contains an header with the credentials
of the user. The server-side receives the RPC packet and uses the credentials
from the RPC header to perform ownership operations and allow/deny checks.

The RPC header used by the GlusterFS protocols can contain at most ~93 groups.
In order to pass this limit, the server process (brick) receiving the RPC
procedure can do the resolving of the groups locally, and ignore the (too few)
groups from the RPC header.

This requires that the service process can resolve all of the users groups by
the UID of the client process. Most environments that have many groups, already
use a configuration where users and groups are maintained in a central
location. for enterprises it is common to manage users and their groups in
LDAP, Active Directory, NIS or similar.

To have the groups of a user resolved on the server-side (brick), the volume
option `server.manage-gids` needs to be set. Once this option is enabled, the
brick processes will not use the groups that the Gluster clients send, but will
use the POSIX `getgrouplist()` function to fetch them.

Because this is a protocol limitation, all clients, including FUSE mounts,
Gluster/NFS server and libgfapi applications are affected by this.


## Group limit with FUSE

The FUSE client gets the groups of the process that does the I/O by reading the
information from `/proc/$pid/status`. This file only contains up to 32 groups.
If client-side xlators rely on all groups of a process/user (like posix-acl),
these 32 groups could limit functionality.

For that reason a mount option has been added. With the `resolve-gids` mount
option, the FUSE client calls the POSIX `getgrouplist()` function instead of
reading `/proc/$pid/status`.


## Group limit for NFS

The NFS protocol (actually the AUTH_SYS/AUTH_UNIX RPC header) allows up to 16
groups. These are the groups that the NFS-server receives from NFS-clients.
Similar to the way the brick processes can resolve the groups on the
server-side, the NFS-server can take the UID passed by the NFS-client and use
that to resolve the groups. the volume option for that is
`nfs.server-aux-gids`.

Other NFS-servers offer options like this too. The Linux kernel nfsd server
uses `rpc.mountd --manage-gids`. NFS-Ganesha has the configuration option
`Manage_Gids`.


## Implications of these solutions

All of the mentioned options are disabled by default. one of the reasons is
that resolving groups is an expensive operation. in many cases there is no need
for supporting many groups and there could be a performance hit.

When groups are resolved, the list is cached. the validity of the cache is
configurable. the Gluster processes are not the only ones that cache these
groups. `nscd` or `sssd` also keep a cache when they handle the
`getgroupslist()` requests. When there are many requests, and querying the
groups from a centralized management system takes long, caches might benefit
from a longer validity.

An other, less obvious difference might be noticed too. Many processes that are
written with security in mind reduce the groups that the process can
effectively use. This is normally done with the `setegids()` function. When
storage processes do not honour the fewer groups that are effective, and the
processes use the UID to resolve all groups of a process, the groups that got
dropped with `setegids()` are added back again. this could lead to permissions
that the process should not have.
