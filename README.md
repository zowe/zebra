

# ZEBRA(Zowe Embedded Browser for RMF/SMF and APIs)


# License Information 

This program and the accompanying materials are made available under the terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.

  
# About ZEBRA and System Requirements

   Zebra is an open source SW project under Linux Foundation's Open Mainframe Project's ZOWE Project.  It intends to provide re-usable and industry compliant JSON formatted RMF/SMF data records, so that many other ISV SW and users can exploit them using Open-Source SW for many ways.
   
   As an example and use-case, it shows real-time data and historical data in JSON format with time stamps. It can also store realtime data into MongoDB and Plot realtime Workload and CPU Utilization chart using Grafana. Zebra can be used to Parse static RMF Monotor I XML file into JSON. 
   
   ** Required SW:
   
   - Current version of Zebra requires RMF DDS Service(GPMSERV) running on IBM z/OS as source of the data
   - NodeJS for runtime (This version tested with nodejs v8.11.2)
   
   ** Optional SW (you will need to install them from their sites) in case you like to test examples shown here:
   
   - Grafana
   - Prometheus
   - MongoDB
   

![](/Documentation/Images/zhome.png)

## <Picture 1>  Zebra main page screenshot


<<<<<<< HEAD
<IMG SRC = "https://github.com/ykimvicom/zebra-1/blob/main/Zebra%20GRAFANA.png"> </IMG>
## <Picture 2>  Zebra use case example #1 - Plotting thru Grafana with RMF III real-time data
=======
![](/Documentation/Images/ZebraGRAFANA.png)
## <Picture 2>  Zebra use case example #1 - Plotting thru Grafana with RMF I real-time data
>>>>>>> 8c159d4f05fac4a382f5c5fd6d2b9795986df848
  
   
# Running Zebra

  To Run Zebra, You'll need to:
  -  Set Up your Environment: You'll need to install nodejs (most prefered{v 8.11.x}), git and optional programs like Prometheus, MongoDB and Grafana. Optional programs will require proper licenses per their terms and conditions.
  
  - Clone Zebra src code
  ```
  git clone git@github.com:zowe/zebra.git
  
  ```
  - navigate to the source code folder
  ```
  cd src
  ```
  
  - Install App packages using npm install from root directory, change set up using config files
  ```
  npm install
  ```

  - Make a copy of ```exampleZconfig.json``` and name it ```Zconfig.json```
   
  - Run Zebra using npm, pm2, nodemon or any other nodejs process manager
  
   ```
   node bin/www
   ```
  
  and you will see it prints: 
    
    
    http server listening at port 3090
    Admin Saved Successfuly
    
    
 If you didn't make any changes, proceed to below instruction to change `Zconfig.json` file appropriately per your need.
    
# Use Zebra with web browser 

  To Use Zebra, you'll need to configure the application parameters. These parameters can be configured by simply editing the `Zconfig.json` file in the `src/config` directory.
 
 ## Configuring Zebra 
 
 ### Zebra Configuration parameters for Zconfig.json file
 1. **dds** : This contains DDS information on multiple LPAR’s as a nested JSON. The nested JSON contains:
  *	***Key***:  
   The key will be the LPAR name and this key will be used as {lpar_name} in the new API structure.
  * ***Value***:  
        The value for each key (LPAR name) a JSON containing:
        
      * **ddshhttptype** : This is the hypertext transfer protocol type of the DDS. Its value is either http or https. E.g ***ddshttptype : http***  

      * **ddsbaseurl** : IP address or domain name of z/OS RMF DDS Server. E.g ***ddsurl : 127.0.0.1***

      * **ddsbaseport**:   port number used when accessing above DDS Server. The typical default DDS port number if 8803. E.g ***ddsport : 8888***

      * **ddsauth** : This config parameter determines the type of connection to DDS, either with authentication or without authentication. Its value is either true or false. If value is set to true, ZEBRA will require username and password with which to connect to DDS. E.g ***ddsauth : false***

      * **ddsuser** : This is the username with which ZEBRA will connect to DDS if value of ddsauth is set to true. E.g. ***ddsuser : userID***

      * **ddspwd** : This is thepassword with which ZEBRA will connect to DDS if value of ddsauth is set to true. E.g. ***ddspwd : Password***

      * **rmf3filename**:  filename/extension used when DDS RMF service sends RMF 3 data to its Web API. The default value is 'rmfm3.xml'. E.g ***rmf3filename : rmfm3.xml***

      * **rmfppfilename**: filename/extension used when DDS RMF service sends RMF I Post Processor data to its Web API. The default value is 'rmfpp.xml'. E.g ***rmfppfilename : rmfpp.xml***

      * **mvsResource**:   Parameter value for RMF DDS Monitor III resource identifier. E.g ***mvsResource : ,SYS,RESOURCE***  

      * **PCI** : This PCI parameter represent the PCI value of the Mainframe. E.g. ***PCI : 2091***

      * **usePrometheus**: true|false - option to send data to Prometheus. E.g ***usePrometheus : true***
 
 
 2. **ppminutesInterval**: Interval for which DDS Produce RMF I data. Its unit is in minutes E.g. Every 30 Minutes or 15 Minutes. E.g ***ppminutesInterval: 30***
 
 3. **rmf3interval**: Interval set on how often DDS Produce RMF III data. E.g. Every 100 seconds E.g ***rmf3interval : 100***
 
 4. **use_cert**: true|false - parameter to set enabling TLS for servicing Zebra APIs. E.g ***use_cert : true***

 5. **zebra_httptype**: http|https - Setting Zebra service type either HTTP or HTTPS. E.g ***zebra_httptype : http***

 6. **appurl**:        IP address / URL of running Zebra instance (after hosting). This value is needed for MongoDB, Prometheus and Grafana to work with Zebra. E.g ***appurl : 127.0.0.1***
 
 7. **appport**:       Port of a running Zebra Server Instance E.g ***apport : 3090***
 
 8. **mongourl**:      IP or URL of MongoDB server location which RMF data will be saved.E.g ***mongourl : localhost*** 
 
 9. **dbinterval**:    The data capture/recording interval into MongoDB, the default value is 100 (seconds). E.g ***dbinterval : 100***
 
