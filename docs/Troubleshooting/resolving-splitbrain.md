Heal info and split-brain resolution 
=======================================
This document explains the  heal info command available in gluster for monitoring pending heals in replicate volumes and the methods available to resolve split-brains.  

## Types of Split-Brains:

A file is said to be in split-brain when Gluster AFR cannot determine which copy in the replica
is the correct one.

There are three types of split-brains:

-  Data split-brain: The data in the file differs on the bricks in the replica set
-  Metadata split-brain: The metadata differs on the bricks
-  Entry/GFID split-brain: The GFID of the file is different on the bricks in the replica. This cannot be healed automatically.


## 1) Volume heal info:
Usage: `gluster volume heal <VOLNAME> info`

This lists all the files that require healing (and will be processed by the self-heal daemon). It prints either their path or their GFID.

### Interpreting the output
All the files listed in the output of this command need to be healed.
The files listed may also be accompanied by the following tags:

a) 'Is in split-brain'  
A file in data or metadata split-brain will 
be listed with " - Is in split-brain" appended after its path/GFID. E.g. 
"/file4" in the output provided below. However, for a file in GFID split-brain,
 the parent directory of the file is shown to be in split-brain and the file 
itself is shown to be needing healing, e.g. "/dir" in the output provided below 
is in split-brain because of GFID split-brain of file "/dir/a".
Files in split-brain cannot be healed without resolving the split-brain.

b) 'Is possibly undergoing heal'  
When the heal info command is run, it (or to be more specific, the 'glfsheal' binary that is executed when you run the command) takes locks on each file to find if it needs healing. However, if the self-heal daemon had already started healing the file, it would have taken locks which glfsheal wouldn't be able to acquire. In such a case, it could print this message. Another possible case could be multiple glfsheal processes running simultaneously (e.g. multiple users ran a heal info command at the same time) and competing for same lock.

The following is an example of heal info command's output.
### Example
Consider a replica volume "test" with two bricks b1 and b2;
self-heal daemon off, mounted at /mnt.

```console
# gluster volume heal test info
Brick \<hostname:brickpath-b1>
<gfid:aaca219f-0e25-4576-8689-3bfd93ca70c2> - Is in split-brain
<gfid:39f301ae-4038-48c2-a889-7dac143e82dd> - Is in split-brain
<gfid:c3c94de2-232d-4083-b534-5da17fc476ac> - Is in split-brain
<gfid:6dc78b20-7eb6-49a3-8edb-087b90142246>

Number of entries: 4

Brick <hostname:brickpath-b2>
/dir/file2
/dir/file1 - Is in split-brain
/dir - Is in split-brain
/dir/file3
/file4 - Is in split-brain
/dir/a


Number of entries: 6
```

### Analysis of the output
It can be seen that
A) from brick b1, four entries need healing:   
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1) file with gfid:6dc78b20-7eb6-49a3-8edb-087b90142246 needs healing  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2) "aaca219f-0e25-4576-8689-3bfd93ca70c2",
"39f301ae-4038-48c2-a889-7dac143e82dd" and "c3c94de2-232d-4083-b534-5da17fc476ac"
 are in split-brain

B) from brick b2 six entries need healing-  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1) "a", "file2" and "file3" need healing  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2) "file1", "file4" & "/dir" are in split-brain  

# 2. Volume heal info split-brain
Usage: `gluster volume heal <VOLNAME> info split-brain`  
This command only shows the list of files that are in split-brain. The output is therefore a subset of `gluster volume heal <VOLNAME> info`

### Example

```console
# gluster volume heal test info split-brain
Brick <hostname:brickpath-b1>
<gfid:aaca219f-0e25-4576-8689-3bfd93ca70c2>
<gfid:39f301ae-4038-48c2-a889-7dac143e82dd>
<gfid:c3c94de2-232d-4083-b534-5da17fc476ac>
Number of entries in split-brain: 3

Brick <hostname:brickpath-b2>
/dir/file1
/dir
/file4
Number of entries in split-brain: 3
```

Note that similar to the heal info command, for GFID split-brains (same filename but different GFID) 
their parent directories are listed to be in split-brain.

# 3. Resolution of split-brain using gluster CLI
Once the files in split-brain are identified, their resolution can be done
from the gluster command line using various policies. Entry/GFID split-brain resolution is not supported via this method. Split-brain resolution commands let the user resolve data and metadata split-brain using the following policies:

