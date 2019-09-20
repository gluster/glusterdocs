Troubleshooting File Locks
==========================


Use [statedumps](./statedump.md) to find and list the locks held
on files. The statedump output also provides information on each lock
with its range, basename, PID of the application holding the lock, and
so on. You can analyze the output to know about the locks whose
owner/application is no longer running or interested in that lock. After
ensuring that the no application is using the file, you can clear the
lock using the following `clear lock` commands.

1.  **Perform statedump on the volume to view the files that are locked
    using the following command:**

        # gluster volume statedump  inode

    For example, to display statedump of test-volume:

        # gluster volume statedump test-volume
        Volume statedump successful

    The statedump files are created on the brick servers in the` /tmp`
    directory or in the directory set using `server.statedump-path`
    volume option. The naming convention of the dump file is
    `<brick-path>.<brick-pid>.dump`.

    The following are the sample contents of the statedump file. It
    indicates that GlusterFS has entered into a state where there is an
    entry lock (entrylk) and an inode lock (inodelk). Ensure that those
    are stale locks and no resources own them.

        [xlator.features.locks.vol-locks.inode]
        path=/
        mandatory=0
        entrylk-count=1
        lock-dump.domain.domain=vol-replicate-0
        xlator.feature.locks.lock-dump.domain.entrylk.entrylk[0](ACTIVE)=type=ENTRYLK_WRLCK on basename=file1, pid = 714782904, owner=ffffff2a3c7f0000, transport=0x20e0670, , granted at Mon Feb 27 16:01:01 2012

        conn.2.bound_xl./gfs/brick1.hashsize=14057
        conn.2.bound_xl./gfs/brick1.name=/gfs/brick1/inode
        conn.2.bound_xl./gfs/brick1.lru_limit=16384
        conn.2.bound_xl./gfs/brick1.active_size=2
        conn.2.bound_xl./gfs/brick1.lru_size=0
        conn.2.bound_xl./gfs/brick1.purge_size=0

        [conn.2.bound_xl./gfs/brick1.active.1]
        gfid=538a3d4a-01b0-4d03-9dc9-843cd8704d07
        nlookup=1
        ref=2
        ia_type=1
        [xlator.features.locks.vol-locks.inode]
        path=/file1
        mandatory=0
        inodelk-count=1
        lock-dump.domain.domain=vol-replicate-0
        inodelk.inodelk[0](ACTIVE)=type=WRITE, whence=0, start=0, len=0, pid = 714787072, owner=00ffff2a3c7f0000, transport=0x20e0670, , granted at Mon Feb 27 16:01:01 2012

2.  **Clear the lock using the following command:**

        # gluster volume clear-locks

    For example, to clear the entry lock on `file1` of test-volume:

        # gluster volume clear-locks test-volume / kind granted entry file1
        Volume clear-locks successful
        vol-locks: entry blocked locks=0 granted locks=1

3.  **Clear the inode lock using the following command:**

        # gluster volume clear-locks

    For example, to clear the inode lock on `file1` of test-volume:

        # gluster  volume clear-locks test-volume /file1 kind granted inode 0,0-0
        Volume clear-locks successful
        vol-locks: inode blocked locks=0 granted locks=1

    Perform statedump on test-volume again to verify that the
    above inode and entry locks are cleared.


