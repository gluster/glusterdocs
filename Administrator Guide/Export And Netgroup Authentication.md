## Exports and Netgroups Authentication for NFS

This feature adds Linux-style exports & netgroups authentication to Gluster's NFS server. More specifically, this feature allows users to restrict access specific IPs (exports authentication) or a netgroup (netgroups authentication), or a combination of both for both Gluster volumes and subdirectories within Gluster volumes. Netgroups are used in Unix environments to control access for NFS exports, remote logins and remote shells. Each netgroup has a unique name and defines a set of hosts, users, groups and other netgroups. This information is stored in files and gluster NFS server manage permission for clients based on those file

## Implications and Usage

Currently, gluster can restrict access to volumes through simple IP list. But this feature makes that capability more scalable by allowing large lists of IPs to be managed through a netgroup. Moreover it provides more granular permission handling on volumes like wildcard support, read-only permission  to certain client etc.

The file `/var/lib/glusterd/nfs/export` contains the details of machines which can be used as clients for that server.An typical export entry use the following format :

        /<export path> <host/netgroup> (options),..

Here export name can be gluster volume or subdirectory path inside that volume. Next it contains list of host/netgroup , followed by the options applicable to that entry.A string beginning with an '@' is treated as a netgroup and a string beginning without an @ is a host. The options include mount related parameters , right now options such as "sec", "ro/rw", "anonuid" valid one. If * is mention as host/netgroup field , then any client can mount that export path.

The file `/var/lib/glusterd/nfs/netgroup` should mention the expansion of each netgroup which mentioned  in the export file. An typical netgroup entry will look like :

        <netgroup name> ng1000\nng1000 ng999\nng999 ng1\nng1 ng2\nng2 (ip1,ip2,..)

The gluster NFS server will check the contents of these file after specific time intervals

## Volume Options

1. Enabling export/netgroup feature

        gluster volume set <volname> nfs.exports-auth-enable on

2. Changing the refresh interval for gluster NFS server

        gluster volume set <volname> nfs.auth-refresh-interval-sec <time in seconds>

3. Changing the cache interval for an export entry

        gluster volume set <volname> nfs.auth-cache-ttl-sec <time in seconds>

## Testing the export/netgroup file

An user should have the ability to check the validity of the files before applying the configuration. The "glusterfsd" command now has the following additional arguments that can be used to check the configuration:
-   --print-netgroups: Validate the netgroups file and print it out. For example,
    -    `glusterfsd --print-netgroups <name of the file>`

-   --print-exports: Validate the exports file and print it out. For example,
    -    `glusterfsd --print-export <name of the file>`


## Points to be noted.

1. This feature does not currently support all the options in the man page of exports, but we can easily add them.

2. The files `/var/lib/glusterd/nfs/export` and `/var/lib/glusterd/nfs/netgroup` should be created before setting the `nfs.exports-auth-enable` option in every node in Trusted Storage Pool.

3. These files are handled manually by the users. So that, their contents can be  different among the gluster nfs servers across Trusted Storage Pool . i.e  it is possible to have different authenticate mechanism for the gluster NFS servers in the same cluster.

4. Do not mixup this feature and authentication using `nfs.rpc-auth-allow`, `nfs.export-dir` which may result in inconsistency.

## Troubleshooting

After changing the contents of the file, if it is not reflected properly in the authentication mechanism , just restart the server using volume stop and start, So that gluster NFS server will forcefully read the contents of those files again.
