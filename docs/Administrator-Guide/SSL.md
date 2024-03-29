# Setting up GlusterFS with SSL/TLS

GlusterFS allows its communication to be secured using the [Transport Layer
Security][tls] standard (which supersedes Secure Sockets Layer), using the
[OpenSSL][ossl] library. Setting this up requires a basic working knowledge of
some SSL/TLS concepts, which can only be briefly summarized here.

- "Authentication" is the process of one entity (e.g. a machine, process, or
  person) proving its identity to a second entity.

- "Authorization" is the process of checking whether an entity has permission
  to perform an action.

- TLS provides authentication and encryption. It does not provide
  authorization, though GlusterFS can use TLS-authenticated identities to
  authorize client connections to bricks/volumes.

- An entity X which must authenticate to a second entity Y does so by sharing
  with Y a _certificate_, which contains information sufficient to prove X's
  identity. X's proof of identity also requires possession of a _private key_
  which matches its certificate, but this key is never seen by Y or anyone
  else. Because the certificate is already public, anyone who has the key can
  claim that identity.

- Each certificate contains the identity of its principal (owner) along with
  the identity of a _certifying authority_ or CA who can verify the integrity
  of the certificate's contents. The principal and CA can be the same (a
  "self-signed certificate"). If they are different, the CA must _sign_ the
  certificate by appending information derived from both the certificate
  contents and the CA's own private key.

- Certificate-signing relationships can extend through multiple levels. For
  example, a company X could sign another company Y's certificate, which could
  then be used to sign a third certificate Z for a specific user or purpose.
  Anyone who trusts X (and is willing to extend that trust through a
  _certificate depth_ of two or more) would therefore be able to authenticate
  Y and Z as well.

- Any entity willing to accept other entities' authentication attempts must
  have some sort of database seeded with the certificates that already accept.

In GlusterFS's case, a client or server X uses the following files to contain
TLS-related information:

- /etc/ssl/glusterfs.pem X's own certificate

- /etc/ssl/glusterfs.key X's private key

- /etc/ssl/glusterfs.ca concatenation of _others'_ certificates

GlusterFS always performs _mutual authentication_, though clients do not
currently do anything with the authenticated server identity. Thus, if client X
wants to communicate with server Y, then X's certificate (or that of a signer)
must be in Y's CA file, and vice versa.

For all uses of TLS in GlusterFS, if one side of a connection is configured to
use TLS then the other side must use it as well. There is no automatic fallback
to non-TLS communication, or allowance for concurrent TLS and non-TLS access to
the same resource, because either would be insecure. Instead, any such "mixed
mode" connections will be rejected by the TLS-using side, sacrificing
availability to maintain security.

**NOTE**The TLS certificate verification will fail if the machines' date and
time are not in sync with each other. Certificate verification depends on the
time of the client as well as the server and if that is not found to be in
sync then it is deemed to be an invalid certificate. To get the date and times
in sync, tools such as ntpdate can be used.

## Using Certmonger and FreeIPA to generate and manage certs

Certmonger can be used to generate keys, request certs from a CA and then
automatically keep the Gluster certificate and the CA bundle updated as
required, simplifying deployment. Either a commercial CA or a local CA can
be used. E.g., FreeIPA (with dogtag CA) is an open-source CA with
user-friendly tooling.

If using FreeIPA, first add the host. This is required for FreeIPA to issue
certificates. This can be done via the web UI, or the CLI with:

    ipa host-add <hostname>

If the host has been added the following should show the host:

    ipa host-show <hostname>

And it should show a kerberos principal for the host in the form of:

    host/<hostname>

Now use certmonger on the gluster server or client to generate the key (if
required), and submit a CSR to the CA. Certmonger will monitor the request,
and create and update the files as required. For FreeIPA we need to specify
the Kerberos principal from above to -K. E.g.:

     getcert request -r  \
    	-K host/$(hostname)  \
    	-f /etc/ssl/gluster.pem \
    	-k /etc/ssl/gluster.key \
    	-D $(hostname)  \
    	-F /etc/ssl/gluster.ca

Certmonger should print out an ID for the request, e.g.:

    New signing request "20210801190305" added.

You can check the status of the request with this ID:

    getcert list -i 20210801190147

If the CA approves the CSR and issues the cert, then the previous command
should print a status field with:

    status: MONITORING

As this point, the key, the cert and the CA bundle should all be in /etc/ssl
ready for Gluster to use. Certmonger will renew the certificates as
required for you.

You do not need to manually concatenate certs to a trusted cert bundle and
distribute them to all servers.

You may need to set the certificate depth to allow the CA signed certs to be
used, if there are intermediate CAs in the signing path. E.g., on every server
and client:

    echo "option transport.socket.ssl-cert-depth 3" >  /var/lib/glusterd/secure-access

This should not be necessary where a local CA (e.g., FreeIPA) has directly
signed the cart.

## Enabling TLS on the I/O Path

To enable authentication and encryption between clients and brick servers, two
options must be set:

    gluster volume set MYVOLUME client.ssl on
    gluster volume set MYVOLUME server.ssl on

> **Note** that the above options affect only the GlusterFS native protocol.
> For foreign protocols such as NFS, SMB, or Swift the encryption will not be
> affected between:
>
> 1.  NFS client and Glusterfs NFS Ganesha Server
> 2.  SMB client and Glusterfs SMB server
>
> While it affects the encryption between the following:
>
> 1.  NFS Ganesha server and Glusterfs bricks
> 2.  Glusterfs SMB server and Glusterfs bricks

## Using TLS Identities for Authorization

Once TLS has been enabled on the I/O path, TLS identities can be used instead of
IP addresses or plain usernames to control access to specific volumes. For
example:

    gluster volume set MYVOLUME auth.ssl-allow Zaphod

Here, we're allowing the TLS-authenticated identity "Zaphod" to access MYVOLUME.
This is intentionally identical to the existing "auth.allow" option, except that
the name is taken from a TLS certificate instead of a command-line string. Note
that infelicities in the gluster CLI preclude using names that include spaces,
which would otherwise be allowed.

## Enabling TLS on the Management Path

Management-daemon traffic is not controlled by an option. Instead, it is
controlled by the presence of a file on each machine:

    /var/lib/glusterd/secure-access

Creating this file will cause glusterd connections made from that machine to use
TLS. Note that even clients must do this to communicate with a remote glusterd
while mounting, but not thereafter.

## Additional Options

The GlusterFS TLS implementation supports two additional options related to TLS
internals.

The first option allows the user to set the certificate depth, as mentioned
above.

    gluster volume set MYVOLUME ssl.certificate-depth 2

Here, we're setting our certificate depth to two, as in the introductory
example. By default this value is zero, meaning that only certificates which
are directly specified in the local CA file will be accepted (i.e. no signed
certificates at all).

The second option allows the user to specify the set of allowed TLS ciphers.

    gluster volume set MYVOLUME ssl.cipher-list 'HIGH:!SSLv2'

Cipher lists are negotiated between the two parties to a TLS connection so
that both sides' security needs are satisfied. In this example, we're setting
the initial cipher list to HIGH, representing ciphers that the cryptography
community still believes to be unbroken. We are also explicitly disallowing
ciphers specific to SSL version 2. The default is based on this example but
also excludes CBC-based cipher modes to provide extra mitigation against the
[POODLE][poo] attack.

[tls]: http://tools.ietf.org/html/rfc5246
[ossl]: https://www.openssl.org/
[poo]: http://web.nvd.nist.gov/view/vuln/detail?vulnId=CVE-2014-3566
