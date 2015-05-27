Feature
-------

AFR CLI enhancements

SUMMARY
-------

Presently the AFR reporting via CLI has lots of problems in the
representation of logs because of which they may not be able to use the
data effectively. This feature is to correct these problems and provide
a coherent mechanism to present heal status,information and the logs
associated.

Owners
------

Venkatesh Somayajulu  
Raghavan

Current status
--------------

There are many bugs related to this which indicates the current status
and why these requirements are required.

​1) 924062 - gluster volume heal info shows only gfids in some cases and
sometimes names. This is very confusing for the end user.

​2) 852294 - gluster volume heal info hangs/crashes when there is a
large number of entries to be healed.

​3) 883698 - when self heal daemon is turned off, heal info does not
show any output. But healing can happen because of lookups from IO path.
Hence list of entries to be healed still needs to be shown.

​4) 921025 - directories are not reported when list of split brain
entries needs to be displayed.

​5) 981185 - when self heal daemon process is offline, volume heal info
gives error as "staging failure"

​6) 952084 - We need a command to resolve files in split brain state.

​7) 986309 - We need to report source information for files which got
healed during a self heal session.

​8) 986317 - Sometimes list of files to get healed also includes files
to which IO s being done since the entries for these files could be in
the xattrop directory. This could be confusing for the user.

There is a master bug 926044 that sums up most of the above problems. It
does give the QA perspective of the current representation out of the
present reporting infrastructure.

Detailed Description
--------------------

​1) One common thread among all the above complaints is that the
information presented to the user is <B>FUD</B> because of the following
reasons:

(a) Split brain itself is a scary scenario especially with VMs.  
(b) The data that we present to the users cannot be used in a stable
    manner for them to get to the list of these files. <I>For ex:</I> we
    need to give mechanisms by which he can automate the resolution out
    of split brain.  
(c) The logs that are generated are all the more scarier since we
    see repetition of some error lines running into hundreds of lines.
    Our mailing lists are filled with such emails from end users.  

Any data is useless unless it is associated with an event. For self
heal, the event that leads to self heal is the loss of connectivity to a
brick from a client. So all healing info and especially split brain
should be associated with such events.

The following is hence the proposed mechanism:

(a) Every loss of a brick from client's perspective is logged and
    available via some ID. The information provides the time from when
    the brick went down to when it came up. Also it should also report
    the number of IO transactions(modifies) that hapenned during this
    event.  
(b) The list of these events are available via some CLI command. The
    actual command needs to be detailed as part of this feature.  
(c) All volume info commands regarding list of files to be healed,
    files healed and split brain files should be associated with this
    event(s).  

​2) Provide a mechanism to show statistics at a volume and replica group
level. It should show the number of files to be healed and number of
split brain files at both the volume and replica group level.

​3) Provide a mechanism to show per volume list of files to be
healed/files healed/split brain in the following info:

This should have the following information:

(a) File name  
(b) Bricks location  
(c) Event association (brick going down)  
(d) Source  
(v) Sink

​4) Self heal crawl statistics - Introduce new CLI commands for showing
more information on self heal crawl per volume.

(a) Display why a self heal crawl ran (timeouts, brick coming up)  
(b) Start time and end time  
(c) Number of files it attempted to heal  
(d) Location of the self heal daemon

​5) Scale the logging infrastructure to handle huge number of file list
that needs to be displayed as part of the logging.

(a) Right now the system crashes or hangs in case of a high number
    of files.  
(b) It causes CLI timeouts arbitrarily. The latencies involved in
    the logging have to be studied (profiled) and mechanisms to
    circumvent them have to be introduced.  
(c) All files are displayed on the output. Have a better way of
    representing them.

Options are:

(a) Maybe write to a glusterd log file or have a seperate directory
    for afr heal logs.  
(b) Have a status kind of command. This will display the current
    status of the log building and maybe have batched way of
    representing when there is a huge list.

​6) We should provide mechanism where the user can heal split brain by
some pre-established policies:

(a) Let the system figure out the latest files (assuming all nodes
    are in time sync) and choose the copies that have the latest time.  
(b) Choose one particular brick as the source for split brain and
    heal all split brains from this brick.  
(c) Just remove the split brain information from changelog. We leave
    the exercise to the user to repair split brain where in he would
    rewrite to the split brained files. (right now the user is forced to
    remove xattrs manually for this step).

Benefits to GlusterFS
--------------------

Makes the end user more aware of healing status and provides statistics.

Scope
-----

6.1. Nature of proposed change

Modification to AFR and CLI and glusterd code

6.2. Implications on manageability

New CLI commands to be added. Existing commands to be improved.

6.3. Implications on presentation layer

N/A

6.4. Implications on persistence layer

N/A

6.5. Implications on 'GlusterFS' backend

N/A

6.6. Modification to GlusterFS metadata

N/A

6.7. Implications on 'glusterd'

Changes for healing specific commands will be introduced.

How To Test
-----------

See documentation session

User Experience
---------------

*Changes in CLI, effect on User experience...*

Documentation
-------------

<http://review.gluster.org/#/c/7792/1/doc/features/afr-statistics.md>

Status
------

Patches :

<http://review.gluster.org/6044> <http://review.gluster.org/4790>

Status:

Merged