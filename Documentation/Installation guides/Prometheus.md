# Install Prometheus on Windows
  1. Download Prometheus Zip file for windows from https://prometheus.io/download/
  2. Unzip the files in a location of your choice.
  3. Configure Prometeheus
    - locate Prometheus.yml
    - edit the scrape config to point to app/server you want to monitor/scrape
    ```
    scrape_configs:
    # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
     job_name: 'zebra'
        metrics_path: "/prommetric"
        scrape_interval: 60s
        # metrics_path defaults to '/metrics'
        # scheme defaults to 'http'.
        static_configs:
         targets: ['localhost:3090']  
    ```
  4. Run Prometheus
    - Open command line and navigate to the directory for prometheus files
    - run
    ```
    prometheus --config.file=prometheus.yml
    ```
# Install Prometheus on Linux(ubuntu/debian)
  1. Create Prometheus system group
    Let’s start by creating the Prometheus system user and group.
    ```
    sudo groupadd --system prometheus
    ```
    The group with ID < 1000 is a system group. Once the system group is added, create Prometheus system user and assign primary group created.
    ```
    sudo useradd -s /sbin/nologin --system -g prometheus prometheus
    ```
  2. Create data & configs directories for Prometheus
    Prometheus needs a directory to store its data. We will create this under /var/lib/prometheus.
    ```
    sudo mkdir /var/lib/prometheus
    ```
    Prometheus primary configuration files directory is /etc/prometheus/. It will have some sub-directories:
    ```
    for i in rules rules.d files_sd; do sudo mkdir -p /etc/prometheus/${i}; done
    ```
  3. Download Prometheus
    We need to download the latest release of Prometheus archive and extract it to get binary files. You can check releases from Prometheus releases Github page.  
    Install wget.
    ```
    sudo apt update
    sudo apt -y install wget curl vim
    ```
    Then download latest binary archive for Prometheus.
    ```
    mkdir -p /tmp/prometheus && cd /tmp/prometheus
    curl -s https://api.github.com/repos/prometheus/prometheus/releases/latest | grep browser_download_url | grep linux-amd64 | cut -d '"' -f 4 | wget -qi -
    ```
    Extract the file:
    ```
    tar xvf prometheus*.tar.gz
    cd prometheus*/
    ```
    Move the binary files to /usr/local/bin/ directory.
    ```
    sudo mv prometheus promtool /usr/local/bin/
    ```
    Check installed version:
    ```
    $ prometheus --version
    prometheus, version 2.15.2 (branch: HEAD, revision: d9613e5c466c6e9de548c4dae1b9aabf9aaf7c57)
    build user:       root@688433cf4ff7
    build date:       20200106-14:50:51
    go version:       go1.13.5

    $ promtool --version
    promtool, version 2.15.2 (branch: HEAD, revision: d9613e5c466c6e9de548c4dae1b9aabf9aaf7c57)
    build user:       root@688433cf4ff7
    build date:       20200106-14:50:51
    go version:       go1.13.5
    ```
    Move Prometheus configuration template to /etc directory.
    ```
    sudo mv prometheus.yml /etc/prometheus/prometheus.yml
    ```
    Also move consoles and console_libraries to /etc/prometheus directory:
    ```
    sudo mv consoles/ console_libraries/ /etc/prometheus/
    ```
  4. Configure Prometheus on Debian / Ubuntu
    Create or edit a configuration file for Prometheus – /etc/prometheus/prometheus.yml.
    ```
    sudo vim /etc/prometheus/prometheus.yml
    ```
  5. Create a Prometheus systemd Service unit file
    To be able to manage Prometheus service with systemd, you need to explicitly define this unit file.
    ```
    sudo tee /etc/systemd/system/prometheus.service<<EOF
    [Unit]
    Description=Prometheus
    Documentation=https://prometheus.io/docs/introduction/overview/
    Wants=network-online.target
    After=network-online.target

    [Service]
    Type=simple
    User=prometheus
    Group=prometheus
    ExecReload=/bin/kill -HUP \$MAINPID
    ExecStart=/usr/local/bin/prometheus \
    --config.file=/etc/prometheus/prometheus.yml \
    --storage.tsdb.path=/var/lib/prometheus \
    --web.console.templates=/etc/prometheus/consoles \
    --web.console.libraries=/etc/prometheus/console_libraries \
    --web.listen-address=0.0.0.0:9090 \
    --web.external-url=

    SyslogIdentifier=prometheus
    Restart=always

    [Install]
    WantedBy=multi-user.target
    EOF
    ```
  6. Change directory permissions.
    Change the ownership of these directories to Prometheus user and group.
    ```
    for i in rules rules.d files_sd; do sudo chown -R prometheus:prometheus /etc/prometheus/${i}; done
    for i in rules rules.d files_sd; do sudo chmod -R 775 /etc/prometheus/${i}; done
    sudo chown -R prometheus:prometheus /var/lib/prometheus/
    ```
    Reload systemd daemon and start the service:
    ```
    sudo systemctl daemon-reload
    sudo systemctl start prometheus
    sudo systemctl enable prometheus
    ```
    Check status using systemctl status prometheus command:
    ```
    systemctl status prometheus
    ```
# Install Prometheus on Mac
  1. Prometheus is available as a binary for Mac OS X via https://prometheus.io/download/.
  OR
  2. it can be installed using homebrew
  - Install command:
    ```
    brew install prometheus
    ```
    Homebrew will install the prometheus binary into the /usr/local/bin directory.  
    We can test that it is operating using:
    ```
    prometheus --version
    ```
