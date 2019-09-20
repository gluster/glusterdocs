# Events APIs

*New in version 3.9*

## Set PYTHONPATH(Only in case of Source installation)
If Gluster is installed using source install, `cliutils` will get
installed under `/usr/local/lib/python.2.7/site-packages` Set
PYTHONPATH by adding in `~/.bashrc`

```console
# export PYTHONPATH=/usr/local/lib/python2.7/site-packages:$PYTHONPATH
```

## Enable and Start Events APIs

Enable and Start glustereventsd in all peer nodes

In Systems using Systemd,

```console
# systemctl enable glustereventsd
# systemctl start glustereventsd
```

FreeBSD or others, add the following in `/etc/rc.conf`

```text
glustereventsd_enable="YES"
```

And start the glustereventsd using,

```console
# service glustereventsd start
```

SysVInit(CentOS 6),

```console
# chkconfig glustereventsd on
# service glustereventsd start
```

## Status

Status Can be checked using,

```console
# gluster-eventsapi status
```

Example output:

```console
Webhooks:
None

+-----------+-------------+-----------------------+
| NODE      | NODE STATUS | GLUSTEREVENTSD STATUS |
+-----------+-------------+-----------------------+
| localhost |          UP |                    UP |
| node2     |          UP |                    UP |
+-----------+-------------+-----------------------+
```

## Webhooks
**Webhooks** are similar to callbacks(over HTTP), on event Gluster will
call the Webhook URL(via POST) which is configured. Webhook is a web
server which listens on a URL, this can be deployed outside of the
Cluster. Gluster nodes should be able to access this Webhook server on
the configured port.

Example Webhook written in python,

```python
from flask import Flask, request

app = Flask(__name__)

@app.route("/listen", methods=["POST"])
def events_listener():
    gluster_event = request.json
    if gluster_event is None:
        # No event to process, may be test call
        return "OK"

    # Process gluster_event
    # {
    #  "nodeid": NODEID,
    #  "ts": EVENT_TIMESTAMP,
    #  "event": EVENT_TYPE,
    #  "message": EVENT_DATA
    # }
    print (gluster_event)
    return "OK"

app.run(host="0.0.0.0", port=9000)
```

Test and Register webhook using following commands,

```console
usage: gluster-eventsapi webhook-test [-h] [--bearer_token BEARER_TOKEN] url

positional arguments:
  url                   URL of Webhook

optional arguments:
  -h, --help            show this help message and exit
  --bearer_token BEARER_TOKEN, -t BEARER_TOKEN
                        Bearer Token
```

Example(Webhook server is running in `192.168.122.188:9000`),

```console
# gluster-eventsapi webhook-test http://192.168.122.188:9000/listen

+-----------+-------------+----------------+
| NODE      | NODE STATUS | WEBHOOK STATUS |
+-----------+-------------+----------------+
| localhost |          UP |             OK |
| node2     |          UP |             OK |
+-----------+-------------+----------------+
```

If Webhook status is OK from all peer nodes then register the Webhook
using,

```console
usage: gluster-eventsapi webhook-add [-h] [--bearer_token BEARER_TOKEN] url

positional arguments:
  url                   URL of Webhook

optional arguments:
  -h, --help            show this help message and exit
  --bearer_token BEARER_TOKEN, -t BEARER_TOKEN
                        Bearer Token
```

Example,

```console
# gluster-eventsapi webhook-add http://192.168.122.188:9000/listen

+-----------+-------------+-------------+
| NODE      | NODE STATUS | SYNC STATUS |
+-----------+-------------+-------------+
| localhost |          UP |          OK |
| node2     |          UP |          OK |
+-----------+-------------+-------------+
```

**Note**: If Sync status is Not OK for any node, then make sure to run
following command from a peer node when that node comes up.

```console
# gluster-eventsapi sync
```

To unsubscribe from events, delete the webhook using following command

```console
usage: gluster-eventsapi webhook-del [-h] url

positional arguments:
  url         URL of Webhook

optional arguments:
  -h, --help  show this help message and exit
```

Example,

```console
# gluster-eventsapi webhook-del http://192.168.122.188:9000/listen
```

## Configuration

View all configurations using,

