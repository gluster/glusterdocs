Feature
-------

Easy addition of custom translators

Summary
-------

I'd like to propose we add a way for people to easily add custom
translators they've written. (using C, or Glupy, or whatever)

Owners
------

Justin Clift <jclift@redhat.com>  
Anand Avati <avati@redhat.com>

Current status
--------------

At present, when a custom translator has been developed it's difficult
to get it included in generated .vol files properly.

It **can** be done using the GlusterFS "filter" mechanism, but that's
non optimal and open to catastrophic failure.

Detailed Description
--------------------

Discussed on the gluster-devel mailing list here:

[http://lists.nongnu.org/archive/html/gluster-devel/2013-08/msg00074.html](http://lists.nongnu.org/archive/html/gluster-devel/2013-08/msg00074.html)

We could have a new install Gluster sub-dir, which takes a .so/.py
translator file, and a JSON fragment to say what to do with it. No CLI.

This would suit deployment via packaging, and should be simple enough
for developers to make use of easily as well.

Benefit to GlusterFS
--------------------

Having an easily usable / deployable approach for custom translators is
a key part of extending the Gluster Developer Community, especially in
combination with rapid feature prototyping through Glupy.

Scope
-----

### Nature of proposed change

Modification of existing code, to enable much easier addition of custom
translators.

### Implications on packaging

The gluster-devel package should include all the necessary header and
library files to compile a standalone glusterfs translator.

### Implications on development

/usr/share/doc/gluster-devel/examples/translators/hello-world should
contain skeleton translator code (well commented), README.txt and build
files. This code becomes the starting point to implement a new
translator. Make a few changes and you should be able to build, install,
test and package your translator.

Ideally, this would be implemented via a script.

Similar to autoproject, "translator-gen NAME" should produce all the
necessary skeleton translator code and associated files. This avoids
erroneous find-replace steps.

### Implications on manageability

TBD

### Implications on presentation layer

N/A

### Implications on persistence layer

TBD

### Implications on 'GlusterFS' backend

TBD

### Modification to GlusterFS metadata

TBD

### Implications on 'glusterd'

TBD

How To Test
-----------

TBD

User Experience
---------------

TBD

Dependencies
------------

No new dependencies.

Documentation
-------------

At least "Getting Started" documentation and API documentation needs to
be created, including libglusterfs APIs.

Status
------

Initial concept proposal only.

Comments and Discussion
-----------------------

-   An initial potential concept for the JSON fragment is on the mailing
    list:
    -   <http://lists.nongnu.org/archive/html/gluster-devel/2013-08/msg00080.html>
