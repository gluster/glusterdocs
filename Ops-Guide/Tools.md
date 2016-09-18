## Tools We Use

| Service/Tool         | Purpose                            | Hosted At       |
|----------------------|------------------------------------|-----------------|
| Gerrit               | Code Review                        |  Temporary Racks|
| Jenkins              | CI, build-verification-test        |  Temporary Racks|
| Backups              | Website, Gerrit and Jenkins backup |  Rackspace|
| Bugs WebUI           | A dashboard for all OPEN bugs      |  Rackspace|
| Docs                 | Documentation content              | readthedocs.org |
| download.gluster.org | Official download site of the binaries | Rackspace|
| Sonar                | Static analysis                    | Rackspace |
| Salt-master          | Manage part of the infra           | Rackspace |
| Web-Builder          | Cronjob building and deploying the website | Rackspace |
| Mailman              | Lists mailman                      | Rackspace |
| www.gluster.org      | Web asset                          | Rackspace |
| SuperColony          | real name of website server (and do-it-all server ) | Rackspace |

## Notes
* download.gluster.org: Resiliency is important for availability and metrics.
  Since it's official download, access need to restricted as much as possible.
  TODO: Who has access?
* Sonar: Infrequently used and mostly idle.
* Salt-master: Michael would have more detail. TODO: Add more detail.
* Web-Builder: Managed by misc with salt. Stateless, Can be trashed and
  reinstalled.
* Mailman: Should be migrated to a separate host. Should be made more redundant
  (ie, more than 1 MX).
* www.gluster.org: Framework, Artifacts now exist under gluster.github.com. Has
  various legacy installation of software (mediawiki, etc ), being cleaned as
  we find them.
