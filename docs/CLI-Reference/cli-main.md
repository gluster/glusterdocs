## Gluster Command Line Interface

### Overview

Use the Gluster CLI to setup and manage your Gluster cluster from a terminal. 
You can run the Gluster CLI on any Gluster server either by invoking the commands 
or by running the Gluster CLI in interactive mode. 
You can also use the gluster command remotely using SSH.

The gluster CLI syntax is `gluster <command>`.


To run a command directly:

```console
# gluster <command>
```

For example, to view the status of all peers:

```console
# gluster peer status
```

To run a command in interactive mode, start a gluster shell by typing:

```console
# gluster
```

This will open a gluster command prompt. You now run the command at the prompt.

```console
gluster> <command>
```

For example, to view the status of all peers,

```console
gluster> peer status
```

#### Peer Commands

The peer commands are used to manage the Trusted Server Pool (TSP).


| Command         | Syntax                 | Description             |
| --------------- |:-----------------------|:------------------------|
| peer probe      | peer probe _server_    | Add _server_ to the TSP |
| peer detach     | peer detach _server_   | Remove _server_ from the TSP |
| peer status     | peer status            | Display the status of all nodes in the TSP |
| pool list       | pool list              | List all nodes in the TSP |

#### Volume Commands

The volume commands are used to setup and manage Gluster volumes.

| Command              | Syntax                 | Description             |
| -------------------- |:-----------------------|:------------------------|
| volume create        | volume create _volname_  [options] _bricks_    | Create a volume called _volname_ using the specified bricks with the configuration specified by options |
| volume start         | volume start _volname_  [force] | Start volume _volname_ |
| volume stop          | volume stop _volname_   | Stop volume _volname_  |
| volume info          | volume info [_volname_] | Display volume info for _volname_ if provided, else for all volumes on the TSP |
| volume status        | volumes status[_volname_] | Display volume status for _volname_ if provided, else for all volumes on the TSP |
| volume list          | volume list             | List all volumes in the TSP |
| volume set           | volume set _volname_ _option_ _value_ | Set _option_ to _value_ for _volname_ |
| volume get           | volume get _volname_ <_option_\|all>  | Display the value of _option_ (if specified)for _volname_ , or all options otherwise |
| volume add-brick     | volume add-brick _brick-1_ ... _brick-n_ | Expand _volname_ to include the bricks _brick-1_ to _brick-n_|
| volume remove-brick  | volume remove-brick _brick-1_ ... _brick-n_ \<start\|stop\|status\|commit\|force\> |  Shrink _volname_ by removing the bricks _brick-1_ to _brick-n_ . _start_ will trigger a rebalance to migrate data from the removed bricks. _stop_ will stop an ongoing remove-brick operation. _force_ will remove the bricks immediately and any data on them will no longer be accessible from Gluster clients.|
| volume replace-brick | volume replace-brick _volname_ _old-brick_ _new-brick_| Replace _old-brick_ of _volname_ with _new-brick_ |
| volume delete        | volume delete _volname_    | Delete _volname_ |

For additional detail of all the available CLI commands, please refer to `man gluster` output.
