### Community Packages

#### GlusterFS and GlusterD2 (4.0 and later)

An **X** means packages are (or will be) provided in the respective repository.  
A **—** means no plans to build new updates. Existing packages will remain in the repos.  

|              |              |  4.1 ltm¹ |  4.0 stm  | 3.12 ltm  |
|--------------|--------------|:---------:|:---------:|:---------:|
|CentOS Storage|el6           |     X³    |     X³    |     X     |
|SIG[1]        |el7           |     X     |     X     |     X     |
|              |              |           |           |           |
|Fedora[2]     |F26           |     —     |     X     |     X     |
|              |F27           |     X     |     X     |     X²    |
|              |F28           |     X     |     X²    |     —     |
|              |F29(rawhide)  |     X     |     X²    |     —     |     
|              |              |           |           |           |
|Debian[2]     |Jessie/8      |     —     |     —     |     X     |
|              |Stretch/9     |     X     |     X     |     X     |
|              |Buster/10(Sid)|     X     |     X     |     X     |
|              |              |           |           |           |
|Ubuntu        |Trusty/14.04  |     —     |     —     |     —     |
|Launchpad[3]  |Xenial/16.04  |     X     |     X     |     X     |
|              |Artful/17.10  |     X     |     X     |     X     |
|              |Bionic/18.04  |     X     |     X     |     X     |
|              |              |           |           |           |
|OpenSuSE Build|SLES12SP3     |     X     |     X     |     X     |
|Service[4]    |Leap42.3      |     X     |     X     |     X     |
|              |Leap15        |     X     |     X     |     —     |
|              |SLES15        |     X     |     X     |     —     |
|              |Tumbleweed    |     X     |     X     |     —     |


#### Related Packages

|              |              | gdeploy | gluster-block | glusterfs-coreutils | nfs-ganesha | Samba |
|--------------|--------------|:-------:|:-------------:|:-------------------:|:-----------:|:-----:|
|CentOS Storage|el6           |    X    |       X       |         X           |      X      |   ?   |
|SIG           |el7           |    X    |       X       |         X           |      X      |   ?   |
|              |              |         |               |                     |             |       |
|Fedora        |F26           |    X    |       X       |         X           |      X      |   ?   |
|              |F27           |    X    |       X       |         X           |      X      |   ?   |
|              |F28           |    X    |       X       |         X           |      X      |   ?   |
|              |F29(rawhide)  |    X    |       X       |         X           |      X      |   ?   |
|              |              |         |               |                     |             |       |
|Debian        |Jessie/8      |    —    |       –       |         X           |      X      |   ?   |
|              |Stretch/9     |    —    |       –       |         X           |      X      |   ?   |
|              |Buster/10(Sid)|    —    |       –       |         X           |      X      |   ?   |
|Ubuntu        |Trusty/14.04  |    —    |       –       |         X           |      X      |   ?   |
|Launchpad     |Xenial/16.04  |    —    |       –       |         X           |      X      |   ?   |
|              |Artful/17.10  |    —    |       –       |         X           |      X      |   ?   |
|              |Bionic/18.04  |    —    |       –       |         X           |      X      |   ?   |
|              |              |         |               |                     |             |       |
|OpenSuSE Build|SLES12SP3     |    X    |     X         |         X           |      X      |   ?   |
|Service       |Leap42.3      |    X    |     X         |         X           |      X      |   ?   |
|              |Leap15        |    X    |     X         |         X           |      X      |   ?   |
|              |SLES15        |    X    |     X         |         X           |      X      |   ?   |
|              |Tumbleweed    |    X    |     X         |         X           |      X      |   ?   |



[1] <https://wiki.centos.org/SpecialInterestGroup/Storage>  
[2] <http://download.gluster.org/pub/gluster/glusterfs>  
[3] <https://launchpad.net/~gluster>  
[4] <https://build.opensuse.org/project/subprojects/home:glusterfs>  

¹ Tentative date June 2018  
² Fedora Updates, UpdatesTesting, or Rawhide repository. Use dnf to install.  
³ Client only  
