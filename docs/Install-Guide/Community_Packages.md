### Community Packages

#### GlusterFS

Tentative plans for community convenience packages.

A **yes** means packages are (or will be) provided in the respective repository.  
A **no** means no plans to build new updates. Existing packages will remain in the repos.  
The following GlusterFS versions have reached EOL[1]: 6, 5, 4.1, 4.0, 3.x and earlier.

|              |                |     8     |     7     |
|--------------|----------------|:---------:|:---------:|
|CentOS Storage SIG[2]|el6      |    no     |    yes    |
|              |el7             |    yes    |    yes    |
|              |el8             |    yes    |    yes    |
|              |                |           |           |
|Fedora[3]     |F31             |    yes    |    yes¹   |
|              |F32             |    yes    |    yes¹   |
|              |F33             |    yes¹   |    yes    |
|              |F34(rawhide)    |    yes¹   |    yes    |
|              |                |           |           |
|Debian[3]     |Stretch/9       |     no    |    yes    |
|              |Buster/10       |    yes    |    yes    |
|              |Bullseye/11(Sid)|    yes    |    yes    |
|              |                |           |           |
|Ubuntu Launchpad[4]|Xenial/16.04    |    no     |    yes    |
|              |Bionic/18.04    |    yes    |    yes    |
|              |Eoan/19.10      |    yes    |    yes    |
|              |Focal/20.04     |    yes    |    yes    |
|              |Groovy/20.10    |    yes    |    yes    |
|              |                |           |           |
|OpenSUSE Build Service[5]|SLES12SP5    |    no     |    yes    |
|              |SLES12SP5       |    no     |    yes    |
|              |Leap15.2        |    yes    |    yes    |
|              |SLES15SP2       |    yes    |    yes    |
|              |Tumbleweed      |    yes    |    yes    |

#### Related Packages

|              |                | gdeploy | gluster-block | glusterfs-coreutils | nfs-ganesha | storhaug | Samba |
|--------------|----------------|:-------:|:--------:|:----------:|:-----------:|:--------:|:-----:|
|CentOS Storage SIG[2]|el6             |   yes   |    yes   |    yes     |     yes     |    yes   |   no    |
|              |el7             |   yes   |    yes   |    yes     |     yes     |    yes   |   yes   |
|              |el8             |   tbd   |    tbd   |    yes     |     yes     |    tbd   |   yes   |
|              |                |         |          |            |             |          |         |
|Fedora[3]     |F31             |   yes   |    yes   |    yes     |     yes     |    yes   |    ?    |
|              |F32             |   yes   |    yes   |    yes     |     yes     |    yes   |    ?    |
|              |F33(rawhide)    |   yes   |    yes   |    yes     |     yes     |    yes   |    ?    |
|              |                |         |          |            |             |          |         |
|Debian[3]     |Stretch/9       |   no    |    no    |    yes     |     yes     |    yes   |    ?    |
|              |Buster/10       |   no    |    no    |    yes     |     yes     |    yes   |    ?    |
|              |Bullseye/11(Sid)|   no    |     no   |    yes     |     yes     |    yes   |    ?    |
|              |                |         |          |            |             |          |         |
|Ubuntu Launchpad[4]|Xenial/16.04    |   no    |    no    |    yes     |     yes     |    yes   |    ?    |
|              |Bionic/18.04    |   no    |    no    |    yes     |     yes     |    yes   |    ?    |
|              |Eoan/19.10      |   no    |    no    |    yes     |     yes     |    yes   |    ?    |
|              |Focal/20.04     |   no    |    no    |    yes     |     yes     |    yes   |   ?     |
|              |Groovy/20.10    |   no    |    no    |    yes     |     yes     |    yes   |    ?    |
|              |                |         |          |            |             |          |         |
|OpenSUSE Build Service[5]|SLES12SP5       |   yes    |    yes     |     yes     |   yes    |   yes   |    ?   |
|              |SLES12SP5       |   yes   |    yes   |    yes     |     yes     |    yes   |    ?    |
|              |Leap15.2        |   yes   |    yes   |    yes     |     yes     |    yes   |    ?    |
|              |SLES15SP2       |   yes   |    yes   |    yes     |     yes     |    yes   |    ?    |
|              |Tumbleweed      |   yes   |    yes   |    yes     |     yes     |    yes   |    ?    |



[1] <https://www.gluster.org/release-schedule/>  
[2] <https://wiki.centos.org/SpecialInterestGroup/Storage>  
[3] <https://download.gluster.org/pub/gluster/glusterfs>  
[4] <https://launchpad.net/~gluster>  
[5] <http://download.opensuse.org/repositories/home:/glusterfs:/>  

¹ Fedora Updates, UpdatesTesting, or Rawhide repository. Use dnf to install.  
