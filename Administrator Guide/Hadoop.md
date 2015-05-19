#Managing Hadoop Compatible Storage

GlusterFS provides compatibility for Apache Hadoop and it uses the
standard file system APIs available in Hadoop to provide a new storage
option for Hadoop deployments. Existing MapReduce based applications can
use GlusterFS seamlessly. This new functionality opens up data within
Hadoop deployments to any file-based or object-based application.

##Advantages

The following are the advantages of Hadoop Compatible Storage with
GlusterFS:

-   Provides simultaneous file-based and object-based access within
    Hadoop.
-   Eliminates the centralized metadata server.
-   Provides compatibility with MapReduce applications and rewrite is
    not required.
-   Provides a fault tolerant file system.

###Pre-requisites

The following are the pre-requisites to install Hadoop Compatible
Storage :

-   Java Runtime Environment
-   getfattr - command line utility

##Installing, and Configuring Hadoop Compatible Storage

See the detailed instruction set at https://forge.gluster.org/hadoop/pages/ConfiguringHadoop2

### Resources

-   [Apache Hadoop](http://hadoop.apache.org/) project home
-   [Community Q&A for GlusterFS
    Betas](http://community.gluster.org/t/3-3-beta/) and Hadoop
-   [Download GlusterFS 3.3](http://www.gluster.org/download/) with the
    Hadoop connector
-   [GlusterFS 3.3 Beta Resource Page](https://github.com/shravantc/Gluster-Documentations/blob/master/Administrative-Guide/How_To_Guide/gluster3.3Beta.md)
-   Download GlusterFileSystem (the hadoop plugin) :
    <http://ec2-54-243-59-213.compute-1.amazonaws.com/archiva/browse/org.apache.hadoop.fs.glusterfs/glusterfs-hadoop>