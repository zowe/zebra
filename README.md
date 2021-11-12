# ZEBRA - Open Source API for Enhancing RMF Metrics

- [ZEBRA - Open Source API for Enhancing RMF Metrics](#zebra---open-source-api-for-enhancing-rmf-metrics)
    - [License Information](#license-information)
    - [About ZEBRA](#about-zebra)
- [System Requirements](#system-requirements)
    - [Distributed Data Server (DDS)](#distributed-data-server-dds)
    - [Node.js Version 8](#nodejs-version-8)
    - [Docker (optional)](#docker-optional)
- [Built-in Third Party Support](#built-in-third-party-support)
    - [Configuring MongoDB](#configuring-mongodb)
    - [Configuring Prometheus](#configuring-prometheus)
    - [Configuring Grafana](#configuring-grafana)
- [Installing ZEBRA](#installing-zebra)
    - [Manual Installation](#manual-installation)
    - [Docker Installation](#docker-installation)
- [Configuring ZEBRA's Settings](#configuring-zebras-settings)
    - [Field Definitions](#field-definitions)
        - [General Settings](#general-settings)
        - [DDS Settings](#dds-settings)
    - [Config File](#config-file)
    - [Settings Page](#settings-page)
- [ZEBRA API](#zebra-api)
    - [RMF Postprocessor (Monitor I) Reports](#rmf-postprocessor-monitor-i-reports)
        - [List of Supported Postprocessor Reports](#list-of-supported-postprocessor-reports)
        - [Request Format](#request-format)
        - [Examples](#examples)
    - [RMF Monitor III Reports](#rmf-monitor-iii-reports)
        - [List of Supported Monitor III reports](#list-of-supported-monitor-iii-reports)
        - [Request Format](#request-format-1)
        - [Examples](#examples-1)
    - [Individual RMF Metrics](#individual-rmf-metrics)
        - [List of Supported RMF Metrics](#list-of-supported-rmf-metrics)
        - [Request Format](#request-format-2)
        - [Examples](#examples-2)
    - [Exposing RMF Data to Prometheus](#exposing-rmf-data-to-prometheus)
        - [Custom Metric Format](#custom-metric-format)
        - [Creating a Prometheus Metric](#creating-a-prometheus-metric)
        - [Retrieving a Prometheus Metric](#retrieving-a-prometheus-metric)
        - [Updating a Prometheus Metric](#updating-a-prometheus-metric)
        - [Deleting a Prometheus Metric](#deleting-a-prometheus-metric)
- [Support](#support)

### License Information 

This program and the accompanying materials are made available under the terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.

### About ZEBRA

ZEBRA (Zowe Embedded Browser for RMF and APIs) is an open source incubator project for the Open Mainframe Project&copy;'s [Zowe](https://www.zowe.org/). The main goal of this project is to provide reusable and industry-compliant RMF data in JSON format. The benefit of using JSON is that it is a modern standard that is very attractive to developers. Because of this, there are many applications and use cases for third-party analysis and visualization tools to harvest ZEBRA's metrics.

# System Requirements

### Distributed Data Server (DDS)

Currently, ZEBRA requires an instance of RMF DDS (GPMSERVE) running on z/OS as the source of its data. You can find out more about setting up the DDS [here](https://www.ibm.com/docs/en/zos/2.4.0?topic=rmf-setting-up-distributed-data-server-zos). 

### Node.js Version 8

ZEBRA makes use of the [Node.js](https://nodejs.org/download/release/v8.11.4/) runtime. **IMPORTANT:** It is imparitive that you are using an instance of Node.js **version 8**. Any version after 8 is currently not supported. If you are getting an error about parsing or getting the DDS data, this is a likely cause.

### Docker (optional)

If you want to get ZEBRA set up as quick as possible, we recommend making use of containerization with [Docker](https://www.docker.com/). More information below on how to run and build the containerized version of ZEBRA.

# Built-in Third Party Support

ZEBRA comes prebuilt with some integrations and frameworks for other software and tools. The following is a list of what is currently supported. All software listed is completely optional and not required for ZEBRA to run, although we strongly recommend taking advantage of these integrations.

| Software                             | Integration with ZEBRA                     |
| ------------------------------------ | ------------------------------------------ |
| [MongoDB](https://www.mongodb.com/)  | Historical Database for RMF III Records    |
| [Prometheus](https://prometheus.io/) | Realtime Data Scraping for RMF III Metrics |
| [Grafana](https://grafana.com/)      | Visualization of RMF III Metrics           |

There is some configuration required in order for these to work with ZEBRA. **NOTE:** If running ZEBRA using ```docker-compose```, all third party software will be installed with no manual configuration necessary.

### Configuring MongoDB

No configuration needed beyond the standard installtion required in order to be compatible with ZEBRA. 

**Reminder:** ZEBRA has to be [configured](#configure) to work with MongoDB.

### Configuring Prometheus

After installing Prometheus, locate the ```prometheus.yml``` config file. You should clone and edit this file to look similar to

```
# my global config
global:
  scrape_interval: 15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.
  # scrape_timeout is set to the global default (10s).

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093

# Load rules once and periodically evaluate them according to the global 'evaluation_interval'.
rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

# A scrape configuration containing exactly one endpoint to scrape:
# Here it's Prometheus itself.
scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: "zebra"
  
    metrics_path: "/prommetric"
    scrape_interval: 60s

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
      - targets: ["localhost:3090"]
```

where ```localhost:3090``` is the host and port where ZEBRA is running.

**Reminder:** ZEBRA has to be [configured](#configure) to work with Prometheus.

### Configuring Grafana 

Grafana makes use of Prometheus to visualize ZEBRA metrics. Therefore, in order to use Grafana with ZEBRA you must have Prometheus installed and configured first.

After installing and running Grafana, follow [this guide](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/) on how to add a Data Source. For the source, you want to use the Prometheus instance you sent up before this.

**Note:** ZEBRA has to be [configured](#configure) to work with Grafana.
   
# Installing ZEBRA

There are currently two ways that you can install ZEBRA: Manual or Docker. We recommend using Docker for the simplest and fastest experience. See below for more details.

### Manual Installation

1.  Make sure you have the required system specifications as described [here](#requirements).
2.  (Optional) Install any desired [third party software](#third-party) you want to integrate with ZEBRA.
3.  Clone this repository with Git.

```
git clone git@github.com:zowe/zebra.git
```

4.  Navigate to the ```src``` directory.

```
cd src
```

5.  Install the Node.js dependencies needed for ZEBRA to run.

```
npm install
```

6.  (Optional) If developing, we recommend downloading the npm package ```nodemon```.

```
npm install -g nodemon
```

7.  (Optional) Configure ZEBRA before running for the first time.
  
This step is not required since you can configure ZEBRA once it is running via the [Settings](#configure-settings) page. However, if you already know how you want to configure everything you can make a copy  ```Zconfig.template.json``` and name it ```Zconfig.json```. Then, you can change your preferences and configuration following the format described [here](#configure-zconfig). Once the application runs, your configuration will already be applied.

8.  (Optional) Add SSL Certificate and Key to ```src/sslcert``` directory.

This step is only required running ZEBRA on ```https```.
   
9.  Run ZEBRA.

```
node bin/www
```

For a development environment, you can use:
```
nodemon bin/www
```

If successful, you should see the following message:
    
```
http server listening at port [PORT]
```

where PORT is the port number that ZEBRA is configured to run on.
    
### Docker Installation

1.  Make sure you have Docker installed.
2.  Clone this repository with Git.

```
git clone git@github.com:zowe/zebra.git
```

3.  (Optional) Configure ZEBRA before running for the first time.
  
This step is not required since you can configure ZEBRA once it is running via the [Settings](#configure-settings) page. However, if you already know how you want to configure everything you can make a copy  ```Zconfig.template.json``` and name it ```Zconfig.json```. Then, you can change your preferences and configuration following the format described [here](#configure-zconfig). Once the application runs, your configuration will already be applied.

4.  (Optional) Add SSL Certificate and Key to ```src/sslcert``` directory.

This step is only required running ZEBRA on ```https```.

5.  Navigate to the ```src``` directory.

```
cd src
```

6. Use ```docker-compose``` to build the container network, and run ZEBRA.

```
docker-compose up --build
```

If successful, you should see the following message somewhere in the output:
    
```
http server listening at port [PORT]
```

**NOTE:** If you are getting an error regarding port conflicts, you can edit the ```docker-compose.yml``` to change the configuration to work with open ports on you machine. It should look like:

```
version: '3'

services:
  zebra:
    container_name: zebra
    build: .
    restart: always
    ports:
      - '[ZEBRA_PORT]:3090'
    depends_on:
      - mongo
      - prometheus
      - grafana
  mongo:
    container_name: zebra-mongo
    image: mongo:5.0.3
    ports:
      - '[MONGO_PORT]:27017'
    volumes:
      - mongo-data:/data/db
  prometheus:
    container_name: zebra-prometheus
    image: prom/prometheus:v2.30.3
    ports:
      - '[PROMETHEUS_PORT]:9090'
    volumes:
      - prometheus-data:/prometheus/data
      - ./config/prometheus:/etc/prometheus
  grafana:
    container_name: zebra-grafana
    image: grafana/grafana:8.2.2
    ports:
      - '[GRAFANA_PORT]:3000'
    depends_on:
      - prometheus
    volumes:
      - grafana-data:/var/lib/grafana
      - ./config/grafana:/etc/grafana/provisioning/datasources

volumes:
  mongo-data:
  prometheus-data:
  grafana-data:
```

where ```[ZEBRA_PORT]```, ```[MONGO_PORT]```, ```[PROMETHEUS_PORT]```, and ```[GRAFANA_PORT]``` are your desired ports for ZEBRA, MongoDB, Prometheus, and Grafana, respectively.

# Configuring ZEBRA's Settings

You can configure ZEBRA in two ways: editing the ```Zconfig.json``` file directly, or making use of the Settings page interface once you get the application running.

### Field Definitions

##### General Settings

| Field                   | Definition                                                                                                                         | Required    |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| ```appurl```            | URL or hostname that ZEBRA is using                                                                                                | Always      |
| ```appport```           | Port that ZEBRA is using                                                                                                           | Always      |
| ```ppminutesInterval``` | The interval (in minutes) that RMF Postprocessor (RMF Monitor I) records are recorded into the DDS                                 | Always      |
| ```rmf3interval```      | The interval (in seconds) that RMF Monitor III records are recorded into the DDS                                                   | Always      |
| ```zebra_httptype```    | The http protocol that ZEBRA is using (```http``` or ```https```)                                                                  | Always      |
| ```use_cert```          | Specifies whether to use TLS for servicing ZEBRA API (```true``` or ```false```)                                                   | Always      |
| ```mongourl```          | URL or hostname of your instance of MongoDB                                                                                        | For MongoDB |
| ```mongoport```         | Port of your instance of MongoDB                                                                                                   | For MongoDB |
| ```dbinterval```        | The interval (in seconds) that data being recorded into MongoDB                                                                    | For MongoDB |
| ```dbname```            | Name of the database to use in MongoDB                                                                                             | For MongoDB |
| ```useDbAuth```         | Specifies whether to use authentication for MongoDB (```true``` or ```false```)                                                    | No          |
| ```dbUser```            | Username for MongoDB if using authentication                                                                                       | No          |
| ```dbPassword```        | Password for MongoDB if using authentication                                                                                       | No          |
| ```authSource```        | Source of MongoDB's authentication (default is ```admin```)                                                                        | No          |
| ```grafanaurl```        | URL or hostname of your instance of grafana                                                                                        | For Grafana |
| ```grafanaport```       | Port of your instance of Grafana                                                                                                   | For Grafana |
| ```grafanahttptype```   | The http protocol of your instance of Grafana                                                                                      | For Grafana |
| ```dds```               | Contains DDS configurations of one or more LPARs. See [below](#configure-dds) to see how to configure this specific field. | Always      |

##### DDS Settings

Each key in the ```dds``` field represents the name of the LPAR you are configuring. For example, if your LPAR is called ```SLSU```, your DDS config may look like:

```
"SLSU": {
   "ddshhttptype":"https",
   "ddsbaseurl":"salisu.com",
   "ddsbaseport":"8803",
   "ddsauth":"true",
   "ddsuser":"user",
   "ddspwd":"pass",
   "rmf3filename":"rmfm3.xml",
   "rmfppfilename":"rmfpp.xml",
   "mvsResource":",SLSU,MVS_IMAGE",
   "PCI": 3340,
   "usePrometheus":"true",
   "useMongo": "false"
}
```

| Field               | Definition                                                                                                                                      | Required       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| ```ddshhttptype```  | The http protocal that this DDS service is using (```http``` or ```https```)                                                                    | Always         |
| ```ddsbaseurl```    | URL or host name of this DDS service                                                                                                            | Always         |
| ```ddsbaseport```   | Port of this DDS service                                                                                                                        | Always         |
| ```ddsauth```       | Specifies whether this DDS service uses authentication (```true``` or ```false```)                                                              | No             |
| ```ddsuser```       | Username to access this DDS (if ```ddsauth``` is ```true```)                                                                                    | No             |
| ```ddspwd```        | Password to access this DDS (if ```ddsauth``` is ```true```)                                                                                    | No             |
| ```rmf3filename```  | File name and extension used when DDS RMF service sends RMF Monitor III records to its Web API (default value is ```rmfm3.xml```)               | Always         |
| ```rmfppfilename``` | File name and extension used when DDS RMF service sends RMF Monitor I (Postprocessor) records to its Web API (default value is ```rmfpp.xml```) | Always         |
| ```mvsResource```   | The default resource to query when making requests to this DDS                                                                                  | Always         |
| ```PCI```           | The PCI value of the mainframe                                                                                                                  | Always         |
| ```usePrometheus``` | Specifies whether this DDS service should make use of Prometheus data  scraping (```true``` or ```false```)                                     | For Prometheus |
| ```useMongo```      | Specifies whether this DDS service should store RMF III records in a MongoDB database (```true``` or ```false```)                               | For MongoDB    |

### Config File

The ```Zconfig.json``` file should be located in the ```src/config``` directory. In this directory, there is a ```Zconfig.template.json``` which is an example of what yours could look like:

```
{
    "mongourl":"localhost",
    "dbinterval":"100",
    "dbname":"zebraDB",
    "appurl":"localhost",
    "appport":"3090",
    "mongoport":"27017",
    "ppminutesInterval":"30",
    "rmf3interval":"100",
    "zebra_httptype":"https",
    "useDbAuth":"true",
    "dbUser":"user",
    "dbPassword":"pass",
    "authSource":"admin",
    "useMongo":"true",
    "use_cert": "false",
    "grafanaurl":"localhost",
    "grafanaport":"9000",
    "grafanahttptype": "http",
    "dds": {
        "SLSU": {
            "ddshhttptype":"https",
            "ddsbaseurl":"salisu.com",
            "ddsbaseport":"8803",
            "ddsauth":"true",
            "ddsuser":"user",
            "ddspwd":"pass",
            "rmf3filename":"rmfm3.xml",
            "rmfppfilename":"rmfpp.xml",
            "mvsResource":",SLSU,MVS_IMAGE",
            "PCI": 3340,
            "usePrometheus":"true",
            "useMongo": "false"
        },
        "JSTN": {
            "ddshhttptype":"http",
            "ddsbaseurl":"justin.com",
            "ddsbaseport":"8803",
            "ddsauth":"true",
            "ddsuser":"user",
            "ddspwd":"pass",
            "rmf3filename":"rmfm3.xml",
            "rmfppfilename":"rmfpp.xml",
            "mvsResource":",JSTN,MVS_IMAGE",
            "PCI": 3340,
            "usePrometheus":"false",
            "useMongo": "true"
        }
    }
}
```

You can edit this file directly with your specifications. **NOTE:** Once you save the changes, a restart of ZEBRA is required. 

### Settings Page

As an alternative to editing the ```Zconfig.json``` file directly, you could make use of the Settings page in a browser once the application is up and running. You can find the page using the Navbar in the browser: 

Config > Settings

Alternatively, you can go to the page directly using the link ```http://localhost:3090/config/settings``` where you ```localhost``` is your ZEBRA hostname and ```3090``` is your ZEBRA port.

On this page, you can input and edit the same configuration fields as described previously for both [General Settings](#configure-general) and [DDS Settings](#configure-dds).

**NOTE:** If you make configuration changes through this method, a restart of ZEBRA is **not required**.

# ZEBRA API

Here, you will find documentation on ZEBRA's API and how to make the most out of each query. A full interactive Swagger doc of the API can also be found in the ```/apis``` route of the application.

### RMF Postprocessor (Monitor I) Reports

RMF Postprocessor reports offer historical records. These reports' intervals are longer than that of RMF Monitor III, and previous records are stored for a set amount of time (usually around 2 weeks).

##### List of Supported Postprocessor Reports

These report types are confirmed to be parsable by ZEBRA. There may be some report types not listed here that still work correctly, however. If you find a working report that is not listed, please reach out and we will add it below. 

Each report links to its official IBM&copy; documentation.

| Report                                                                                                   | Description                               |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [CACHE](https://www.ibm.com/docs/en/zos/2.4.0?topic=postprocessor-cache-cache-subsystem-activity-report) | Cache Subsystem Activity                  |
| [CF](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/erbb500382.htm)                   | Coupling Facility Activity                |
| [CHAN](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/chan.htm)                       | Channel Path Activity                     |
| [CPU](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/cpu.htm)                         | Channel Path Activity                     |
| [CRYPTO](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/crypto.htm)                   | Crypto Hardware Activity                  |
| [DEVICE](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/device.htm)                   | Device Activity                           |
| [EADM](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/pp-eadm.htm)                    | Extended Asynchronous Data Mover Activity |
| [HFS](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/hfspp.htm)                       | Hierarchical File System Statistics       |
| [IOQ](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/ioq.htm)                         | I/O Queuing Activity                      |
| [OMVS](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/omvs.htm)                       | OMVS Kernal Activity                      |
| [PAGESP](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/pagesp.htm)                   | Page Data Set Activity                    |
| [PAGING](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/paging.htm)                   | Paging Activity                           |
| [SDELAY](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/sdelay.htm)                   | Serialization Delay                       |
| [VSTOR](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/vstor.htm)                     | Virtual Storage Activity                  |
| [WLMGL](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/wrkldac.htm)                   | Workload Activity                         |
| [XCF](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/xcf1.htm)                        | Cross-System Coupling Facility Activity   |

Additionally, when querying these reports with ZEBRA, you can append special parameters to the report as you would in the DDS. For example, instead of just using ```WLMGL```, you could use ```WLMGL(SCPER, RCLASS)``` to breakdown the service classes by period and include report classes.

##### Request Format

To get a Postprocessor report in ZEBRA format, make a ```GET``` request to the route ```/v1/{lpar}/rmfpp/{report}```.

The route has the following parameters:

| Parameter    | Description                                                                          |
| ------------ | ------------------------------------------------------------------------------------ |
| ```lpar```   | Name of the reporting LPAR                                                           |
| ```report``` | RMF Postprocessor report type (see [list](#list-of-supported-postprocessor-reports)) |

You can add additional query strings to the request for more options:

| Option      | Description                                                                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ```start``` | Specifies the start date for the report's interval (If missing, defaults to current date). **NOTE:** If ```start``` is defined, ```end``` must be as well. |
| ```end```   | Specifies the end date for the report's interval (If missing, defaults to current date). **NOTE:** If ```end``` is defined, ```start``` must be as well.   |

##### Examples

The following examples use the ZEBRA demo found at <https://zebra.talktothemainframe.com:3390/>.

| Request                                                                                        | Description                                                             |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| <https://zebra.talktothemainframe.com:3390/v1/RPRT/rmfpp/CPU>                                  | Gets the list of CPU Activity reports for the current date so far.      |
| <https://zebra.talktothemainframe.com:3390/v1/RPRT/rmfpp/CHAN?start=2021-11-09&end=2021-11-11> | Gets the list of Channel Path Activity reports from November 9, 2021 to November 11, 2021. **NOTE:** These dates are most likely outdated since Postprocessor reports only go back a limited amounted of time. Try changing the dates to those within the last week.  |
| <https://zebra.talktothemainframe.com:3390/v1/RPRT/rmfpp/WLMGL>                                | Gets the list of Workload Activity reports for the current date so far. |
| <https://zebra.talktothemainframe.com:3390/v1/RPRT/rmfpp/WLMGL(SCPER,RCLASS)>                  | Adds additional parameters to the previously listed request. The ```SCPER``` parameter breaks down service classes to periods and the ```RCLASS``` adds report classes to the report.                                                                                    |

### RMF Monitor III Reports

RMF Monitor III reports offer near realtime records. These reports' intervals are much shorter than that of RMF Postprocessor. With Monitor III, you can only query the current Monitor III data, unlike Postprocessor records that are stored for some time after they are generated. To store Monitor III records, we recommend using the MongoDB integration.

##### List of Supported Monitor III reports

These report types are confirmed to be parsable by ZEBRA. There may be some report types not listed here that still work correctly, however. If you find a working report that is not listed, please reach out and we will add it below. 

Each report links to its official IBM&copy; documentation.

| Report                                                                                       | Description                               |
| -------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [CHANNEL](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/chan3.htm#chan3) | Channel Path Activity                     |
| [CPC](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/cfc3.htm#cfc3)       | CPC Capacity                              |
| [DELAY](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/delay.htm#delay)   | Delay                                     |
| [DEV](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/devx.htm#devx)       | Device Delays                             |
| [DEVR](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/devrx.htm#devrx)    | Device Resource Delays                    |
| [DSND](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/dsnd.htm#dsnd)      | Data Set Delays                           |
| [EADM](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/m3-eadm.htm)        | Extended Asynchronous Data Mover Activity |
| [ENCLAVE](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/enclave.htm)     | Enclave                                   |
| [ENQ](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/enqx.htm)            | Enqueue Delays                            |
| [HSM](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/hsm.htm)             | Hierarchical Storage Manager Delays       |
| [JES](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/jes.htm)             | Job Entry Subsystem Delays                |
| [OPD](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/opd.htm)             | OMVS Process Data                         |
| [PROC](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/erbb500170.htm)     | Processor Delays                          |
| [PROCU](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/procu.htm)         | Processor Usage                           |
| [STOR](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/erbb500196.htm)     | Storage Delays                            |
| [STORC](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/erbb500202.htm)    | Common Storage                            |
| [STORCR](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/erbb500208.htm)   | Common Storage Remaining                  |
| [SYSINFO](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/erbb500236.htm)  | System Information                        |
| [SYSSUM](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/mrsyps.htm)       | Sysplex Summary                           |
| [USAGE](https://www.ibm.com/docs/en/SSLTBW_2.4.0/com.ibm.zos.v2r4.erbb500/m3usage00.htm)     | Monitor III Job Usage                     |

##### Request Format

To get a Monitor III report in ZEBRA format, make a ```GET``` request to the route ```/v1/{lpar}/rmfm3/{report}```.

The route has the following parameters:

| Parameter    | Description                                                                          |
| ------------ | ------------------------------------------------------------------------------------ |
| ```lpar```   | Name of the reporting LPAR                                                           |
| ```report``` | RMF Monitor III report type (see [list](#list-of-supported-monitor-iii-reports))     |

You can add additional query strings to the request for more options:

| Option         | Description                                                                                                |
| -----------    | ---------------------------------------------------------------------------------------------------------- |
| ```resource``` | Specifies the resource to query for the reports (default is ```mvsResource``` defined in general settings) |


##### Examples

The following examples use the ZEBRA demo found at <https://zebra.talktothemainframe.com:3390/>.

| Request                                                                                  | Description                                                                          |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| <https://zebra.talktothemainframe.com:3390/v1/RPRT/rmf3/CPC>                             | Gets the most recent CPC Capacity report.                                            |
| <https://zebra.talktothemainframe.com:3390/v1/RPRT/rmf3/SYSINFO>                         | Gets the most recent System Information report.                                      |
| <https://zebra.talktothemainframe.com:3390/v1/RPRT/rmf3/SYSSUM?resource=,VIPLEX,SYSPLEX> | Gets the most recent Sysplex Summary report from the ```,VIPLEX,SYSPLEX``` resource. |

### Individual RMF Metrics

ZEBRA can also individually retrieve and parse certain RMF metrics defined by the DDS.

##### List of Supported RMF Metrics

To see a list of what metrics are available in your system, use the ```/v1/{lpar}/rmf?id=LIST``` API route (where ```lpar``` is the reporting LPAR). You can also include a ```resource``` query option to see the metrics for different resources (default is ```mvsResource``` defined in configuration).

##### Request Format

To get an individual RMF metric from ZEBRA, make a ```GET``` request to the route ```/v1/{lpar}/rmf?id={metricId}```.

The route has the following parameters:

| Parameter      | Description                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| ```lpar```     | Name of the reporting LPAR                                                                                                   |
| ```metricId``` | ID of the RMF metric (the list of available metric IDs and descriptions can be found [here](#list-of-supported-dds-metrics)) |

You can add additional query strings to the request for more options:

| Option         | Description                                   |
| -------------- | --------------------------------------------- |
| ```resource``` | Specifies the resource to get the metric from |

##### Examples

The following examples use the ZEBRA demo found at <https://zebra.talktothemainframe.com:3390/>.

| Request                                                                                    | Description                                                                                      |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| <https://zebra.talktothemainframe.com:3390/v1/RPRT/rmf?id=LIST>                            | Lists the RMF metric IDs and their description in the default resource.                          |
| <https://zebra.talktothemainframe.com:3390/v1/RPRT/rmf?id=LIST&resource=,VIPLEX,SYSPLEX>   | Lists the RMF metric IDs and their description in the ```,VIPLEX,SYSPLEX``` resource.            |
| <https://zebra.talktothemainframe.com:3390/v1/RPRT/rmf?id=8D0160>                          | Gets most recent value for '% delay' (ID: ```8D0160```) from the default resource.               |
| <https://zebra.talktothemainframe.com:3390/v1/RPRT/rmf?id=8D0160&resource=,VIPLEX,SYSPLEX> | Gets most recent value for '% delay' (ID: ```8D0160```) from the ```,VIPLEX,SYSPLEX``` resource. |

### Exposing RMF Data to Prometheus

ZEBRA comes built with an API and framework that allows for the creation of realtime Prometheus metrics, with RMF Monitor III. When the application is run for the first time, a ```metrics.json``` file is created in the ```src``` directory. This is where ZEBRA will store the custom Prometheus metrics that you define. While you can edit this file directly with your metric configuration, it is recommended to use the API. For complete documentation on the API, check out the Swagger page on the ```/apis``` route.

##### Custom Metric Format

Before getting into the API calls, it is important to understand how ZEBRA formats these custom metrics. In the ```src``` directory, there is a ```metrics.template.json``` that serves as an example of what the metrics should look like:

```
{
    "RPRT_QCK2_PTOU": {
        "lpar": "RPRT",
        "request": {
            "report": "CPC",
            "resource": ",RPRT,MVS_IMAGE"
        },
        "identifiers": [
            {
                "key": "CPCPPNAM",
                "value": "QCK2"
            }
        ],
        "field": "CPCPPTOU",
        "desc": "Physical total utilization for the QCK2 partition."
    },
    "RPRT_TRNG_PTOU": {
        "lpar": "RPRT",
        "request": {
            "report": "CPC",
            "resource": ",RPRT,MVS_IMAGE"
        },
        "identifiers": [
            {
                "key": "CPCPPNAM",
                "value": "TRNG"
            }
        ],
        "field": "CPCPPTOU",
        "desc": "Physical total utilization for the TRNG partition."
    },
    "RPRT_VIDVLP_PTOU": {
        "lpar": "RPRT",
        "request": {
            "report": "CPC",
            "resource": ",RPRT,MVS_IMAGE"
        },
        "identifiers": [
            {
                "key": "CPCPPNAM",
                "value": "VIDVLP"
            }
        ],
        "field": "CPCPPTOU",
        "desc": "Physical total utilization for the VIDVLP partition."
    },
    "RPRT_VIRPT_PTOU": {
        "lpar": "RPRT",
        "request": {
            "report": "CPC",
            "resource": ",RPRT,MVS_IMAGE"
        },
        "identifiers": [
            {
                "key": "CPCPPNAM",
                "value": "VIRPT"
            }
        ],
        "field": "CPCPPTOU",
        "desc": "Physical total utilization for the VIRPT partition."
    }
}
```

Each top-level key in the JSON is the name of the Prometheus metric. You can name the metrics how ever you like, there is no strict convention.

| Field | Definition | 
| ----- | ---------- |
| ```lpar``` | The name of the reporting LPAR. |
| ```request``` | Object that contains info about the request needed to get the data. The requests are RMF Monitor III, so you must specify a ```report``` type to call. Optionally, you can provide a ```resource``` target. If no ```resource``` is provided, then the default ```mvsResource``` specified in configuration will be used. |
| ```identifiers``` | Array of key-value pairs that are used as conditions to get the data of the appropriate entity. For example, if you want the total physical utilization of only the partition with the name of ```QCK2```, you can set ```key``` to be ```CPCPPNAM``` (partition name) and ```value``` to ```QCK2```. Since ```identifiers``` is an array, you can add as many key-value pairs as needed for multiple conditions. Can be left empty ```[]``` if not needed. |
| ```field``` | The field whose value is used as the Prometheus metric. |
| ```desc``` | Optionally, you can provide a description for readability on what the metric is tracking. |

##### Creating a Prometheus Metric

To initialize a new custom Prometheus metric, make a ```POST``` request to ```/v1/metrics/{metricName}```, where ```metricName``` is the name of your new custom metric. This ```POST``` request should have a body with the format of [metric](#custom-metric-field-definitions). Here is an example:

**Request:**

```POST https://zebra.talktothemainframe.com:3390/v1/metrics/RPRT_QCK2_PTOU```

**Request Body:**

```
{
   "lpar": "RPRT",
   "request": {
       "report": "CPC",
       "resource": ",RPRT,MVS_IMAGE"
   },
   "identifiers": [
       {
           "key": "CPCPPNAM",
           "value": "QCK2"
       }
   ],
   "field": "CPCPPTOU",
   "desc": "Physical total utilization for the QCK2 partition."
}
```

**Response**:

```
{
    "msg": "Metrics were successfully created.",
    "err": false
}
```

##### Retrieving a Prometheus Metric

To retrieve a custom Prometheus metric, make a ```GET``` request to ```/v1/metrics/{metricName}```, where ```metricName``` is the name of a custom metric that already exists. If you do not provide a metric name, it will list all current Prometheus metrics. Here is an example:

**Request:**

```GET https://zebra.talktothemainframe.com:3390/v1/metrics/RPRT_QCK2_PTOU```

**Response:**

```
{
    "data": {
        "lpar": "RPRT",
        "request": {
            "report": "CPC",
            "resource": ",RPRT,MVS_IMAGE"
        },
        "identifiers": [
            {
                "key": "CPCPPNAM",
                "value": "QCK2"
            }
        ],
        "field": "CPCPPTOU",
        "desc": "Physical total utilization for the QCK2 partition."
    },
    "msg": "Metric 'RPRT_QCK2_PTOU' successfully retrieved",
    "err": false
}
```

##### Updating a Prometheus Metric

To update a custom Prometheus metric, make a ```PUT``` request to ```/v1/metrics/{metricName}```, where ```metricName``` is the name of a custom metric that already exists. Here is an example:

**Request:**

```PUT https://zebra.talktothemainframe.com:3390/v1/metrics/RPRT_QCK2_PTOU```

**Request Body:**

```
{
   "lpar": "RPRT",
   "request": {
       "report": "CPC",
       "resource": ",RPRT,MVS_IMAGE"
   },
   "identifiers": [
       {
           "key": "CPCPPNAM",
           "value": "QCK2"
       }
   ],
   "field": "CPCPLTOU",
   "desc": "Logical total utilization for the VIRPT partition."
}
```

**Response**:

```
{
    "msg": "Metric was successfully updated.",
    "err": false
}
```

##### Deleting a Prometheus Metric

To delete a custom Prometheus metric, make a ```DELETE``` request to ```/v1/metrics/{metricName}```, where ```metricName``` is the name of a custom metric that already exists. Here is an example:

**Request:**

```DELETE https://zebra.talktothemainframe.com:3390/v1/metrics/RPRT_QCK2_PTOU```

**Response:**

```
{
    "msg": "Metric 'RPRT_QCK2_PTOU' was successfully deleted.",
    "err": false
}
```

# Support

For any questions or help with any aspect of ZEBRA, you can contact the development team directly or open an [issue](https://github.com/zowe/zebra/issues) on GitHub. For Slack users, there is a channel for ZEBRA in the Open Mainframe Project&copy;'s [workspace](openmainframeproject.slack.com) that you can use to get in touch with the team and community! We greatly appreciate any feedback or suggestions!

| Name          | Role         | Contact                        |
| ------------- | ------------ | ------------------------------ |
| Alex Kim      | Project Lead | <alexkim@ibm.com>              |
| Salisu Ali    | Developer    | <salis7897@gmail.com>          |
| Justin Santer | Developer    | <justin.santer@convergetp.com> |