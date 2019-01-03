# Setup on Virtual Machine
*Note: You only need one of the three setup methods!*

### Setup, Method 1 – Setting up in virtual machines

As we just mentioned, to set up Gluster using virtual machines, you will
need at least two virtual machines with at least 1GB of RAM each. You
may be able to test with less but most users will find it too slow for
their tastes. The particular virtualization product you use is a matter
of choice. Common platforms include include Xen, VMware ESX and
Workstation, VirtualBox, and KVM. For purpose of this article, all steps
assume KVM but the concepts are expected to be simple to translate to
other platforms as well. The article assumes you know the particulars of
how to create a virtual machine and have installed a 64 bit linux
distribution already.

Create or clone two VM’s, with the following setup on each:

-   2 disks using the VirtIO driver, one for the base OS and one that we
    will use as a Gluster “brick”. You can add more later to try testing
    some more advanced configurations, but for now let’s keep it simple.

*Note: If you have ample space available, consider allocating all the
disk space at once.*

-   2 NIC’s using VirtIO driver. The second NIC is not strictly
    required, but can be used to demonstrate setting up a separate
    network for storage and management traffic.

*Note: Attach each NIC to a separate network.*

Other notes: Make sure that if you clone the VM, that Gluster has not
already been installed. Gluster generates a UUID to “fingerprint” each
system, so cloning a previously deployed system will result in errors
later on.

Once these are prepared, you are ready to move on to the
[install](./Install.md) section.
