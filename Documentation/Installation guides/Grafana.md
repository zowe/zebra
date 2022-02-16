# Install Grafana on Windows
## Install on Windows
1. Navigate to Download Grafana(https://grafana.com/grafana/download?platform=windows).
2. Select a Grafana version you want to install.
    - The most recent Grafana version is selected by default.
    - The Version field displays only finished releases. If you want to install a beta version, click Nightly Builds and then select a version.
3. Select an Edition.
    - Enterprise - Recommended download. Functionally identical to the open source version, but includes features you can unlock with a license if you so choose.
    - Open Source - Functionally identical to the enterprise version, but you will need to download the enterprise version if you want enterprise features.
4. Click Windows.
  You can either use the Windows installer or you can install a standalone Windows binary.
### Install with Windows installer (recommended)
  - Click Download the installer.
  - Open and run the installer.
  - To run Grafana, open your browser and go to the Grafana port (http://localhost:3000/ is default) and then follow the instructions in Getting Started

# Install Grafana on Linux(Ubuntu/Debian)
1. Download and install
  You can install Grafana using our official APT repository, by downloading a .deb package, or by downloading a binary .tar.gz file.
  OR
2. Install from APT repository
  If you install from the APT repository, then Grafana is automatically updated every time you run apt-get update.  
  To install the latest Enterprise edition:
  ```  
  sudo apt-get install -y apt-transport-https
  sudo apt-get install -y software-properties-common wget
  wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
  ```
  Add this repository for stable releases:
  ```
  echo "deb https://packages.grafana.com/enterprise/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
  ```
  Add this repository if you want beta releases:  
  ```
  echo "deb https://packages.grafana.com/enterprise/deb beta main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
  ```
  After you add the repository:
  ```
  sudo apt-get update
  sudo apt-get install grafana-enterprise
  ```
  
# Install Grafana on Mac
## Install on macOS
  This page explains how to install Grafana and get the service running on your macOS.

### Install with Homebrew
  Use Homebrew to install the most recent released version of Grafana using Homebrew package.  
  1. On the Homberew homepage, search for Grafana. The last stable and released version is listed.  
  2. Open a terminal and enter:  
  ```
  brew update
  brew install grafana
  ```
The brew page downloads and untars the files into /usr/local/Cellar/grafana/version.

3. Start Grafana using the command:
  ```
  brew services start grafana
  ```
### Install standalone macOS binaries
  To install a nightly build, or to install the latest version of Grafana without Homebrew, go to the Grafana download page.  
  1. Select the Grafana version you want to install. By default, the most recent released version is selected.

  2. Select an Edition.
    -  Open Source - Functionally identical to the enterprise version, but you will need to download the enterprise version if you want enterprise features.
    - Enterprise - Recommended download. Functionally identical to the open source version, but includes features you can unlock with a license if you so choose.
  3. Click Mac.
  4. Open a terminal and download the binary using the cURL command. The following example shows Grafana 7.1.5 version:
    ```
    curl -O https://dl.grafana.com/oss/release/grafana-7.1.5.darwin-amd64.tar.gz
    ```
  5. Untar the gz file and copy the files to the location of your preference.

  6. To start Grafana service, go to the directory and run the command:
    ```
    ./bin/grafana-server web
    ```
