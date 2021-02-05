# Install MongoDB on Windows
## Procedure
Follow these steps to install MongoDB Community Edition using the MongoDB Installer wizard. The installation process installs both the MongoDB binaries as well as the default configuration file <install directory>\bin\mongod.cfg.

1. Download the installer.
Download the MongoDB Community .msi installer from the following link:
https://www.mongodb.com/try/download/community?tck=docs_server
- In the Version dropdown, select the version of MongoDB to download.
- In the Platform dropdown, select Windows.
- In the Package dropdown, select msi.
Click Download.
2. Run the MongoDB installer.
For example, from the Windows Explorer/File Explorer:  
Go to the directory where you downloaded the MongoDB installer (.msi file). By default, this is your Downloads directory.  
Double-click the .msi file.  
3. Follow the MongoDB Community Edition installation wizard.  
The wizard steps you through the installation of MongoDB and MongoDB Compass.
- Choose Setup Type
  You can choose either the Complete (recommended for most users) or Custom setup type. The Complete setup option installs MongoDB and the MongoDB tools to the default location. The Custom setup option allows you to specify which executables are installed and where.

4. Install MongoDB Compass
  Optional. To have the wizard install MongoDB Compass, select Install MongoDB Compass (Default).

  When ready, click Install.

# Install MongoDB on Linux(Ubuntu)
### Import the public key used by the package management system
From a terminal, issue the following command to import the MongoDB public GPG Key from https://www.mongodb.org/static/pgp/server-4.4.asc:  
```
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc  
sudo apt-key add -
```
### Create a list file for MongoDB.
Create the list file /etc/apt/sources.list.d/mongodb-org-4.4.list for your version of Ubuntu.
```
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
```

### Update the package list
```
sudo apt-get update  
```

### Install MongoDB
```
sudo apt-get install -y mongodb-org
```

### Update /etc/mongod.conf for remote access
```
sudo vim /etc/mongod.conf
```

Edit bindIP: with setting below

```
net:
  port: 27017
  bindIp: 0.0.0.0
```

### Start MongoDB
```
sudo systemctl start mongod
```

### Check MongoDB status
```
sudo systemctl status mongod
```

### Enable MongoDB so it starts on boot
```
sudo systemctl enable mongod
```

# Install MongoDB on Mac
## Installing MongoDB 4.4 Community Edition
  Follow these steps to install MongoDB Community Edition using Homebrew’s brew package manager.  
  1. Verify that your system meets all the installation prerequisites by running the following command in your macOS Terminal:
  ```
  brew tap | grep mongodb
  ```
  You should see the MongoDB brew tap listed. If you do not, or you receive an error, return to the Prerequisites section.

  2. To install MongoDB, run the following command in your macOS Terminal application:
  ```
  brew install mongodb-community@4.4
  ```
  Alternatively, you can specify a previous version of MongoDB if desired. You can also maintain multiple versions of MongoDB side by side in this manner.

### Run MongoDB Community Edition
  Follow these steps to run MongoDB Community Edition. These instructions assume that you are using the default settings.  
  You can run MongoDB as a macOS service using brew, or you can run MongoDB manually as a background process. It is recommended to run MongoDB as a macOS service, as doing so sets the correct system ulimit values automatically (see ulimit settings for more information).  
  To run MongoDB (i.e. the mongod process) as a macOS service, issue the following:
  ```
  brew services start mongodb-community@4.4
  ```
  To stop a mongod running as a macOS service, use the following command as needed:
  ```
  brew services stop mongodb-community@4.4
  ```
  To run MongoDB (i.e. the mongod process) manually as a background process, issue the following:
  ```
  mongod --config /usr/local/etc/mongod.conf --fork
  ```
  To stop a mongod running as a background process, connect to the mongod from the mongo shell, and issue the shutdown command as needed.  
  Both methods use the /usr/local/etc/mongod.conf file created during the install. You can add your own MongoDB configuration options to this file as well.  