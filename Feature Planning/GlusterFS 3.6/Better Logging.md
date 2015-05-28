Feature
-------

Gluster logging enhancements to support message IDs per message

Summary
-------

Enhance gluster logging to provide the following features, SubFeature
--\> SF

- SF1: Add message IDs to message

- SF2: Standardize error num reporting across messages

- SF3: Enable repetitive message suppression in logs

- SF4: Log location and hierarchy standardization (in case anything is
further required here, analysis pending)

- SF5: Enable per sub-module logging level configuration

- SF6: Enable logging to other frameworks, than just the current gluster
logs

- SF7: Generate a catalogue of these message, with message ID, message,
reason for occurrence, recovery/troubleshooting steps.

Owners
------

Balamurugan Arumugam <barumuga@redhat.com>  
Krishnan Parthasarathi <kparthas@redhat.com>  
Krutika Dhananjay <kdhananj@redhat.com>  
Shyamsundar Ranganathan <srangana@redhat.com>

Current status
--------------

### Existing infrastructure:

Currently gf\_logXXX exists as an infrastructure API for all logging
related needs. This (typically) takes the form,

gf\_log(dom, levl, fmt...)

where,

		   dom: Open format string usually the xlator name, or "cli" or volume name etc.
		   levl: One of, GF_LOG_EMERG, GF_LOG_ALERT, GF_LOG_CRITICAL, GF_LOG_ERROR, GF_LOG_WARNING, GF_LOG_NOTICE, GF_LOG_INFO, GF_LOG_DEBUG, GF_LOG_TRACE
		   fmt: the actual message string, followed by the required arguments in the string

The log initialization happens through,

gf\_log\_init (void \*data, const char \*filename, const char \*ident)

where,

		   data: glusterfs_ctx_t, largely unused in logging other than the required FILE and mutex fields
		   filename: file name to log to
		   ident: Like syslog ident parameter, largely unused

The above infrastructure leads to logs of type, (sample extraction from
nfs.log)

		    [2013-12-08 14:17:17.603879] I [socket.c:3485:socket_init] 0-socket.ACL: SSL support is NOT enabled
		    [2013-12-08 14:17:17.603937] I [socket.c:3500:socket_init] 0-socket.ACL: using system polling thread
		    [2013-12-08 14:17:17.612128] I [nfs.c:934:init] 0-nfs: NFS service started
		    [2013-12-08 14:17:17.612383] I [dht-shared.c:311:dht_init_regex] 0-testvol-dht: using regex rsync-hash-regex = ^\.(.+)\.[^.]+$

### Limitations/Issues in the infrastructure

​1) Auto analysis of logs needs to be done based on the final message
string. Automated tools that can help with log message and related
troubleshooting options need to use the final string, which needs to be
intelligently parsed and also may change between releases. It would be
desirable to have message IDs so that such tools and trouble shooting
options can leverage the same in a much easier fashion.

​2) The log message itself currently does not use the \_ident\_ which
can help as we move to more common logging frameworks like journald,
rsyslog (or syslog as the case maybe)

​3) errno is the primary identifier of errors across gluster, i.e we do
not have error codes in gluster and use errno values everywhere. The log
messages currently do not lend themselves to standardization like
printing the string equivalent of errno rather than the actual errno
value, which \_could\_ be cryptic to administrators

​4) Typical logging infrastructures provide suppression (on a
configurable basis) for repetitive messages to prevent log flooding,
this is currently missing in the current infrastructure

​5) The current infrastructure cannot be used to control log levels at a
per xlator or sub module, as the \_dom\_ passed is a string that change
based on volume name, translator name etc. It would be desirable to have
a better module identification mechanism that can help with this
feature.

​6) Currently the entire logging infrastructure resides within gluster.
It would be desirable in scaled situations to have centralized logging
and monitoring solutions in place, to be able to better analyse and
monitor the cluster health and take actions.

This requires some form of pluggable logging frameworks that can be used
within gluster to enable this possibility. Currently the existing
framework is used throughout gluster and hence we need only to change
configuration and logging.c to enable logging to other frameworks (as an
example the current syslog plug that was provided).

It would be desirable to enhance this to provide a more robust framework
for future extensions to other frameworks. This is not a limitation of
the current framework, so much as a re-factor to be able to switch
logging frameworks with more ease.

​7) For centralized logging in the future, it would need better
identification strings from various gluster processes and hosts, which
is currently missing or suppressed in the logging infrastructure.

Due to the nature of enhancements proposed, it is required that we
better the current infrastructure for the stated needs and do some
future proofing in terms of newer messages that would be added.

Detailed Description
--------------------

NOTE: Covering details for SF1, SF2, and partially SF3, SF5, SF6. SF4/7
will be covered in later revisions/phases.

### Logging API changes:

​1) Change the logging API as follows,

From: gf\_log(dom, levl, fmt...)

To: gf\_msg(dom, levl, errnum, msgid, fmt...)

Where:

		   dom: Open string as used in the current logging infrastructure (helps in backward compat)
		   levl: As in current logging infrastructure (current levels seem sufficient enough to not add more levels for better debuggability etc.)
		   <new fields>
		   msgid: A message identifier, unique to this message FMT string and possibly this invocation. (SF1, lending to SF3)
		   errnum: The errno that this message is generated for (with an implicit 0 meaning no error number per se with this message) (SF2)

NOTE: Internally the gf\_msg would still be a macro that would add the
\_\_FILE\_\_ \_\_LINE\_\_ \_\_FUNCTION\_\_ arguments

​2) Enforce \_ident\_ in the logging initialization API, gf\_log\_init
(void \*data, const char \*filename, const char \*ident)

