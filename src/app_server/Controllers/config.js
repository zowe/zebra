// app_server/Controllers/config.js
/* GET Homepage*/
const fs = require('fs').promises; // Use promises version for async/await
const fsSync = require('fs'); // Keep sync version for checks
const path = require('path');
const Auth = require('../../Auth');

// Load initial Zconfig
let Zconfig;
try {
  Zconfig = require("../../config/Zconfig");
} catch(e) {
  Zconfig = {};
}

// Helper function to get config path
function getConfigPath() {
  return path.join(__dirname, '..', '..', 'config', 'Zconfig.json');
}

// Helper function to reload Zconfig after changes
function reloadZconfigModule() {
  const configPath = getConfigPath();
  try {
    delete require.cache[require.resolve(configPath)];
    Zconfig = require(configPath);
    global.Zconfig = Zconfig;
    if (global.reloadZconfig) {
      global.Zconfig = global.reloadZconfig();
    }
    return Zconfig;
  } catch (error) {
    console.error("Error reloading Zconfig:", error);
    return Zconfig;
  }
}

module.exports.createZconfig = async function(req, res){
  var conf = {
    "mongourl": "localhost",
    "dbinterval": "100",
    "dbname": "Zebrav1111",
    "appurl": "localhost",
    "appport": "3090",
    "mongoport": "27017",
    "ppminutesInterval": "30",
    "rmf3interval": "100",
    "zebra_httptype": "http",
    "useDbAuth": "true",
    "dbUser": "myUserAdmin",
    "dbPassword": "salisu",
    "authSource": "admin",
    "use_cert": "false",
    "grafanaurl": "localhost",
    "grafanaport": "3000",
    "grafanahttptype": "http",
    "dds": {
      "LPAR1": {
        "ddshhttptype": "https",
        "ddsbaseurl": "lpar1.com",
        "ddsbaseport": "8803",
        "ddsauth": "true",
        "ddsuser": "user",
        "ddspwd": "password",
        "rmf3filename": "rmfm3.xml",
        "rmfppfilename": "rmfpp.xml",
        "mvsResource": ",SYSID,MVS_IMAGE",
        "PCI": 2951,
        "usePrometheus": "false",
        "useMongo": "false",
        "hmai": {
          "ftp": {
            "directory": "/default/ftp/directory"
          },
          "mysql": {
            "host": "localhost",
            "user": "defaultuser",
            "password": "defaultpassword"
          },
          "dataRetention": {
            "clpr": "1",
            "ldev": "1",
            "mpb":"1",
            "mprank20": "1",
            "pgrp": "1",
            "port": "1"
        },
          "checkInterval": "1",
          "defaultStartDate": "2024-08-20",
          "continuousMonitoring": true
        },
        "hmre": {
          "ftp": {
            "directory": "/u/hmre/hmrecsv"
          },
          "mysql": {
            "host": "localhost",
            "user": "defaultuser",
            "password": "defaultpassword"
          },
          "checkInterval": "1",
          "defaultStartDate": "2024-08-20",
          "continuousMonitoring": true
        },
        "dcol": {
          "ftp": {
            "directory": "/u/hmaidcol"
          },
          "mysql": {
            "host": "localhost",
            "user": "defaultuser",
            "password": "defaultpassword"
          },
          "checkInterval": "1",
          "defaultStartDate": "2024-08-20",
          "continuousMonitoring": true
        }
      }
    },
    "apiml_IP": "localhost",
    "apiml_http_type": "https",
    "apiml_password": "password",
    "apiml_username": "username",
    "apiml_port": "10010",
    "apiml_auth_type": "bypass"
  };
  
  const configDir = path.join(__dirname, '..', '..', 'config');
  const configPath = getConfigPath();
  
  try {
    // Ensure the directory exists
    if (!fsSync.existsSync(configDir)) {
      await fs.mkdir(configDir, { recursive: true });
    }
    
    // Write the file
    await fs.writeFile(configPath, JSON.stringify(conf, null, '\t'), 'utf-8');
    
    // Update the global Zconfig variable
    Zconfig = conf;
    reloadZconfigModule();
    
    res.json({ success: true, message: `Zconfig file Created Successfully` });
  } catch (err) {
    console.error("Error creating Zconfig file:", err);
    res.status(500).json({ success: false, message: `Zconfig file Creation Failed: ${err.message}` });
  }
};

