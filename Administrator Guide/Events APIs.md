# Events APIs

*New in version 3.9*

## Enable and Start Events APIs

Enable and Start glustereventsd in all peer nodes

In Systems using Systemd,

    systemctl enable glustereventsd
    systemctl start glustereventsd

FreeBSD or others, add the following in `/etc/rc.conf`

    glustereventsd_enable="YES"

And start the glustereventsd using,

    service glustereventsd start

SysVInit(CentOS 6),

    chkconfig glustereventsd on
    service glustereventsd start

## Status

Status Can be checked using,

    gluster-eventsapi status

Example output:

    Webhooks:
    None

    +-----------+-------------+-----------------------+
    |    NODE   | NODE STATUS | GLUSTEREVENTSD STATUS |
    +-----------+-------------+-----------------------+
    | localhost |          UP |                    UP |
    | node2     |          UP |                    UP |
    +-----------+-------------+-----------------------+

## Webhooks
**Webhooks** are similar to callbacks(over HTTP), on event Gluster will
call the Webhook URL(via POST) which is configured. Webhook is a web
server which listens on a URL, this can be deployed outside of the
Cluster. Gluster nodes should be able to access this Webhook server on
the configured port.

Example Webhook written in python,

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

Test and Register webhook using following commands,

    usage: gluster-eventsapi webhook-test [-h] [--bearer_token BEARER_TOKEN] url

    positional arguments:
      url                   URL of Webhook

    optional arguments:
      -h, --help            show this help message and exit
      --bearer_token BEARER_TOKEN, -t BEARER_TOKEN
                            Bearer Token

Example(Webhook server is running in `192.168.122.188:9000`),

    gluster-eventing webhook-test http://192.168.122.188:9000/listen

    +-----------+-------------+----------------+
    |    NODE   | NODE STATUS | WEBHOOK STATUS |
    +-----------+-------------+----------------+
    | localhost |          UP |             OK |
    | node2     |          UP |             OK |
    +-----------+-------------+----------------+

If Webhook status is OK from all peer nodes then register the Webhook
using,

    usage: gluster-eventsapi webhook-add [-h] [--bearer_token BEARER_TOKEN] url

    positional arguments:
      url                   URL of Webhook

    optional arguments:
      -h, --help            show this help message and exit
      --bearer_token BEARER_TOKEN, -t BEARER_TOKEN
                            Bearer Token

Example,

    gluster-eventing webhook-add http://192.168.122.188:9000/listen

    +-----------+-------------+-------------+
    |    NODE   | NODE STATUS | SYNC STATUS |
    +-----------+-------------+-------------+
    | localhost |          UP |          OK |
    | node2     |          UP |          OK |
    +-----------+-------------+-------------+

**Note**: If Sync status is Not OK for any node, then make sure to run
following command from a peer node when that node comes up.

    gluster-eventsapi sync

To unsubscribe from events, delete the webhook using following command

    usage: gluster-eventsapi webhook-del [-h] url

    positional arguments:
      url         URL of Webhook

    optional arguments:
      -h, --help  show this help message and exit

Example,

    gluster-eventing webhook-del http://192.168.122.188:9000/listen

## Configuration

View all configurations using,

    usage: gluster-eventsapi config-get [-h] [--name NAME]

    optional arguments:
      -h, --help   show this help message and exit
      --name NAME  Config Name

Example output:

    +-----------+-------+
    |    NAME   | VALUE |
    +-----------+-------+
    | log_level | INFO  |
    |    port   | 24009 |
    +-----------+-------+

To change any configuration,

    usage: gluster-eventsapi config-set [-h] name value

    positional arguments:
      name        Config Name
      value       Config Value

    optional arguments:
      -h, --help  show this help message and exit

Example output,

    +-----------+-------------+-------------+
    |    NODE   | NODE STATUS | SYNC STATUS |
    +-----------+-------------+-------------+
    | localhost |          UP |          OK |
    | node2     |          UP |          OK |
    +-----------+-------------+-------------+

To Reset any configuration,

    usage: gluster-eventsapi config-reset [-h] name

    positional arguments:
      name        Config Name or all

    optional arguments:
      -h, --help  show this help message and exit

Example output,

    +-----------+-------------+-------------+
    |    NODE   | NODE STATUS | SYNC STATUS |
    +-----------+-------------+-------------+
    | localhost |          UP |          OK |
    | node2     |          UP |          OK |
    +-----------+-------------+-------------+

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

    {
            "nodeid": "95cd599c-5d87-43c1-8fba-b12821fd41b6",
            "ts": 1468303352,
            "event": "VOLUME_CREATE",
            "message": {
                "name": "gv1"
            }
    }

"message" can have following attributes based on the type of event.

### Peers Events
Event Type       | Attribute | Description
---------------- | --------- | -----------
PEER_ATTACH      | host      | Hostname or IP
PEER_DETACH      | host      | Hostname or IP

### Volume Events
Event Type       | Attribute | Description
---------------- | --------- | -----------
VOLUME_CREATE    | name      | Volume Name
VOLUME_START     | name      | Volume Name
                 | force     | Force option used in Volume Start
VOLUME_STOP      | name      | Volume Name
                 | force     | Force option used in Volume Stop
VOLUME_SET       | name      | Volume Name
                 | options   | List of Tuples(Name, Value)
VOLUME_RESET     | name      | Volume Name
                 | option    | Option Name
VOLUME_DELETE    | name      | Volume Name
