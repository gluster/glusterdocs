### Community Packages

#### GlusterFS

Tentative plans for community convenience packages.

A **yes** means packages are (or will be) provided in the respective repository.  
A **no** means no plans to build new updates. Existing packages will remain in the repos.  
The following GlusterFS versions have reached EOL[1]: 7, 6, 5 and earlier.

|              |                |    (10)   |     9     |     8     |
|--------------|----------------|:---------:|:---------:|:---------:|
|CentOS Storage SIG[2]|el7      |     no    |    yes    |    yes    |
|              |el8             |    yes    |    yes    |    yes    |
|              |el8 stream      |    yes    |    yes    |    yes    |
|              |                |           |           |           |
|Fedora[3]     |F33             |     no    |    yes    |    yes¹   |
|              |F34             |    yes    |    yes¹   |    yes    |
|              |F35             |    yes    |    yes¹   |    yes    |
|              |F36(rawhide)    |    yes    |    yes¹   |    yes    |
|              |                |           |           |           |
|Debian[3]     |Stretch/9       |     no    |    yes    |    yes    |
|              |Buster/10       |    yes    |    yes    |    yes    |
|              |Bullseye/11     |    yes    |    yes    |    yes    |
|              |Bookworm/12(sid)|    yes    |    yes    |     no    |
|              |                |           |           |           |
|Ubuntu Launchpad[4]|Xenial/16.04    |     no    |    yes    |    yes    |
|              |Bionic/18.04    |    yes    |    yes    |    yes    |
|              |Focal/20.04     |    yes    |    yes    |    yes    |
|              |Hirsute/21.04   |    tbd    |    yes    |    yes    |
|              |Impish/21.10    |    tbd    |    yes    |    yes    |
|              |                |           |           |           |
|OpenSUSE Build Service[5]|Leap15.2        |      no    |     yes    |    yes    |
|              |Leap15.3        |    yes    |    yes    |    yes    |
|              |SLES12SP5       |     no    |    yes    |    yes    |
|              |SLES15SP2       |     no    |    yes    |    yes    |
|              |SLES15SP3       |    yes    |    yes    |    yes    |
|              |Tumbleweed      |    yes    |    yes    |    yes    |

#### Related Packages

|              |                | glusterfs-selinux | gdeploy | gluster-block | glusterfs-coreutils | nfs-ganesha | Samba |
|--------------|----------------|:-----------------:|:-------:|:-------------:|:-------------------:|:-----------:|:-----:|
|CentOS Storage SIG[2]|el7      |         yes       |   yes   |      yes      |        yes          |     yes     |  yes  |
|              |el8             |         yes       |   tbd   |      yes      |        yes          |     yes     |  yes  |
|              |el8 stream      |         yes       |   tbd   |      yes      |        yes          |     yes     |  tbd  |
|              |                |                   |         |               |                     |             |       |
|Fedora[3      |F33             |         yes       |   yes   |      yes      |        yes          |     yes     |   ?   |
|              |F34             |         yes       |   yes   |      yes      |        yes          |     yes     |   ?   |
|              |F35             |         yes       |   yes   |      yes      |        yes          |     yes     |   ?   |
|              |F36(rawhide)    |         yes       |   yes   |      yes      |        yes          |     yes     |   ?   |
|              |                |                   |         |               |                     |             |       |
|Debian[3]     |Stretch/9       |         n/a       |   no    |      no       |        yes          |     yes     |   ?   |
|              |Buster/10       |         n/a       |   no    |      no       |        yes          |     yes     |   ?   |
|              |Bullseye/11     |         n/a       |   no    |      no       |        yes          |     yes     |   ?   |
|              |Bookworm/12(sid)|         n/a       |   no    |      no       |        yes          |     yes     |   ?   |
|              |                |                   |         |               |                     |             |       |
|Ubuntu Launchpad[4]|Xenial/16.04    |         n/a/      |   no    |      no       |        yes          |     yes     |   ?   |
|              |Bionic/18.04    |         n/a       |   no    |      no       |        yes          |     yes     |   ?   |
|              |Focal/20.04     |         n/a       |   no    |      no       |        yes          |     yes     |   ?   |
|              |Hirsute/21.04   |         n/a       |   no    |      no       |        yes          |     yes     |   ?   |
|              |Impish/21.10    |         n/a       |   no    |      no       |        yes          |     yes     |   ?   |
|              |                |                   |         |               |                     |             |       |
|OpenSUSE Build Service[5]|Leap15.2|          n/a      |   yes   |      yes      |        yes          |     yes     |   ?   |
|              |Leap15.3        |         n/a       |   yes   |      yes      |        yes          |     yes     |   ?   |
|              |SLES12SP5       |         n/a       |   yes   |      yes      |        yes          |     yes     |   ?   |
|              |SLES15SP2       |         n/a       |   yes   |      yes      |        yes          |     yes     |   ?   |
|              |SLES15SP3       |         n/a       |   yes   |      yes      |        yes          |     yes     |   ?   |
|              |Tumbleweed      |         n/a       |   yes   |      yes      |        yes          |     yes     |   ?   |



[1] <https://www.gluster.org/release-schedule/>  
[2] <https://wiki.centos.org/SpecialInterestGroup/Storage>  
[3] <https://download.gluster.org/pub/gluster/glusterfs>  
[4] <https://launchpad.net/~gluster>  
[5] <http://download.opensuse.org/repositories/home:/glusterfs:/>  

¹ Fedora Updates, UpdatesTesting, or Rawhide repository. Use dnf to install.  
