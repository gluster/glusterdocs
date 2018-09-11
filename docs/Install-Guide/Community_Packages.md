### Community Packages

#### GlusterFS and GlusterD2 (4.x and later)

An **X** means packages are (or will be) provided in the respective repository.  
A **—** means no plans to build new updates. Existing packages will remain in the repos.  

|              |              |     5     |    4.1    | 3.12 ltm  |
|--------------|--------------|:---------:|:---------:|:---------:|
|CentOS Storage SIG[1]|el6    |     X¹    |     X¹    |     X     |
|              |el7           |     X     |     X     |     X     |
|              |              |           |           |           |
|Fedora[2]     |F27           |     X²    |     X     |     X²    |
|              |F28           |     X²    |     X²    |     —     |
|              |F29           |     X     |     X²    |     —     | 
|              |F30(rawhide)  |     X     |     X²    |     —     | 
|              |              |           |           |           |
|Debian[2]     |Jessie/8      |     —     |     —     |     X     |
|              |Stretch/9     |     X³    |     X³    |     X     |
|              |Buster/10(Sid)|     X³    |     X³    |     X     |
|              |              |           |           |           |
|Ubuntu Launchpad[3]|Xenial/16.04  |     X³    |     X³    |     X     |
|              |Bionic/18.04  |     X³    |     X³    |     X     |
|              |Cosmic/18.10  |     X³    |     X³    |     —     |
|              |              |           |           |           |
|OpenSUSE Build Service[4]|SLES12SP3  |     —     |     X     |     X     |
|              |SLES12SP4     |     X     |     X     |     X     |
|              |Leap42.3      |     —     |     X     |     X     |
|              |Leap15        |     X     |     X     |     —     |
|              |SLES15        |     X     |     X     |     —     |
|              |Tumbleweed    |     X     |     X     |     —     |


#### Related Packages

|              |              | gdeploy | gluster-block | glusterfs-coreutils | nfs-ganesha | storhaug | Samba |
|--------------|--------------|:-------:|:--------:|:----------:|:-----------:|:--------:|:-----:|
|CentOS Storage SIG[1]|el6           |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |el7           |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |              |         |          |            |             |          |       |
|Fedora[2]     |F27           |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |F28           |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |F29           |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |F30(rawhide)  |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |              |         |          |            |             |          |       |
|Debian[2]     |Jessie/8      |    —    |     —    |     X      |      X      |     X    |   ?   |
|              |Stretch/9     |    —    |     —    |     X      |      X      |     X    |   ?   |
|              |Buster/10(Sid)|    —    |     —    |     X      |      X      |     X    |   ?   |
|              |              |         |          |            |             |          |       |
|Ubuntu Launchpad[3]|Xenial/16.04  |    —    |     —    |     X      |      X      |     X    |   ?   |
|              |Bionic/18.04  |    —    |     —    |     X      |      X      |     X    |   ?   |
|              |Cosmic/18.10  |    —    |     —    |     X      |      X      |     X    |   ?   |
|              |              |         |          |            |             |          |       |
|OpenSUSE Build Service[4]|SLES12SP3     |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |SLES12SP4     |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |Leap42.3      |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |Leap15        |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |SLES15        |    X    |     X    |     X      |      X      |     X    |   ?   |
|              |Tumbleweed    |    X    |     X    |     X      |      X      |     X    |   ?   |



[1] <https://wiki.centos.org/SpecialInterestGroup/Storage>  
[2] <http://download.gluster.org/pub/gluster/glusterfs>  
[3] <https://launchpad.net/~gluster>  
[4] <https://build.opensuse.org/project/subprojects/home:glusterfs>  

¹ Client-side only  
² Fedora Updates, UpdatesTesting, or Rawhide repository. Use dnf to install.  
³ glusterd2 packging needed  
