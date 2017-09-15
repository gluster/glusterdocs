## Fixing "Peer Rejected" 

If you run 

        gluster peer status


and the status of any node in the list is "Peer Rejected", it means the volume configuration
on that peer is out of sync with the rest of the cluster.

Fixing this is pretty easy...

On the rejected peer:

1.  Stop glusterd
2.  In /var/lib/glusterd, delete everything except glusterd.info (the
    UUID file)
3.  Start glusterd
4.  Probe one of the good peers

                gluster peer probe <server>

5.  Restart glusterd, check 'gluster peer status'
6.  You may need to restart glusterd another time or two, keep checking
    peer status.

Try the whole procedure a couple more times if it doesn't work right
away.
