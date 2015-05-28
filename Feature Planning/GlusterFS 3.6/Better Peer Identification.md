Feature
-------

**Better peer identification**

Summary
-------

This proposal is regarding better identification of peers.

Owners
------

Kaushal Madappa <kmadappa@redhat.com>

Current status
--------------

Glusterd currently is inconsistent in the way it identifies peers. This
causes problems when the same peer is referenced with different names in
different gluster commands.

Detailed Description
--------------------

Currently, the way we identify peers is not consistent all through the
gluster code. We use uuids internally and hostnames externally.

This setup works pretty well when all the peers are on a single network,
have one address, and are referred to in all the gluster commands with
same address.

But once we start mixing up addresses in the commands (ip, shortnames,
fqdn) and bring in multiple networks we have problems.

The problems were discussed in the following mailing list threads and
some solutions were proposed.

-   How do we identify peers? [^1]
-   RFC - "Connection Groups" concept [^2]

The solution to the multi-network problem is dependent on the solution
to the peer identification problem. So it'll be good to target fixing
the peer identification problem asap, ie. in 3.6, and take up the
networks problem later.

Benefit to GlusterFS
--------------------

Sanity. It will be great to have all internal identifiers for peers
happening through a UUID, and being translated into a host/IP at the
most superficial layer.

Scope
-----

### Nature of proposed change

The following changes will be done in Glusterd to improve peer
identification.

1.  Peerinfo struct will be extended to have a list of associated
    hostnames/addresses, instead of a single hostname as it is
    currently. The import/export and store/restore functions will be
    changed to handle this. CLI will be updated to show this list of
    addresses in peer status and pool list commands.
2.  Peer probe will be changed to append an address to the peerinfo
    address list, when we observe that the given address belongs to an
    existing peer.
3.  Have a new API for translation between hostname/addresses into
    UUIDs. This new API will be used in all places where
    hostnames/addresses were being validated, including peer probe, peer
    detach, volume create, add-brick, remove-brick etc.
4.  A new command - 'gluster peer add-address <existing> <new-address>'
    - which appends to the address list will be implemented if time
    permits.
5.  A new command - 'gluster peer rename <existing> <new>' - which will
    rename all occurrences of a peer with the newly given name will be
    implemented if time permits.

Changes 1-3 are the base for the other changes and will the primary
deliverables for this feature.

### Implications on manageability

The primary changes will bring about some changes to the CLI output of
'peer status' and 'pool list' commands. The normal and XML outputs for
these commands will contain a list of addresses for each peer, instead
of a single hostname.

Tools depending on the output of these commands will need to be updated.

**TODO**: *Add sample outputs*

The new commands 'peer add-address' and 'peer rename' will improve
manageability of peers.

### Implications on presentation layer

None

### Implications on persistence layer

None

### Implications on 'GlusterFS' backend

None

### Modification to GlusterFS metadata

None

### Implications on 'glusterd'

<persistent store, configuration changes, brick-op...>

How To Test
-----------

**TODO:** *Add test cases*

User Experience
---------------

User experience will improve for commands which used peer identifiers
(volume create/add-brick/remove-brick, peer probe, peer detach), as the
the user will no longer face errors caused by mixed usage of
identifiers.

Dependencies
------------

None.

Documentation
-------------

The new behaviour of the peer probe command will need to be documented.
The new commands will need to be documented as well.

**TODO:** *Add more documentations*

Status
------

The feature is under development on forge [^3] and github [^4]. This
github merge request [^5] can be used for performing preliminary
reviews. Once we are satisfied with the changes, it will be posted for
review on gerrit.

Comments and Discussion
-----------------------

There are open issues around node crash + re-install with same IP (but
new UUID) which need to be addressed in this effort.

Links
-----

<references>
</references>

[^1]: <http://lists.gnu.org/archive/html/gluster-devel/2013-06/msg00067.html>

[^2]: <http://lists.gnu.org/archive/html/gluster-devel/2013-06/msg00069.html>

[^3]: <https://forge.gluster.org/~kshlm/glusterfs-core/kshlms-glusterfs/commits/better-peer-identification>

[^4]: <https://github.com/kshlm/glusterfs/tree/better-peer-identification>

[^5]: <https://github.com/kshlm/glusterfs/pull/2>
