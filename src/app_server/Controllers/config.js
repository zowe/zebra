// app_server/Controllers/config.js
/* GET Homepage*/
var fs = require('fs'); //importing the fs module
try{
    var Zconfig = require("../../config/Zconfig");
}catch(e){
    var Zconfig = {};
}

var path = require("path");
var  Auth = require('../../Auth');

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
        }
      }
    },
    "apiml_IP": "localhost",
    "apiml_http_type": "https",
    "apiml_password": "password",
    "apiml_username": "username",
    "apiml_port": "10010",
    "apiml_auth_type": "bypass"
  }
  const configDir = path.join(__dirname, '..', '..', 'config');
  const configPath = path.join(configDir, 'Zconfig.json');
  
  // First, ensure the directory exists
  fs.mkdir(configDir, { recursive: true }, (err) => {
    if (err && err.code !== 'EEXIST') {
      console.error("Error creating config directory:", err);
      return res.status(500).json({ success: false, message: `Config directory creation failed: ${err.message}` });
    }
    
    // Now, write the file
    fs.writeFile(configPath, JSON.stringify(conf, null, '\t'), 'utf-8', (err) => {
      if (err) {
        console.error("Error creating Zconfig file:", err);
        return res.status(500).json({ success: false, message: `Zconfig file Creation Failed: ${err.message}` });
      }
      
      // Update the global Zconfig variable
      global.Zconfig = conf;
      delete require.cache[require.resolve('../../config/Zconfig.json')];
      res.json({ success: true, message: `Zconfig file Created Successfully` });
    });
  });
};

// try{
//   fs.writeFile("./config/Zconfig.json", JSON.stringify(conf, null, '\t'), 'utf-8', function(err, data) {}); // Save all new/modified settings to Zconfig file
//   res.send(`Zconfig file Created Successfully`); // Express returns JSON of the App settings from Zconfig.json file
// }catch(e){
//   res.send(`Zconfig file Creation Failed`);
// }

module.exports.updatedds = async function(req, res){ 
  try {
    if (!Zconfig.dds[req.body.sysid]) {
      Zconfig.dds[req.body.sysid] = {};
    }
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
    }
    
    await fs.writeFile("./config/Zconfig.json", JSON.stringify(Zconfig, null, '\t'), 'utf-8');
    global.Zconfig = global.reloadZconfig();
    res.send(`${req.body.sysid} Details Updated Successfully`);
  } catch(e) {
    console.error(`Error updating ${req.body.sysid} Details:`, e);
    res.status(500).send(`${req.body.sysid} Details Update Failed`);
  }
};

module.exports.savedds = async function(req, res) {
  try {
    if (!global.Zconfig.dds) {
      global.Zconfig.dds = {};
    }
    global.Zconfig.dds[req.body.sysid] = req.body.update;
    
    // Handle HMAI configuration
    if (req.body.update.hmai) {
      if (!global.Zconfig.dds[req.body.sysid].hmai) {
        global.Zconfig.dds[req.body.sysid].hmai = {};
      }
      Object.assign(global.Zconfig.dds[req.body.sysid].hmai, req.body.update.hmai);
      
      // Handle data retention configuration
      if (req.body.update.hmai.dataRetention) {
        if (!global.Zconfig.dds[req.body.sysid].hmai.dataRetention) {
          global.Zconfig.dds[req.body.sysid].hmai.dataRetention = {};
        }
        Object.assign(global.Zconfig.dds[req.body.sysid].hmai.dataRetention, req.body.update.hmai.dataRetention);
      }
    }
    
    const configPath = path.join(__dirname, '..', '..', 'config', 'Zconfig.json');
    await fs.writeFile(configPath, JSON.stringify(global.Zconfig, null, '\t'), 'utf-8');
    global.Zconfig = global.reloadZconfig();
    
    res.send(`${req.body.sysid} Details Saved Successfully`);
  } catch(e) {
    console.error(`Error saving ${req.body.sysid} Details:`, e);
    res.status(500).send(`Saving ${req.body.sysid} Details Failed`);
  }
};

module.exports.deletedds = async function(req, res){ 
    try{
        delete Zconfig.dds[`${req.body.sysid}`];
        fs.writeFile("./config/Zconfig.json", JSON.stringify(Zconfig, null, '\t'), 'utf-8', function(err, data) {}); // Save all new/modified settings to Zconfig file
        res.send(`${req.body.sysid} Details Deleted Successfully`); // Express returns JSON of the App settings from Zconfig.json file
    }catch(e){
        res.send(`${req.body.sysid} Details Deletion Failed`);
    }

};