Where:

		ident would be the identifier string like, nfs, <mountpoint>, brick-<brick-name>, cli, glusterd, as is the case with the log file name that is generated today (lending to SF6)

#### What this achieves:

With the above changes, we now have a message ID per message
(\_msgid\_), location of the message in terms of which component
(\_dom\_) and which process (\_ident\_). The further identification of
the message location in terms of host (ip/name) can be done in the
framework, when centralized logging infrastructure is introduced.

#### Log message changes:

With the above changes to the API the log message can now appear in a
compatibility mode to adhere to current logging format, or be presented
as follows,

log invoked as: gf\_msg(dom, levl, ENOTSUP, msgidX)

Example: gf\_msg ("logchecks", GF\_LOG\_CRITICAL, 22, logchecks\_msg\_4,
42, "Forty-Two", 42);

Where: logchecks\_msg\_4 (GLFS\_COMP\_BASE + 4), "Critical: Format
testing: %d:%s:%x"

​1) Gluster logging framework (logged as)

		[2014-02-17 08:52:28.038267] I [MSGID: 1002] [logchecks.c:44:go_log] 0-logchecks: Informational: Format testing: 42:Forty-Two:2a [Invalid argument]

​2) syslog (passed as)

		Feb 17 14:17:42 somari logchecks[26205]: [MSGID: 1002] [logchecks.c:44:go_log] 0-logchecks: Informational: Format testing: 42:Forty-Two:2a [Invalid argument]

​3) journald (passed as)

		   sd_journal_send("MESSAGE=<vasprintf(dom, msgid(fmt))>",
		                       "MESSAGE_ID=msgid",
		                       "PRIORITY=levl",
		                       "CODE_FILE=`<fname>`", "CODE_LINE=`<lnum>", "CODE_FUNC=<fnnam>",
		                       "ERRNO=errnum",
		                       "SYSLOG_IDENTIFIER=<ident>"
		                       NULL);

​4) CEE (Common Event Expression) format string passed to any CEE
consumer (say lumberjack)

Based on generating @CEE JSON string as per specifications and passing
it the infrastructure in question.

#### Message ID generation:

​1) Some rules for message IDs

- Every message, even if it is the same message FMT, will have a unique
message ID - Changes to a specific message string, hence will not change
its ID and also not impact other locations in the code that use the same
message FMT

​2) A glfs-message-id.h file would contain ranges per component for
individual component based messages to be created without overlapping on
the ranges.

​3) <component>-message.h would contain something as follows,

	    #define GLFS_COMP_BASE         GLFS_MSGID_COMP_<component>
	    #define GLFS_NUM_MESSAGES       1
	    #define GLFS_MSGID_END          (GLFS_COMP_BASE + GLFS_NUM_MESSAGES + 1)
	    /* Messaged with message IDs */
	    #define glfs_msg_start_x GLFS_COMP_BASE, "Invalid: Start of messages"
	    /*------------*/
	    #define <component>_msg_1 (GLFS_COMP_BASE + 1), "Test message, replace with"\
	                       " original when using the template"
	    /*------------*/
	    #define glfs_msg_end_x GLFS_MSGID_END, "Invalid: End of messages"

​5) Each call to gf\_msg hence would be,

	   gf_msg(dom, levl, errnum, glfs_msg_x, ...)

#### Setting per xlator logging levels (SF5):

short description to be elaborated later

Leverage this-\>loglevel to override the global loglevel. This can be
also configured from gluster CLI at runtime to change the log levels at
a per xlator level for targeted debugging.

#### Multiple log suppression(SF3):

short description to be elaborated later

​1) Save the message string as follows, Msg\_Object(msgid,
msgstring(vasprintf(dom, fmt)), timestamp, repetitions)

​2) On each message received by the logging infrastructure check the
list of saved last few Msg\_Objects as follows,

2.1) compare msgid and on success compare msgstring for a match, compare
repetition tolerance time with current TS and saved TS in the
Msg\_Object

2.1.1) if tolerance is within limits, increment repetitions and do not
print message

2.1.2) if tolerance is outside limits, print repetition count for saved
message (if any) and print the new message

2.2) If none of the messages match the current message, knock off the
oldest message in the list printing any repetition count message for the
same, and stash new message into the list

The key things to remember and act on here would be to, minimize the
string duplication on each message, and also to keep the comparison
quick (hence base it off message IDs and errno to start with)

#### Message catalogue (SF7):

<short description to be elaborated later>

The idea is to use Doxygen comments in the <component>-message.h per
component, to list information in various sections per message of
consequence and later use Doxygen to publish this catalogue on a per
release basis.

Benefit to GlusterFS
--------------------

The mentioned limitations and auto log analysis benefits would accrue
for GlusterFS

Scope
-----

### Nature of proposed change

All gf\_logXXX function invocations would change to gf\_msgXXX
invocations.

### Implications on manageability

None

### Implications on presentation layer

None

### Implications on persistence layer

None

### Implications on 'GlusterFS' backend

None

### Modification to GlusterFS metadata

None

### Implications on 'glusterd'

None

How To Test
-----------

A separate test utility that tests various logs and formats would be
provided to ensure that functionality can be tested independent of
GlusterFS

User Experience
---------------

Users would notice changed logging formats as mentioned above, the
additional field of importance would be the MSGID:

Dependencies
------------

None

Documentation
-------------

Intending to add a logging.md (or modify the same) to elaborate on how a
new component should now use the new framework and generate messages
with IDs in the same.

Status
------

In development (see, <http://review.gluster.org/#/c/6547/> )

Comments and Discussion
-----------------------

<Follow here>