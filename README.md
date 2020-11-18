# glusterdocs

Source code to gluster documentation: http://docs.gluster.org/

**Important Note:
This repo had its git history re-written on 19 May 2016.
Please create a fresh fork or clone if you have an older local clone.**

# Building the docs

If you are on EPEL 7 or Fedora, the first thing you will need is to install
mkdocs, with the following command :

    # sudo yum install mkdocs

For Fedora 30+ (run the following in root)

    # dnf install python-pip
    # pip install -r requirements.txt

Then you need to run mkdocs from the root of that repository:

    $ mkdocs build

If you see an error about `docs_dir` when using recent versions of mkdocs , try running additional steps mentioned below:

    $ cp ./mkdocs.yml ../
    $ cd ..

Edit below entry in the copied mkdocs.yml file

    docs_dir: ./glusterdocs/

Then you need to run mkdocs

    $ mkdocs build

The result will be in the `site/` subdirectory, in HTML.

# Building the docs in Docker

Included is a Makefile and a Dockerfile, which enables you to easily build the
docs inside Docker without installing any dependencies on your system.

Simply run the following command to compile the docs:

```sh
make
```

This Makefile recipe builds a Docker image containing the dependencies required
and runs `mkdocs` inside the built image, taking care to run the container as
the current `uid` and `gid` so that your user has ownership of the results in
the `./site` directory.
