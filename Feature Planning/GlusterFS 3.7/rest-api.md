Feature
-------

REST API for GlusterFS

Summary
-------

Provides REST API for Gluster Volume and Peer Management.

Owners
------

Aravinda VK <mail@aravindavk.in> (http://aravindavk.in)

Current status
--------------

REST API is not available in GlusterFS.

Detailed Description
--------------------

GlusterFS REST service can be started by running following command in
any node.

        sudo glusterrest -p 8080

Features:

-   No Separate server required, command can be run in any one node.
-   Provides Basic authentication(user groups can be added)
-   Any REST client can be used.
-   JSON output

Benefit to GlusterFS
--------------------

Provides REST API for GlusterFS cluster.

Scope
-----

### Nature of proposed change

New code.

### Implications on manageability

### Implications on presentation layer

### Implications on persistence layer

### Implications on 'GlusterFS' backend

### Modification to GlusterFS metadata

### Implications on 'glusterd'

How To Test
-----------

User Experience
---------------

Dependencies
------------

Documentation
-------------

### Usage:

New CLI command will be available \`glusterrest\`,

    usage: glusterrest [-h] [-p PORT] [--users USERS] 
                       [--no-password-hash] 

    optional arguments:
      -h, --help            show this help message and exit
      -p PORT, --port PORT  PORT Number
      -u USERS, --users USERS
                            Users JSON file
      --no-password-hash    No Password Hash
     

Following command will start the REST server in the given port(8080 in
this example).

        sudo glusterrest -p 8080 --users /root/secured_dir/gluster_users.json

Format of users json file(List of key value pairs, username and
password):

    [
    {"username": "aravindavk", "password": "5ebe2294ecd0e0f08eab7690d2a6ee69"}
    ]

Password is md5 hash, if no hash required then use --no-password-hash
while running glusterrest command.

### API Documentation

Getting list of peers

        GET    /api/1/peers

Peer Probe

        CREATE    /api/1/peers/:hostname

Peer Detach

        DELETE    /api/1/peers/:hostname

Creating Gluster volumes

        CREATE /api/1/volumes/:name
        CREATE /api/1/volumes/:name/force

Deleting Gluster Volume

        DELETE /api/1/volumes/:name
        DELETE /api/1/volumes/:name/stop

Gluster volume actions

        POST   /api/1/volumes/:name/start
        POST   /api/1/volumes/:name/stop
        POST   /api/1/volumes/:name/start-force
        POST   /api/1/volumes/:name/stop-force
        POST   /api/1/volumes/:name/restart

Gluster Volume modifications

        PUT    /api/1/volumes/:name/add-brick
        PUT    /api/1/volumes/:name/remove-brick
        PUT    /api/1/volumes/:name/set
        PUT    /api/1/volumes/:name/reset

Getting volume information

        GET    /api/1/volumes
        GET    /api/1/volumes/:name

Status
------

50% Coding complete, Started writing documentation.

Comments and Discussion
-----------------------
