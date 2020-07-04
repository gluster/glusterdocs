# Building GlusterFS
This page describes how to build and install GlusterFS.

Build Requirements
------------------

The following packages are required for building GlusterFS,

-   GNU Autotools
    -   Automake
    -   Autoconf
    -   Libtool
-   lex (generally flex)
-   GNU Bison
-   OpenSSL
-   libxml2
-   Python 2.x
-   libaio
-   libibverbs
-   librdmacm
-   readline
-   lvm2
-   glib2
-   liburcu
-   cmocka
-   libacl
-   sqlite
-   fuse-devel

### Fedora

The following dnf command installs all the build requirements for
Fedora,

```console
# dnf install automake autoconf libtool flex bison openssl-devel  \
    libxml2-devel python-devel libaio-devel libibverbs-devel      \
    librdmacm-devel readline-devel lvm2-devel glib2-devel         \
    userspace-rcu-devel libcmocka-devel libacl-devel sqlite-devel \
    fuse-devel redhat-rpm-config rpcgen libtirpc-devel make
```

### Ubuntu

The following apt-get command will install all the build requirements on
Ubuntu,

```console
# sudo apt-get install make automake autoconf libtool flex bison  \
    pkg-config libssl-dev libxml2-dev python-dev libaio-dev       \
    libibverbs-dev librdmacm-dev libreadline-dev liblvm2-dev      \
    libglib2.0-dev liburcu-dev libcmocka-dev libsqlite3-dev       \
    libacl1-dev
```

### CentOS / Enterprise Linux v7

The following yum command installs the build requirements for CentOS / Enterprise Linux 7,

```console
# yum install autoconf automake bison cmockery2-devel dos2unix flex   \
    fuse-devel glib2-devel libacl-devel libaio-devel libattr-devel    \
    libcurl-devel libibverbs-devel librdmacm-devel libtirpc-devel     \
    libtool libxml2-devel lvm2-devel make openssl-devel pkgconfig     \
    pyliblzma python-devel python-eventlet python-netifaces           \
    python-paste-deploy python-simplejson python-sphinx python-webob  \
    pyxattr readline-devel rpm-build sqlite-devel systemtap-sdt-devel \
    tar userspace-rcu-devel
```
**Note: You will need to enable the CentOS SIG repos in order to install userspace-rcu-devel package**<br>
For details check https://wiki.centos.org/SpecialInterestGroup/Storage

### Enable repositories for CentOS 8
The following yum command enables needed repositories providing the build requirements for CentOS 8,
```console
# yum-config-manager --enable PowerTools --enable Devel
```

### CentOS / Enterprise Linux v8

The following yum command installs the build requirements for CentOS / Enterprise Linux 8,

```console
# yum install autoconf automake bison dos2unix flex fuse-devel glib2-devel   \
    libacl-devel libaio-devel libattr-devel libcurl-devel libibverbs-devel   \
    librdmacm-devel libtirpc-devel libuuid-devel libtool libxml2-devel       \
    lvm2-devel make openssl-devel pkgconfig xz-devel  python3-devel          \
    python3-netifaces python3-paste-deploy python3-simplejson python3-sphinx \
    python3-webob python3-pyxattr readline-devel rpm-build sqlite-devel      \
    systemtap-sdt-devel tar userspace-rcu-devel rpcgen
```
             
Building from Source
--------------------

This section describes how to build GlusterFS from source. It is assumed
you have a copy of the GlusterFS source (either from a released tarball
or a git clone). All the commands below are to be run with the source
directory as the working directory.

### Configuring for building

Run the below commands once for configuring and setting up the build
process.

Run autogen to generate the configure script.

```console
# ./autogen.sh
```

Once autogen completes successfully a configure script is generated. Run
the configure script to generate the makefiles.

```console
# ./configure
```

For CentOS 7, use:

```console
# ./configure --without-libtirpc
```

If the above build requirements have been installed, running the
configure script should give the below configure summary,

```console
GlusterFS configure summary
===========================
FUSE client          : yes
Infiniband verbs     : yes
epoll IO multiplex   : yes
argp-standalone      : no
fusermount           : yes
readline             : yes
georeplication       : yes
Linux-AIO            : yes
Enable Debug         : no
Block Device xlator  : yes
glupy                : yes
Use syslog           : yes
XML output           : yes
Encryption xlator    : yes
Unit Tests		 : no
Track priv ports	 : yes
POSIX ACLs			 : yes
Data Classification	 : yes
SELinux features	 : yes
firewalld-config	 : no
Experimental xlators : yes
Events			 : yes
EC dynamic support	 : x64 sse avx
Use memory pools	 : yes
Nanosecond m/atimes	 : yes
Legacy gNFS server	 : no
```

During development it is good to enable a debug build. To do this run
configure with a '--enable-debug' flag.

```console
# ./configure --enable-debug
```

Further configuration flags can be found by running configure with a
'--help' flag,

```console
# ./configure --help
```

Please note to enable gNFS use the following flag

```console
# ./configure --enable-gnfs
```

If you are looking at contributing by fixing some of the memory issues,
use `--enable-asan` option

```console
# ./configure --enable-asan
```

The above option will build with `-fsanitize=address -fno-omit-frame-pointer`
options and uses the libasan.so shared library, so that needs to be available.

### Building

Once configured, GlusterFS can be built with a simple make command.

```console
# make
```

To speed up the build process on a multicore machine, add a '-jN' flag,
where N is the number of parallel jobs.

### Installing

Run 'make install' to install GlusterFS. By default, GlusterFS will be
installed into '/usr/local' prefix. To change the install prefix, give
the appropriate option to configure. If installing into the default
prefix, you might need to use 'sudo' or 'su -c' to install.

```console
# sudo make install
```

NOTE: glusterfs can be installed on any target path. However, the
`mount.glusterfs` script has to be in `/sbin/mount.glusterfs` for
mounting via command `mount -t glusterfs` to work. See -t section
in man 8 mount for more details.


### Running GlusterFS

GlusterFS can be only run as root, so the following commands will need
to be run as root. If you've installed into the default '/usr/local'
prefix, add '/usr/local/sbin' and '/usr/local/bin' to your PATH before
running the below commands.

A source install will generally not install any init scripts. So you
will need to start glusterd manually. To manually start glusterd just
run,

```console
# glusterd
```

This will start glusterd and fork it into the background as a daemon
process. You now run 'gluster' commands and make use of GlusterFS.

Building packages
-----------------

### Building RPMs

Building RPMs is really simple. On a RPM based system, for eg. Fedora,
get the source and do the configuration steps as shown in the 'Building
from Source' section. After the configuration step, run the following
steps to build RPMs,

```console
# cd extras/LinuxRPM
# make glusterrpms
```

This will create rpms from the source in 'extras/LinuxRPM'. *(Note: You
will need to install the rpmbuild requirements including rpmbuild and
mock)*<br>
For CentOS / Enterprise Linux 8 the dependencies can be installed via:
```console
# yum install mock rpm-build  selinux-policy-devel
```
