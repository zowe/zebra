/* GET Homepage*/
var fs = require('fs'); //importing the fs module
var Zconfig = require("../../config/Zconfig");
var path = require("path");
var  Auth = require('../../Auth');
var ddsconfig = require("../../config/Zconfig.json");
const REPORTS = require("../../constants").REPORTS;

/**
 * parameters function reads the parameters in the Zconfig file
 * @param {Object} fn - returns the parameters from Zconfig file and their value
 */
/*function parameters(fn){
  parms = {
    ddsbaseurl: Zconfig.ddsbaseurl, 
    ddsbaseport: Zconfig.ddsbaseport,
    rmf3filename: Zconfig.rmf3filename,
    rmfppfilename: Zconfig.rmfppfilename,
    mvsResource: Zconfig.mvsResource,
    mongourl: Zconfig.mongourl,
    dbinterval: Zconfig.dbinterval,
    dbname: Zconfig.dbname,
    appurl: Zconfig.appurl,
    appport: Zconfig.appport,
    mongoport: Zconfig.mongoport,
    ppminutesInterval: Zconfig.ppminutesInterval,
    rmf3interval: Zconfig.rmf3interval,
    httptype: Zconfig.zebra_httptype,
    useDbAuth: Zconfig.useDbAuth,
    dbUser: Zconfig.dbUser,
    dbPassword: Zconfig.dbPassword,
    authSource: Zconfig.authSource,
    useMongo: Zconfig.useMongo,
    usePrometheus: Zconfig.usePrometheus,
    use_cert: Zconfig.use_cert,
    grafanaurl: Zconfig.grafanaurl,
    grafanaport: Zconfig.grafanaport
  }
  fn(parms); //return the parameters
}*/
/**  
 * home Function displays a welcome message                                                    
 * Endpoint: /                                                                                
 * Endpoint does not take any parameter                                                        
 */
module.exports.home = async function(req, res){ //Controller function for Index page/Home page
  var lpar_details = ddsconfig["dds"];
  var lpars = Object.keys(lpar_details);
  if(req.session.name){ //Check if User login session is available
    res.render("index",{msg:"Admin", lpar:lpars, reports:REPORTS}); // render the homepage wih Admin previledge
  }else{ // if login session not available
    res.render("index", {lpar:lpars, reports:REPORTS}); //render the homepage with user previledge
  }
};

/**  
 * settings Function displays App settings from Zconfig.json file                              
 * Endpoint: /settings                                                                         
 * Endpoint does not take any parameter                                                        
 */
/*module.exports.settings = function(req,res){ //Controller Function for displaying App settings
  res.json(Zconfig); // Express returns JSON of the App settings from Zconfig.json file 
}*/

/**  
 * addSetting Function controls adding/modifying settings used by the app in Zconfig.json file 
 * Endpoint: /addSettings                                                                      
 * Example: /addSettings?appurl=salisuali.com&appport=3009                                     
 * Endpoint can take multiple parameters recognised by the addSettings Function                
 */
/*module.exports.addSettings = function(req,res){ //Controller function for adding/editing App settings
  var queryPrameterKeys = Object.keys(req.body); //make a array of the objects in request body
  for (i in queryPrameterKeys){ //loop through the array above
    var parameterKey = queryPrameterKeys[i]; // select the parameter from the array at index i
    switch(parameterKey){
      case "ddsurl": //if user specify a value for ddsurl parameter in the URL
        Zconfig['ddsbaseurl'] = req.body.ddsurl; // Change/add ddsbaseurl key to Zconfig file, with the value specified by user for ddsurl
        break;
      case "ddsport": //if user specify a value for ddsport parameter in the URL
        Zconfig['ddsbaseport'] = req.body.ddsport; // Change/add ddsbaseport key to Zconfig file, with the value specified by user for ddsport 
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
      case "rmf3filename": //if user specify a value for rmf3filename parameter in the URL
        Zconfig['rmf3filename'] = req.body.rmf3filename; // Change/add rmf3filename key to Zconfig file, with the value specified by user for dbinterval 
        break;
      case "rmfppfilename": //if user specify a value for rmfppfilename parameter in the URL
        Zconfig['rmfppfilename'] = req.body.rmfppfilename; // Change/add rmfppfilename key to Zconfig file, with the value specified by user for rmfppfilename 
        break;
      case "mvsResource": //if user specify a value for mvsResource parameter in the URL
        Zconfig['mvsResource'] = req.body.mvsResource; // Change/add mvsResource key to Zconfig file, with the value specified by user for mvsResource
        break;
      case "rmf3interval": //if user specify a value for rmf3interval parameter in the URL
        Zconfig['rmf3interval'] = req.body.rmf3interval; // Change/add rmf3interval key to Zconfig file, with the value specified by user for rmf3interval 
        break;
      case "ppminutesInterval": //if user specify a value for ppminutesInterval parameter in the URL
      Zconfig['ppminutesInterval'] = req.body.ppminutesInterval; // Change/add ppminutesInterval key to Zconfig file, with the value specified by user for ppminutesInterval 
        break;
      case "httptype": //if user specify a value for httptype parameter in the URL
      Zconfig['httptype'] = req.body.httptype; // Change/add httptype key to Zconfig file, with the value specified by user for httptype 
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
      case "useMongo": //if user specify a value for useMongo parameter in the URL
        Zconfig['useMongo'] = req.body.useMongo; // Change/add useMongo key to Zconfig file, with the value specified by user for useMongo 
        break;
      case "usePrometheus": //if user specify a value for usePrometheus parameter in the URL
      Zconfig['usePrometheus'] = req.body.usePrometheus; // Change/add usePrometheus key to Zconfig file, with the value specified by user for usePrometheus
        break;
      case "grafanaurl": //if user specify a value for grafanaurl parameter in the URL
      Zconfig['grafanaurl'] = req.body.grafanaurl; // Change/add grafanaurl key to Zconfig file, with the value specified by user for grafanaurl
        break;
      case "grafanaport": //if user specify a value for grafanaport parameter in the URL
      Zconfig['grafanaport'] = req.body.grafanaport; // Change/add grafanaport key to Zconfig file, with the value specified by user for grafanaport
        break;
    }
   }
  fs.writeFile("Zconfig.json", JSON.stringify(Zconfig, null, '\t'), 'utf-8', function(err, data) {}); // Save all new/modified settings to Zconfig file
  res.json(Zconfig); // Express returns JSON of the App settings from Zconfig.json file
}*/