```console
usage: gluster-eventsapi config-get [-h] [--name NAME]

optional arguments:
  -h, --help   show this help message and exit
  --name NAME  Config Name
```

Example output:

```console
+-----------+-------+
| NAME      | VALUE |
+-----------+-------+
| log_level | INFO  |
| port      | 24009 |
+-----------+-------+
```

To change any configuration,

```console
usage: gluster-eventsapi config-set [-h] name value

positional arguments:
  name        Config Name
  value       Config Value

optional arguments:
  -h, --help  show this help message and exit
```

Example output,

```console
+-----------+-------------+-------------+
| NODE      | NODE STATUS | SYNC STATUS |
+-----------+-------------+-------------+
| localhost |          UP |          OK |
| node2     |          UP |          OK |
+-----------+-------------+-------------+
```

To Reset any configuration,

```console
usage: gluster-eventsapi config-reset [-h] name

positional arguments:
  name        Config Name or all

optional arguments:
  -h, --help  show this help message and exit
```

Example output,

```console
+-----------+-------------+-------------+
| NODE      | NODE STATUS | SYNC STATUS |
+-----------+-------------+-------------+
| localhost |          UP |          OK |
| node2     |          UP |          OK |
+-----------+-------------+-------------+
```

**Note**: If any node status is not UP or sync status is not OK, make
sure to run `gluster-eventsapi sync` from a peer node.

## Add node to the Cluster
When a new node added to the cluster,

- Enable and Start Eventsd in the new node using the steps mentioned above
- Run `gluster-eventsapi sync` command from a peer node other than the new node.


## APIs documentation
Glustereventsd pushes the Events in JSON format to configured
Webhooks. All Events will have following attributes.


Attribute | Description
--------- | -----------
nodeid    | Node UUID
ts        | Event Timestamp
event     | Event Type
message   | Event Specific Data

Example:

```json
{
    "nodeid": "95cd599c-5d87-43c1-8fba-b12821fd41b6",
    "ts": 1468303352,
    "event": "VOLUME_CREATE",
    "message": {
        "name": "gv1"
    }
}
```

"message" can have following attributes based on the type of event.

### Peer Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
PEER_ATTACH                    | host                 | Hostname or IP of added node
PEER_DETACH                    | host                 | Hostname or IP of detached node

### Volume Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
VOLUME_CREATE                  | name                 | Volume Name
VOLUME_START                   | force                | Force option used or not during Start
                               | name                 | Volume Name
VOLUME_STOP                    | force                | Force option used or not during Stop
                               | name                 | Volume Name
VOLUME_DELETE                  | name                 | Volume Name
VOLUME_SET                     | name                 | Volume Name
                               | options              | List of Options[(key1, val1), (key2, val2),..]
VOLUME_RESET                   | name                 | Volume Name
                               | option               | Option Name

### Brick Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
BRICK_RESET_START              | volume               | Volume Name
                               | source-brick         | Source Brick details
BRICK_RESET_COMMIT             | volume               | Volume Name
                               | destination-brick    | Destination Brick
                               | source-brick         | Source Brick details
BRICK_REPLACE                  | volume               | Volume Name
                               | destination-brick    | Destination Brick
                               | source-brick         | Source Brick details

### Georep Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
GEOREP_CREATE                  | force                | Force option used during session Create
                               | slave                | Slave Details(Slavehost::SlaveVolume)
                               | no_verify            | No verify option is used or not
                               | push_pem             | Push pem option is used or Not
                               | ssh_port             | If SSH port is configured during Session Create
                               | master               | Master Volume Name
GEOREP_START                   | force                | Force option used during session Start
                               | master               | Master Volume Name
                               | slave                | Slave Details(Slavehost::SlaveVolume)
GEOREP_STOP                    | force                | Force option used during session Stop
                               | master               | Master Volume Name
                               | slave                | Slave Details(Slavehost::SlaveVolume)
GEOREP_PAUSE                   | force                | Force option used during session Pause
                               | master               | Master Volume Name
                               | slave                | Slave Details(Slavehost::SlaveVolume)
GEOREP_RESUME                  | force                | Force option used during session Resume
                               | master               | Master Volume Name
                               | slave                | Slave Details(Slavehost::SlaveVolume)
