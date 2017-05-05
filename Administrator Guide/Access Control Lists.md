# POSIX Access Control Lists

POSIX Access Control Lists (ACLs) allow you to assign different
permissions for different users or groups even though they do not
correspond to the original owner or the owning group.

>For example - User `john` creates a file but does not want to allow anyone
to do anything with this file, except another user, `antony` (even though
there are other users that belong to the group john).

This means, in addition to the file owner, the file group, and others,
additional users and groups can be granted or denied access by using
POSIX ACLs.

## Activating POSIX ACLs Support

To use POSIX ACLs for a file or directory, the partition of the file or
directory must be mounted with POSIX ACLs support.

### To activate POSIX ACLs support on a server

1. To mount the backend export directories for POSIX ACLs support, use the
following command:

	`# mount -o acl `

	For example:

	`# mount -o acl /dev/sda1 /export1 `

	Alternatively, if the partition is listed in the `/etc/fstab` file, add the following entry for the partition to include the POSIX ACLs option:

	`LABEL=/work /export1 ext3 rw, acl 14 `

### To activate POSIX ACLs support on a client

1. To mount the glusterfs volumes for POSIX ACLs support, use the following
command:

	`# mount –t glusterfs -o acl `

	For example:

	`# mount -t glusterfs -o acl 198.192.198.234:glustervolume /mnt/gluster`

## Setting POSIX ACLs

You can set two types of POSIX ACLs (Access Control Lists): access ACLs and default
ACLs. You can use access ACLs to grant permission for a specific file or
directory. You can use default ACLs only on a directory but if a file
inside that directory does not have an ACLs, it inherits the permissions
of the default ACLs of the directory.

You can set ACLs for per user, per group, for users not in the user
group for the file, and using the effective right mask.

## Setting Access ACLs

You can apply access ACLs to grant permission for both files and
directories.

### To set or modify Access ACLs###

1. Set or modify access ACLs use the following command:

	`# setfacl –m  file `
1. See the section on ACL entry types for a description of the types you can use.

## ACL entry types

The ACL entry types are the POSIX ACLs representations of owner, group,
and other.

Permissions must be a combination of the characters `r` (read), `w`
(write), and `x` (execute). You must specify the ACL entry in the
following format and can specify multiple entry types separated by
commas.


  
ACL Entry | Description
  --- | ---
  u:uid:\<permission\> | Sets the access ACLs for a user. You can specify user name or UID
  g:gid:\<permission\> | Sets the access ACLs for a group. You can specify group name or GID.
  m:\<permission\> | Sets the effective rights mask. The mask is the combination of all access permissions of the owning group and all of the user and group entries.
  o:\<permission\> | Sets the access ACLs for users other than the ones in the group for the file.

If a file or directory already has a POSIX ACLs, and the setfacl
command is used, the additional permissions are added to the existing
POSIX ACLs or the existing rule is modified.

For example, to give read and write permissions to user `antony`:

`# setfacl -m u:antony:rw /mnt/gluster/data/testfile `

## Setting Default ACLs

You can apply default ACLs only to directories. They determine the
permissions of a file system objects that inherits from its parent
directory when it is created.

### To set default ACLs

1. Set default ACLs for files and directories using the following
command:

    `# setfacl –m –-set `

Permissions must be a combination of the characters r (read), w (write), and x (execute). Specify the ACL entry_type as described below, separating multiple entry types with commas.
ACL Entry | Description
  --- | ---
  u:uid:\<permission\> | Sets the access ACLs for a user. You can specify user name or UID
  g:gid:\<permission\> | Sets the access ACLs for a group. You can specify group name or GID.
  m:\<permission\> | Sets the effective rights mask. The mask is the combination of all access permissions of the owning group and all of the user and group entries.
  o:\<permission\> | Sets the access ACLs for users other than the ones in the group for the file.

For example, to set the default ACLs for the /data directory to read for
users not in the user group:

`# setfacl –m --set o::r /mnt/gluster/data `

> **Note**
>
> An access control list set for an individual file can override the default
> ACL's permissions.

### Effects of a Default ACL

A directory's default ACLs are passed to the files and subdirectories in it based on these rules:
-   A subdirectory inherits the default ACL of the parent directory both as its default ACLs and as an access ACL.
-   A file inherits the default ACL as its access ACL.

## Retrieving POSIX ACLs

You can view the existing POSIX ACLs for a file or directory.

### To view existing POSIX ACLs

1. View the existing access ACLs of a file using the following command:

    `# getfacl `

    For example, to view the existing POSIX ACLs for `sample.jpg`, type:

       # getfacl /mnt/gluster/data/test/sample.jpg
        # owner: antony
        # group: antony
        user::rw-
        group::rw-
        other::r--

1. View the default ACLs of a directory using the following command:

    `# getfacl `

    For example, to view the existing ACLs for /data/doc

       # getfacl /mnt/gluster/data/doc
        # owner: antony
        # group: antony
        user::rw-
        user:john:r--
        group::r--
        mask::r--
        other::r--
        default:user::rwx
        default:user:antony:rwx
        default:group::r-x
        default:mask::rwx
        default:other::r-x

## Removing POSIX ACLs
Removing the POSIX permissions from an entity will mean that the user or group cannot access that resource anymore
### To remove all the permissions for a user, groups, or others
1. Type the following command:

    `# setfacl -x `

#### setfaclentry_type Options

The ACL entry_type translates to the POSIX ACL representations of owner, group, and other.

Permissions must be a combination of the characters r (read), w (write), and x (execute). Specify the ACL entry_type as described below, separating multiple entry types with commas.

ACL Entry | Description
  --- | ---
  u:uid:\<permission\> | Sets the access ACLs for a user. You can specify user name or UID
  g:gid:\<permission\> | Sets the access ACLs for a group. You can specify group name or GID.
  m:\<permission\> | Sets the effective rights mask. The mask is the combination of all access permissions of the owning group and all of the user and group entries.
  o:\<permission\> | Sets the access ACLs for users other than the ones in the group for the file.

For example, to remove all permissions from the user `antony`, type:

`# setfacl -x u:antony /mnt/gluster/data/test-file`

## Samba and ACLs

If you are using Samba to access GlusterFS FUSE mount, then POSIX ACLs
are enabled by default. Samba has been compiled with the
`--with-acl-support` option, so no special flags are required when
accessing or mounting a Samba share.

## NFS and ACLs

Currently GlusterFS supports POSIX ACL configuration through NFS mount,
i.e. setfacl and getfacl commands work through NFS mount.