module.exports.updatedds = async function(req, res){ 
  try {
    if (!Zconfig.dds) {
      Zconfig.dds = {};
    }
    
    if (!Zconfig.dds[req.body.sysid]) {
      Zconfig.dds[req.body.sysid] = {};
    }
    
    // Merge the update into existing config
    Object.assign(Zconfig.dds[req.body.sysid], req.body.update);
    
    // Handle HMAI configuration update
    if (req.body.update.hmai) {
      if (!Zconfig.dds[req.body.sysid].hmai) {
        Zconfig.dds[req.body.sysid].hmai = {};
      }
      Object.assign(Zconfig.dds[req.body.sysid].hmai, req.body.update.hmai);
      
      // Handle data retention configuration
      if (req.body.update.hmai.dataRetention) {
        if (!Zconfig.dds[req.body.sysid].hmai.dataRetention) {
          Zconfig.dds[req.body.sysid].hmai.dataRetention = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].hmai.dataRetention, req.body.update.hmai.dataRetention);
      }
      
      // Handle RMF MON I retention configuration
      if (req.body.update.hmai.rmfmon1Retention) {
        if (!Zconfig.dds[req.body.sysid].hmai.rmfmon1Retention) {
          Zconfig.dds[req.body.sysid].hmai.rmfmon1Retention = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].hmai.rmfmon1Retention, req.body.update.hmai.rmfmon1Retention);
      }
    }
    
    // Handle HMRE configuration update
    if (req.body.update.hmre) {
      if (!Zconfig.dds[req.body.sysid].hmre) {
        Zconfig.dds[req.body.sysid].hmre = {};
      }
      if (req.body.update.hmre.ftp) {
        if (!Zconfig.dds[req.body.sysid].hmre.ftp) {
          Zconfig.dds[req.body.sysid].hmre.ftp = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].hmre.ftp, req.body.update.hmre.ftp);
      }
      if (req.body.update.hmre.mysql) {
        if (!Zconfig.dds[req.body.sysid].hmre.mysql) {
          Zconfig.dds[req.body.sysid].hmre.mysql = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].hmre.mysql, req.body.update.hmre.mysql);
      }
      if (req.body.update.hmre.checkInterval !== undefined) {
        Zconfig.dds[req.body.sysid].hmre.checkInterval = req.body.update.hmre.checkInterval;
      }
      if (req.body.update.hmre.defaultStartDate !== undefined) {
        Zconfig.dds[req.body.sysid].hmre.defaultStartDate = req.body.update.hmre.defaultStartDate;
      }
      if (req.body.update.hmre.continuousMonitoring !== undefined) {
        Zconfig.dds[req.body.sysid].hmre.continuousMonitoring = req.body.update.hmre.continuousMonitoring;
      }
      
      // Handle data retention configuration
      if (req.body.update.hmre.dataRetention) {
        if (!Zconfig.dds[req.body.sysid].hmre.dataRetention) {
          Zconfig.dds[req.body.sysid].hmre.dataRetention = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].hmre.dataRetention, req.body.update.hmre.dataRetention);
      }
    }

    // Handle DCOL configuration update
    if (req.body.update.dcol) {
      if (!Zconfig.dds[req.body.sysid].dcol) {
        Zconfig.dds[req.body.sysid].dcol = {};
      }
      if (req.body.update.dcol.ftp) {
        if (!Zconfig.dds[req.body.sysid].dcol.ftp) {
          Zconfig.dds[req.body.sysid].dcol.ftp = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].dcol.ftp, req.body.update.dcol.ftp);
      }
      if (req.body.update.dcol.mysql) {
        if (!Zconfig.dds[req.body.sysid].dcol.mysql) {
          Zconfig.dds[req.body.sysid].dcol.mysql = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].dcol.mysql, req.body.update.dcol.mysql);
      }
      if (req.body.update.dcol.checkInterval !== undefined) {
        Zconfig.dds[req.body.sysid].dcol.checkInterval = req.body.update.dcol.checkInterval;
      }
      if (req.body.update.dcol.defaultStartDate !== undefined) {
        Zconfig.dds[req.body.sysid].dcol.defaultStartDate = req.body.update.dcol.defaultStartDate;
      }
      if (req.body.update.dcol.continuousMonitoring !== undefined) {
        Zconfig.dds[req.body.sysid].dcol.continuousMonitoring = req.body.update.dcol.continuousMonitoring;
      }
      
      // Handle data retention configuration
      if (req.body.update.dcol.dataRetention) {
        if (!Zconfig.dds[req.body.sysid].dcol.dataRetention) {
          Zconfig.dds[req.body.sysid].dcol.dataRetention = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].dcol.dataRetention, req.body.update.dcol.dataRetention);
      }
    }
    
    // Handle RMF MON 1 configuration
    if (req.body.update.rmfmon1) {
      if (!Zconfig.dds[req.body.sysid].rmfmon1) {
        Zconfig.dds[req.body.sysid].rmfmon1 = {};
      }
      // Handle Cache configuration
      if (req.body.update.rmfmon1.cache) {
        Zconfig.dds[req.body.sysid].rmfmon1.cache = req.body.update.rmfmon1.cache;
      }
      // Handle Device configuration
      if (req.body.update.rmfmon1.device) {
        Zconfig.dds[req.body.sysid].rmfmon1.device = req.body.update.rmfmon1.device;
      }
      // Handle MySQL config
      if (req.body.update.rmfmon1.mysql) {
        if (!Zconfig.dds[req.body.sysid].rmfmon1.mysql) {
          Zconfig.dds[req.body.sysid].rmfmon1.mysql = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].rmfmon1.mysql, req.body.update.rmfmon1.mysql);
      }
    }
    
    const configPath = getConfigPath();
    await fs.writeFile(configPath, JSON.stringify(Zconfig, null, '\t'), 'utf-8');
    reloadZconfigModule();
    
    res.send(`${req.body.sysid} Details Updated Successfully`);
  } catch(e) {
    console.error(`Error updating ${req.body.sysid} Details:`, e);
    res.status(500).send(`${req.body.sysid} Details Update Failed`);
  }
};