GEOREP_DELETE                  | force                | Force option used during session Delete
                               | master               | Master Volume Name
                               | slave                | Slave Details(Slavehost::SlaveVolume)
GEOREP_CONFIG_SET              | master               | Master Volume Name
                               | slave                | Slave Details(Slavehost::SlaveVolume)
                               | option               | Name of Geo-rep config
                               | value                | Changed Value
GEOREP_CONFIG_RESET            | master               | Master Volume Name
                               | slave                | Slave Details(Slavehost::SlaveVolume)
                               | option               | Name of Geo-rep config

### Bitrot Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
BITROT_ENABLE                  | name                 | Volume Name
BITROT_DISABLE                 | name                 | Volume Name
BITROT_SCRUB_THROTTLE          | name                 | Volume Name
                               | value                | Changed Value
BITROT_SCRUB_FREQ              | name                 | Volume Name
                               | value                | Changed Value
BITROT_SCRUB_OPTION            | name                 | Volume Name
                               | value                | Changed Value

### Quota Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
QUOTA_ENABLE                   | volume               | Volume Name
QUOTA_DISABLE                  | volume               | Volume Name
QUOTA_SET_USAGE_LIMIT          | volume               | Volume Name
                               | path                 | Path in Volume on which Quota option is set
                               | limit                | Changed Value
QUOTA_SET_OBJECTS_LIMIT        | volume               | Volume Name
                               | path                 | Path in Volume on which Quota option is set
                               | limit                | Changed Value
QUOTA_REMOVE_USAGE_LIMIT       | volume               | Volume Name
                               | path                 | Path in Volume on which Quota option is Reset
QUOTA_REMOVE_OBJECTS_LIMIT     | volume               | Volume Name
                               | path                 | Path in Volume on which Quota option is Reset
QUOTA_ALERT_TIME               | volume               | Volume Name
                               | time                 | Changed Alert Time
QUOTA_SOFT_TIMEOUT             | volume               | Volume Name
                               | soft-timeout         | Changed Value
QUOTA_HARD_TIMEOUT             | volume               | Volume Name
                               | hard-timeout         | Changed Value
QUOTA_DEFAULT_SOFT_LIMIT       | volume               | Volume Name
                               | default-soft-limit   | Changed Value

### Snapshot Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
SNAPSHOT_CREATED               | snapshot_name        | Snapshot Name
                               | volume_name          | Volume Name
                               | snapshot_uuid        | Snapshot UUID
SNAPSHOT_CREATE_FAILED         | snapshot_name        | Snapshot Name
                               | volume_name          | Volume Name
                               | error                | Failure details
SNAPSHOT_ACTIVATED             | snapshot_name        | Snapshot Name
                               | snapshot_uuid        | Snapshot UUID
SNAPSHOT_ACTIVATE_FAILED       | snapshot_name        | Snapshot Name
                               | error                | Failure details
SNAPSHOT_DEACTIVATED           | snapshot_name        | Snapshot Name
                               | snapshot_uuid        | Snapshot UUID
SNAPSHOT_DEACTIVATE_FAILED     | snapshot_name        | Snapshot Name
                               | error                | Failure details
SNAPSHOT_SOFT_LIMIT_REACHED    | volume_name          | Volume Name
                               | volume_id            | Volume ID
SNAPSHOT_HARD_LIMIT_REACHED    | volume_name          | Volume Name
                               | volume_id            | Volume ID
SNAPSHOT_RESTORED              | snapshot_name        | Snapshot Name
                               | volume_name          | Volume Name
                               | snapshot_uuid        | Snapshot UUID
SNAPSHOT_RESTORE_FAILED        | snapshot_name        | Snapshot Name
                               | error                | Failure details
SNAPSHOT_DELETED               | snapshot_name        | Snapshot Name
                               | snapshot_uuid        | Snapshot UUID
SNAPSHOT_DELETE_FAILED         | snapshot_name        | Snapshot Name
                               | error                | Failure details
SNAPSHOT_CLONED                | clone_uuid           | Snapshot Clone UUID
                               | snapshot_name        | Snapshot Name
                               | clone_name           | Snapshot Clone Name
SNAPSHOT_CLONE_FAILED          | snapshot_name        | Snapshot Name
                               | clone_name           | Snapshot Clone Name
                               | error                | Failure details
