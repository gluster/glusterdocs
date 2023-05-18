### Community Packages

#### GlusterFS

Tentative plans for community convenience packages.

A **yes** means packages are (or will be) provided in the respective repository.  
A **no** means no plans to build new updates. Existing packages will remain in the repos.  
The following GlusterFS versions have reached EOL[1]: 8, 7, 6 and earlier.

|                           |                  |  11  |  10  |
| ------------------------- | ---------------- | :--: | :--: |
| CentOS Storage SIG[2]     | Stream 8         | yes  | yes  |
|                           | Stream 9         | yes  | yes  |
|                           |                  |      |      |
| Fedora[3]                 | F37              | yes  | yes¹ |
|                           | F38              | yes¹ | yes  |
|                           | F39(rawhide)     | yes¹ | yes  |
|                           |                  |      |      |
| Debian[3]                 | Buster/10        | yes  | yes  |
|                           | Bullseye/11      | yes  | yes  |
|                           | Bookworm/12      | yes  | yes  |
|                           | Trixie/13(sid)   | yes  |  no  |
|                           |                  |      |      |
| Ubuntu Launchpad[4]       | Bionic/18.04     | yes  | yes  |
|                           | Focal/20.04      | yes  | yes  |
|                           | Jammy/22.04      | yes  | yes  |
|                           | Kinetic/22.10    | yes  | yes  |
|                           | Lunar/23.04      | yes  | yes  |
|                           | Mantic/23.10     | yes  |  no  |
|                           |                  |      |      |
| OpenSUSE Build Service[5] | Leap15.4         | yes  | yes  |
|                           | SLES15SP4        | yes  | yes  |
|                           | Tumbleweed       | yes  | yes  |

**NOTE** - We are not building Debian arm packages due to resource constraints for a while now. There will be only amd64 packages present on [download.gluster.org](https://download.gluster.org/pub/gluster/glusterfs/LATEST/)

#### Related Packages

|                           |                  | glusterfs-selinux | gdeploy | gluster-block | glusterfs-coreutils | nfs-ganesha | Samba |
| ------------------------- | ---------------- | :---------------: | :-----: | :-----------: | :-----------------: | :---------: | :---: |
| CentOS Storage SIG[2]     | Stream 8         |        yes        |   tbd   |      yes      |         yes         |     yes     |  yes  |
|                           | Stream 9         |        yes        |   tbd   |      yes      |         yes         |     yes     |  yes  |
|                           |                  |                   |         |               |                     |             |       |
| Fedora[3]                 | F37              |        yes        |   yes   |      yes      |         yes         |     yes     |   ?   |
|                           | F38              |        yes        |   yes   |      yes      |         yes         |     yes     |   ?   |
|                           | F39(rawhide)     |        yes        |   yes   |      yes      |         yes         |     yes     |   ?   |
|                           |                  |                   |         |               |                     |             |       |
| Debian[3]                 | Buster/10        |        n/a        |   no    |      no       |         yes         |     yes     |   ?   |
|                           | Bullseye/11      |        n/a        |   no    |      no       |         yes         |     yes     |   ?   |
|                           | Bookworm/12      |        n/a        |   no    |      no       |         yes         |     yes     |   ?   |
|                           | Trixie/13(sid)   |        n/a        |   no    |      no       |         yes         |     yes     |   ?   |
|                           |                  |                   |         |               |                     |             |       |
| Ubuntu Launchpad[4]       | Bionic/18.04     |        n/a        |   no    |      no       |         yes         |     yes     |   ?   |
|                           | Focal/20.04      |        n/a        |   no    |      no       |         yes         |     yes     |   ?   |
|                           | Jammy/22.04      |        n/a        |   no    |      no       |         yes         |     yes     |   ?   |
|                           | Kinetic/22.10    |        n/a        |   no    |      no       |         yes         |     yes     |   ?   |
|                           | Lunar/23.04      |        n/a        |   no    |      no       |         yes         |     yes     |   ?   |
|                           | Mantic/23.10     |        n/a        |   no    |      no       |         yes         |     yes     |   ?   |
|                           |                  |                   |         |               |                     |             |       |
| OpenSUSE Build Service[5] | Leap15.4         |        n/a        |   yes   |      yes      |         yes         |     yes     |   ?   |
|                           | SLES15SP4        |        n/a        |   yes   |      yes      |         yes         |     yes     |   ?   |
|                           | Tumbleweed       |        n/a        |   yes   |      yes      |         yes         |     yes     |   ?   |

[1] <https://www.gluster.org/release-schedule/>  
[2] <https://wiki.centos.org/SpecialInterestGroup/Storage>  
[3] <https://download.gluster.org/pub/gluster/glusterfs>  
[4] <https://launchpad.net/~gluster>  
[5] <http://download.opensuse.org/repositories/home:/glusterfs:/>

¹ Fedora Updates, UpdatesTesting, or Rawhide repository. Use dnf to install.
