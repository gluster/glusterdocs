### Community Packages

An **X** means packages are (or will be) provided in the respective repository.  
A **—** means no plans to build new updates. Existing packages will remain in the repos.  

|              |               |  4.0 stm  | 3.12 ltm¹ | 3.11 stm² | 3.10 ltm  |  3.8 ltm³ |
|--------------|---------------|:---------:|:---------:|:---------:|:---------:|:---------:|
|CentOS Storage|el6            |     —     |     X     |    X      |     X     |     X     |
|SIG[1]        |el7            |     X     |     X     |    X      |     X     |     X     |
|              |               |           |           |           |           |           |
|Fedora[2]     |F24⁵           |     —     |     —     |    —      |    (X)    |    (X)⁴   |
|              |F25            |     X     |     X     |    X      |     X⁴    |     X     |
|              |F26            |     X     |     X     |    X      |     X⁴    |     X     |
|              |F27            |     X     |     X⁴    |    X      |     X     |     X     |
|              |F28(rawhide)   |     X     |     X⁴    |    X      |     X     |     —     |
|              |               |           |           |           |           |           |
|Ubuntu        |Trusty/14.04   |     —     |     —     |    —      |     X     |     X     |
|Launchpad[3]  |Xenial/16.04   |     X     |     X     |    X      |     X     |     X     |
|              |Yakkety/16.10⁵ |     —     |     —     |   (X)     |    (X)    |    (X)    |
|              |Zesty/17.04    |     X     |     X     |    X      |     X     |     X     |
|              |Artful/17.10   |     X     |     X     |    X      |     X     |     X     |
|              |               |           |           |           |           |           |
|Debian[2]     |Jessie/8       |     X     |     X     |    X      |     X     |     X     |
|              |Stretch/9      |     X     |     X     |    X      |     X     |     X     |
|              |Buster(Sid)/10 |     X     |     X     |    X      |     X     |     —     |
|              |               |           |           |           |           |           |
|OpenSuSE Build|OpenSuSE13     |     —     |     —     |    —      |     —     |    (X)    |
|Service[4]    |Leap 42.X      |     X     |     X     |    X      |     X     |     X     |
|              |SLES12         |     X     |     X     |    X      |     X     |     X     |

[1] <https://wiki.centos.org/SpecialInterestGroup/Storage>  
[2] <http://download.gluster.org/pub/gluster/glusterfs>  
[3] <https://launchpad.net/~gluster>  
[4] <https://build.opensuse.org/project/subprojects/home:glusterfs>  
  
¹ Tentative release date August, 2017.  
² 3.11 will EOL when 4.0 is released.  
³ 3.8 will EOL when 3.12 is released.  
⁴ Fedora Updates or UpdatesTesting repository. Use dnf to install.  
⁵ Ubuntu Yakkety EOL, July 2017; Fedora 24 EOL, August 2017 — no further updates.  

