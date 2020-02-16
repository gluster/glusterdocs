Mandatory Locks
===============
Support for mandatory locks inside GlusterFS does not converge all by itself to what Linux kernel provides to user space file systems. Here we enforce core mandatory lock semantics with and without the help of file mode bits. Please read through the [design specification](https://github.com/gluster/glusterfs-specs/blob/master/done/GlusterFS%203.8/Mandatory%20Locks.md) which explains the whole concept behind the mandatory locks implementation done for GlusterFS.

## Implications and Usage
By default, mandatory locking will be disabled for a volume and a volume set options is available to configure volume to operate under 3 different mandatory locking modes.

## Volume Option

```console
gluster volume set <VOLNAME> locks.mandatory-locking <off / file / forced / optimal>
```

**off**      - Disable mandatory locking for specified volume.<br/>
**file**     - Enable Linux kernel style mandatory locking semantics with the help of mode bits (not well tested)<br/>
**forced**   - Check for conflicting byte range locks for every data modifying operation in a volume<br/>
**optimal**  - Combinational mode where POSIX clients can live with their advisory lock semantics which will still honour the mandatory locks acquired by other clients like SMB.

**Note**:- Please refer the design doc for more information on these key values.

#### Points to be remembered
* Valid key values available with mandatory-locking volume set option are taken into effect only after a subsequent start/restart of the volume.
* Due to some outstanding issues, it is recommended to turn off the performance translators in order to have the complete functionality of mandatory-locks when volume is configured in any one of the above described mandatory-locking modes. Please see the 'Known issue' section below for more details.

#### Known issues
* Since the whole logic of mandatory-locks are implemented within the locks translator loaded at the server side, early success returned to fops like open, read, write to upper/application layer by performance translators residing at the client side will impact the intended functionality of mandatory-locks. One such issue is being tracked in the following bugzilla report:

    <https://bugzilla.redhat.com/show_bug.cgi?id=1194546>

* There is a possible race window uncovered with respect to mandatory locks and an ongoing read/write operation. For more details refer the bug report given below:

    <https://bugzilla.redhat.com/show_bug.cgi?id=1287099>
