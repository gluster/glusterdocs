# Setup Bare Metal
*Note: You only need one of the three setup methods!*
### Setup, Method 2 – Setting up on physical servers

To set up Gluster on physical servers, we recommend two servers of very
modest specifications (2 CPU’s, 2GB of RAM, 1GBE). Since we are dealing
with physical hardware here, keep in mind, what we are showing here is
for testing purposes. In the end, remember that forces beyond your
control (aka, your bosses’ boss...) can force you to take that the “just
for a quick test” environment right into production, despite your
kicking and screaming against it. To prevent this, it can be a good idea
to deploy your test environment as much as possible the same way you
would to a production environment (in case it becomes one, as mentioned
above). That being said, here is a reminder of some of the best
practices we mentioned before:

-   Make sure DNS and NTP are setup, correct, and working
-   If you have access to a backend storage network, use it! 10GBE or
    InfiniBand are great if you have access to them, but even a 1GBE
    backbone can help you get the most out of your deployment. Make sure
    that the interfaces you are going to use are also in DNS since we
    will be using the hostnames when we deploy Gluster
-   When it comes to disks, the more the merrier. Although you could
    technically fake things out with a single disk, there would be
    performance issues as soon as you tried to do any real work on the
    servers

With the explosion of commodity hardware, you don’t need to be a
hardware expert these days to deploy a server. Although this is
generally a good thing, it also means that paying attention to some
important, performance impacting BIOS settings is commonly ignored. Several
points that might cause issues when if you're unaware of them:

-   Most manufacturers enable power saving mode by default. This is a
    great idea for servers that do not have high-performance
    requirements. For the average storage server, the performance impact
    of the power savings is not a reasonable tradeoff
-   Newer motherboards and processors have lots of nifty features!
    Enhancements in virtualization, newer ways of doing predictive
    algorithms and NUMA are just a few to mention. To be safe, many
    manufactures ship hardware with settings meant to work with as
    massive a variety of workloads and configurations as they have
    customers. One issue you could face is when you set up that blazing
    fast 10GBE card you were so thrilled about installing? In many
    cases, it would end up being crippled by a default 1x speed put in
    place on the PCI-E bus by the motherboard.

Thankfully, most manufacturers show all the BIOS settings, including the
defaults, right in the manual. It only takes a few minutes to download,
and you don’t even have to power off the server unless you need to make
changes. More and more boards include the functionality to make changes
in the BIOS on the fly without even powering the box off. One word of
caution of course, is don’t go too crazy. Fretting over each tiny little
detail and setting is usually not worth the time, and the more changes
you make, the more you need to document and implement later. Try to find
the happy balance between time spent managing the hardware (which
ideally should be as close to zero after you setup initially) and the
expected gains you get back from it.

Finally, remember that some hardware really is better than others.
Without pointing fingers anywhere specifically, it is often true that
onboard components are not as robust as add-ons. As a general rule, you
can safely delegate the onboard hardware to things like management
network for the NIC’s, and for installing the OS onto a SATA drive. At
least twice a year you should check the manufacturer's website for
bulletins about your hardware. Critical performance issues are often
resolved with a simple driver or firmware update. As often as not, these
updates affect the two most critical pieces of hardware on a machine you
want to use for networked storage - the RAID controller and the NIC's.

Once you have setup the servers and installed the OS, you are ready to
move on to the [install](./Install.md) section.