/**  
 * addSetting Function controls adding/modifying settings used by the app in Zconfig.json file 
 * Endpoint: /addSettings                                                                      
 * Example: /addSettings?appurl=salisuali.com&appport=3009                                     
 * Endpoint can take multiple parameters recognised by the addSettings Function                
 */
module.exports.updateconfig = function(req, res) {
  try {
    var queryParameterKeys = Object.keys(req.body);
    for (var i in queryParameterKeys) {
      var parameterKey = queryParameterKeys[i];
      if (parameterKey === 'dds') {
        Object.keys(req.body.dds).forEach(lpar => {
          if (req.body.dds[lpar] && req.body.dds[lpar].hmai) {
            // Handle HMAI configuration
            if (!Zconfig.dds[lpar]) {
              Zconfig.dds[lpar] = {};
            }
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
            if (req.body.dds[lpar].hmai.dataRetention) {
              Zconfig.dds[lpar].hmai.dataRetention = Zconfig.dds[lpar].hmai.dataRetention || {};
              Zconfig.dds[lpar].hmai.dataRetention.clpr = req.body.dds[lpar].hmai.dataRetention.clpr || Zconfig.dds[lpar].hmai.dataRetention.clpr;
              Zconfig.dds[lpar].hmai.dataRetention.ldev = req.body.dds[lpar].hmai.dataRetention.ldev || Zconfig.dds[lpar].hmai.dataRetention.ldev;
              Zconfig.dds[lpar].hmai.dataRetention.mpb = req.body.dds[lpar].hmai.dataRetention.mpb || Zconfig.dds[lpar].hmai.dataRetention.mpb;
              Zconfig.dds[lpar].hmai.dataRetention.mprank20 = req.body.dds[lpar].hmai.dataRetention.mprank20 || Zconfig.dds[lpar].hmai.dataRetention.mprank20;
              Zconfig.dds[lpar].hmai.dataRetention.pgrp = req.body.dds[lpar].hmai.dataRetention.pgrp || Zconfig.dds[lpar].hmai.dataRetention.pgrp;
              Zconfig.dds[lpar].hmai.dataRetention.port = req.body.dds[lpar].hmai.dataRetention.port || Zconfig.dds[lpar].hmai.dataRetention.port;
            }
            
            // Update other HMAI fields
            Zconfig.dds[lpar].hmai.checkInterval = req.body.dds[lpar].hmai.checkInterval || Zconfig.dds[lpar].hmai.checkInterval;
            Zconfig.dds[lpar].hmai.defaultStartDate = req.body.dds[lpar].hmai.defaultStartDate || Zconfig.dds[lpar].hmai.defaultStartDate;
            Zconfig.dds[lpar].hmai.continuousMonitoring = req.body.dds[lpar].hmai.continuousMonitoring !== undefined ? req.body.dds[lpar].hmai.continuousMonitoring : Zconfig.dds[lpar].hmai.continuousMonitoring;
          }
        });
      }else {
        // Handle other configuration fields as before
        switch(parameterKey) {
          case "apimlpwd":
            Zconfig['apiml_password'] = req.body.apimlpwd;
            break;
          case "mongourl":
            Zconfig['mongourl'] = req.body.mongourl;
            break;
        case "mongoport": //if user specify a value for mongoport parameter in the URL
        Zconfig['mongoport'] = req.body.mongoport; // Change/add mongoport key to Zconfig file, with the value specified by user for mongoport 
        break;
      case "dbname": //if user specify a value for dbname parameter in the URL
        Zconfig['dbname'] = req.body.dbname; // Change/add dbname key to Zconfig file, with the value specified by user for dbname
        break;
      case "dbinterval": //if user specify a value for dbinterval parameter in the URL
        Zconfig['dbinterval'] = req.body.dbinterval; // Change/add dbinterval key to Zconfig file, with the value specified by user for dbinterval 
        break;
      case "appurl": //if user specify a value for appurl parameter in the URL
        Zconfig['appurl'] = req.body.appurl; // Change/add appurl key to Zconfig file, with the value specified by user for appurl 
        break;
      case "appport": //if user specify a value for appport parameter in the URL
        Zconfig['appport'] = req.body.appport; // Change/add appport key to Zconfig file, with the value specified by user for appport 
        break;
      case "apimluser": //if user specify a value for rmf3filename parameter in the URL
        Zconfig['apiml_username'] = req.body.apimluser; // Change/add rmf3filename key to Zconfig file, with the value specified by user for dbinterval 
        break;
      case "usecert": //if user specify a value for rmfppfilename parameter in the URL
        Zconfig['use_cert'] = req.body.usecert; // Change/add rmfppfilename key to Zconfig file, with the value specified by user for rmfppfilename 
        break;
      case "grafanahttp": //if user specify a value for mvsResource parameter in the URL
        Zconfig['grafanahttptype'] = req.body.grafanahttp; // Change/add mvsResource key to Zconfig file, with the value specified by user for mvsResource
        break;
      case "rmf3interval": //if user specify a value for rmf3interval parameter in the URL
        Zconfig['rmf3interval'] = req.body.rmf3interval; // Change/add rmf3interval key to Zconfig file, with the value specified by user for rmf3interval 
        break;
      case "ppminutesInterval": //if user specify a value for ppminutesInterval parameter in the URL
      Zconfig['ppminutesInterval'] = req.body.ppminutesInterval; // Change/add ppminutesInterval key to Zconfig file, with the value specified by user for ppminutesInterval 
        break;
      case "httptype": //if user specify a value for httptype parameter in the URL
      Zconfig['zebra_httptype'] = req.body.httptype; // Change/add httptype key to Zconfig file, with the value specified by user for httptype 
        break;
      case "useDbAuth": //if user specify a value for useDbAuth parameter in the URL
      Zconfig['useDbAuth'] = req.body.useDbAuth; // Change/add useDbAuth key to Zconfig file, with the value specified by user for useDbAuth 
        break;
      case "dbUser": //if user specify a value for dbUser parameter in the URL
        Zconfig['dbUser'] = req.body.dbUser; // Change/add dbUser key to Zconfig file, with the value specified by user for dbUser
        break;
      case "dbPassword": //if user specify a value for dbPassword parameter in the URL
        Zconfig['dbPassword'] = req.body.dbPassword; // Change/add dbPassword key to Zconfig file, with the value specified by user for dbPassword 
        break;
      case "authSource": //if user specify a value for authSource parameter in the URL
        Zconfig['authSource'] = req.body.authSource; // Change/add authSource key to Zconfig file, with the value specified by user for authSource
        break;
      case "apimlhttp": //if user specify a value for useMongo parameter in the URL
        Zconfig['apiml_http_type'] = req.body.apimlhttp; // Change/add useMongo key to Zconfig file, with the value specified by user for useMongo 
        break;
      case "apimlIP": //if user specify a value for usePrometheus parameter in the URL
      Zconfig['apiml_IP'] = req.body.apimlIP; // Change/add usePrometheus key to Zconfig file, with the value specified by user for usePrometheus
        break;
      case "grafanaurl": //if user specify a value for grafanaurl parameter in the URL
      Zconfig['grafanaurl'] = req.body.grafanaurl; // Change/add grafanaurl key to Zconfig file, with the value specified by user for grafanaurl
        break;
      case "grafanaport": //if user specify a value for grafanaport parameter in the URL
      Zconfig['grafanaport'] = req.body.grafanaport; // Change/add grafanaport key to Zconfig file, with the value specified by user for grafanaport
        break;
      case "apimlport": //if user specify a value for grafanaurl parameter in the URL
        Zconfig['apiml_port'] = req.body.apimlport; // Change/add grafanaurl key to Zconfig file, with the value specified by user for grafanaurl
          break;
      case "apimlauth": //if user specify a value for grafanaport parameter in the URL
        Zconfig['apiml_auth_type'] = req.body.apimlauth; // Change/add grafanaport key to Zconfig file, with the value specified by user for grafanaport
          break;
        }
      }
    }
    
    fs.writeFile("./config/Zconfig.json", JSON.stringify(Zconfig, null, '\t'), 'utf-8', function(err, data) {
      if (err) {
        console.error("Error writing to Zconfig.json:", err);
        res.status(500).send("Error updating Zconfig");
      } else {
        global.Zconfig = global.reloadZconfig(); 
        res.send("Zconfig Updated!");
      }
    });
  } catch (error) {
    console.error("Error in updateconfig:", error);
    res.status(500).send("Error updating configuration");
  }
};