## i) Select the bigger-file as source
This command is useful for per file healing where it is known/decided that the
file with bigger size is to be considered as source.   
`gluster volume heal <VOLNAME> split-brain bigger-file <FILE>`  
Here, `<FILE>` can be either the full file name as seen from the root of the volume
(or) the GFID-string representation of the file, which sometimes gets displayed
in the heal info command's output. Once this command is executed, the replica containing the `<FILE>` with a bigger
size is found and healing is completed with that brick as a source.

### Example :
Consider the earlier output of the heal info split-brain command.

Before healing the file, notice file size and md5 checksums :  

On brick b1:

```console
[brick1]# stat b1/dir/file1
  File: ‘b1/dir/file1’
  Size: 17              Blocks: 16         IO Block: 4096   regular file
Device: fd03h/64771d    Inode: 919362      Links: 2
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2015-03-06 13:55:40.149897333 +0530
Modify: 2015-03-06 13:55:37.206880347 +0530
Change: 2015-03-06 13:55:37.206880347 +0530
 Birth: -
[brick1]#
[brick1]# md5sum b1/dir/file1
040751929ceabf77c3c0b3b662f341a8  b1/dir/file1
```

On brick b2:

```console
[brick2]# stat b2/dir/file1
  File: ‘b2/dir/file1’
  Size: 13              Blocks: 16         IO Block: 4096   regular file
Device: fd03h/64771d    Inode: 919365      Links: 2
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2015-03-06 13:54:22.974451898 +0530
Modify: 2015-03-06 13:52:22.910758923 +0530
Change: 2015-03-06 13:52:22.910758923 +0530
 Birth: -
[brick2]#
[brick2]# md5sum b2/dir/file1
cb11635a45d45668a403145059c2a0d5  b2/dir/file1
```

**Healing file1 using the above command** :-    
`gluster volume heal test split-brain bigger-file /dir/file1`  
Healed /dir/file1.

After healing is complete, the md5sum and file size on both bricks should be the same.

On brick b1:

```console
[brick1]# stat b1/dir/file1
  File: ‘b1/dir/file1’
  Size: 17              Blocks: 16         IO Block: 4096   regular file
Device: fd03h/64771d    Inode: 919362      Links: 2
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2015-03-06 14:17:27.752429505 +0530
Modify: 2015-03-06 13:55:37.206880347 +0530
Change: 2015-03-06 14:17:12.880343950 +0530
 Birth: -
[brick1]#
[brick1]# md5sum b1/dir/file1
040751929ceabf77c3c0b3b662f341a8  b1/dir/file1
```

On brick b2:

```console
[brick2]# stat b2/dir/file1
  File: ‘b2/dir/file1’
  Size: 17              Blocks: 16         IO Block: 4096   regular file
Device: fd03h/64771d    Inode: 919365      Links: 2
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2015-03-06 14:17:23.249403600 +0530
Modify: 2015-03-06 13:55:37.206880000 +0530
Change: 2015-03-06 14:17:12.881343955 +0530
 Birth: -
[brick2]#
[brick2]# md5sum b2/dir/file1
040751929ceabf77c3c0b3b662f341a8  b2/dir/file1
```

## ii) Select the file with the latest mtime as source

```console
gluster volume heal <VOLNAME> split-brain latest-mtime <FILE>
```

As is perhaps self-explanatory, this command uses the brick having the latest modification time for `<FILE>` as the source for healing.

## iii) Select one of the bricks in the replica as the source for a particular file

```console
gluster volume heal <VOLNAME> split-brain source-brick <HOSTNAME:BRICKNAME> <FILE>
```

Here, `<HOSTNAME:BRICKNAME>` is selected as source brick and `<FILE>` present in the source brick is taken as the source for healing.

### Example :
Notice the md5 checksums and file size before and after healing.

Before heal :

On brick b1:

```console
[brick1]# stat b1/file4
  File: ‘b1/file4’
  Size: 4               Blocks: 16         IO Block: 4096   regular file
Device: fd03h/64771d    Inode: 919356      Links: 2
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2015-03-06 13:53:19.417085062 +0530
Modify: 2015-03-06 13:53:19.426085114 +0530
Change: 2015-03-06 13:53:19.426085114 +0530
 Birth: -
[brick1]#
[brick1]# md5sum b1/file4
b6273b589df2dfdbd8fe35b1011e3183  b1/file4
```

