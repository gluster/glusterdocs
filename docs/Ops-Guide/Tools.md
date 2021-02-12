## Tools We Use

| Service/Tool         | Purpose                                            | Hosted At       |
|----------------------|----------------------------------------------------|-----------------|
| Github               | Code Review                                        | Github          |
| Jenkins              | CI, build-verification-test                        | Temporary Racks |
| Backups              | Website, Gerrit and Jenkins backup                 | Rackspace       |
| Docs                 | Documentation content                              | mkdocs.org      |
| download.gluster.org | Official download site of the binaries             | Rackspace       |
| Mailman              | Lists mailman                                      | Rackspace       |
| www.gluster.org      | Web asset                                          | Rackspace       |

## Notes
* download.gluster.org: Resiliency is important for availability and metrics.
  Since it's official download, access need to restricted as much as possible.
  Few developers building the community packages have access. If anyone requires
  access can raise an issue at [gluster/project-infrastructure](https://github.com/gluster/project-infrastructure/issues/new)
  with valid reason
* Mailman: Should be migrated to a separate host. Should be made more redundant
  (ie, more than 1 MX).
* www.gluster.org: Framework, Artifacts now exist under gluster.github.com. Has
  various legacy installation of software (mediawiki, etc ), being cleaned as
  we find them.
