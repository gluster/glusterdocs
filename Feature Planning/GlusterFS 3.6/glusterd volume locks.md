As of today most gluster commands take a cluster wide lock, before
performing their respective operations. As a result any two gluster
commands, which have no interdependency with each other, can't be
executed simultaneously. To remove this interdependency we propose to
replace this cluster wide lock with a volume specific lock, so that two
operations on two different volumes can be performed simultaneously.

​1. We classify all gluster operations in three different classes :
Create volume, Delete volume, and volume specific operations.

​2. At any given point of time, we should allow two simultaneous
operations (create, delete or volume specific), as long as each both the
operations are not happening on the same volume.

​3. If two simultaneous operations are performed on the same volume, the
operation which manages to acquire the volume lock will succeed, while
the other will fail. Also both might fail to acquire the volume lock on
the cluster, in which case both the operations will fail.

In order to achieve this, we propose a locking engine, which will
receive lock requests from these three types of operations. Each such
request for a particular volume will contest for the same volume lock
(based on the volume name and the node-uuid). For example, a delete
volume command for volume1 and a volume status command for volume 1 will
contest for the same lock (comprising of the volume name, and the uuid
of the node winning the lock), in which case, one of these commands will
succeed and the other one will not, failing to acquire the lock.

Whereas, if two operations are simultaneously performed on a different
volumes they should happen smoothly, as both these operations would
request the locking engine for two different locks, and will succeed in
locking them in parallel.

We maintain a global list of volume-locks (using a dict for a list)
where the key is the volume name, and which saves the uuid of the
originator glusterd. These locks are held and released per volume
transaction.

In order to acheive multiple gluster operations occuring at the same
time, we also separate opinfos in the op-state-machine, as a part of
this patch. To do so, we generate a unique transaction-id (uuid) per
gluster transaction. An opinfo is then associated with this transaction
id, which is used throughout the transaction. We maintain a run-time
global list(using a dict) of transaction-ids, and their respective
opinfos to achieve this.

Gluster devel Mailing Thread:
<http://lists.gnu.org/archive/html/gluster-devel/2013-09/msg00042.html>