# glusterdocs

Source code to gluster documentation: http://gluster.readthedocs.io

# Building the docs

If you are on EPEL 7 or Fedora, the first thing you will need is to install
mkdocs, with the following command (replace yum by dnf on Fedora):

    # yum install mkdocs

Then you need to run mkdocs from the root of that repository:

    $ mkdocs build

The result will be in the `site/` subdirectory, in HTML.
