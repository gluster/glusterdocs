# Managing the glusterd Service

After installing GlusterFS, you must start glusterd service. The
glusterd service serves as the Gluster elastic volume manager,
overseeing glusterfs processes, and co-ordinating dynamic volume
operations, such as adding and removing volumes across multiple storage
servers non-disruptively.

This section describes how to start the glusterd service in the
following ways:

- [Starting and stopping glusterd manually on distributions using systemd](#manual)
- [Starting glusterd automatically on distributions using systemd](#auto)
- [Starting and stopping glusterd manually](#manual-legacy)
- [Starting glusterd Automatically](#auto-legacy)

> **Note**: You must start glusterd on all GlusterFS servers.

## Distributions with systemd

<a name="manual"></a>
### Starting and stopping glusterd manually
- To start `glusterd` manually:

```console
systemctl start glusterd
```

- To stop `glusterd` manually:

```console
systemctl stop glusterd
```

<a name="auto"></a>
### Starting glusterd automatically
- To enable the glusterd service and start it if stopped:

```console
systemctl enable --now glusterd
```

- To disable the glusterd service and stop it if started:

```console
systemctl disable --now glusterd
```

## Distributions without systemd

<a name="manual-legacy"></a>
### Starting and stopping glusterd manually

This section describes how to start and stop glusterd manually

- To start glusterd manually, enter the following command:

```console
# /etc/init.d/glusterd start
```

-   To stop glusterd manually, enter the following command:

```console
# /etc/init.d/glusterd stop
```

<a name="auto-legacy"></a>
### Starting glusterd Automatically

This section describes how to configure the system to automatically
start the glusterd service every time the system boots.

#### Red Hat and Fedora distributions

To configure Red Hat-based systems to automatically start the glusterd
service every time the system boots, enter the following from the
command line:

```console
# chkconfig glusterd on
```

#### Debian and derivatives like Ubuntu

To configure Debian-based systems to automatically start the glusterd
service every time the system boots, enter the following from the
command line:

```console
# update-rc.d glusterd defaults
```

#### Systems Other than Red Hat and Debian

To configure systems other than Red Hat or Debian to automatically start
the glusterd service every time the system boots, enter the following
entry to the*/etc/rc.local* file:

```console
# echo "glusterd" >> /etc/rc.local
```
