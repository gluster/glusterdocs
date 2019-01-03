# Setup AWS
*Note: You only need one of the three setup methods!*

### Setup, Method 3 – Deploying in AWS

Deploying in Amazon can be one of the fastest ways to get up and running
with Gluster. Of course, most of what we cover here will work with other
cloud platforms.

-   Deploy at least two instances. For testing, you can use micro
    instances (I even go as far as using spot instances in most cases).
    Debates rage on what size instance to use in production, and there
    is really no correct answer. As with most things, the real answer is
    “whatever works for you”, where the trade-offs between cost and
    performance are balanced in a continual dance of trying to make your
    project successful while making sure there is enough money left over
    in the budget for you to get that sweet new ping pong table in the
    break room.
-   For cloud platforms, your data is wide open right from the start. As
    such, you shouldn’t allow open access to all ports in your security
    groups if you plan to put a single piece of even the least valuable
    information on the test instances. By least valuable, I mean “Cash
    value of this coupon is 1/100th of 1 cent” kind of least valuable.
    Don’t be the next one to end up as a breaking news flash on the
    latest inconsiderate company to allow their data to fall into the
    hands of the baddies. See Step 2 for the minimum ports you will need
    open to use Gluster
-   You can use the free “ephemeral” storage for the Gluster bricks
    during testing, but make sure to use some form of protection against
    data loss when you move to production. Typically this means EBS
    backed volumes or using S3 to periodically back up your data bricks.

Other notes:

-   In production, it is recommended to replicate your VM’s across
    multiple zones. For purpose of this tutorial, it is overkill, but if
    anyone is interested in this please let us know since we are always
    looking to write articles on the most requested features and
    questions.
-   Using EBS volumes and Elastic IP’s is also recommended in
    production. For testing, you can safely ignore these as long as you
    are aware that the data could be lost at any moment, so make sure
    your test deployment is just that, testing only.
-   Performance can fluctuate wildly in a cloud environment. If
    performance issues are seen, there are several possible strategies,
    but keep in mind that this is the perfect place to take advantage of
    the scale-out capability of Gluster. While it is not true in all
    cases that deploying more instances will necessarily result in a
    “faster” cluster, in general, you will see that adding more nodes
    means more performance for the cluster overall.
-   If a node reboots, you will typically need to do some extra work to
    get Gluster running again using the default EC2 configuration. If a
    node is shut down, it can mean absolute loss of the node (depending
    on how you set things up). This is well beyond the scope of this
    document, but is discussed in any number of AWS related forums and
    posts. Since I found out the hard way myself (oh, so you read the
    manual every time?!), I thought it worth at least mentioning.


Once you have both instances up, you can proceed to the [install](./Install.md) page.
