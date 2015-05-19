Peer Rejected is a state a peer can be in. If you see a peer in this
state when you run 'gluster peer status' that means volume configuration
on that peer is out of sync with the rest of the cluster.

Fixing this is pretty easy...

On the rejected peer:

1.  Stop glusterd
2.  In /var/lib/glusterd, delete everything except glusterd.info (the
    UUID file)
3.  Start glusterd
4.  Probe one of the good peers
5.  Restart glusterd, check 'gluster peer status'
6.  You may need to restart glusterd another time or two, keep checking
    peer status.

Try the whole procedure a couple more times if it doesn't work right
away.