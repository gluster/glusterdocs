# Performance tuning

## Enable Metadata cache
Metadata caching improves performance in almost all the workloads, except for use cases
with most of the workload accessing a file sumultaneously from multiple clients.
 1. Execute the following command to enable metadata caching and cache invalidation:
    ```
    # gluster volume set <volname> group metadata-cache
    ```
    This group command enables caching of stat and xattr information of a file or directory.
    The caching is refreshed every 10 min, and cache-invalidation is enabled to ensure cache
    consistency.

 2. To increase the number of files that can be cached, execute the following command:
    ```
    # gluster volume set <volname> network.inode-lru-limit <n>
    ```
    n, is set to 50000. It can be increased if the number of active files in the volume
    is very high. Increasing this number increases the memory footprint of the brick processes.

 3. Execute the following command to enable samba specific metadata caching:
    ```
    # gluster volume set <volname> cache-samba-metadata on
    ```

 4. By default, some xattrs are cached by gluster like: capability xattrs, ima xattrs
    ACLs, etc. If there are any other xattrs that are used by the application using
    the Gluster storage, execute the following command to add these xattrs to the metadata
    cache list:
    ```
    # gluster volume set <volname> xattr-cache-list "comma separated xattr list"
    ```
    Eg:
    ```
    # gluster volume set <volname> xattr-cache-list "user.org.netatalk.*,user.swift.metadata"
    ```

## Directory operations
Along with enabling the metadata caching, the following options can be set to
increase performance of directory operations:

   ### Directory listing Performance:

   - Enable `parallel-readdir`
    ```
    # gluster volume set <VOLNAME> performance.readdir-ahead on
    # gluster volume set <VOLNAME> performance.parallel-readdir on
    ```

   ### File/Directory Create Performance

   - Enable `nl-cache`
    ```
    # gluster volume set <volname> group nl-cache
    # gluster volume set <volname> nl-cache-positive-entry on
    ```

The above command also enables cache invalidation and increases the timeout to
10 minutes

## Small file Read operations
For use cases with dominant small file reads, enable the following options

    # gluster volume set <volname> performance.cache-invalidation on
    # gluster volume set <volname> features.cache-invalidation on
    # gluster volume set <volname> performance.qr-cache-timeout 600 --> 10 min recommended setting
    # gluster volume set <volname> cache-invalidation-timeout 600 --> 10 min recommended setting

This command enables caching of the content of small file, in the client cache.
Enabling cache invalidation ensures cache consistency.

The total cache size can be set using

    # gluster volume set <volname> cache-size <size>

By default, the files with size `<=64KB` are cached. To change this value:

    # gluster volume set <volname> performance.cache-max-file-size <size>

Note that the `size` arguments use SI unit suffixes, e.g. `64KB` or `2MB`.
