Feature
-------

Provide a capability to:

-   Probe the type (posix or bd) of volume.
-   Provide list of capabilities of a xlator/volume. For example posix
    xlator could support zerofill, BD xlator could support offloaded
    copy, thin provisioning etc

Summary
-------

With multiple storage translators (posix and bd) being supported in
GlusterFS, it becomes necessary to know the volume type so that user can
issue appropriate calls that are relevant only to the a given volume
type. Hence there needs to be a way to expose the type of the storage
translator of the volume to the user.

BD xlator is capable of providing server offloaded file copy,
server/storage offloaded zeroing of a file etc. This capabilities should
be visible to the client/user, so that these features can be exploited.

Owners
------

M. Mohan Kumar  
Bharata B Rao.

Current status
--------------

BD xlator exports capability information through gluster volume info
(and --xml) output. For eg:

*snip of gluster volume info output for a BD based volume*

        Xlator 1: BD
        Capability 1: thin

*snip of gluster volume info --xml output for a BD based volume*

        <xlators>
          <xlator>
            <name>BD</name>
            <capabilities>
              <capability>thin</capability>
            </capabilities>
          </xlator>
        </xlators>

But this capability information should also exposed through some other
means so that a host which is not part of Gluster peer could also avail
this capabilities.

Exposing about type of volume (ie posix or BD) is still in conceptual
state currently and needs discussion.

Detailed Description
--------------------

1.  Type
-  BD translator supports both regular files and block device,
i,e., one can create files on GlusterFS volume backed by BD
translator and this file could end up as regular posix file or a
logical volume (block device) based on the user's choice. User
can do a setxattr on the created file to convert it to a logical
volume.
-  Users of BD backed volume like QEMU would like to know that it
is working with BD type of volume so that it can issue an
additional setxattr call after creating a VM image on GlusterFS
backend. This is necessary to ensure that the created VM image
is backed by LV instead of file.
-  There are different ways to expose this information (BD type of
volume) to user. One way is to export it via a getxattr call.

2.  Capabilities
-  BD xlator supports new features such as server offloaded file
copy, thin provisioned VM images etc (there is a patch posted to
Gerrit to add server offloaded file zeroing in posix xlator).
There is no standard way of exploiting these features from
client side (such as syscall to exploit server offloaded copy).
So these features need to be exported to the client so that they
can be used. BD xlator V2 patch exports these capabilities
information through gluster volume info (and --xml) output. But
if a client is not part of GlusterFS peer it can't run volume
info command to get the list of capabilities of a given
GlusterFS volume. Also GlusterFS block driver in qemu need to
get the capability list so that these features are used.

Benefit to GlusterFS
--------------------

Enables proper consumption of BD xlator and client exploits new features
added in both posix and BD xlator.

### Scope

Nature of proposed change
-------------------------

-   Quickest way to expose volume type to a client can be achieved by
    using getxattr fop. When a client issues getxattr("volume\_type") on
    a root gfid, bd xlator will return 1 implying its BD xlator. But
    posix xlator will return ENODATA and client code can interpret this
    as posix xlator.

-   Also capability list can be returned via getxattr("caps") for root
    gfid.

Implications on manageability
-----------------------------

None.

Implications on presentation layer
----------------------------------

N/A

Implications on persistence layer
---------------------------------

N/A

Implications on 'GlusterFS' backend
-----------------------------------

N/A

Modification to GlusterFS metadata
----------------------------------

N/A

Implications on 'glusterd'
--------------------------

N/A

How To Test
-----------

User Experience
---------------

Dependencies
------------

Documentation
-------------

Status
------

Patch : <http://review.gluster.org/#/c/4809/>

Status : Merged

Comments and Discussion
-----------------------