On brick b2:

```console
[brick2]# stat b2/file4
  File: ‘b2/file4’
  Size: 4               Blocks: 16         IO Block: 4096   regular file
Device: fd03h/64771d    Inode: 919358      Links: 2
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2015-03-06 13:52:35.761833096 +0530
Modify: 2015-03-06 13:52:35.769833142 +0530
Change: 2015-03-06 13:52:35.769833142 +0530
 Birth: -
[brick2]#
[brick2]# md5sum b2/file4
0bee89b07a248e27c83fc3d5951213c1  b2/file4
```

**Healing the file with gfid c3c94de2-232d-4083-b534-5da17fc476ac using the above command** :

```console
# gluster volume heal test split-brain source-brick test-host:/test/b1 gfid:c3c94de2-232d-4083-b534-5da17fc476ac
```

Healed gfid:c3c94de2-232d-4083-b534-5da17fc476ac.

After healing :

On brick b1:

```console
# stat b1/file4
  File: ‘b1/file4’
  Size: 4               Blocks: 16         IO Block: 4096   regular file
Device: fd03h/64771d    Inode: 919356      Links: 2
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2015-03-06 14:23:38.944609863 +0530
Modify: 2015-03-06 13:53:19.426085114 +0530
Change: 2015-03-06 14:27:15.058927962 +0530
 Birth: -
# md5sum b1/file4
b6273b589df2dfdbd8fe35b1011e3183  b1/file4
```

On brick b2:

```console
# stat b2/file4
 File: ‘b2/file4’
  Size: 4               Blocks: 16         IO Block: 4096   regular file
Device: fd03h/64771d    Inode: 919358      Links: 2
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2015-03-06 14:23:38.944609000 +0530
Modify: 2015-03-06 13:53:19.426085000 +0530
Change: 2015-03-06 14:27:15.059927968 +0530
 Birth: -
# md5sum b2/file4
b6273b589df2dfdbd8fe35b1011e3183  b2/file4
```

## iv) Select one brick of the replica as the source for all files

```console
gluster volume heal <VOLNAME> split-brain source-brick <HOSTNAME:BRICKNAME>
```

Consider a scenario where many files are in split-brain such that one brick of
replica pair is source. As the result of the above command all split-brained
files in `<HOSTNAME:BRICKNAME>` are selected as source and healed to the sink.

### Example:
Consider a volume having three entries "a, b and c" in split-brain.

```console
# gluster volume heal test split-brain source-brick test-host:/test/b1
Healed gfid:944b4764-c253-4f02-b35f-0d0ae2f86c0f.
Healed gfid:3256d814-961c-4e6e-8df2-3a3143269ced.
Healed gfid:b23dd8de-af03-4006-a803-96d8bc0df004.
Number of healed entries: 3
```

## Note:
As mentioned earlier, entry split-brain and gfid split-brain healing
 are not supported using CLI. Trying to heal /dir would fail as it is in entry split-brain.

### Example

```console
# gluster volume heal test split-brain source-brick test-host:/test/b1 /dir
Healing /dir failed:Operation not permitted.
Volume heal failed.
```

