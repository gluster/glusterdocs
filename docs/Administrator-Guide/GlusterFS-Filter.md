Modifying .vol files with a filter
==================================

If you need to make manual changes to a .vol file it is recommended to
make these through the client interface ('gluster foo'). Making changes
directly to .vol files is discouraged, because it cannot be predicted
when a .vol file will be reset on disk, for example with a 'gluster set
foo' command. The command line interface was never designed to read the
.vol files, but rather to keep state and rebuild them (from
'/var/lib/glusterd/vols/\$vol/info'). There is, however, another way to
do this.

You can create a shell script in the directory
'/usr/lib\*/glusterfs/\$VERSION/filter'. All scripts located there will
be executed every time the .vol files are written back to disk. The
first and only argument passed to all script located there is the name
of the .vol file.

So you could create a script there that looks like this:

    #!/bin/sh`\
    sed -i 'some-sed-magic' "$1"

Which will run the script, which in turn will run the sed command on the
.vol file (passed as \$1).

Importantly, the script needs to be set as executable (eg via chmod),
else it won't be run.