module.exports.savedds = async function(req, res) {
  try {
    if (!Zconfig.dds) {
      Zconfig.dds = {};
    }
    
    // Replace the entire DDS entry with the new update
    Zconfig.dds[req.body.sysid] = req.body.update;
    
    // Handle HMAI configuration
    if (req.body.update.hmai) {
      if (!Zconfig.dds[req.body.sysid].hmai) {
        Zconfig.dds[req.body.sysid].hmai = {};
      }
      Object.assign(Zconfig.dds[req.body.sysid].hmai, req.body.update.hmai);
      
      // Handle data retention configuration
      if (req.body.update.hmai.dataRetention) {
        if (!Zconfig.dds[req.body.sysid].hmai.dataRetention) {
          Zconfig.dds[req.body.sysid].hmai.dataRetention = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].hmai.dataRetention, req.body.update.hmai.dataRetention);
      }
      
      // Handle RMF MON I retention configuration
      if (req.body.update.hmai.rmfmon1Retention) {
        if (!Zconfig.dds[req.body.sysid].hmai.rmfmon1Retention) {
          Zconfig.dds[req.body.sysid].hmai.rmfmon1Retention = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].hmai.rmfmon1Retention, req.body.update.hmai.rmfmon1Retention);
      }
    }

    // Handle HMRE configuration
    if (req.body.update.hmre) {
      if (!Zconfig.dds[req.body.sysid].hmre) {
        Zconfig.dds[req.body.sysid].hmre = {};
      }
      if (req.body.update.hmre.ftp) {
        if (!Zconfig.dds[req.body.sysid].hmre.ftp) {
          Zconfig.dds[req.body.sysid].hmre.ftp = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].hmre.ftp, req.body.update.hmre.ftp);
      }
      if (req.body.update.hmre.mysql) {
        if (!Zconfig.dds[req.body.sysid].hmre.mysql) {
          Zconfig.dds[req.body.sysid].hmre.mysql = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].hmre.mysql, req.body.update.hmre.mysql);
      }
      if (req.body.update.hmre.checkInterval !== undefined) {
        Zconfig.dds[req.body.sysid].hmre.checkInterval = req.body.update.hmre.checkInterval;
      }
      if (req.body.update.hmre.defaultStartDate !== undefined) {
        Zconfig.dds[req.body.sysid].hmre.defaultStartDate = req.body.update.hmre.defaultStartDate;
      }
      if (req.body.update.hmre.continuousMonitoring !== undefined) {
        Zconfig.dds[req.body.sysid].hmre.continuousMonitoring = req.body.update.hmre.continuousMonitoring;
      }
      
      // Handle data retention configuration
      if (req.body.update.hmre.dataRetention) {
        if (!Zconfig.dds[req.body.sysid].hmre.dataRetention) {
          Zconfig.dds[req.body.sysid].hmre.dataRetention = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].hmre.dataRetention, req.body.update.hmre.dataRetention);
      }
    }

    // Handle DCOL configuration
    if (req.body.update.dcol) {
      if (!Zconfig.dds[req.body.sysid].dcol) {
        Zconfig.dds[req.body.sysid].dcol = {};
      }
      if (req.body.update.dcol.ftp) {
        if (!Zconfig.dds[req.body.sysid].dcol.ftp) {
          Zconfig.dds[req.body.sysid].dcol.ftp = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].dcol.ftp, req.body.update.dcol.ftp);
      }
      if (req.body.update.dcol.mysql) {
        if (!Zconfig.dds[req.body.sysid].dcol.mysql) {
          Zconfig.dds[req.body.sysid].dcol.mysql = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].dcol.mysql, req.body.update.dcol.mysql);
      }
      if (req.body.update.dcol.checkInterval !== undefined) {
        Zconfig.dds[req.body.sysid].dcol.checkInterval = req.body.update.dcol.checkInterval;
      }
      if (req.body.update.dcol.defaultStartDate !== undefined) {
        Zconfig.dds[req.body.sysid].dcol.defaultStartDate = req.body.update.dcol.defaultStartDate;
      }
      if (req.body.update.dcol.continuousMonitoring !== undefined) {
        Zconfig.dds[req.body.sysid].dcol.continuousMonitoring = req.body.update.dcol.continuousMonitoring;
      }
      
      // Handle data retention configuration
      if (req.body.update.dcol.dataRetention) {
        if (!Zconfig.dds[req.body.sysid].dcol.dataRetention) {
          Zconfig.dds[req.body.sysid].dcol.dataRetention = {};
        }
        Object.assign(Zconfig.dds[req.body.sysid].dcol.dataRetention, req.body.update.dcol.dataRetention);
      }
    }
    
    const configPath = getConfigPath();
    await fs.writeFile(configPath, JSON.stringify(Zconfig, null, '\t'), 'utf-8');
    reloadZconfigModule();
    
    res.send(`${req.body.sysid} Details Saved Successfully`);
  } catch(e) {
    console.error(`Error saving ${req.body.sysid} Details:`, e);
    res.status(500).send(`Saving ${req.body.sysid} Details Failed`);
  }
};

