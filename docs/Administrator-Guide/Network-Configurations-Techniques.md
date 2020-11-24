# Network Configurations Techniques
#### Bonding best practices

Bonded network interfaces incorporate multiple physical interfaces into a single logical bonded interface, with a single IP addr. An N-way bonded interface can survive loss of N-1 physical interfaces, and performance can be improved in some cases.

###### When to bond?

-   Need high availability for network link
-   Workload: sequential access to large files (most time spent reading/writing)
-   Network throughput limit of client/server \<\< storage throughput limit
    -   1 GbE (almost always)
    -   10-Gbps links or faster -- for writes, replication doubles the load on the network and replicas are usually on different peers to which the client can transmit in parallel.
-   LIMITATION: Bonding mode 6 doesn't improve throughput if network peers are not on the same VLAN.

###### How to configure

-   [Bonding-howto](http://www.linuxquestions.org/linux/answers/Networking/Linux_bonding_howto_0)
-   Best bonding mode for Gluster client is mode 6 (balance-alb), this allows client to transmit writes in parallel on separate NICs much of the time. A peak throughput of 750 MB/s on writes from a single client was observed with bonding mode 6 on 2 10-GbE NICs with jumbo frames. That's 1.5 GB/s of network traffic.
-   Another way to balance both transmit and receive traffic is bonding mode 4 (802.3ad) but this requires switch configuration (trunking commands)
-   Still another way to load balance is bonding mode 2 (balance-xor) with option "xmit\_hash\_policy=layer3+4". The bonding modes 6 and 2 will not improve single-connection throughput, but improve aggregate throughput across all connections.

##### Jumbo frames

Jumbo frames are Ethernet (or Infiniband) frames with size greater than the default of 1500 bytes (Infiniband default is around 2000 bytes). Increasing frame size reduces load on operating system and hardware, which must process interrupts and protocol messages per frame.

###### When to configure?

-   Any network faster than 1-GbE
-   Workload is sequential large-file reads/writes
-   LIMITATION: Requires all network switches in VLAN must be configured to handle jumbo frames, do not configure otherwise.

###### How to configure?

-   Edit network interface file at /etc/sysconfig/network-scripts/ifcfg-your-interface
-   Ethernet (on ixgbe driver): add "MTU=9000" (MTU means "maximum transfer unit") record to network interface file
-   Infiniband (on mlx4 driver): add "CONNECTED\_MODE=yes" and "MTU=65520" records to network interface file
-   ifdown your-interface; ifup your-interface
-   Test with "ping -s 16384 other-host-on-VLAN"
-   Switch requires max frame size larger than MTU because of protocol headers, usually 9216 bytes

##### Configuring a backend network for storage

This method lets you add network capacity for multi-protocol sites by segregating traffic for different protocols on different network interfaces. This method can lower latency and improve throughput. For example, this method can keep self-heal and rebalancing traffic from competing with non-Gluster client traffic for a network interface, and will better support multi-stream I/O.

###### When to configure?

-   For non-Gluster services such as NFS, Swift (REST), CIFS being provided on Gluster servers. It will not help Gluster clients (external nodes with Gluster mountpoints on them).
-   Network port is over-utilized.

###### How to configure?

-   Most network cards have multiple ports on them -- make port 1 the non-Gluster port and port 2 the Gluster port.
-   Separate Gluster ports onto a separate VLAN from non-Gluster ports, to simplify configuration.