/**  
 * addFormSettings Function controls adding/modifying settings used by the app in Zconfig.json file from Zebra UI 
 * Endpoint: /addSetting                                                                                                         
 * Endpoint can take multiple parameters recognised by the addFormSettings Function                
 */
/*module.exports.addFormSettings = function(req,res){ //Controller function for adding/editing App settings
  var queryPrameterKeys = Object.keys(req.body); //make a array of the objects in request body
  for (i in queryPrameterKeys){ // loop through the array above
    var parameterKey = queryPrameterKeys[i]; // select the parameter from the array at index i
    switch(parameterKey){
      case "ddsurl": //if user specify a value for ddsurl parameter in the URL
        Zconfig['ddsbaseurl'] = req.body.ddsurl; // Change/add ddsbaseurl key to Zconfig file, with the value specified by user for ddsurl
        break;
      case "ddsport": //if user specify a value for ddsport parameter in the URL
        Zconfig['ddsbaseport'] = req.body.ddsport; // Change/add ddsbaseport key to Zconfig file, with the value specified by user for ddsport 
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
      case "rmf3filename": //if user specify a value for rmf3filename parameter in the URL
        Zconfig['rmf3filename'] = req.body.rmf3filename; // Change/add rmf3filename key to Zconfig file, with the value specified by user for dbinterval 
        break;
      case "rmfppfilename": //if user specify a value for rmfppfilename parameter in the URL
        Zconfig['rmfppfilename'] = req.body.rmfppfilename; // Change/add rmfppfilename key to Zconfig file, with the value specified by user for rmfppfilename 
        break;
      case "mvsResource": //if user specify a value for mvsResource parameter in the URL
        Zconfig['mvsResource'] = req.body.mvsResource; // Change/add mvsResource key to Zconfig file, with the value specified by user for mvsResource
        break;
      case "rmf3interval": //if user specify a value for rmf3interval parameter in the URL
        Zconfig['rmf3interval'] = req.body.rmf3interval; // Change/add rmf3interval key to Zconfig file, with the value specified by user for rmf3interval 
        break;
      case "ppminutesInterval": //if user specify a value for ppminutesInterval parameter in the URL
      Zconfig['ppminutesInterval'] = req.body.ppminutesInterval; // Change/add ppminutesInterval key to Zconfig file, with the value specified by user for ppminutesInterval 
        break;
      case "httptype": //if user specify a value for httptype parameter in the URL
      Zconfig['httptype'] = req.body.httptype; // Change/add httptype key to Zconfig file, with the value specified by user for httptype 
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
      case "useMongo": //if user specify a value for useMongo parameter in the URL
        Zconfig['useMongo'] = req.body.useMongo; // Change/add useMongo key to Zconfig file, with the value specified by user for useMongo 
        break;
      case "usePrometheus": //if user specify a value for usePrometheus parameter in the URL
      Zconfig['usePrometheus'] = req.body.usePrometheus; // Change/add usePrometheus key to Zconfig file, with the value specified by user for usePrometheus
        break;
      case "grafanaurl": //if user specify a value for grafanaurl parameter in the URL
      Zconfig['grafanaurl'] = req.body.grafanaurl; // Change/add grafanaurl key to Zconfig file, with the value specified by user for grafanaurl
        break;
      case "grafanaport": //if user specify a value for grafanaport parameter in the URL
      Zconfig['grafanaport'] = req.body.grafanaport; // Change/add grafanaport key to Zconfig file, with the value specified by user for grafanaport
        break;
    }
   }
  fs.writeFile("./config/Zconfig.json", JSON.stringify(Zconfig, null, '\t'), 'utf-8', function(err, data) {}); // Save all new/modified settings to Zconfig file
  Auth.formToken(req.session.name, function(data){ //Authenticate the Access Token from the UI
    if (data.Access){ //if token is valid, check data returned by the authentication function
      parameters(function(parms){ // read the parameters and their values from Zconfig file
       res.render("settings", {fdata: data, fparms:parms, scmsg:"success"}); // render the settings page with the updated parameters and a success message
      })
    }else{ // if token is not valid
      res.send(data) // send the data returned by the authentication function
    }
  })
}*/