module.exports.deletedds = async function(req, res){ 
  try {
    delete Zconfig.dds[`${req.body.sysid}`];
    
    const configPath = getConfigPath();
    await fs.writeFile(configPath, JSON.stringify(Zconfig, null, '\t'), 'utf-8');
    reloadZconfigModule();
    
    res.send(`${req.body.sysid} Details Deleted Successfully`);
  } catch(e) {
    console.error(`Error deleting ${req.body.sysid} Details:`, e);
    res.status(500).send(`${req.body.sysid} Details Deletion Failed`);
  }
};

/**  
 * addSetting Function controls adding/modifying settings used by the app in Zconfig.json file 
 * Endpoint: /addSettings                                                                      
 * Example: /addSettings?appurl=salisuali.com&appport=3009                                     
 * Endpoint can take multiple parameters recognised by the addSettings Function                
 */
module.exports.updateconfig = async function(req, res) {
  try {
    var queryParameterKeys = Object.keys(req.body);
    
    for (var i in queryParameterKeys) {
      var parameterKey = queryParameterKeys[i];
      
      if (parameterKey === 'dds') {
        Object.keys(req.body.dds).forEach(lpar => {
          // Ensure lpar exists in Zconfig
          if (!Zconfig.dds) {
            Zconfig.dds = {};
          }
          if (!Zconfig.dds[lpar]) {
            Zconfig.dds[lpar] = {};
          }
          
          // Handle HMAI configuration
          if (req.body.dds[lpar] && req.body.dds[lpar].hmai) {
            if (!Zconfig.dds[lpar].hmai) {
              Zconfig.dds[lpar].hmai = {};
            }
            
            // Update FTP directory
            if (req.body.dds[lpar].hmai.ftp && req.body.dds[lpar].hmai.ftp.directory) {
              Zconfig.dds[lpar].hmai.ftp = Zconfig.dds[lpar].hmai.ftp || {};
              Zconfig.dds[lpar].hmai.ftp.directory = req.body.dds[lpar].hmai.ftp.directory;
            }
            
            // Update MySQL configuration
            if (req.body.dds[lpar].hmai.mysql) {
              Zconfig.dds[lpar].hmai.mysql = Zconfig.dds[lpar].hmai.mysql || {};
              Zconfig.dds[lpar].hmai.mysql.host = req.body.dds[lpar].hmai.mysql.host || Zconfig.dds[lpar].hmai.mysql.host;
              Zconfig.dds[lpar].hmai.mysql.user = req.body.dds[lpar].hmai.mysql.user || Zconfig.dds[lpar].hmai.mysql.user;
              Zconfig.dds[lpar].hmai.mysql.password = req.body.dds[lpar].hmai.mysql.password || Zconfig.dds[lpar].hmai.mysql.password;
            }
            
            // Update data retention
            if (req.body.dds[lpar].hmai.dataRetention) {
              Zconfig.dds[lpar].hmai.dataRetention = Zconfig.dds[lpar].hmai.dataRetention || {};
              Object.assign(Zconfig.dds[lpar].hmai.dataRetention, req.body.dds[lpar].hmai.dataRetention);
            }
            
            // Update other HMAI fields
            if (req.body.dds[lpar].hmai.checkInterval !== undefined) {
              Zconfig.dds[lpar].hmai.checkInterval = req.body.dds[lpar].hmai.checkInterval;
            }
            if (req.body.dds[lpar].hmai.defaultStartDate !== undefined) {
              Zconfig.dds[lpar].hmai.defaultStartDate = req.body.dds[lpar].hmai.defaultStartDate;
            }
            if (req.body.dds[lpar].hmai.continuousMonitoring !== undefined) {
              Zconfig.dds[lpar].hmai.continuousMonitoring = req.body.dds[lpar].hmai.continuousMonitoring;
            }
          }

          // Handle HMRE configuration
          if (req.body.dds[lpar] && req.body.dds[lpar].hmre) {
            if (!Zconfig.dds[lpar].hmre) {
              Zconfig.dds[lpar].hmre = {};
            }

            // Update FTP directory
            if (req.body.dds[lpar].hmre.ftp && req.body.dds[lpar].hmre.ftp.directory) {
              Zconfig.dds[lpar].hmre.ftp = Zconfig.dds[lpar].hmre.ftp || {};
              Zconfig.dds[lpar].hmre.ftp.directory = req.body.dds[lpar].hmre.ftp.directory;
            }

            // Update MySQL configuration
            if (req.body.dds[lpar].hmre.mysql) {
              Zconfig.dds[lpar].hmre.mysql = Zconfig.dds[lpar].hmre.mysql || {};
              Object.assign(Zconfig.dds[lpar].hmre.mysql, req.body.dds[lpar].hmre.mysql);
            }

            // Update other HMRE fields
            if (req.body.dds[lpar].hmre.checkInterval !== undefined) {
              Zconfig.dds[lpar].hmre.checkInterval = req.body.dds[lpar].hmre.checkInterval;
            }
            if (req.body.dds[lpar].hmre.defaultStartDate !== undefined) {
              Zconfig.dds[lpar].hmre.defaultStartDate = req.body.dds[lpar].hmre.defaultStartDate;
            }
            if (req.body.dds[lpar].hmre.continuousMonitoring !== undefined) {
              Zconfig.dds[lpar].hmre.continuousMonitoring = req.body.dds[lpar].hmre.continuousMonitoring;
            }
          }

          // Handle DCOL configuration
          if (req.body.dds[lpar] && req.body.dds[lpar].dcol) {
            if (!Zconfig.dds[lpar].dcol) {
              Zconfig.dds[lpar].dcol = {};
            }

            // Update FTP directory
            if (req.body.dds[lpar].dcol.ftp && req.body.dds[lpar].dcol.ftp.directory) {
              Zconfig.dds[lpar].dcol.ftp = Zconfig.dds[lpar].dcol.ftp || {};
              Zconfig.dds[lpar].dcol.ftp.directory = req.body.dds[lpar].dcol.ftp.directory;
            }

            // Update MySQL configuration
            if (req.body.dds[lpar].dcol.mysql) {
              Zconfig.dds[lpar].dcol.mysql = Zconfig.dds[lpar].dcol.mysql || {};
              Object.assign(Zconfig.dds[lpar].dcol.mysql, req.body.dds[lpar].dcol.mysql);
            }

            // Update other DCOL fields
            if (req.body.dds[lpar].dcol.checkInterval !== undefined) {
              Zconfig.dds[lpar].dcol.checkInterval = req.body.dds[lpar].dcol.checkInterval;
            }
            if (req.body.dds[lpar].dcol.defaultStartDate !== undefined) {
              Zconfig.dds[lpar].dcol.defaultStartDate = req.body.dds[lpar].dcol.defaultStartDate;
            }
            if (req.body.dds[lpar].dcol.continuousMonitoring !== undefined) {
              Zconfig.dds[lpar].dcol.continuousMonitoring = req.body.dds[lpar].dcol.continuousMonitoring;
            }
          }
        });
      } else {
        // Handle other configuration fields
        switch(parameterKey) {
          case "apimlpwd":
            Zconfig['apiml_password'] = req.body.apimlpwd;
            break;
          case "mongourl":
            Zconfig['mongourl'] = req.body.mongourl;
            break;
          case "mongoport":
            Zconfig['mongoport'] = req.body.mongoport;
            break;
          case "dbname":
            Zconfig['dbname'] = req.body.dbname;
            break;
          case "dbinterval":
            Zconfig['dbinterval'] = req.body.dbinterval;
            break;
          case "appurl":
            Zconfig['appurl'] = req.body.appurl;
            break;
          case "appport":
            Zconfig['appport'] = req.body.appport;
            break;
          case "apimluser":
            Zconfig['apiml_username'] = req.body.apimluser;
            break;
          case "usecert":
            Zconfig['use_cert'] = req.body.usecert;
            break;
          case "grafanahttp":
            Zconfig['grafanahttptype'] = req.body.grafanahttp;
            break;
          case "rmf3interval":
            Zconfig['rmf3interval'] = req.body.rmf3interval;
            break;
          case "ppminutesInterval":
            Zconfig['ppminutesInterval'] = req.body.ppminutesInterval;
            break;
          case "httptype":
            Zconfig['zebra_httptype'] = req.body.httptype;
            break;
          case "useDbAuth":
            Zconfig['useDbAuth'] = req.body.useDbAuth;
            break;
          case "dbUser":
            Zconfig['dbUser'] = req.body.dbUser;
            break;
          case "dbPassword":
            Zconfig['dbPassword'] = req.body.dbPassword;
            break;
          case "authSource":
            Zconfig['authSource'] = req.body.authSource;
            break;
          case "apimlhttp":
            Zconfig['apiml_http_type'] = req.body.apimlhttp;
            break;
          case "apimlIP":
            Zconfig['apiml_IP'] = req.body.apimlIP;
            break;
          case "grafanaurl":
            Zconfig['grafanaurl'] = req.body.grafanaurl;
            break;
          case "grafanaport":
            Zconfig['grafanaport'] = req.body.grafanaport;
            break;
          case "apimlport":
            Zconfig['apiml_port'] = req.body.apimlport;
            break;
          case "apimlauth":
            Zconfig['apiml_auth_type'] = req.body.apimlauth;
            break;
        }
      }
    }
    
    const configPath = getConfigPath();
    await fs.writeFile(configPath, JSON.stringify(Zconfig, null, '\t'), 'utf-8');
    reloadZconfigModule();
    
    res.send("Zconfig Updated!");
  } catch (error) {
    console.error("Error in updateconfig:", error);
    res.status(500).send("Error updating configuration");
  }
};


