# Get core dump on a customer set up without killing the process

### Why do we need this?
Finding the root cause of an issue that occurred in the customer/production setup is a challenging task.
Most of the time we cannot replicate/setup the environment and scenario which is leading to the issue on
our test setup. In such cases, we got to grab most of the information from the system where the problem
has occurred.
<br>
### What information we look for and also useful?
The information like a core dump is very helpful to catch the root cause of an issue by adding ASSERT() in
the code at the places where we feel something is wrong and install the custom build on the affected setup.
But the issue is ASSERT() would kill the process and produce the core dump.
<br>
### Is it a good idea to do ASSERT() on customer setup?
Remember we are seeking help from customer setup, they unlikely agree to kill the process and produce the 
core dump for us to root cause it. It affects the customer’s business and nobody agrees with this proposal.
<br>
### What if we have a way to produce a core dump without a kill?
Yes, Glusterfs provides a way to do this. Gluster has customized ASSERT() i.e GF_ASSERT() in place which helps 
in producing the core dump without killing the associated process and also provides a script which can be run on 
the customer set up that produces the core dump without harming the running process (This presumes we already have 
GF_ASSERT() at the expected place in the current build running on customer setup. If not, we need to install custom 
build on that setup by adding GF_ASSERT()).
<br>
### Is GF_ASSERT() newly introduced in Gluster code?
No. GF_ASSERT() is already there in the codebase before this improvement. In the debug build, GF_ASSERT() kills the 
process and produces the core dump but in the production build, it just logs the error and moves on. What we have done 
is we just changed the implementation of the code and now in production build also we get the core dump but the process 
won’t be killed. The code places where GF_ASSERT() is not covered, please add it as per the requirement.
<br>

## Here are the steps to achieve the goal:
-  Add GF_ASSERT() in the Gluster code path where you expect something wrong is happening.
-  Build the Gluster code, install and mount the Gluster volume (For detailed steps refer: Gluster quick start guide).
-  Now, in the other terminal, run the gfcore.py script
   `# ./extras/debug/gfcore.py $PID 1 /tmp/` (PID of the gluster process you are interested in, got it by `ps -ef | grep gluster`
   in the previous step. For more details, check `# ./extras/debug/gfcore.py --help`)
-  Hit the code path where you have introduced GF_ASSERT(). If GF_ASSERT() is in fuse_write() path, you can hit the code 
   path by writing on to a file present under Gluster moun. Ex: `# dd if=/dev/zero of=/mnt/glustrefs/abcd bs=1M count=1`
   where `/mnt/glusterfs` is the gluster mount
-  Go to the terminal where the gdb is running (step 3) and observe that the gdb process is terminated
-  Go to the directory where the core-dump is produced. Default would be present working directory.
-  Access the core dump using gdb Ex: `# gdb -ex "core-file $GFCORE_FILE" $GLUSTER_BINARY`
   (1st arg would be core file name and 2nd arg is o/p of file command in the previous step)
-  Observe that the Gluster process is unaffected by checking its process state. Check pid status using `ps -ef | grep gluster`
<br>
Thanks, Xavi Hernandez(jahernan@redhat.com) for the idea. This will ease many Gluster developer's/maintainer’s life.
