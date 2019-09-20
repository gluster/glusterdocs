Coreutils for GlusterFS volumes
===============================
The GlusterFS Coreutils is a suite of utilities that aims to mimic the standard Linux coreutils, with the exception that it utilizes the gluster C API in order to do work. It offers an interface similar to that of the ftp program.
Operations include things like getting files from the server to the local machine, putting files from the local machine to the server, retrieving directory information from the server and so on.

## Installation
#### Install GlusterFS
For information on prerequisites, instructions and configuration of GlusterFS, see Installation Guides from <http://docs.gluster.org/en/latest/>.

#### Install glusterfs-coreutils
For now glusterfs-coreutils will be packaged only as rpm. Other package formats will be supported very soon.

##### For fedora
Use dnf/yum to install glusterfs-coreutils:

```console
# dnf install glusterfs-coreutils
```

OR

```console
# yum install glusterfs-coreutils
```

## Usage
glusterfs-coreutils provides a set of basic utilities such as cat, cp, flock, ls, mkdir, rm, stat and tail that are implemented specifically using the GlusterFS API commonly known as libgfapi. These utilities can be used either inside a gluster remote
shell or as standalone commands with 'gf' prepended to their respective base names. For example, glusterfs cat utility is named as gfcat and so on with an exception to flock core utility for which a standalone gfflock command is not provided as such(see the notes section on why flock is designed in that way).

#### Using coreutils within a remote gluster-shell
##### Invoke a new shell
In order to enter into a gluster client-shell, type *gfcli* and press enter. You will now be presented with a similar prompt as shown below:

```console
# gfcli
gfcli>
```

See the man page for *gfcli* for more options.
##### Connect to a gluster volume
Now we need to connect as a client to some glusterfs volume which has already started. Use connect command to do so as follows:

```console
gfcli> connect glfs://<SERVER-IP or HOSTNAME>/<VOLNAME>
```

For example if you have a volume named vol on a server with hostname localhost the above command will take the following form:

```console
gfcli> connect glfs://localhost/vol
```

Make sure that you are successfully attached to a remote gluster volume by verifying the new prompt which should look like:

```console
gfcli (<SERVER IP or HOSTNAME/<VOLNAME>)
```

##### Try out your favorite utilities
Please go through the man pages for different utilities and available options for each command. For example, *man gfcp* will display details on the usage of cp command outside or within a gluster-shell. Run different commands as follows:

```console
gfcli (localhost/vol) ls .
gfcli (localhost/vol) stat .trashcan
```

##### Terminate the client connection from the volume
Use disconnect command to close the connection:

```console
gfcli (localhost/vol) disconnect
gfcli>
```

##### Exit from shell
Run quit from shell:

```console
gfcli> quit
```

#### Using standalone glusterfs coreutil commands
As mentioned above glusterfs coreutils also provides standalone commands to perform the basic GNU coreutil functionalities. All those commands are prepended by 'gf'. Instead of invoking a gluster client-shell you can directly make use of these to establish and perform the operation in one shot. For example see the following sample usage of gfstat command:

```console
gfstat glfs://localhost/vol/foo
```

There is an exemption regarding flock coreutility which is not available as a standalone command for a reason described under 'Notes' section.

For more information on each command and corresponding options see associated man pages.

## Notes
* Within a particular session of gluster client-shell, history of commands are preserved i.e, you can use up/down arrow keys to search through previously executed commands or the reverse history search technique using Ctrl+R.
* flock is not available as standalone 'gfflock'. Because locks are always associated with file descriptors. Unlike all other commands flock cannot straight away clean up the file descriptor after acquiring the lock. For flock we need to maintain an active connection as a glusterfs client.
