# Consul and GlusterFS integration

[Consul](https://www.consul.io/) is used for service discovery and configuration.

It consists of consul server and agents connecting to it.
Apps can get configuration data from consul via HTTP API or DNS queries.

Long story short, instead of using standard hostnames and relying on official DNS servers which we may not control,
we can use consul to resolve hosts with services under ``.consul`` domain, which turns this classic setup:

```bash

    mount -t glusterfs -o backupvolfile-server=gluster-poc-02 gluster-poc-01:/g0 /mnt/gluster/g0

```

into more convenient entry:

```bash

    mount -t glusterfs gluster.service.consul:/g0 /mnt/gluster/g0

```

which is especially useful when using image-based servers without further provisioning, and spreading load across all healthy servers registered in consul.

# Warning

In this document you will get a proof-of-concept basic setup - gluster servers and gluster clients configured,
which should be a point to expand. You should read [Further steps](#further-steps-for-improvements) section to harden it.

Tested on:

* isolated virtual network
* selinux permissive (yay!)
* consul server/agents version `v0.7.5`
* gluster servers with glusterfs 3.8.x on CentOS 7.3 + samba 4 with simple auth and vfs gluster module
* gluster volume set as distributed-replicated + 'features.shard: true' and 'features.shard-block-size: 512MB'
* gluster agents with glusterfs 3.8.x on Ubuntu 14.04
* gluster agents with glusterfs 3.8.x on CentOS 7.3
* gluster agents with glusterfs 3.7.x on CentOS 5.9
* Windows 2012R2 connected to gluster servers via samba


# Scenario

We want to create shared storage accessible via different operating systems - Linux and Windows.

* we do not control DNS server so we cannot add/remove entries on gluster server add/remove
* gluster servers are in the gluster pool and have gluster volume created named ``g0``
* gluster servers have consul agent installed, and they will register to consul as ``gluster`` service
* gluster servers have also SMB installed with very simple setup using gluster vfs plugin
* gluster client have consul agent installed, and they will use ``gluster.service.consul`` as entry point.
* DNS resolution under Linux will be handled via dnsmasq
* DNS resolution under Windows will be handled via consul itself

# Known limitations

* consul health checks introduce delay, also remember that consul can cache DNS entries to increase performance
* the way Windows share works is that it will connect to one of the samba servers, if this server die then transfers are
  aborted, and we must retry operation, but watch out for delay.
* anything other than gluster volume distributed-replicated was not tested - it may not work for Windows.

# Requirements

* you should have consul server (or cluster) up and running, and the best, also accessible via default HTTP port.
* you should have gluster servers already joined in the gluster pool, bricks and volume configured.
* check you firewall rules for outbound and inbound for DNS, gluster, samba, consul
* make yourself familiar with [consul documentation](https://www.consul.io/docs/index.html) (or specific branch on github)

# Linux setup

## Consul agent on Linux on gluster clients

First, install consul agent. The best way is to use for example [puppet module](https://github.com/solarkennedy/puppet-consul)
In general your Linux boxes should register in the consul server and be visible under `Nodes` section.

To verify if consul agent is working properly, you can query its DNS interface, asking it to list consul servers:

```bash

    [centos@gluster-poc-01]# dig consul.service.consul 127.0.0.1:8600

    ; <<>> DiG 9.9.4-RedHat-9.9.4-38.el7_3.3 <<>> consul.service.consul 127.0.0.1:8600
    ;; global options: +cmd
    ;; Got answer:
    ;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 39354
    ;; flags: qr aa rd ra; QUERY: 1, ANSWER: 3, AUTHORITY: 0, ADDITIONAL: 0

    ;; QUESTION SECTION:
    ;consul.service.consul.     IN  A

    ;; ANSWER SECTION:
    consul.service.consul.  0   IN  A   172.30.64.198
    consul.service.consul.  0   IN  A   172.30.82.255
    consul.service.consul.  0   IN  A   172.30.81.155

    ;; Query time: 1 msec
    ;; SERVER: 127.0.0.1#53(127.0.0.1)
    ;; WHEN: Sat May 20 08:50:21 UTC 2017
    ;; MSG SIZE  rcvd: 87

    ;; Got answer:
    ;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 22224
    ;; flags: qr rd ra ad; QUERY: 1, ANSWER: 0, AUTHORITY: 0, ADDITIONAL: 0

    ;; QUESTION SECTION:
    ;127.0.0.1:8600.            IN  A

    ;; Query time: 0 msec
    ;; SERVER: 127.0.0.1#53(127.0.0.1)
    ;; WHEN: Sat May 20 08:50:21 UTC 2017
    ;; MSG SIZE  rcvd: 32


```

Now, to be able to use it on system level, we want it to work without specifying port.
We can achieve it with running consul on port 53 (not advised), or redirecting network traffic from port 53 to 8600 or proxy it via local DNS resolver - for example use locally installed dnsmasq.

First, install dnsmasq, and add file ``/etc/dnsmasq.d/10-consul``:

```text

    server=/consul/127.0.0.1#8600

```

This will ensure that any ``*.consul`` requests will be forwarded to local consul listening on its default DNS port 8600.

Make sure that ``/etc/resolv.conf`` contains ``nameserver 127.0.0.1``. Under Debian distros it should be there, under RedHat - not really. You can fix this in two ways, choose on your onw which one to apply:

* add ``nameserver 127.0.0.1`` to ``/etc/resolvconf/resolv.conf.d/header``

or

* update ``/etc/dhcp/dhclient.conf`` and add to it line ``prepend domain-name-servers 127.0.0.1;``.

In both cases it ensures that dnsmasq will be a first nameserver, and requires reloading resolver or networking.

Eventually you should have ``nameserver 127.0.0.1`` set as first entry in ``/etc/resolv.conf`` and have DNS resolving consul entries:

```bash

    [centos@gluster-poc-01]# dig consul.service.consul

    ; <<>> DiG 9.9.4-RedHat-9.9.4-38.el7_3.3 <<>> consul.service.consul
    ;; global options: +cmd
    ;; Got answer:
    ;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 42571
    ;; flags: qr aa rd ra; QUERY: 1, ANSWER: 3, AUTHORITY: 0, ADDITIONAL: 0

    ;; QUESTION SECTION:
    ;consul.service.consul.     IN  A

    ;; ANSWER SECTION:
    consul.service.consul.  0   IN  A   172.30.64.198
    consul.service.consul.  0   IN  A   172.30.82.255
    consul.service.consul.  0   IN  A   172.30.81.155

    ;; Query time: 1 msec
    ;; SERVER: 127.0.0.1#53(127.0.0.1)
    ;; WHEN: Sat May 20 09:01:12 UTC 2017
    ;; MSG SIZE  rcvd: 87

```

From now on we should be able to use ``<servicename>.service.consul`` in places, where we had FQDN entries of the single servers.

Next, we must define gluster service consul on the servers.

## Consul agent on Linux on gluster servers

Install consul agent as described in previous section.

You can define consul services as ``gluster`` to run health checks, to do that we must add consul to sudoers or allow it executing certain sudo commands without password:

``/etc/sudoers.d/99-consul.conf``:

```text

    consul ALL=(ALL) NOPASSWD: /sbin/gluster pool list

```

First, lets define service in consul, it will be very basic, without volume names.
Service name ``gluster``, with default port 24007, and we will tag it as ``gluster`` and ``server``.

Our service will have [service health checks](https://www.consul.io/docs/agent/checks.html) every 10s:

* check if the gluster service is responding to TCP on 24007 port
* check if the gluster server is connected to other peers in the pool (to avoid registering as healthy service which is actaully not serving anything)

Below is an example of ``/etc/consul/service_gluster.json``:

```json

    {
      "service": {
        "address": "",
        "checks": [
          {
            "interval": "10s",
            "tcp": "localhost:24007",
            "timeout": "5s"
          },
          {
            "interval": "10s",
            "script": "/bin/bash -c \"sudo -n /sbin/gluster pool list |grep -v UUID|grep -v localhost|grep Connected\"",
            "timeout": "5s"
          }
        ],
        "enableTagOverride": false,
        "id": "gluster",
        "name": "gluster",
        "port": 24007,
        "tags": [
          "gluster",
          "server"
        ]
      }
    }

```

Restart consul service and you should see gluster servers in consul web ui.
After a while service should be in healthy stage and be available under nslookup:

```bash

    [centos@gluster-poc-02]# nslookup gluster.service.consul
    Server:     127.0.0.1
    Address:    127.0.0.1#53

    Name:   gluster.service.consul
    Address: 172.30.64.144
    Name:   gluster.service.consul
    Address: 172.30.65.61

```

Notice that gluster server can be also gluster client, for example if we want to mount gluster volume on the servers.

## Mounting gluster volume under Linux

As a moutpoint we would usually select one of the gluster servers, and another as backup server, like this:

```bash

    mount -t glusterfs -o backupvolfile-server=gluster-poc-02 gluster-poc-01:/g0 /mnt/gluster/g0

```

This is a bit inconvenient, for example we have an image with hardcoded hostnames, and old servers are gone due to maintenance.
We would have to recreate image, or reconfigure existing nodes if they unmount gluster storage.

To mitigate that issue we can now use consul for fetching the server pool:

```bash

    mount -t glusterfs gluster.service.consul:/g0 /mnt/gluster/g0

```

So we can populate that to ``/etc/fstab`` or one of the ``autofs`` files.

# Windows setup


## Configuring gluster servers as samba shares

This is the simplest and not so secure setup, you have been warned.

Proper setup suggests using LDAP or [CTDB](https://ctdb.samba.org/).
You can configure it with puppet using module [kakwa-samba](https://github.com/kakwa/puppet-samba).


First, we want to reconfigure gluster servers so that they serve as samba shares using user/pass credentials, which is separate to Linux credentials.

We assume that accessing windows share will be done as user ``steve`` with password ``steve-loves-bacon``, make sure you create that user on each gluster server host.


```bash
    sudo adduser steve
    sudo smbpasswd -a steve
```

Notice that if you do not set ``user.smb = disable`` in gluster volume then it may auto-add itself to samba configuration. So better disable this by executing:

```bash

    gluster volume get g0 user.smb disable

```

Now install ``samba`` and ``samba-vfs-glusterfs`` packages and configure ``/etc/samba/smb.conf``:

```ini

    [global]
    workgroup = test
    security = user
    min protocol = SMB2
    netbios name = gluster
    realm = test
    vfs objects = acl_xattr
    map acl inherit = Yes
    store dos attributes = Yes
    log level = 1
    dedicated keytab file = /etc/krb5.keytab
    map untrusted to domain = Yes

    [vfs-g0]
    guest only = no
    writable = yes
    guest ok = no
    force user = steve
    create mask = 0666
    directory mask = 0777
    comment = Gluster via VFS (native gluster)
    path = /
    vfs objects = glusterfs
    glusterfs:volume = g0
    kernel share modes = no
    glusterfs:loglevel = 7
    glusterfs:logfile = /var/log/samba/glusterfs-g0.%M.log
    browsable = yes
    force group = steve

```

Some notes:

* when using vfs plugin then ``path`` is a relative path via gluster volume.
* ``kernel share modes = no`` may be required to make it work.

We can also use classic fuse mount and use it under samba as share path, then configuration is even simpler.

For detailed description between those two solutions see [gluster vfs blog posts](https://lalatendu.org/2014/04/20/glusterfs-vfs-plugin-for-samba/).

* Remember to add user steve to samba with a password
* unblock firewall ports for samba
* test samba config and reload samba

## Defining new samba service under consul

Now we define gluster-samba service on gluster server hosts in a similiar way as we defined it for gluster itself.

Below is an example of ``/etc/consul/service_samba.json``:

```json

    {
      "service": {
        "address": "",
        "checks": [
          {
            "interval": "10s",
            "tcp": "localhost:139",
            "timeout": "5s"
          },
          {
            "interval": "10s",
            "tcp": "localhost:445",
            "timeout": "5s"
          }
        ],
        "enableTagOverride": false,
        "id": "gluster-samba",
        "name": "gluster-samba",
        "port": 139,
        "tags": [
          "gluster",
          "samba"
        ]
      }
    }

```

We have two health checks here, just checking if we can connect to samba service. It could be also expanded to see if the network share is actually accessible.

Reload consul service and you should after a while see new service registered in the consul.
Check if it exists in dns:

```bash

    nslookup gluster-samba.service.consul

    Server:     127.0.0.1
    Address:    127.0.0.1#53

    Name:   gluster-samba.service.consul
    Address: 172.30.65.61
    Name:   gluster-samba.service.consul
    Address: 172.30.64.144

```

Install ``samba-client`` and check connectivity to samba from gluster server itself.

```bash

    [centos@gluster-poc-01]# smbclient -L //gluster-samba.service.consul/g0 -U steve
    Enter steve's password:
    Domain=[test] OS=[Windows 6.1] Server=[Samba 4.4.4]

        Sharename       Type      Comment
        ---------       ----      -------
        vfs-g0          Disk      Gluster via VFS (native gluster)
        IPC$            IPC       IPC Service (Samba 4.4.4)
    Domain=[test] OS=[Windows 6.1] Server=[Samba 4.4.4]

        Server               Comment
        ---------            -------

        Workgroup            Master
        ---------            -------

```

Now check if we can list share directory as ``steve``:

```bash

    smbclient //gluster-samba.service.consul/vfs-g0/ -U steve -c ls

    Enter steve's password:
    Domain=[test] OS=[Windows 6.1] Server=[Samba 4.4.4]
      .                                   D        0  Wed May 17 20:48:06 2017
      ..                                  D        0  Wed May 17 20:48:06 2017
      .trashcan                          DH        0  Mon May 15 15:41:37 2017
      CentOS-7-x86_64-Everything-1611.iso      N 8280604672  Mon Dec  5 13:57:33 2016
      hello.world                         D        0  Fri May 19 08:54:02 2017
      ipconfig.all.txt                    A     2931  Wed May 17 20:18:52 2017
      nslookup.txt                        A      126  Wed May 17 20:19:13 2017
      net.view.txt                        A      315  Wed May 17 20:47:44 2017

            463639360 blocks of size 1024. 447352464 blocks available

```

Notice that this might take a few seconds, because when we try to connect to the share, samba vfs connects to the gluster servers as agent.

Looks good, time to configure Windows.

## Installing Consul agent on Windows

Log in as administrator and install consul agent on the Windows machine, the easiest way is to use chocolatey.

* install [chocolatey](https://chocolatey.org/install) and use preferred installation method, for example via ``cmd.exe``

* optionally install some tools via chocolatey to edit files:

```bash

    chocolatey install notepadplusplus

```

* install consul as agent with specific version and configs to load:

```bash

    chocolatey install consul --version 0.7.5 -params '-config-dir "%PROGRAMDATA%\consul\"'

```

* stop consul service in command prompt:

```bash

    net stop consul

```

* edit consul config ``%PROGRAMDATA%\consul\config.json``:

```bash

    start notepad++.exe "%PROGRAMDATA%\consul\config\config.json"

```

fill it with data (description below):

```json

    {
        "datacenter": "virt-gluster",
        "retry_join": [
            "192.178.1.11",
            "192.178.1.12",
            "192.178.1.13",
        ],
        "recursors": ["8.8.8.8", "8.8.4.4"],
        "ports": {
            "dns": 53
        }


    }
```


Remember to replace ``datacenter``, ``recursors`` with preferred local DNS servers and ``retry_join`` with list of consul server hosts or for example some generic Route53 entry from private zone (if it exists) which points to real consul servers.

In AWS you can also use ``retry_join_ec2`` - his way Windows instance will always search other consul server EC2 instances and join them.

Notice that  recursors section is required if not using retry_join and just relying on AWS EC2 tags - otherwise consul will fail to resolve anything else, thus not joining to the consul.

We use port ``53`` so that consul will serve as local DNS.

* start consul service

```bash

    net start consul

```

* update DNS settings for network interface in Windows, make it the primary entry

```bash

    netsh interface ipv4 add dnsserver \"Ethernet\" address=127.0.0.1 index=1

```

* verify that DNS Servers is pointing to localhost:

```bash

    ipconfig /all

    Windows IP Configuration

       Host Name . . . . . . . . . . . . : WIN-S8N782O8GG3
       ...
       ...
       DNS Servers . . . . . . . . . . . : 127.0.0.1
       ...
       ...

```

* verify that consul resolves some services:

```bash

    nslookup gluster.service.consul

    nslookup gluster-samba.service.consul

    Server:  UnKnown
    Address:  127.0.0.1

    Name:    gluster-samba.service.consul
    Addresses:  172.30.65.61
              172.30.64.144

```

## Mounting gluster volume under Windows

We have running gluster servers with volume and samba share, registered in consul.
We have Windows with running consul agent.
All hosts are registered in consul and can connect to each other.

* verify that samba can see network share:

```bash

    net view \\gluster-samba.service.consul

    Shared resources at \\gluster-samba.service.consul

    Samba 4.4.4

    Share name  Type  Used as  Comment

    -------------------------------------------------------------------------------
    vfs-g0      Disk           Gluster via VFS (native gluster)
    The command completed successfully.

```

* mount network share, providing credentials for gluster samba share:

```bash

    net use s: \\gluster-samba.service.consul\vfs-g0 /user:steve password: steve-loves-bacon /persistent:yes

```

If mounting fails due to error message:
``System error 1219 has occurred. Multiple connections to a server or shared resource by the same user,
using more than one user name, are not allowed....``
then you must delete existing connections, for example:

```bash

    net use /delete \\gluster-samba.service.consul\IPC$

```

And then retry the ``net use`` commands again.

From now on this windows share should reconnect to the random gluster samba server, if it is healthy.

Enjoy.


# Further steps for improvements

Below is a list of things to improve:

* enable selinux
* harden samba setup on gluster servers to use domain logons
* use consul ACL lists to control access to consul data

* export gluster volumes as key/value in consul, use consul-template to create mountpoints on consul updates - in autofs/ samba mounts/unmounts
* expand consul health checks with more detailed checks, like:
    - better checking if gluster volume exists etc
    - if samba share is accessible by the client (to avoid situation samba tries to share non-mounted volume)

