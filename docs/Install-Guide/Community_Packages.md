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
|              |F33(rawhide)    |    yes¹   |    yes    |
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
|              |SLES12SP4       |    no     |    yes    |
|              |Leap15.2        |    yes    |    yes    |
|              |SLES15SP1       |    yes    |    yes    |
|              |SLES15          |    no     |    yes    |
|              |Tumbleweed      |    yes    |    yes    |

#### Related Packages

|              |                | gdeploy | gluster-block | glusterfs-coreutils | nfs-ganesha | storhaug | Samba |
|--------------|----------------|:-------:|:--------:|:----------:|:-----------:|:--------:|:-----:|
|CentOS Storage SIG[1]|el6             |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |el7             |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |el8             |   tbd   |    tbd   |     X      |      X      |    tbd   |   ?   |
|              |                |         |          |            |             |          |       |
|Fedora[2]     |F31             |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |F32             |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |F33(rawhide)    |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |                |         |          |            |             |          |       |
|Debian[2]     |Stretch/9       |    —    |     —    |     X      |      X      |     X    |   ?   |
|              |Buster/10       |    —    |     —    |     X      |      X      |     X    |   ?   |
|              |Bullseye/11(Sid)|    —    |     —    |     X      |      X      |     X    |   ?   |
|              |                |         |          |            |             |          |       |
|Ubuntu Launchpad[3]|Xenial/16.04    |    —    |     —    |     X      |      X      |     X    |   ?   |
|              |Bionic/18.04    |    —    |     —    |     X      |      X      |     X    |   ?   |
|              |Eoan/19.10      |    —    |     —    |     X      |      X      |     X    |   ?   |
|              |Focal/20.04     |    —    |     —    |     X      |      X      |     X    |   ?   |
|              |Groovy/20.10    |    —    |     —    |     X      |      X      |     X    |   ?   |
|              |                |         |          |            |             |          |       |
|OpenSUSE Build Service[4]|SLES12SP5       |    X     |     X    |     X       |      X      |     X    |   ?   |
|              |SLES12SP4       |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |Leap15.2        |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |SLES15          |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |SLES15SP1       |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |Tumbleweed      |    X    |     X    |     X      |      X      |     X    |   ?   |



[1] <https://www.gluster.org/release-schedule/>
[2] <https://wiki.centos.org/SpecialInterestGroup/Storage>  
[3] <https://download.gluster.org/pub/gluster/glusterfs>  
[4] <https://launchpad.net/~gluster>  
[5] <http://download.opensuse.org/repositories/home:/glusterfs:/>  

1 Fedora Updates, UpdatesTesting, or Rawhide repository. Use dnf to install.  
