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

Sometimes this might fail on Fedora 24+, so perform below steps

    $ cp ./mkdocs.yml ../
    $ cd ..

Edit below entry in the copied mkdocs.yml file
    docs_dir: ./glusterdocs/

Then you need to run mkdocs

    $ mkdocs build

The result will be in the `site/` subdirectory, in HTML.
