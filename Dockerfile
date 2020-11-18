FROM centos:7

# RUN yum install -y epel-release
RUN yum install -y python3 python3-setuptools
RUN pip3 install mkdocs mkdocs-material

ENV LC_ALL=en_US.utf-8 LANG=en_US.utf-8

ENTRYPOINT ["mkdocs", "build"]
