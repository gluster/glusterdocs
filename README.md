# glusterdocs

Source code to gluster documentation: http://gluster.readthedocs.io

# Building the docs

If you are on EPEL 7 or Fedora, the first thing you will need is to install
mkdocs, with the following command :

    #sudo yum install mkdocs
    
For Fedora 23+ (run the following in root)

    #dnf install python-pip
    #pip install mkdocs

Then you need to run mkdocs from the root of that repository:

    $ mkdocs build

The result will be in the `site/` subdirectory, in HTML.

** Advanced topic: changing the TOC. The TOC is mkdocs.yml, NOT index.md is the base directory. **

# Writing the docs

This documentation set uses the Commonmark markdown set. You can read more about Commonmark here: [Commonmark Specification](http://spec.commonmark.org/0.27/)

For examples of topics, see the 'Templates' subdirectory in this folder. Each topic type has a markdown template that you can copy and complete for a topic that is formatted like others in the documentation.

## Minimum viable style guide

* Topic titles have an -ing (gerund) construction, such as "Configuring the pool" and "Adding users".
* Every topic must have a brief explanation of why a user would read the topic or complete the procedure.
* Note: useful thing to know without bad consequences.
* Warning: only use for personal injury or death.
* Caution: something in this topic could cause loss of data or damage to equipment.
* Before a set of steps, have a heading that says "To _thing the thing_".
* Sequential steps are always numbered. Only use bulleted lists if the order doesn't matter.
* Every procedure should end with an updated status or test so that the user knows they completed the steps correctly.
* When in doubt about how to format information, add it to the "docdrafts" file and notify someone.

[Full RedHat Style Guide](http://www.stylepedia.net/)
