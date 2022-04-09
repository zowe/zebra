[![zowe](https://img.shields.io/badge/Zowe-incubator-3162ac?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACaElEQVQ4T42RW0gUYRiG339mXI9tYxaulocNZDUzdN0y6CKkJToQdBfBRquFEYE3HUGExaRuAqFuoiU2M7qwi6Ag6SyEgeUhg+xAm6tuWiykreYeZmemb4ZWF9ulBn4G3v99n+/7v4/hf77dD9LRsyeSzMr+ma/ptGfn57mLtlQ1f2grub/cnxpQd8sISb4EhqOrStcy04ayKQOvVL5xmWcTIckB1q5dYPI1gK0js1RQZTHkFhVouRuj50saUgOqPSI41gHGHQbU71S9EQrqzduspzNFI+WYClnZO3qhtCcOWerA6tkHxq6SqZAu70KRj2G4MYDN3aZyu22aE/h4ZjLK52z87MoLagIT9z8Xw7MzV+SY5CBARJpfOIFh53XU3qyj6ubirdWvsnJzvBy/CICqwv2+vaRJB2w6NZItZYqD1IoFKtRIOGT39vbvgMrOQFWaoPB+Lp09MprWzOQWF85nGHOKGOOIgZ0EeaI/wdIyYeOZ8pI6SJOjMXnWP83TQST4y04zMRP4AGLRBghCDW8w3FuRvxp0fGEho2pxBpWt4+eIejFxwhFJKvM+7JUwfGQCVk89GN9J99pmZGqevKG2pSG6VK5CnnzGoG7XIfScBUHJ8t15rSA91E7KSdoKR/8xWsYhDDj79BkkVqx0TRWrsjRCmijHYuGPj1/YoXKXiWb94+uEwDej36Fv4C+AJpS3jB3kOO526GcQY31Dcd8PGv1xDDm7EwsmBWhiRet419y3gMM/9E7r8SmivBNvHf7l4ZSA9We9K+cmvvYHPvncGPzSAbiUZOGUAN1cO5CGQZuUKhjXfwPWhtdCBAoS/gAAAABJRU5ErkJggg==)](http://www.zowe.org/)
[![License](https://img.shields.io/badge/license-EPL_2.0-red.svg)](https://opensource.org/licenses/EPL-2.0)
[![ts](https://img.shields.io/badge/TypeScript-%230074c1.svg?logo=TypeScript&logoColor=white)](https://www.typescriptlang.org/)
[![node](https://img.shields.io/badge/Node.js-339933.svg?logo=Node.js&logoColor=white)](https://nodejs.org/en/)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-2F0268.svg)](https://lerna.js.org/)
[![jest](https://img.shields.io/badge/tested%20with-jest-C21325.svg)](https://jestjs.io/)
[![code style: airbnb](https://img.shields.io/badge/code%20style-airbnb-FF5A5F.svg?style=flat)](https://github.com/airbnb/javascript)
[![build](https://img.shields.io/github/workflow/status/zowe/zebra/Build%20and%20Test%20Workflow/main)](https://github.com/zowe/zebra/actions)

<p align="center">
  <img alt="ZEBRA logo" src="images/zebra.png" style="width: 60%">
</p>

- [About](#about)
- [Getting Started](#getting-started)
  - [System Requirements](#system-requirements)
    - [RMF Distributed Data Server](#rmf-distributed-data-server)
    - [Node.js](#nodejs)
  - [Installation](#installation)
  - [Development](#development)
- [Packages](#packages)
  - [`@zebra-omp/parser`](#zebra-ompparser)
  - [`@zebra-omp/server`](#zebra-ompserver)
  - [`@zebra-omp/ui`](#zebra-ompui)
  - [`@zebra-omp/types`](#zebra-omptypes)
- [Supported Metrics](#supported-metrics)
  - [RMF](#rmf)
    - [RMF Postprocessor Reports](#rmf-postprocessor-reports)
    - [RMF Monitor III Reports](#rmf-monitor-iii-reports)
  - [SMF](#smf)
- [Contribution](#contribution)
- [License](#license)

# About

ZEBRA is an open-source incubator project for [Zowe](https://www.zowe.org). The project is best described as a z/OS performance metric framework and API that allows for quick and automated data handling through other services, such as [Grafana](https://grafana.com/). Currently, ZEBRA supports RMF as its performance metric data source, with plans to expand to SMF in the future.

# Getting Started

## System Requirements
Before installing ZEBRA, make sure you meet the following system requirements.

### RMF Distributed Data Server
ZEBRA uses the [RMF Distributed Data Server](https://www.ibm.com/docs/en/zos/2.2.0?topic=rmf-setting-up-distributed-data-server-zos) as the source for its RMF data. Any installation of z/OS that uses RMF should have access to setting it up. You can find out more through the official [IBM Documentation](https://www.ibm.com/docs/en/zos/2.2.0?topic=rmf-setting-up-distributed-data-server-zos).

### Node.js
ZEBRA requires the LTS Gallium version of Node.js (v16). Since ZEBRA is a Node.js application, it can run anywhere Node.js can run. It does **not** need to be run on z/OS to work.

## Installation

TODO

## Development

Once you set up the development environment with Node.js, run
```
npx lerna bootstrap
```
to install all dependencies across the packages

# Packages
This repository serves as a [monorepo](https://en.wikipedia.org/wiki/Monorepo) managing the various packages for ZEBRA. The following are the currently supported packages:

## `@zebra-omp/parser`
This package handles the parsing of XML data retrieved from RMF Distributed Data Server into ZEBRA's JSON format. This is the core component of the project. Find out more [here](packages/parser/README.md).

## `@zebra-omp/server`
This package creates a REST API that can be used to retrieve RMF data in ZEBRA format. Find out more [here](packages/server/README.md).

## `@zebra-omp/ui`
This package contains a user interface that can be interacted with instead of soley using the REST API. Find out more [here](packages/ui/README.md).

## `@zebra-omp/types`
This package holds shared typing information that is used across the other packages. Find out more [here](packages/types/README.md).

# Supported Metrics
This section provides some insight on what kind of data can be accessed wit ZEBRA.

## RMF
Anything that can be accessed via the RMF Distributed Data Server for z/OS can be accessed via ZEBRA. Here are some examples:

### RMF Postprocessor Reports
These reports contain historical data:
- CPU
- WLMGL
- CHAN
- and much more!

### RMF Monitor III Reports
These reports contain near real-time data:
- CPC
- SYSINFO
- CHANNEL
- and much more!

## SMF
Coming soon!

# Contribution
We encourage anyone to contribute to ZEBRA, whether it be with code or knowledge of the performance metrics it uses! Check out the [Contribution Guidelines](CONTRIBUTING.md) for more on contributing code.

The ZEBRA team meets biweekly on Thursdays at 8:00AM ET via Zoom to discuss plans and general topics. All are welcome! Checkout the [Zowe Calendar](https://lists.openmainframeproject.org/g/zowe-dev/calendar?calstart=2022-03-31) for the link!

# License
This program and the accompanying materials are made available under the terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.