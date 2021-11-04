# SSL CERT and KEY Files
create two files in this directory(sslcert). these files are needed to set up SSl/TLS on ZEBRA

1. server.cert
  * create a file named ```server.cert``` in this directory
  * copy the sample details below into the file
  * replace the comment with your certificate
```
-----BEGIN CERTIFICATE-----
//Please paste your certificate here
-----END CERTIFICATE-----
```

2. server.key
  * create a file named ```server.key``` in this directory
  * copy the sample details below into the file
  * replace the comment with your key
```
-----BEGIN PRIVATE KEY-----
//Please paste your key here
-----END PRIVATE KEY-----
```
