### Community Packages

#### GlusterFS

Tentative plans for community convenience packages.

An **X** means packages are (or will be) provided in the respective repository.  
A **—** means no plans to build new updates. Existing packages will remain in the repos.  

|              |                |     8     |     7     |     6     |     5     |
|--------------|----------------|:---------:|:---------:|:---------:|:---------:|
|CentOS Storage SIG[1]|el6            |     —     |     X      |     X¹     |     X¹    |
|              |el7             |     X     |     X     |     X     |     X     |
|              |el8             |     X     |     X     |     X     |     —     |
|              |                |           |           |           |           |
|Fedora[2]     |F31             |     X     |     X²    |     X     |     X     |
|              |F32             |     X     |     X²    |     X     |     X     |
|              |F33(rawhide)    |     X²    |     X     |     X     |     X     |
|              |                |           |           |           |           |
|Debian[2]     |Stretch/9       |     —     |     X     |     X     |     X     |
|              |Buster/10       |     X     |     X     |     X     |     X     |
|              |Bullseye/11(Sid)|     X     |     X     |     X     |     X     |
|              |                |           |           |           |
|Ubuntu Launchpad[3]|Xenial/16.04    |     —     |     X     |     X     |     X     |
|              |Bionic/18.04    |     X     |     X     |     X     |     X     |
|              |Eoan/19.10      |     X     |     X     |     X     |     X     |
|              |Focal/20.04     |     X     |     X     |     X     |     X     |
|              |Groovy/20.10    |     X     |     X     |     X     |     —     |
|              |                |           |           |           |           |
|OpenSUSE Build Service[4]|SLES12SP5    |     —     |     X     |     X     |      —    |
|              |SLES12SP4       |     —     |     X     |     X     |     X     |
|              |Leap15.2        |     X     |     X     |     X     |     X     |
|              |SLES15SP1       |     X     |     X     |     X     |     X     |
|              |SLES15          |     —     |     —     |     X     |     X     |
|              |Tumbleweed      |     X     |     X     |     X     |     X     |

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



[1] <https://wiki.centos.org/SpecialInterestGroup/Storage>  
[2] <https://download.gluster.org/pub/gluster/glusterfs>  
[3] <https://launchpad.net/~gluster>  
[4] <http://download.opensuse.org/repositories/home:/glusterfs:/>  

¹ Client-side only.  
² Fedora Updates, UpdatesTesting, or Rawhide repository. Use dnf to install.  
