
# License Information 

This program and the accompanying materials are made available under the terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.

  
# Source Code Folder
To be structured as needed by project team.

Please document here
| Subdirectory Name | Description |
|---|---|
| App_server | Directory For Project Controller Functions, Parser and Routes |
| sslcert | Directory for Server certificate and private key |
| config | Directory for configuration file |
| bin | Directory for startup file |

# RMF Parsing Engine (ZEBRA)
   Zebra is a Performance Monitoring tool that converts RMF monitor I and III data into JSON Format. As an example and use-case, it shows it can also store realtime data into MongoDB and Plot realtime Workload and CPU Utilization chart using Grafana. Zebra can be used to Parse static RMF Monotor I XML file into JSON. This version works with nodejs v8.11.2

# Run Zebra
  To Run Zebra, You'll need to:
  -  Set Up your Environment: You'll need to install nodejs (most prefered{v 8.11.x}), git and optional programs like Prometheus, MongoDB and Grafana. Optional programs will require proper licenses per their terms and conditions.
  
  - Clone Zebra
  
  - Install App packages using npm install from root directory, change set up using config files
  
  - Run Zebra using npm, pm2, nodemon or any other nodejs process manager
  
   (e.g. node bin/www)

# Use Zebra
  To Use Zebra, You'll need to configure the application parameters. These parameters can be configured by simply editing the Zconfig.json file in the root directory or using Zebra's /addsetting function while Zebra instance is running.
 
 ## Configure Zebra Using Endpoint
   Zebra’s configuration gives users the flexibility to run the app according to their needs.  Zebra provides “/addsettings” endpoint for editing config values. This endpoint can take one or more parameters recognized by zebra at once. E.g.  
  http://localhost:3090/addsettings?appurl=127.0.0.1

## Recognized Zebra Config Parameters
   -  ddsbaseurl: (Distributed Data Server base URL)   
      This is the IP address of the DDS from which the App can retrieve RMF Data. E.g.   
       http://localhost:3090/addsettings?ddsurl=127.0.0.1
   -  ddsbaseport: (Distributed Data Server base Port)   
      This is the Port number of the DDS from which from which the App can retrieve RMF Data. E.g  
      http://localhost:3090/addsettings?ddsport=8888
   -  rmf3filename: (DDS RMF Monitor III Filename)  
      This is the filename from which The App can retrieve RMF Monitor III data. E.g.  
      http://localhost:3090/addsettings?rmf3filename=rmfm3.xml
   -  rmfppfilename: (DDS RMF Monitor I Filename)  
      This is the filename from which The App can retrieve RMF Monitor I data. E.g.  
      http://localhost:3090/addsettings?rmfppfilename=rmfpp.xml
   -  mvsResource: (DDS RMF Monitor III resource identifier)  
      This parameter represent Monitor III resource identifier. E.g.  
       http://localhost:3090/addsettings?mvsResource=,SYS,RESOURCE
   -  mongourl: (Mongo DB URL)  
      This is the IP address of MongoDB to which RMF III data will be saved. E.g.  
      http://localhost:3090/addsettings?mongourl=127.0.0.1
   -  dbinterval: (Database Interval)  
      This is the Interval for which data will be saved to MongoDB. Its unit is in seconds. E.g. Every 100 seconds  
      http://localhost:3090/addsettings?dbinterval=100
   -  dbname: (Database Name)  
      This is the name of the database for which RMF III data will be saved. E.g  
      http://localhost:3090/addsettings?dbname=ompzebra
   -  appurl: (Running Zebra App URL)  
      This is the IP address of running Zebra instance (after hosting). This value is needed for MongoDB, Prometheus and Grafana to work with Zebra. E.g. 127.0.0.1.    
      http://localhost:3090/addsettings?appurl=127.0.0.1
   -  appport: (Running Zebra App Port)  
      This is the Port of a running Zebra Instance (after hosting). This value is needed for MongoDB, Prometheus and Grafana to work with Zebra. E.g. 3000  
      http://localhost:3090/addsettings?appport=3000  
   -  mongoport: (Mongo DB Port)  
      This is the port number of MongoDB to which RMF III data will be saved. E.g.    
      http://localhost:3090/addsettings?mongoport=27017
   -  ppminutesInterval: (RMF Monitor I PP Report Interval)  
      This is the Interval for which DDS Produce RMF I report. Its unit is in minutes E.g. Every 30 Minutes  
      http://localhost:3090/addsettings?ppminutesInterval=30
   -  rmf3interval: (RMF Monitor III Report Interval)  
      This is the Interval for which DDS Produce RMF III report. E.g. Every 100 seconds  
      http://localhost:3090/addsettings?rmf3interval=100
   -  httptype: (http type of running Zebra App)
      This is the hypertext transfer protocol type of the running zebra app (after hosting). Its value is either http or https. E.g.  
      http://localhost:3090/addsettings?httptype=http
   -  useDbAuth: ( Use Database Authentication)
      This config parameter determines the type of connection to mongodb, either with authentication or without authentication. Its value is either true or false. If value is set to true, zebra will require username and password with which to connect to mongodb. E.g.  
      http://localhost:3090/addsettings?useDbAuth=true
   -  dbUser: (Database Username)  
      This is mongodb username with which zebra will connect to database if value of useDbAuth is set to true. E.g.  
      http://localhost:3090/addsettings?dbUser=salisuali
   -  dbPassword: (Database Password)  
      This is mongodb password with which zebra will connect to database if value of useDbAuth is set to true. E.g.  
      http://localhost:3090/addsettings?dbPassword=salisu
   -  authSource: (Authentication Source)  
       This is mongodb database which contains the username and password for authentication. The default is mongodb’s “admin” database. E.g.  
       http://localhost:3090/addsettings?authSource=admin
   -  useMongo: (Use Mongo DB)  
       This parameter needs to be set to true before a user can connect MongoDB to Zebra. Its default value is false. E.g.  
       http://localhost:3090/addsettings?useMongo=true  
   -  usePrometheus: (Use Prometheus server)  
       This parameter needs to be set to true before a user can connect Prometheus to Zebra. Its default value is false. E.g.  
       http://localhost:3090/addsettings?usePrometheus=true
   -  https: (Use TLS)  
       This parameter needs to be set to true before a user can use TLS for Zebra. Its default value is false. E.g.  
       http://localhost:3090/addsettings?https=true

