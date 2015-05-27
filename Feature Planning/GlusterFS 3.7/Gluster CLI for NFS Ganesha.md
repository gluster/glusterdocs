Feature
-------

Gluster CLI support to manage nfs-ganesha exports.

Summary
-------

NFS-ganesha support for GlusterFS volumes has been operational for quite
some now. In the upcoming release, we intend to provide gluster CLI
commands to manage nfs-ganesha exports analogous to the commands
provided for Gluster-NFS. CLI commands to support ganesha specific
options shall also be introduced.

Owners
------

Meghana Madhusudhan

Current status
--------------

1.  Options nfs-ganesha.enable and nfs-ganesha.host defined in
    gluster-nfs code.
2.  Writing into config files and starting nfs-ganesha is done as part
    of hook scripts.
3.  User has to manually stop gluster-nfs and configure DBus interface.(
    Required to add/remove exports dynamically)
4.  Volume level options

		gluster vol set testvol nfs-ganesha.host 10.70.43.78
		gluster vol set testvol nfs-ganesha.enable on

Drawbacks
---------

1.  Volume set options show success status irrespective of what the
    outcome is. Post phase of the hook scipts do not allow us to handle
    errors.
2.  Multi-headed ganesha scenarios were difficult to avoid in this
    approach.

Related Feature Requests and Bugs
---------------------------------

Detailed Description
--------------------

Benefit to GlusterFS
--------------------

These CLI options is aimed to make the switch between gluster-nfs and
nfs-ganesha seamless. The approach is to find a way where the end user
executes the kind of commands that he is already familiar with.

Scope
-----

### Nature of proposed change

The CLI integration would mean introduction of a number of options that
are analogous to gluster-nfs. A dummy translator will be introduced on
the client side for this purpose. Having it as a separate translator
would provide the necessary modularity and the correct placeholder for
all nfs-ganesha related functions. When the translator is loaded, all
the options that are enabled for nfs-ganesha will be listed in that
(nfs-ganesha) block. This approach will make the user experience with
nfs-ganesha close to the one that's familiar.

### Implications on manageability

All the options related to nfs-ganesha will appear in the volfile once
the nfs-ganesha translator is enabled.

### Implications on presentation layer

Gluster-nfs should be disabled to export any volume via nfs-ganesha None

### Implications on persistence layer

None

### Implications on 'GlusterFS' backend

None

### Modification to GlusterFS metadata

None

### Implications on 'glusterd'

Some code will be added to glusterd to manage nfs-ganesha options.

How To Test
-----------

Execute CLI commands and check for expected behaviour.

User Experience
---------------

User will be introduced to new CLI commands to manage nfs-ganesha
exports. Most of the commands will be volume level options.

Dependencies
------------

None

Documentation
-------------

<Status of development - Design Ready, In development, Completed> In
development

Comments and Discussion
-----------------------

The feature page is not complete as yet. This will be updated regularly.
