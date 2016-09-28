### Community Packages

An **X** means packages are planned to be in the repository.  
A **—** means we have no plans to build the version for the repository.  
**d.g.o** means packages will (also) be provided on https://download.gluster.org  
**DNF/YUM** means the packages are included in the Fedora updates or updates-testing repos.  

|                   |             |   3.9    |   3.8    |   3.7    |   3.6    |
|-------------------|-------------|:--------:|:--------:|:--------:|:--------:|
|CentOS Storage SIG¹|el5          |    —     |    —     |   d.g.o  |   d.g.o  |
|                   |el6          |    X     |    X     | X, d.g.o | X, d.g.o |
|                   |el7          |    X     |    X     | X, d.g.o | X, d.g.o |
|                   |             |          |          |          |          |
|Fedora             |`F23`        |   `—`    | `d.g.o`  |`DNF/YUM` | `d.g.o`  |
|                   |F24          |  d.g.o   | DNF/YUM  |  d.g.o   |  d.g.o   |
|                   |F25          | DNF/YUM  |  d.g.o   |  d.g.o   |  d.g.o   |
|                   |F26          | DNF/YUM  |  d.g.o   |  d.g.o   |  d.g.o   |
|                   |             |          |          |          |          |
|Ubuntu Launchpad²  |Precise      |    —     |    —     |    X     |    X     |
|                   | (12.04 LTS) |          |          |          |          |
|                   |Trusty       |    —     |    X     |    X     |    X     |
|                   | (14.04 LTS) |          |          |          |          |
|                   |`Wily`       |   `—`    |   `X`    |   `X`    |   `X`    |
|                   |`(15.10)`    |          |          |          |          |
|                   |Xenial       |    X     |    X     |    X     |    X     |
|                   | (16.04 LTS) |          |          |          |          |
|                   |Yakkety      |    X     |    X     |    —     |    —     |
|                   |             |          |          |          |          |
|Debian             |Wheezy (7)   |    —     |    —     |  d.g.o   |  d.g.o   |
|                   |Jessie (8)   |  d.g.o   |  d.g.o   |  d.g.o   |  d.g.o   |
|                   |Stretch (9)  |  d.g.o   |  d.g.o   |  d.g.o   |  d.g.o   |
|                   |             |          |          |          |          |
| SuSE Build System³|OpenSuSE13   |    X     |    X     |    X     |    X     |
|                   |Leap 42.X    |    X     |    X     |    X     |    —     |
|                   |SLES11       |    —     |    —     |    —     |    X     |
|                   |SLES12       |    X     |    X     |    X     |    X     |


	SLES12 	X
	X 	X 	X

¹ https://wiki.centos.org/SpecialInterestGroup/Storage
² https://launchpad.net/~gluster
³ https://build.opensuse.org/project/subprojects/home:kkeithleatredhat
