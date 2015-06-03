### Instructions

**Feature**

'gfid-access' translator to provide access to data in glusterfs using a virtual path.

**1 Summary**

This particular Translator is designed to provide direct access to files in glusterfs using its gfid.'GFID' is glusterfs's inode numbers for a file to identify it uniquely.

**2 Owners**

Amar Tumballi <atumball@redhat.com>  
Raghavendra G <rgowdapp@redhat.com>  
Anand Avati <aavati@redhat.com>

**3 Current status**

With glusterfs-3.4.0, glusterfs provides only path based access.A feature is added in 'fuse' layer in the current master branch,
but its desirable to have it as a separate translator for long time
maintenance.

**4 Detailed Description**

With this method, we can consume the data in changelog translator
(which is logging 'gfid' internally) very efficiently.

**5 Benefit to GlusterFS**

Provides a way to access files quickly with direct gfid.

​**6. Scope**

6.1. Nature of proposed change

* A new translator.
* Fixes in 'glusterfsd.c' to add this translator automatically based
on mount time option.
* change to mount.glusterfs to parse this new option 
(single digit number or lines changed)

6.2. Implications on manageability

* No CLI required.  
* mount.glusterfs script gets a new option.

6.3. Implications on presentation layer

* A new virtual access path is made available. But all access protocols work seemlessly, as the complexities are handled internally.

6.4. Implications on persistence layer

* None

6.5. Implications on 'GlusterFS' backend

* None

6.6. Modification to GlusterFS metadata

* None

6.7. Implications on 'glusterd'

* None

7 How To Test

* Mount glusterfs client with '-o aux-gfid-mount' and access files using '/mount/point/.gfid/ <actual-canonical-gfid-of-the-file>'.

8 User Experience

* A new virtual path available for users.

9 Dependencies

* None

10 Documentation

This wiki.

11 Status

Patch sent upstream. More review comments required. (http://review.gluster.org/5497)

12 Comments and Discussion

Please do give comments :-)