# Zconfig File Sample

* Create a file with the name ```Zconfig.json``` in this directory(config)
* Copy the sample JSON below into the file
* Edit the file with the your DDS parameters. Edit other parameters as it suits your need. The meaning of these parameters can be found on the readme in the SRC directory or in the ZEBRA Documentation
* Zebra can support multiple DDS instances running on different lpars. feel free to delete or add DDS information under the dds parameter in the Zconfig file.

```
{
    "dds" : {
        "LPAR1": {
            "ddshhttptype":"https",
            "ddsbaseurl":"lpar1.com",
            "ddsbaseport":"8803",
            "ddsauth":"true",
            "ddsuser":"user",
            "ddspwd":"password",
            "rmf3filename":"rmfm3.xml",
            "rmfppfilename":"rmfpp.xml",
            "mvsResource":",SYSID,MVS_IMAGE",
            "PCI": 2951,
            "usePrometheus":"false",
            "useMongo":"false"
        },
        "LPAR2" : {
            "ddshhttptype":"https",
            "ddsbaseurl":"lpar2.com",
            "ddsbaseport":"8803",
            "ddsauth":"true",
            "ddsuser":"user",
            "ddspwd":"password",
            "rmf3filename":"rmfm3.xml",
            "rmfppfilename":"rmfpp.xml",
            "mvsResource":",SYSID,MVS_IMAGE",
            "PCI": 2951,
            "usePrometheus":"false",
            "useMongo":"false"
        }
    },
    "ppminutesInterval":"30",
    "rmf3interval":"100",
    "use_cert": "false",
    "zebra_httptype":"http",
    "appurl":"localhost",
    "appport":"3090",
    "mongourl":"localhost",
    "dbinterval":"100",
    "dbname":"Zebrav1111",
    "mongoport":"27017",
    "useDbAuth":"true",
    "dbUser":"myUserAdmin",
    "dbPassword":"salisu",
    "authSource":"admin",
    "grafanaurl":"localhost",
    "grafanaport":"3000",
    "grafanahttptype": "http",
    "apiml_http_type" : "https",
    "apiml_IP" : "localhost",
    "apiml_port" : "10010",
    "apiml_auth_type" : "bypass",
    "apiml_username" : "username",
    "apiml_password" : "password"
}
```
