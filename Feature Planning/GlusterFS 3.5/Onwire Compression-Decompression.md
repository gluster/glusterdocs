Feature
=======

On-Wire Compression/Decompression

1. Summary
==========

Translator to compress/decompress data in flight between client and
server.

2. Owners
=========

-   Venky Shankar <vshankar@redhat.com>
-   Prashanth Pai <ppai@redhat.com>

3. Current Status
=================

Code has already been merged. Needs more testing.

The [initial submission](http://review.gluster.org/3251) contained a
`compress` option, which introduced [some
confusion](https://bugzilla.redhat.com/1053670). [A correction has been
sent](http://review.gluster.org/6765) to rename the user visible options
to start with `network.compression`.

TODO

-   Make xlator pluggable to add support for other compression methods
-   Add support for lz4 compression: <https://code.google.com/p/lz4/>

4. Detailed Description
=======================

-   When a writev call occurs, the client compresses the data before
    sending it to server. On the server, compressed data is
    decompressed. Similarly, when a readv call occurs, the server
    compresses the data before sending it to client. On the client, the
    compressed data is decompressed. Thus the amount of data sent over
    the wire is minimized.

-   Compression/Decompression is done using Zlib library.

-   During normal operation, this is the format of data sent over wire:
    <compressed-data> + trailer(8 bytes). The trailer contains the CRC32
    checksum and length of original uncompressed data. This is used for
    validation.

5. Usage
========

Turning on compression xlator:

        # gluster volume set <vol_name> network.compression on

Configurable options:

        # gluster volume set <vol_name> network.compression.compression-level 8
        # gluster volume set <vol_name> network.compression.min-size 50

6. Benefits to GlusterFS
========================

Fewer bytes transferred over the network.

7. Issues
=========

-   Issues with striped volumes. Compression xlator cannot work with
    striped volumes

-   Issues with write-behind: Mount point hangs when writing a file with
    write-behind xlator turned on. To overcome this, turn off
    write-behind entirely OR set "performance.strict-write-ordering" to
    on.

-   Issues with AFR: AFR v1 currently does not propagate xdata.
    <https://bugzilla.redhat.com/show_bug.cgi?id=951800> This issue has
    been resolved in AFR v2.

8. Dependencies
===============

Zlib library

9. Documentation
================

<http://review.gluster.org/#/c/7479/3/doc/network_compression.md>

10. Status
==========

Code merged upstream.