However, they can be fixed by deleting the file from all but one bricks. See [Fixing Directory entry split-brain](#dir-split-brain)

# An overview of working of heal info commands
When these commands are invoked, a "glfsheal" process is spawned which reads 
the entries from the various sub-directories under `/<brick-path>/.glusterfs/indices/` of all 
the bricks that are up (that it can connect to) one after another. These 
entries are GFIDs of files that might need healing. Once GFID entries from a 
brick are obtained, based on the lookup response of this file on each 
participating brick of replica-pair & trusted.afr.* extended attributes it is 
found out if the file needs healing, is in split-brain etc based on the 
requirement of each command and displayed to the user.


# 4. Resolution of split-brain from the mount point
A set of getfattr and setfattr commands have been provided to detect the data and metadata split-brain status of a file and resolve split-brain, if any, from mount point.

Consider a volume "test", having bricks b0, b1, b2 and b3.

```console
# gluster volume info test

Volume Name: test
Type: Distributed-Replicate
Volume ID: 00161935-de9e-4b80-a643-b36693183b61
Status: Started
Number of Bricks: 2 x 2 = 4
Transport-type: tcp
Bricks:
Brick1: test-host:/test/b0
Brick2: test-host:/test/b1
Brick3: test-host:/test/b2
Brick4: test-host:/test/b3
```

Directory structure of the bricks is as follows:

```console
# tree -R /test/b?
/test/b0
├── dir
│   └── a
└── file100

/test/b1
├── dir
│   └── a
└── file100

/test/b2
├── dir
├── file1
├── file2
└── file99

/test/b3
├── dir
├── file1
├── file2
└── file99
```

Some files in the volume are in split-brain.

```console
# gluster v heal test info split-brain
Brick test-host:/test/b0/
/file100
/dir
Number of entries in split-brain: 2

Brick test-host:/test/b1/
/file100
/dir
Number of entries in split-brain: 2

Brick test-host:/test/b2/
/file99
<gfid:5399a8d1-aee9-4653-bb7f-606df02b3696>
Number of entries in split-brain: 2

Brick test-host:/test/b3/
<gfid:05c4b283-af58-48ed-999e-4d706c7b97d5>
<gfid:5399a8d1-aee9-4653-bb7f-606df02b3696>
Number of entries in split-brain: 2
```

### To know data/metadata split-brain status of a file:

```console
getfattr -n replica.split-brain-status <path-to-file>
```

The above command executed from mount provides information if a file is in data/metadata split-brain. Also provides the list of afr children to analyze to get more information about the file.
This command is not applicable to gfid/directory split-brain.

### Example:
1) "file100" is in metadata split-brain. Executing the above mentioned command for file100 gives :

```console
# getfattr -n replica.split-brain-status file100
file: file100
replica.split-brain-status="data-split-brain:no    metadata-split-brain:yes    Choices:test-client-0,test-client-1"
```

2) "file1" is in data split-brain.

```console
# getfattr -n replica.split-brain-status file1
file: file1
replica.split-brain-status="data-split-brain:yes    metadata-split-brain:no    Choices:test-client-2,test-client-3"
```

3) "file99" is in both data and metadata split-brain.

```console
# getfattr -n replica.split-brain-status file99
file: file99
replica.split-brain-status="data-split-brain:yes    metadata-split-brain:yes    Choices:test-client-2,test-client-3"
```

4) "dir" is in directory split-brain but as mentioned earlier, the above command is not applicable to such split-brain. So it says that the file is not under data or metadata split-brain.

```console
# getfattr -n replica.split-brain-status dir
file: dir
replica.split-brain-status="The file is not under data or metadata split-brain"
```

5) "file2" is not in any kind of split-brain.

```console
# getfattr -n replica.split-brain-status file2
file: file2
replica.split-brain-status="The file is not under data or metadata split-brain"
```

### To analyze the files in data and metadata split-brain
Trying to do operations (say cat, getfattr etc) from the mount on files in split-brain, gives an input/output error. To enable the users analyze such files, a setfattr command is provided.

```console
# setfattr -n replica.split-brain-choice -v "choiceX" <path-to-file>
```

Using this command, a particular brick can be chosen to access the file in split-brain from.

### Example:

1) "file1" is in data-split-brain. Trying to read from the file gives input/output error.

```console
# cat file1
cat: file1: Input/output error
```

Split-brain choices provided for file1 were test-client-2 and test-client-3.

Setting test-client-2 as split-brain choice for file1 serves reads from b2 for the file.

```console
# setfattr -n replica.split-brain-choice -v test-client-2 file1
```

Now, read operations on the file can be done.

```console
# cat file1
xyz
```

Similarly, to inspect the file from other choice, replica.split-brain-choice is to be set to test-client-3.

Trying to inspect the file from a wrong choice errors out.

To undo the split-brain-choice that has been set, the above mentioned setfattr command can be used 
with "none" as the value for extended attribute.

### Example:

```console
# setfattr -n replica.split-brain-choice -v none file1
```

Now performing cat operation on the file will again result in input/output error, as before.

```console
# cat file
cat: file1: Input/output error
```

Once the choice for resolving split-brain is made, source brick is supposed to be set for the healing to be done.
This is done using the following command:

```console
# setfattr -n replica.split-brain-heal-finalize -v <heal-choice> <path-to-file>
```

## Example

```console
# setfattr -n replica.split-brain-heal-finalize -v test-client-2 file1
```

The above process can be used to resolve data and/or metadata split-brain on all the files.

**NOTE**:

1) If "fopen-keep-cache" fuse mount option is disabled then inode needs to be invalidated each time before selecting a new replica.split-brain-choice to inspect a file. This can be done by using:

```console
# sefattr -n inode-invalidate -v 0 <path-to-file>
```

2) The above mentioned process for split-brain resolution from mount will not work on nfs mounts as it doesn't provide xattrs support.

# 5. Automagic unsplit-brain by [ctime|mtime|size|majority]
The CLI and fuse mount based resolution methods require intervention in the sense that the admin/ user needs to run the commands manually. There is a   `cluster.favorite-child-policy` volume option which when set to one of the various policies available, automatically resolve split-brains without user intervention. The default value is 'none', i.e. it is disabled.

```console
# gluster volume set help | grep -A3 cluster.favorite-child-policy
Option: cluster.favorite-child-policy
Default Value: none
Description: This option can be used to automatically resolve split-brains using various policies without user intervention. "size" picks the file with the biggest size as the source. "ctime" and "mtime" pick the file with the latest ctime and mtime respectively as the source. "majority" picks a file with identical mtime and size in more than half the number of bricks in the replica.
```

`cluster.favorite-child-policy` applies to all files of the volume. It is assumed that if this option is enabled with a particular policy, you don't care to examine the split-brain files on a per file basis but just want the split-brain to be resolved as and when it occurs based on the set policy.


<a name="manual-split-brain"></a>
# Manual Split-Brain Resolution:

Quick Start:
============
1. Get the path of the file that is in split-brain:  
>  It can be obtained either by  
>       a) The command `gluster volume heal info split-brain`.  
>       b) Identify the files for which file operations performed
           from the client keep failing with Input/Output error.

2. Close the applications that opened this file from the mount point.
In case of VMs, they need to be powered-off.

3. Decide on the correct copy:  
> This is done by observing the afr changelog extended attributes of the file on
the bricks using the getfattr command; then identifying the type of split-brain 
(data split-brain, metadata split-brain, entry split-brain or split-brain due to
gfid-mismatch); and finally determining which of the bricks contains the 'good copy'
of the file.  
>   `getfattr -d -m . -e hex <file-path-on-brick>`.  
It is also possible that one brick might contain the correct data while the
other might contain the correct metadata.

4. Reset the relevant extended attribute on the brick(s) that contains the
'bad copy' of the file data/metadata using the setfattr command.  
>   `setfattr -n <attribute-name> -v <attribute-value> <file-path-on-brick>`

5. Trigger self-heal on the file by performing lookup from the client:  
>   `ls -l <file-path-on-gluster-mount>`

Detailed Instructions for steps 3 through 5:  
===========================================
To understand how to resolve split-brain we need to know how to interpret the
afr changelog extended attributes.

Execute `getfattr -d -m . -e hex <file-path-on-brick>`

Example:

```console
[root@store3 ~]# getfattr -d -e hex -m. brick-a/file.txt
\#file: brick-a/file.txt
security.selinux=0x726f6f743a6f626a6563745f723a66696c655f743a733000
trusted.afr.vol-client-2=0x000000000000000000000000
trusted.afr.vol-client-3=0x000000000200000000000000
trusted.gfid=0x307a5c9efddd4e7c96e94fd4bcdcbd1b
```

The extended attributes with `trusted.afr.<volname>-client-<subvolume-index>`
are used by afr to maintain changelog of the file.The values of the
`trusted.afr.<volname>-client-<subvolume-index>` are calculated by the glusterfs
client (fuse or nfs-server) processes. When the glusterfs client modifies a file
or directory, the client contacts each brick and updates the changelog extended 
attribute according to the response of the brick.

'subvolume-index' is nothing but (brick number - 1) in
`gluster volume info <volname>` output.

Example:

```console
[root@pranithk-laptop ~]# gluster volume info vol
 Volume Name: vol
 Type: Distributed-Replicate
 Volume ID: 4f2d7849-fbd6-40a2-b346-d13420978a01
 Status: Created
 Number of Bricks: 4 x 2 = 8
 Transport-type: tcp
 Bricks:
 brick-a: pranithk-laptop:/gfs/brick-a
 brick-b: pranithk-laptop:/gfs/brick-b
 brick-c: pranithk-laptop:/gfs/brick-c
 brick-d: pranithk-laptop:/gfs/brick-d
 brick-e: pranithk-laptop:/gfs/brick-e
 brick-f: pranithk-laptop:/gfs/brick-f
 brick-g: pranithk-laptop:/gfs/brick-g
 brick-h: pranithk-laptop:/gfs/brick-h
```