SNAPSHOT_CONFIG_UPDATED        | auto-delete          | Auto delete Value if available
                               | config_type          | Volume Config or System Config
                               | hard_limit           | Hard Limit Value if available
                               | soft_limit           | Soft Limit Value if available
                               | snap-activate        | Snap activate Value if available
SNAPSHOT_CONFIG_UPDATE_FAILED  | error                | Error details
SNAPSHOT_SCHEDULER_INITIALISED | status               | Succss Status
SNAPSHOT_SCHEDULER_INIT_FAILED | error                | Error details
SNAPSHOT_SCHEDULER_ENABLED     | status               | Succss Status
SNAPSHOT_SCHEDULER_ENABLE_FAILED | error                | Error details
SNAPSHOT_SCHEDULER_DISABLED    | status               | Succss Status
SNAPSHOT_SCHEDULER_DISABLE_FAILED | error                | Error details
SNAPSHOT_SCHEDULER_SCHEDULE_ADDED | status               | Succss Status
SNAPSHOT_SCHEDULER_SCHEDULE_ADD_FAILED | error                | Error details
SNAPSHOT_SCHEDULER_SCHEDULE_EDITED | status               | Succss Status
SNAPSHOT_SCHEDULER_SCHEDULE_EDIT_FAILED | error                | Error details
SNAPSHOT_SCHEDULER_SCHEDULE_DELETED | status               | Succss Status
SNAPSHOT_SCHEDULER_SCHEDULE_DELETE_FAILED | error                | Error details

### Svc Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
SVC_MANAGER_FAILED             | volume               | Volume Name if available
                               | svc_name             | Service Name
SVC_CONNECTED                  | volume               | Volume Name if available
                               | svc_name             | Service Name
SVC_DISCONNECTED               | svc_name             | Service Name

### Peer Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
PEER_STORE_FAILURE             | peer                 | Hostname or IP
PEER_RPC_CREATE_FAILED         | peer                 | Hostname or IP
PEER_REJECT                    | peer                 | Hostname or IP
PEER_CONNECT                   | host                 | Hostname or IP
                               | uuid                 | Host UUID
PEER_DISCONNECT                | host                 | Hostname or IP
                               | uuid                 | Host UUID
                               | state                | Disconnect State
PEER_NOT_FOUND                 | peer                 | Hostname or IP
                               | uuid                 | Host UUID

### Unknown Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
UNKNOWN_PEER                   | peer                 | Hostname or IP

### Brick Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
BRICK_START_FAILED             | peer                 | Hostname or IP
                               | volume               | Volume Name
                               | brick                | Brick
BRICK_STOP_FAILED              | peer                 | Hostname or IP
                               | volume               | Volume Name
                               | brick                | Brick
BRICK_DISCONNECTED             | peer                 | Hostname or IP
                               | volume               | Volume Name
                               | brick                | Brick
BRICK_CONNECTED                | peer                 | Hostname or IP
                               | volume               | Volume Name
                               | brick                | Brick

### Bricks Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
BRICKS_START_FAILED            | volume               | Volume Name

### Brickpath Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
BRICKPATH_RESOLVE_FAILED       | peer                 | Hostname or IP
                               | volume               | Volume Name
                               | brick                | Brick

### Notify Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
NOTIFY_UNKNOWN_OP              | op                   | Operation Name

### Quorum Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
QUORUM_LOST                    | volume               | Volume Name
QUORUM_REGAINED                | volume               | Volume Name

### Rebalance Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
REBALANCE_START_FAILED         | volume               | Volume Name
REBALANCE_STATUS_UPDATE_FAILED | volume               | Volume Name

### Import Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
IMPORT_QUOTA_CONF_FAILED       | volume               | Volume Name
IMPORT_VOLUME_FAILED           | volume               | Volume Name
IMPORT_BRICK_FAILED            | peer                 | Hostname or IP
                               | brick                | Brick details

### Compare Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
COMPARE_FRIEND_VOLUME_FAILED   | volume               | Volume Name

### Ec Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
EC_MIN_BRICKS_NOT_UP           | subvol               | Subvolume
EC_MIN_BRICKS_UP               | subvol               | Subvolume

