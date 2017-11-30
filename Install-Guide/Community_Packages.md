### Community Packages

#### GlusterFS

An **X** means packages are (or will be) provided in the respective repository.  
A **—** means no plans to build new updates. Existing packages will remain in the repos.  

|              |              |  4.1 stm¹ |  4.0 stm¹ | 3.13 stm  | 3.12 ltm  | 3.10 ltm  |
|--------------|--------------|:---------:|:---------:|:---------:|:---------:|:---------:|
|CentOS Storage|el6           |     —     |     —     |     ?     |     X     |     X     |
|SIG[1]        |el7           |     X     |     X     |     X     |     X     |     X     |
|              |              |           |           |           |           |           |
|Fedora[2]     |F25           |     —     |     —     |     X     |     X     |     X²    |
|              |F26           |     —     |     X     |     X     |     X     |     X²    |
|              |F27           |     X     |     X     |     X     |     X²    |     X     |
|              |F28(rawhide)  |     X     |     X     |     X²     |    X     |     X     |
|              |              |           |           |           |           |           |
|Ubuntu        |Trusty/14.04  |     —     |     —     |     —     |     —     |     X     |
|Launchpad[2]  |Xenial/16.04  |     X     |     X     |     X     |     X     |     X     |
|              |Zesty/17.04   |     —     |     —     |     X     |     X     |     X     |
|              |Artful/17.10  |     X     |     X     |     X     |     X     |     X     |
|              |Bionic/18.04  |     X     |     X     |     X     |     X     |     X     |
|              |              |           |           |           |           |           |
|Debian[3]     |Jessie/8      |     —     |     —     |     X     |     X     |     X     |
|              |Stretch/9     |     X     |     X     |     X     |     X     |     X     |
|              |Buster/10(Sid)|     X     |     X     |     X     |     X     |     X     |
|              |              |           |           |           |           |           |
|OpenSuSE Build|Leap 42.3     |     X     |     X     |     X     |     X     |     X     |
|Service[4]    |SLES12SP3     |     X     |     X     |     X     |     X     |     X     |

#### Related Packages

|              |              | gluster-block | glusterfs-coreutils | nfs-ganesha | Samba |
|--------------|--------------|:-------------:|:-------------------:|:-----------:|:-----:|
|CentOS Storage|el6           |       X       |         X           |      X      |   ?   |
|SIG           |el7           |       X       |         X           |      X      |   ?   |
|              |              |               |                     |             |       |
| Fedora       |F25           |       X       |         X           |      X      |   ?   |
|              |F26           |       X       |         X           |      X      |   ?   |
|              |F27           |       X       |         X           |      X      |   ?   |
|              |F28(rawhide)  |       X       |         X           |      X      |   ?   |
|              |              |               |                     |             |       |
|Ubuntu        |Trusty/14.04  |       –       |         X           |      X      |   ?   |
|Launchpad     |Xenial/16.04  |       –       |         X           |      X      |   ?   |
|              |Zesty/17.04   |       –       |         X           |      X      |   ?   |
|              |Artful/17.10  |       –       |         X           |      X      |   ?   |
|              |Bionic/18.04  |       –       |         X           |      X      |   ?   |
|              |              |               |                     |             |       |
|Debian        |Jessie/8      |       –       |         X           |      X      |   ?   |
|              |Stretch/9     |       –       |         X           |      X      |   ?   |
|              |Buster/10(Sid)|       –       |         X           |      X      |   ?   |
|              |              |               |                     |             |       |
|OpenSuSE Build|Leap 42.3     |     X         |         X           |      X      |   ?   |
|Service       |SLES12SP3     |     X         |         X           |      X      |   ?   |


[1] <https://wiki.centos.org/SpecialInterestGroup/Storage>  
[2] <https://launchpad.net/~gluster>  
[3] <http://download.gluster.org/pub/gluster/glusterfs>  
[4] <https://build.opensuse.org/project/subprojects/home:glusterfs>  

¹ Tentative date 2018  
² Fedora Updates or UpdatesTesting repository. Use dnf to install.  