In the example above:

```console
Brick             |    Replica set        |    Brick subvolume index
----------------------------------------------------------------------------
-/gfs/brick-a     |       0               |       0
-/gfs/brick-b     |       0               |       1
-/gfs/brick-c     |       1               |       2
-/gfs/brick-d     |       1               |       3
-/gfs/brick-e     |       2               |       4
-/gfs/brick-f     |       2               |       5
-/gfs/brick-g     |       3               |       6
-/gfs/brick-h     |       3               |       7
```

Each file in a brick maintains the changelog of itself and that of the files
present in all the other bricks in its replica set as seen by that brick.

In the example volume given above, all files in brick-a will have 2 entries, 
one for itself and the other for the file present in its replica pair, i.e.brick-b:  
trusted.afr.vol-client-0=0x000000000000000000000000 -->changelog for itself (brick-a)  
trusted.afr.vol-client-1=0x000000000000000000000000 -->changelog for brick-b as seen by brick-a  

Likewise, all files in brick-b will have:  
trusted.afr.vol-client-0=0x000000000000000000000000 -->changelog for brick-a as seen by brick-b  
trusted.afr.vol-client-1=0x000000000000000000000000 -->changelog for itself (brick-b)  

The same can be extended for other replica pairs.  

Interpreting Changelog (roughly pending operation count) Value:  
Each extended attribute has a value which is 24 hexa decimal digits.  
First 8 digits represent changelog of data. Second 8 digits represent changelog
of metadata. Last 8 digits represent Changelog of directory entries.  

Pictorially representing the same, we have:

```text
0x 000003d7 00000001 00000000
        |      |       |
        |      |        \_ changelog of directory entries
        |       \_ changelog of metadata
         \ _ changelog of data
```


For Directories metadata and entry changelogs are valid.
For regular files data and metadata changelogs are valid.
For special files like device files etc metadata changelog is valid.
When a file split-brain happens it could be either data split-brain or
meta-data split-brain or both. When a split-brain happens the changelog of the
file would be something like this:  

Example:(Lets consider both data, metadata split-brain on same file).

```console
[root@pranithk-laptop vol]# getfattr -d -m . -e hex /gfs/brick-?/a
getfattr: Removing leading '/' from absolute path names
\#file: gfs/brick-a/a
trusted.afr.vol-client-0=0x000000000000000000000000
trusted.afr.vol-client-1=0x000003d70000000100000000
trusted.gfid=0x80acdbd886524f6fbefa21fc356fed57
\#file: gfs/brick-b/a
trusted.afr.vol-client-0=0x000003b00000000100000000
trusted.afr.vol-client-1=0x000000000000000000000000
trusted.gfid=0x80acdbd886524f6fbefa21fc356fed57
```

### Observations:

#### According to changelog extended attributes on file /gfs/brick-a/a:

The first 8 digits of trusted.afr.vol-client-0 are all
zeros (0x00000000................), and the first 8 digits of
trusted.afr.vol-client-1 are not all zeros (0x000003d7................).
So the changelog on /gfs/brick-a/a implies that some data operations succeeded
on itself but failed on /gfs/brick-b/a.

The second 8 digits of trusted.afr.vol-client-0 are
all zeros (0x........00000000........), and the second 8 digits of
trusted.afr.vol-client-1 are not all zeros (0x........00000001........).
So the changelog on /gfs/brick-a/a implies that some metadata operations succeeded 
on itself but failed on /gfs/brick-b/a.

#### According to Changelog extended attributes on file /gfs/brick-b/a:

The first 8 digits of trusted.afr.vol-client-0 are not all
zeros (0x000003b0................), and the first 8 digits of
trusted.afr.vol-client-1 are all zeros (0x00000000................).
So the changelog on /gfs/brick-b/a implies that some data operations succeeded
on itself but failed on /gfs/brick-a/a.

The second 8 digits of trusted.afr.vol-client-0 are not
all zeros (0x........00000001........), and the second 8 digits of
trusted.afr.vol-client-1 are all zeros (0x........00000000........).
So the changelog on /gfs/brick-b/a implies that some metadata operations succeeded
on itself but failed on /gfs/brick-a/a.