<<<<<<< HEAD
 * useMongo: true|false - option to send data to MongoDB
=======
 10. **dbname**:        MongoDB database name where RMF III monitor data will be saved. E.g ***dbname : ZebraDB***
>>>>>>> 8c159d4f05fac4a382f5c5fd6d2b9795986df848
 
 11. **mongoport**:     MongoDB service port. E.g ***mongoport : 27017***
 
 12. **useDbAuth**: true|false - Set if MongoDB would require authentication to access its database writing RMF data into MongoDB. E.g ***useDbAuth : false***
 
 13. **dbUser**: MongoDB's User ID used by Zebra when writing RMF data into JSON(BSON) format to MongoDB. E.g ***dbUser : mongouserid***
 
 14. **dbPassword**: MongoDB's User Password used by Zebra. E.g ***dbPassword : mongopassword***
 
 15. **authSource**: MongoDB's authentication DB source. Default is 'admin'. E.g ***authSource : admin***
 
 16. **useMongo**: true|fasle - option for Zebra to send data to MongoDB. E.g ***useMongo : true***
 
 17. **grafanahttptype**: This is the hypertext transfer protocol type of the running Grafana instance. Its value is either http or https. E.g. ***grafanahttptype: http***
 
 18. **grafanaurl**: IP address or URL to Prometheus/Grafana service. E.g ***grafanaurl : localhost***
 
 19. **grafanaport**: Port used to access Grafana service. E.g ***grafanaport : 3000***

# Sample Zebra Queries
  Please replace localhost with the IP address of your running Zebra Instance and lpar_name with the name of your DDS lpar name(key) in Zconfig file.
1.	Monitor 3  
-	CPC Report  
a.	http://localhost:3090/v1/{lpar_name}/rmf3/CPC  
b.	http://localhost:3090/v1/{lpar_name}/rmf3/CPC?parm=CPCHCMSU  
c.	http://localhost:3090/v1/{lpar_name}/rmf3/CPC?parm=ALL  
d.	http://localhost:3090/v1/{lpar_name}/rmf3/CPC?lpar_parms=ALL_CP  
e.	http://localhost:3090/v1/{lpar_name}/rmf3/CPC?lpar_parms=VIRPT  
f.	http://localhost:3090/v1/{lpar_name}/rmf3/CPC?lpar_parms=VIRPT&parm=CPCHLMSU  
-	PROC and USAGE Reports  
g.	http://localhost:3090/v1/{lpar_name}/rmf3/proc  
h.	http://localhost:3090/v1/{lpar_name}/rmf3/proc?job=SDSFAUX   
i.  http://localhost:3090/v1/{lpar_name}/rmf3/proc?parm=PRCPSVCL  
j.  http://localhost:3090/v1/{lpar_name}/rmf3/proc?parm=PRCPSVCL&job=SDSFAUX  
- PROC report has similar parameters with USAGE report in Zebra. just change the values and you are good to go.  
  
2. RMF Specific Fields  
a.  http://localhost:3090/v1/RPRT/rmf?id=8D0F60  
b.  http://localhost:3090/v1/RPRT/rmf?id=8D0160&resource=,,SYSPLEX  

3. Listing IDs and Description  
a.  http://localhost:3090/v1/RPRT/rmf?id=LIST  
b.  http://localhost:3090/v1/RPRT/rmf?id=LIST&resource=,,SYSPLEX  

4.	Post Processor Report  
-	Workload  
a.	http://localhost:3090/v1/RPRT/rmfpp/wlmgl?start=2021-07-17&end=2021-07-17  
b.	http://localhost:3090/v1/RPRT/rmfpp/wlmgl?start=2021-07-17&end=2021-07-17&SvcCls=STCHIGH  
c.	http://localhost:3090/v1/RPRT/rmfpp/wlmgl?start=2021-07-17&end=2021-07-17&SvcCls=STCHIGH&Time=05.30.00  
d.	http://localhost:3090/v1/RPRT/rmfpp/wlmgl?start=2021-07-17&end=2021-07-17&SvcCls=STCHIGH&duration=05.30.00,09.30.00  
e.	http://localhost:3090/v1/RPRT/rmfpp/wlmgl?start=2021-07-17&end=2021-07-17&Wlkd=TSO  
f.	http://localhost:3090/v1/RPRT/rmfpp/wlmgl?start=2021-07-17&end=2021-07-17&Wlkd=TSO&Time=05.30.00  
g.	http://localhost:3090/v1/RPRT/rmfpp/wlmgl?start=2021-07-17&end=2021-07-17&Wlkd=TSO&duration=04.00.00,07.30.00  

-	CPU  
h.	http://localhost:3090/v1/RPRT/rmfpp/cpu?start=2021-07-17&end=2021-07-17  

5.	Static  
a.	http://localhost:3090/static?file=C:\Users\Salis\Desktop\rmfpp.xml  


| Folder | Description |
|---|---|
| Documentation | Contains all documentation from the OMP Mentorship project periods. It has description of the architecture, design, installation and configuration of Zebra's intinial design |
| src | Source code - create as many subdirectories as needed |