The user can specify multiple configuration parameters at once:  
       http://localhost:3090/addsettings?dbinterval=3600&appport=3000  
      The above URL contains two parameters dbinterval and appport. The user can specify as many parameters as possible with their value each. These new values specified by the user will overwrite the value stored in zebra’s config file.

# Sample Zebra Queries
  Please replace localhost with the IP address of your running Zebra Instance 
1.	Monitor 3  
-	CPC Report  
a.	http://localhost:3090/rmfm3/?report=CPC  
b.	http://localhost:3090/rmfm3/?report=CPC&parm=CPCHCMSU  
c.	http://localhost:3090/rmfm3/?report=CPC&parm=ALL  
d.	http://localhost:3090/rmfm3/?report=CPC&lpar_parms=ALL_CP  
e.	http://localhost:3090/rmfm3/?report=CPC&lpar_parms=VIRPT  
f.	http://localhost:3090/rmfm3/?report=CPC&lpar_parms=VIRPT&parm=CPCHLMSU  
-	RMF3 files  
g.	http://localhost:3090/rmfm3?filename=SYSINFO  
h.	http://localhost:3090/rmfm3?filename=USAGE  
  
-	USAGE and PROC Reports  
i.	http://localhost:3090/rmfm3?report=PROC  
j.	http://localhost:3090/rmfm3?report=PROC&job=SDSFAUX  
k.	http://localhost:3090/rmfm3?report=PROC&job=ALL_JOBS  
l.	http://localhost:3090/rmfm3?report=PROC&parm=PRCPSVCL  
  
2.	Post Processor  
-	Workload  
a.	http://localhost:3090/rmfpp?report=WLMGL&date=20200731,20200731  
b.	http://localhost:3090/rmfpp?report=WLMGL&date=20200731,20200731&SvcCls=STCHIGH  
c.	http://localhost:3090/rmfpp?report=WLMGL&date=20200731,20200731&SvcCls=STCHIGH&Time=05.30.00  
d.	http://localhost:3090/rmfpp?report=WLMGL&date=20200731,20200731&SvcCls=STCHIGH&duration=05.30.00,09.30.00  
e.	http://localhost:3090/rmfpp?report=WLMGL&date=20200731,20200731&Wlkd=TSO  
f.	http://localhost:3090/rmfpp?report=WLMGL&date=20200731,20200731&Wlkd=TSO&Time=05.30.00  
g.	http://localhost:3090/rmfpp?report=WLMGL&date=20200731,20200731&Wlkd=TSO&duration=04.00.00,07.30.00  
-	CPU  
h.	http://localhost:3090/rmfpp?report=CPU&date=20200731,20200731  
3.	Static  
a.	http://localhost:3090/static?file=C:\Users\Salis\Desktop\rmfpp.xml&type=CPU  
