## Before filing an issue

If you are finding any issues, these preliminary checks as useful:

- Is SELinux enabled? (you can use `getenforce` to check)
- Are iptables rules blocking any data traffic? (`iptables -L` can
  help check)
- Are all the nodes reachable from each other? [ Network problem ]
- Please search [issues](https://github.com/gluster/glusterfs/issues)
  to see if the bug has already been reported

      - If an issue has been already filed for a particular release and you found the issue in another release, add a comment in issue.

Anyone can search in github issues, you don't need an account. Searching
requires some effort, but helps avoid duplicates, and you may find that
your problem has already been solved.

## Reporting An Issue

- You should have an account with github.com
- Here is the link to file an issue:
  [Github](https://github.com/gluster/glusterfs/issues/new)

_Note: Please go through all below sections to understand what
information we need to put in a bug. So it will help the developer to
root cause and fix it_

### Required Information

You should gather the information below before creating the bug report.

#### Package Information

- Location from which the packages are used
- Package Info - version of glusterfs package installed

#### Cluster Information

- Number of nodes in the cluster
- Hostnames and IPs of the gluster Node [if it is not a security
  issue]

      - Hostname / IP will help developers in understanding & correlating with the logs

- Output of `gluster peer status`
- Node IP, from which the "x" operation is done

      - "x" here means any operation that causes the issue

#### Volume Information

- Number of volumes
- Volume Names
- Volume on which the particular issue is seen [ if applicable ]
- Type of volumes
- Volume options if available
- Output of `gluster volume info`
- Output of `gluster volume status`
- Get the statedump of the volume with the problem `gluster volume statedump <vol-name>`

This dumps statedump per brick process in `/var/run/gluster`

_NOTE: Collect statedumps from one gluster Node in a directory._

Repeat it in all Nodes containing the bricks of the volume. All the so
collected directories could be archived, compressed and attached to bug

#### Brick Information

- xfs options when a brick partition was done

      - This could be obtained with this command: `xfs_info /dev/mapper/vg1-brick`

- Extended attributes on the bricks

      - This could be obtained with this command: `getfattr -d -m. -ehex /rhs/brick1/b1`

#### Client Information

- OS Type ( Ubuntu, Fedora, RHEL )
- OS Version: In case of Linux distro get the following :

```console
uname -r
cat /etc/issue
```

- Fuse or NFS Mount point on the client with output of mount commands
- Output of `df -Th` command

#### Tool Information

- If any tools are used for testing, provide the info/version about it
- if any IO is simulated using a script, provide the script

#### Logs Information

- You can check logs for issues/warnings/errors.

      - Self-heal logs
      - Rebalance logs
      - Glusterd logs
      - Brick logs
      - NFS logs (if applicable)
      - Samba logs (if applicable)
      - Client mount log

- Add the entire logs as attachment, if its very large to paste as a
  comment

#### SOS report for CentOS/Fedora

- Get the sosreport from the involved gluster Node and Client [ in
  case of CentOS /Fedora ]
- Add a meaningful name/IP to the sosreport, by renaming/adding
  hostname/ip to the sosreport name