Since both the copies have data, metadata changes that are not on the other
file, it is in both data and metadata split-brain.

#### Deciding on the correct copy:

The user may have to inspect stat,getfattr output of the files to decide which 
metadata to retain and contents of the file to decide which data to retain.
Continuing with the example above, lets say we want to retain the data
of /gfs/brick-a/a and metadata of /gfs/brick-b/a.

#### Resetting the relevant changelogs to resolve the split-brain:  

For resolving data-split-brain:

We need to change the changelog extended attributes on the files as if some data
operations succeeded on /gfs/brick-a/a but failed on /gfs/brick-b/a. But
/gfs/brick-b/a should NOT have any changelog which says some data operations
succeeded on /gfs/brick-b/a but failed on /gfs/brick-a/a. We need to reset the
data part of the changelog on trusted.afr.vol-client-0 of /gfs/brick-b/a.

For resolving metadata-split-brain:

We need to change the changelog extended attributes on the files as if some
metadata operations succeeded on /gfs/brick-b/a but failed on /gfs/brick-a/a.
But /gfs/brick-a/a should NOT have any changelog which says some metadata
operations succeeded on /gfs/brick-a/a but failed on /gfs/brick-b/a.
We need to reset metadata part of the changelog on
trusted.afr.vol-client-1 of /gfs/brick-a/a

So, the intended changes are:  
On /gfs/brick-b/a:  
For trusted.afr.vol-client-0  
0x000003b00000000100000000 to 0x000000000000000100000000  
(Note that the metadata part is still not all zeros)  
Hence execute
`setfattr -n trusted.afr.vol-client-0 -v 0x000000000000000100000000 /gfs/brick-b/a`

On /gfs/brick-a/a:  
For trusted.afr.vol-client-1  
0x000003d70000000100000000 to 0x000003d70000000000000000  
(Note that the data part is still not all zeros)  
Hence execute  
`setfattr -n trusted.afr.vol-client-1 -v 0x000003d70000000000000000 /gfs/brick-a/a`

Thus after the above operations are done, the changelogs look like this:  
[root@pranithk-laptop vol]# getfattr -d -m . -e hex /gfs/brick-?/a  
getfattr: Removing leading '/' from absolute path names  
\#file: gfs/brick-a/a  
trusted.afr.vol-client-0=0x000000000000000000000000  
trusted.afr.vol-client-1=0x000003d70000000000000000  
trusted.gfid=0x80acdbd886524f6fbefa21fc356fed57  

\#file: gfs/brick-b/a  
trusted.afr.vol-client-0=0x000000000000000100000000  
trusted.afr.vol-client-1=0x000000000000000000000000  
trusted.gfid=0x80acdbd886524f6fbefa21fc356fed57  


Triggering Self-heal:
---------------------
Perform `ls -l <file-path-on-gluster-mount>` to trigger healing.

<a name="dir-split-brain"></a>
Fixing Directory entry split-brain:
----------------------------------
Afr has the ability to conservatively merge different entries in the directories
when there is a split-brain on directory.
If on one brick directory 'd' has entries '1', '2' and has entries '3', '4' on
the other brick then afr will merge all of the entries in the directory to have
'1', '2', '3', '4' entries in the same directory.
(Note: this may result in deleted files to re-appear in case the split-brain
happens because of deletion of files on the directory)
Split-brain resolution needs human intervention when there is at least one entry
which has same file name but different gfid in that directory.
Example:  
On brick-a the directory has entries '1' (with gfid g1), '2' and on brick-b
directory has entries '1' (with gfid g2) and '3'.
These kinds of directory split-brains need human intervention to resolve.
The user needs to remove either file '1' on brick-a or the file '1' on brick-b
to resolve the split-brain. In addition, the corresponding gfid-link file also
needs to be removed.The gfid-link files are present in the .glusterfs folder
in the top-level directory of the brick. If the gfid of the file is
0x307a5c9efddd4e7c96e94fd4bcdcbd1b (the trusted.gfid extended attribute got
from the getfattr command earlier),the gfid-link file can be found at
> /gfs/brick-a/.glusterfs/30/7a/307a5c9efddd4e7c96e94fd4bcdcbd1b

#### Word of caution:
Before deleting the gfid-link, we have to ensure that there are no hard links
to the file present on that brick. If hard-links exist,they must be deleted as
well.
