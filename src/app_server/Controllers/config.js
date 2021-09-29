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

    try{
        fs.writeFile("./config/Zconfig.json", JSON.stringify(conf, null, '\t'), 'utf-8', function(err, data) {}); // Save all new/modified settings to Zconfig file
        res.send(`Zconfig file Created Successfully`); // Express returns JSON of the App settings from Zconfig.json file
    }catch(e){
        res.send(`Zconfig file Creation Failed`);
    }
}

module.exports.updatedds = async function(req, res){ 
    try{
        Zconfig.dds[`${req.body.sysid}`] = req.body.update;
        fs.writeFile("./config/Zconfig.json", JSON.stringify(Zconfig, null, '\t'), 'utf-8', function(err, data) {}); // Save all new/modified settings to Zconfig file
        res.send(`${req.body.sysid} Details Updated Successfully`); // Express returns JSON of the App settings from Zconfig.json file
    }catch(e){
        res.send(`${req.body.sysid} Details Update Failed`);
    }
    
};

module.exports.savedds = async function(req, res){ 
    try{
        Zconfig.dds[`${req.body.sysid}`] = req.body.update;
        fs.writeFile("./config/Zconfig.json", JSON.stringify(Zconfig, null, '\t'), 'utf-8', function(err, data) {}); // Save all new/modified settings to Zconfig file
        res.send(`${req.body.sysid} Details Saved Successfully`); // Express returns JSON of the App settings from Zconfig.json file
    }catch(e){
        res.send(`Saving ${req.body.sysid} Details Failed`);
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
module.exports.updateconfig = function(req,res){ //Controller function for adding/editing App settings
  var queryPrameterKeys = Object.keys(req.body); //make a array of the objects in request body
  for (i in queryPrameterKeys){ //loop through the array above
    var parameterKey = queryPrameterKeys[i]; // select the parameter from the array at index i
    switch(parameterKey){
      case "apimlpwd": //if user specify a value for ddsport parameter in the URL
        Zconfig['apiml_password'] = req.body.apimlpwd; // Change/add ddsbaseport key to Zconfig file, with the value specified by user for ddsport 
        break;
      case "mongourl": //if user specify a value for mongourl parameter in the URL
        Zconfig['mongourl'] = req.body.mongourl; // Change/add mongourl key to Zconfig file, with the value specified by user for mongourl
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
  fs.writeFile("./config/Zconfig.json", JSON.stringify(Zconfig, null, '\t'), 'utf-8', function(err, data) {}); // Save all new/modified settings to Zconfig file
  res.send("Zconfig Updated!"); // Express returns JSON of the App settings from Zconfig.json file
}