### Georep Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
GEOREP_FAULTY                  | master_node          | Hostname or IP of Master Volume
                               | brick_path           | Brick Path
                               | slave_host           | Slave Hostname or IP
                               | master_volume        | Master Volume Name
                               | current_slave_host   | Current Slave Host to which Geo-rep worker was trying to connect to
                               | slave_volume         | Slave Volume Name

### Quota Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
QUOTA_CROSSED_SOFT_LIMIT       | usage                | Usage
                               | volume               | Volume Name
                               | path                 | Path

### Bitrot Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
BITROT_BAD_FILE                | gfid                 | GFID of File
                               | path                 | Path if Available
                               | brick                | Brick details

### Client Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
CLIENT_CONNECT                 | client_identifier    | Client Identifier
                               | client_uid           | Client UID
                               | server_identifier    | Server Identifier
                               | brick_path           | Path of Brick
CLIENT_AUTH_REJECT             | client_identifier    | Client Identifier
                               | client_uid           | Client UID
                               | server_identifier    | Server Identifier
                               | brick_path           | Path of Brick
CLIENT_DISCONNECT              | client_identifier    | Client Identifier
                               | client_uid           | Client UID
                               | server_identifier    | Server Identifier
                               | brick_path           | Path of Brick

### Posix Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
POSIX_SAME_GFID                | gfid                 | GFID of File
                               | path                 | Path of File
                               | newpath              | New Path of File
                               | brick                | Brick details
POSIX_ALREADY_PART_OF_VOLUME   | volume-id            | Volume ID
                               | brick                | Brick details
POSIX_BRICK_NOT_IN_VOLUME      | brick                | Brick details
POSIX_BRICK_VERIFICATION_FAILED | brick                | Brick details
POSIX_ACL_NOT_SUPPORTED        | brick                | Brick details
POSIX_HEALTH_CHECK_FAILED      | path                 | Path
                               | brick                | Brick details
                               | op                   | Error Number
                               | error                | Error

### Afr Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
AFR_QUORUM_MET                 | subvol               | Sub Volume Name
AFR_QUORUM_FAIL                | subvol               | Sub Volume Name
AFR_SUBVOL_UP                  | subvol               | Sub Volume Name
AFR_SUBVOLS_DOWN               | subvol               | Sub Volume Name
AFR_SPLIT_BRAIN                | subvol               | Sub Volume Name

### Tier Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
TIER_ATTACH                    | vol                  | Volume Name
TIER_ATTACH_FORCE              | vol                  | Volume Name
TIER_DETACH_START              | vol                  | Volume Name
TIER_DETACH_STOP               | vol                  | Volume Name
TIER_DETACH_COMMIT             | vol                  | Volume Name
TIER_DETACH_FORCE              | vol                  | Volume Name
TIER_PAUSE                     | vol                  | Volume Name
TIER_RESUME                    | vol                  | Volume Name
TIER_WATERMARK_HI              | vol                  | Volume Name
TIER_WATERMARK_DROPPED_TO_MID  | vol                  | Volume Name
TIER_WATERMARK_RAISED_TO_MID   | vol                  | Volume Name
TIER_WATERMARK_DROPPED_TO_LOW  | vol                  | Volume Name

### Volume Events
Event Type                     | Attribute            | Description
------------------------------ | -------------------- | -----------
VOLUME_ADD_BRICK               | volume               | Volume Name
                               | bricks               | Bricks details separated by Space
VOLUME_REMOVE_BRICK_START      | volume               | Volume Name
                               | bricks               | Bricks details separated by Space
VOLUME_REMOVE_BRICK_COMMIT     | volume               | Volume Name
                               | bricks               | Bricks details separated by Space
VOLUME_REMOVE_BRICK_STOP       | volume               | Volume Name
                               | bricks               | Bricks details separated by Space
VOLUME_REMOVE_BRICK_FORCE      | volume               | Volume Name
                               | bricks               | Bricks details separated by Space
VOLUME_REBALANCE_START         | volume               | Volume Name
VOLUME_REBALANCE_STOP          | volume               | Volume Name
VOLUME_REBALANCE_FAILED        | volume               | Volume Name
VOLUME_REBALANCE_COMPLETE      | volume               | Volume Name
