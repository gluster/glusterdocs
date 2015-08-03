Feature
-------
Lockdep - runtime lock validator

Summary
-------

Lockdep is a "lock dependency correctness validator" at it's core. It observes and maps all locking rules as they occur dynamically, i.e., it keeps track of locking dependency (in a graph like data structure) between various locks at runtime. Whenever a new lock is about to be taken, the lockdep subsystem "validates" the locking rule against the set of existing rules (which are learnt over time as system is in use). If this lock is "inconsistent" with the set of existing rules, a probable deadlock is detected and logged. A successfull lock validation "adds" the new rule and things move forward.

Owners
------

Venky Shankar <vshankar@redhat.com>

Current status
--------------

Feature proposed.

Related Feature Requests and Bugs
---------------------------------

TBD

Detailed Description
--------------------

Lockdep helps in catching locking related deadlocks far before they are possibly hit. As codebase grows overtime, it's natural to have lots of "inter dependent" locks and it becomes hard (and define) locking orders. Lockdep ensures that such cases are caught even before they are encountered in real life, e.g.

	Thread 1: L1 -> L2
	Thread 2: L2 -> L1

The above example would surely deadlock in no time. These are probably the easier ones. Much more nastier ones include grabbing a lock in the signal handler with the main thread (or any other) already holding the lock (this is similar to acquiring a lock in an interrupt handler for a given CPU with a task running on _that_ CPU already holding the lock). Such cases are also caught by lockdep.

Benefit to GlusterFS
--------------------

Who doesn't want to be free from deadlocks :-)

Furthermore, lockdep would be disabled by default. Compiling with -DUSE_LOCKDEP would transparently enable it.

Scope
-----

#### Nature of proposed change

Possibly adding a wrapper to GlusterFS locking macros and maintaining a graph of locking rules. For reference see kernel/locking in the linux kernel source tree.

#### Implications on manageability

None.

#### Implications on presentation layer

None.

#### Implications on persistence layer

None.

#### Implications on 'GlusterFS' backend

None.

#### Modification to GlusterFS metadata

None.

#### Implications on 'glusterd'

None.

How To Test
-----------

Enable lockdep during compilation by passing "-DUSE_LOCKDEP" CFLAGS while running configure and run Gluster smoke/regression test suites.

User Experience
---------------

Nothing for end user though, but immesely helpful for developers.

Dependencies
------------

None.

Documentation
-------------

TBD.

Status
------

Design in progress.

Comments and Discussion
-----------------------

More than welcome :-)
