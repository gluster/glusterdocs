# Building QEMU With gfapi For Debian Based Systems

This how-to has been tested on Ubuntu 13.10 in a clean, up to date
environment. Older Ubuntu distros required some hacks if I remembered
rightly. Other Debian based distros should be able to follow this
adjusting for dependencies. Please update this if you get it working on
another distro.

### Satisfying dependencies

Make the first stab at getting qemu dependencies

        apt-get  build-dep qemu 

This next command grabs all the dependencies specified in the debian
control file as asked for from upstream Debian sid You can look into the
options specified there and adjust to taste.

        # get almost all the rest and the tools to work up the Debian magic
        apt-get install devscripts quilt libiscsi-dev libusbredirparser-dev libssh2-1-dev libvdeplug-dev libjpeg-dev glusterfs*

we need a newer version of libseccomp for Ubuntu 13.10

        mkdir libseccomp
        cd libseccomp
        # grab it from upstream sid
        wget http://ftp.de.debian.org/debian/pool/main/libs/libseccomp/libseccomp_2.1.0+dfsg.orig.tar.gz
        wget http://ftp.de.debian.org/debian/pool/main/libs/libseccomp/libseccomp_2.1.0+dfsg-1.debian.tar.gz
        # get it ready
        tar xf libseccomp_2.1.0+dfsg.orig.tar.gz 
        cd libseccomp-2.1.0+dfsg/
        # install the debian magic
        tar xf ../libseccomp_2.1.0+dfsg-1.debian.tar.gz
        # apply series files if any
        while quilt push; do quilt refresh; done
        # build debs, they'll appear one directory up
        debuild -i -us -uc -b
        cd ..
        # install it
        dpkg -i *.deb

### Building QEMU

This next part is straightforward if your dependencies are met. For the
advanced reader look around debian/control once it is extracted before
you install as you may want to change what options QEMU is built with
and what targets are requested.

        cd ..
        mkdir qemu
        cd qemu
        # download our sources. you'll want to check back frequently on these for changes
        wget http://ftp.de.debian.org/debian/pool/main/q/qemu/qemu_1.7.0+dfsg.orig.tar.xz
        wget http://ftp.de.debian.org/debian/pool/main/q/qemu/qemu_1.7.0+dfsg-2.debian.tar.gz
        wget http://download.gluster.org/pub/gluster/glusterfs/3.4/LATEST/glusterfs-3.4.2.tar.gz
        tar xf glusterfs-3.4.2.tar.gz 
        tar xf qemu_1.7.0+dfsg.orig.tar.xz 
        cd qemu-1.7.0+dfsg/
        # unpack the debian magic
        tar xf ../qemu_1.7.0+dfsg-2.debian.tar.gz
        # bring glusterfs in to the buiild
        cp -r ../glusterfs-3.4.2 glusterfs
        # the glusterfs check in configure looks around weird. I've never asked why but moving the src stuff up one works and tests fine
        cd glusterfs/api/
        mv src/* .
        cd ../..
        #you'll need to edit debian/control to enable glusterfs replacing  

         - ##--enable-glusterfs todo 
         + # --enable-glusterfs 
         + glusterfs-common (>= 3.4.0),

        #And finally build. It'll take ages.  http://xkcd.com/303/
        # apply series if any
        while quilt push; do quilt refresh; done
        # build packages
        debuild -i -us -uc -b
        cd ..

Your debs now available to install. It is up to the reader to determine
what targets they want installed.
