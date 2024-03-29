# Managing Directory Quota

Directory quotas in GlusterFS allow you to set limits on the usage of the disk
space by directories or volumes. The storage administrators can control
the disk space utilization at the directory and/or volume levels in
GlusterFS by setting limits to allocatable disk space at any level in
the volume and directory hierarchy. This is particularly useful in cloud
deployments to facilitate the utility billing model.

> **Note:** For now, only Hard limits are supported. Here, the limit cannot be
> exceeded, and attempts to use more disk space or inodes beyond the set
> limit are denied.

System administrators can also monitor the resource utilization to limit
the storage for the users depending on their role in the organization.

You can set the quota at the following levels:

- **Directory level** – limits the usage at the directory level
- **Volume level** – limits the usage at the volume level

> **Note:** You can set the quota limit on an empty directory. The quota limit will be automatically enforced when files are added to the directory.

## Enabling Quota

You must enable Quota to set disk limits.

**To enable quota:**

Use the following command to enable quota:

```console
gluster volume quota <VOLNAME> enable
```

For example, to enable quota on the test-volume:

```console
# gluster volume quota test-volume enable
Quota is enabled on /test-volume
```

## Disabling Quota

You can disable Quota if needed.

**To disable quota:**

Use the following command to disable quota:

```console
gluster volume quota <VOLNAME> disable
```

For example, to disable quota translator on the test-volume:

```console
# gluster volume quota test-volume disable
Quota translator is disabled on /test-volume
```

## Setting or Replacing Disk Limit

You can create new directories in your storage environment and set the
disk limit or set disk limit for the existing directories. The directory
name should be relative to the volume with the export directory/mount
being treated as "/".

**To set or replace disk limit:**

Set the disk limit using the following command:

```console
gluster volume quota <VOLNAME> limit-usage <DIR> <HARD_LIMIT>
```

For example, to set a limit on data directory on the test-volume where
data is a directory under the export directory:

```console
# gluster volume quota test-volume limit-usage /data 10GB
Usage limit has been set on /data
```

> **Note**
> In a multi-level directory hierarchy, the strictest disk limit
> will be considered for enforcement. Also, whenever the quota limit
> is set for the first time, an auxiliary mount point will be
> created under /var/run/gluster/<VOLNAME>. This is just like any
> other mount point with some special permissions and remains until
> the quota is disabled. This mount point is being used by quota to set
> and display limits and lists respectively.

## Displaying Disk Limit Information

You can display disk limit information on all the directories on which
the limit is set.

**To display disk limit information:**

- Display disk limit information of all the directories on which limit
  is set, using the following command:

      gluster volume quota <VOLNAME> list

  For example, to see the set disks limit on the test-volume:

      # gluster volume quota test-volume list
      /Test/data    10 GB       6 GB
      /Test/data1   10 GB       4 GB

- Display disk limit information on a particular directory on which
  limit is set, using the following command:

      gluster volume quota <VOLNAME> list <DIR>

  For example, to view the set limit on /data directory of test-volume:

      # gluster volume quota test-volume list /data
      /Test/data    10 GB       6 GB

### Displaying Quota Limit Information Using the df Utility

You can create a report of the disk usage using the df utility by considering quota limits. To generate a report, run the following command:

```console
gluster volume set <VOLNAME> quota-deem-statfs on
```

In this case, the total disk space of the directory is taken as the quota hard limit set on the directory of the volume.

> **Note**
> The default value for quota-deem-statfs is on when the quota is enabled and it is recommended to keep quota-deem-statfs on.

The following example displays the disk usage when quota-deem-statfs is off:

```console
# gluster volume set test-volume features.quota-deem-statfs off
volume set: success

# gluster volume quota test-volume list
Path            Hard-limit    Soft-limit    Used      Available
---------------------------------------------------------------
/               300.0GB        90%          11.5GB    288.5GB
/John/Downloads  77.0GB        75%          11.5GB     65.5GB
```

Disk usage for volume test-volume as seen on client1:

```console
# df -hT /home
Filesystem           Type            Size  Used Avail Use% Mounted on
server1:/test-volume fuse.glusterfs  400G   12G  389G   3% /home
```

The following example displays the disk usage when quota-deem-statfs is on:

```console
# gluster volume set test-volume features.quota-deem-statfs on
volume set: success

# gluster vol quota test-volume list
Path        Hard-limit    Soft-limit     Used     Available
-----------------------------------------------------------
/              300.0GB        90%        11.5GB     288.5GB
/John/Downloads 77.0GB        75%        11.5GB     65.5GB
```

Disk usage for volume test-volume as seen on client1:

```console
# df -hT /home
Filesystem            Type            Size  Used Avail Use% Mounted on
server1:/test-volume  fuse.glusterfs  300G   12G  289G   4% /home
```

The quota-deem-statfs option when set to on, allows the administrator to make the user view the total disk space available on the directory as the hard limit set on it.

## Updating Memory Cache Size

### Setting Timeout

For performance reasons, quota caches the directory sizes on the client. You
can set a timeout indicating the maximum valid duration of directory sizes
in the cache, from the time they are populated.

For example: If multiple clients are writing to a single
directory, there are chances that some other client might write till the
quota limit is exceeded. However, this new file-size may not get
reflected in the client till the size entry in the cache has become stale
because of timeout. If writes happen on this client during this
duration, they are allowed even though they would lead to exceeding of
quota-limits, since the size in the cache is not in sync with the actual size.
When a timeout happens, the size in the cache is updated from servers and will
be in sync and no further writes will be allowed. A timeout of zero will
force fetching of directory sizes from the server for every operation that
modifies file data and will effectively disable directory size caching
on the client-side.

**To update the memory cache size:**

Use the following command to update the memory cache size:

1. Soft Timeout: The frequency at which the quota server-side translator checks the volume usage when the usage is below the soft limit. The soft timeout is in effect when the disk usage is less than the soft limit.

```console
gluster volume set <VOLNAME> features.soft-timeout <time>
```

2. Hard Timeout: The frequency at which the quota server-side translator checks the volume usage when the usage is above the soft limit. The hard timeout is in effect when the disk usage is between the soft limit and the hard limit.

```console
gluster volume set <VOLNAME> features.hard-timeout <time>
```

For example, to update the memory cache size for every 5 seconds on test-volume in case of hard-timeout:

```console
# gluster volume set test-volume features.hard-timeout 5
Set volume successful
```

## Setting Alert Time

Alert time is the frequency at which you want your usage information to be logged after you reach the soft limit.

**To set the alert time:**

Use the following command to set the alert time:

```console
gluster volume quota <VOLNAME> alert-time <time>
```

> **Note:**
> The default alert-time is one week.

For example, to set the alert time to one day:

```console
# gluster volume quota test-volume alert-time 1d
volume quota : success
```

## Removing Disk Limit

You can remove the set disk limit if you do not want a quota anymore.

**To remove disk limit:**

Use the following command to remove the disk limit set on a particular directory:

```console
gluster volume quota <VOLNAME> remove <DIR>
```

For example, to remove the disk limit on /data directory of
test-volume:

```console
# gluster volume quota test-volume remove /data
Usage limit set on /data is removed
```
