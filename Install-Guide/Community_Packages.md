### Community Packages

An **X** means packages are planned to be in the respective repository.  
A **—** means we have no plans to build the version for the repository.  
**d.g.o** means packages will (also) be provided on https://download.gluster.org  
**DNF/YUM** means the packages are included in the Fedora Updates or Updates-testing repos.  

|              |             | 3.10 ltm | 3.9 stm⁴ | 3.8 ltm  | 3.7 eol⁴ |
|--------------|-------------|:--------:|:--------:|:--------:|:--------:|
|CentOS Storage SIG¹  |el5          |    —     |    —     |    —     |   d.g.o  |
|              |el6          |    X     |    X     |    X     | X, d.g.o |
|              |el7          |    X     |    X     |    X     | X, d.g.o |
|              |             |          |          |          |          |
|Fedora        |F24          |  d.g.o   |  d.g.o   | DNF/YUM  |  d.g.o   |
|              |F25          |  d.g.o   | DNF/YUM  |  d.g.o   |  d.g.o   |
|              |F26          | DNF/YUM  | DNF/YUM  |  d.g.o   |  d.g.o   |
|              |             |          |          |          |          |
|Ubuntu²       |Trusty/14.04 |    —     |    —     |    X     |    X     |
|              |Xenial/16.04 |    X     |    X     |    X     |    X     |
|              |Yakkety/16.10|    X     |    X     |    X     |    —     |
|              |Zesty/17.04  |    X     |    X     |    X     |    —     |
|              |             |          |          |          |          |
|Debian        |Wheezy/7     |    —     |    —     |    —     |  d.g.o   |
|              |Jessie/8     |  d.g.o   |  d.g.o   |  d.g.o   |  d.g.o   |
|              |Stretch/9    |  d.g.o   |  d.g.o   |  d.g.o   |  d.g.o   |
|              |             |          |          |          |          |
|OpenSuSE Build System³ |OpenSuSE13   |    —     |    X     |    X     |    X     |
|              |Leap 42.X    |    X     |    X     |    X     |    X     |
|              |SLES11       |    —     |    —     |    —     |    —     |
|              |SLES12       |    X     |    X     |    X     |    X     |

¹ https://wiki.centos.org/SpecialInterestGroup/Storage  
² https://launchpad.net/~gluster  
³ https://build.opensuse.org/project/subprojects/home:kkeithleatredhat  
⁴ support ends at 3.10 GA
