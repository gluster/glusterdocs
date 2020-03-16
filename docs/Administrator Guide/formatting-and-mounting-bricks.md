## Formatting and Mounting Bricks

### Creating a Thinly Provisioned Logical Volume

To create a thinly provisioned logical volume, proceed with the following steps:

  1. Create a physical volume(PV) by using the pvcreate command.
  For example:

  `# pvcreate --dataalignment 128K /dev/sdb`

  Here, /dev/sdb is a storage device.
  Use the correct dataalignment option based on your device.

  >**Note**
  >
  >The device name and the alignment value will vary based on the device you are using.

  2. Create a Volume Group (VG) from the PV using the vgcreate command: 
  For example:

  `# vgcreate --physicalextentsize 128K gfs_vg /dev/sdb`

  It is recommended that only one VG must be created from one storage device.

  3. Create a thin-pool using the following commands:

      1. Create an LV to serve as the metadata device using the following command:

      `# lvcreate -L metadev_sz --name metadata_device_name VOLGROUP`

      For example:

      `# lvcreate -L 16776960K --name gfs_pool_meta gfs_vg`

      2. Create an LV to serve as the data device using the following command:

      `# lvcreate -L datadev_sz --name thin_pool VOLGROUP`

      For example:

      `# lvcreate -L 536870400K --name gfs_pool gfs_vg`

      3. Create a thin pool from the data LV and the metadata LV using the following command:

      `# lvconvert --chunksize STRIPE_WIDTH --thinpool VOLGROUP/thin_pool --poolmetadata VOLGROUP/metadata_device_name`

      For example:

      `# lvconvert --chunksize 1280K --thinpool gfs_vg/gfs_pool --poolmetadata gfs_vg/gfs_pool_meta`

  >**Note**
  >
  >By default, the newly provisioned chunks in a thin pool are zeroed to prevent data leaking between different block devices.

  `# lvchange --zero n VOLGROUP/thin_pool`

  For example:

  `# lvchange --zero n gfs_vg/gfs_pool`

  4. Create a thinly provisioned volume from the previously created pool using the lvcreate command:

  For example:

  `# lvcreate -V 1G -T gfs_vg/gfs_pool -n gfs_lv`

  It is recommended that only one LV should be created in a thin pool.

Format bricks using the supported XFS configuration, mount the bricks, and verify the bricks are mounted correctly.

  1. Run `# mkfs.xfs -f -i size=512 -n size=8192 -d su=128k,sw=10 DEVICE` to format the bricks to the supported XFS file system format. Here, DEVICE is the thin LV. The inode size is set to 512 bytes to accommodate for the extended attributes used by GlusterFS.

  Run `# mkdir /mountpoint` to create a directory to link the brick to.

  Add an entry in /etc/fstab:

      /dev/gfs_vg/gfs_lv    /mountpoint  xfs rw,inode64,noatime,nouuid      1 2

  Run `# mount /mountpoint` to mount the brick.

  Run the `df -h` command to verify the brick is successfully mounted:

      # df -h
      /dev/gfs_vg/gfs_lv   16G  1.2G   15G   7% /exp1
