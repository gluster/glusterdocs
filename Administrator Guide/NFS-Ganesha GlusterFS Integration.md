# Configuring NFS-Ganesha over GlusterFS

NFS-Ganesha is a user space file server for the NFS protocol with support for NFSv3, v4, v4.1, pNFS. It provides a FUSE-compatible File System Abstraction Layer(FSAL) to allow the file-system developers to plug in their own storage mechanism and access it from any NFS client. NFS-Ganesha can access the FUSE filesystems directly through its FSAL without copying any data to or from the kernel, thus potentially improving response times.

##  Installing nfs-ganesha

#### Gluster RPMs (>= 3.12)
> glusterfs-server

> glusterfs-api

> glusterfs-ganesha

#### Ganesha RPMs (>= 2.6)
> nfs-ganesha

> nfs-ganesha-gluster

## Start NFS-Ganesha manually

- To start NFS-Ganesha manually, use the command:
    -  *service nfs-ganesha start*
```sh
where:
/var/log/ganesha.log is the default log file for the ganesha process.
/etc/ganesha/ganesha.conf is the default configuration file
NIV_EVENT is the default log level. You can modify all the options in /run/sysconfig/ganesha and restart nfs-ganesha
```
- If user want to run ganesha in prefered mode, execute the following command :
     - *#ganesha.nfsd -f \<location_of_nfs-ganesha.conf_file\> -L \<location_of_log_file\> -N \<log_level\>*

```sh
For example:
#ganesha.nfsd -f nfs-ganesha.conf -L nfs-ganesha.log -N NIV_DEBUG
where:
nfs-ganesha.log is the log file for the ganesha.nfsd process.
nfs-ganesha.conf is the configuration file
NIV_DEBUG is the log level. 
```
- By default exportlist for the server will be Null

```sh
Note : include following parameters in ganesha configuration file for exporting gluster volumes
NFS_Core_Param {
        #Use supplied name other tha IP In NSM operations
        NSM_Use_Caller_Name = true;
        #Copy lock states into "/var/lib/nfs/ganesha" dir
        Clustered = false;
        #Use a non-privileged port for RQuota
        Rquota_Port = 875;
}
```
## Step by step procedures to exporting GlusterFS volume via NFS-Ganesha

#### step 1 :

To export any GlusterFS volume or directory inside volume, create the EXPORT block for each of those entries in a export configuration  file. The following parameters are required to export any entry.
- *#cat export.conf*

```sh
EXPORT{
	Export_Id = 1 ;   # Export ID unique to each export
	Path = "volume_path";  # Path of the volume to be exported. Eg: "/test_volume"

	FSAL {
		name = GLUSTER;
		hostname = "10.xx.xx.xx";  # IP of one of the nodes in the trusted pool
		volume = "volume_name";	 # Volume name. Eg: "test_volume"
	}

	Access_type = RW;	 # Access permissions
	Squash = No_root_squash; # To enable/disable root squashing
	Disable_ACL = TRUE;	 # To enable/disable ACL
	Pseudo = "pseudo_path";	 # NFSv4 pseudo path for this export. Eg: "/test_volume_pseudo"
	Protocols = "3","4" ;	 # NFS protocols supported
	Transports = "UDP","TCP" ; # Transport protocols supported
	SecType = "sys";	 # Security flavors supported
}
```

#### step 2 :

Now include the export configuration file in the ganesha configuration file(by default ).This can be done by adding the line below at the end of file
   - %include “\<path of export configuration\>”

#### step 3 :
Turn on features.cache-invalidation for that volume
-   gluster volume set \<volume name\> features.cache-invalidation on

#### step 4 :
dbus commands are used to export/unexport volume <br />
- export
	- *#dbus-send  --system --print-reply --dest=org.ganesha.nfsd  /org/ganesha/nfsd/ExportMgr org.ganesha.nfsd.exportmgr.AddExport  string:<ganesha directory>/exports/export.<volume name>.conf string:"EXPORT(Path=/\<volume name\>)"*

- unexport
	- *#dbus-send  --system --dest=org.ganesha.nfsd  /org/ganesha/nfsd/ExportMgr org.ganesha.nfsd.exportmgr.RemoveExport uint16:\<export id\>*

#### step 5 :
   - To check if the volume is exported, run
       - *#showmount -e localhost*
   - Or else use the following dbus command
       - *#dbus-send --type=method_call --print-reply --system --dest=org.ganesha.nfsd /org/ganesha/nfsd/ExportMgr  org.ganesha.nfsd.exportmgr.ShowExports*
   - To see clients
       - *#dbus-send --type=method_call --print-reply --system --dest=org.ganesha.nfsd /org/ganesha/nfsd/ClientMgr org.ganesha.nfsd.clientmgr.ShowClients*

## Using Highly Available Active-Active using Storhaug
Please refer the wiki(still need a alot) in https://github.com/gluster/storhaug/wiki

## Configuring Gluster volume for pNFS
The Parallel Network File System (pNFS) is part of the NFS v4.1 protocol that allows compute clients to access storage devices directly and in parallel. The pNFS cluster consists of MDS(Meta-Data-Server) and DS (Data-Server). The client sends all the read/write requests directly to DS and all other operations are handle by the MDS.

### Step by step guide

  - Turn on feature.cache-invalidation for the volume.
       - gluster v set \<volname\> features.cache-invalidation on

-  Select one of nodes in cluster as MDS and configure it adding following block to ganesha configuration file
```sh
GLUSTER
{
 PNFS_MDS = true;
}
```
-  Mannually start NFS-Ganesha in every node in the cluster.

- Check whether volume is exported via nfs-ganesha in all the nodes.
    - *#showmount -e localhost*

-  Mount the volume using NFS version 4.1 protocol with the ip of MDS
    -  *#mount -t nfs4 -o minorversion=1 \<ip of MDS\>:/\<volume name\> \<mount path\>*

### Points to be Noted

   - Current architecture supports only single MDS and mulitple DS. The server with which client mounts will act as MDS and all severs including MDS can act as DS.

   - Currently HA is not supported for pNFS(more specifically MDS). Although it is configurable, but consistency is guaranteed across the cluster.

   - If any of the DS goes down, then MDS will handle those I/O's.

   - Hereafter, all the subsequent NFS clients need to use same server for mounting that volume via pNFS. i.e more than one MDS for a volume is not prefered

   - pNFS support is only tested with distributed, replicated or distribute-replicate volumes

   - It is tested and verified with RHEL 6.5 , fedora 20, fedora 21 nfs clients. It is always better to use latest nfs-clients

## Tunables for NFS-Ganesha
- NFS_CORE_PARAM {} in ganesha.conf
	- Large no of clients: RPC_Max_Connections (default is 1000)
	- Large file workload: Nb_Worker – no of worker thread (default 256)
- CACHEINODE {} in ganesha.conf
	- Small file workload Entries_HWMark – entries saved in md cache(default 100k)
	- For larger directory workload
		No of directory entry cache = Chunks_HWMark x Dir_Chunk
		Default: 128 lakh		     = 	128 X 1 lakh
- system limit on FDs (ulimit -n), ganesha limits no of open fd’s based on that
