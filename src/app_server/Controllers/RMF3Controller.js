const axios = require('axios');
var RMFMonitor3parser = require('../parser/RMFMonitor3parser') //importing the RMFMonitor3parser file
//var RMFPPparser = require('../parser/RMFPPparser') //importing the RMFPPparser file
try{
  var Zconfig = require("../../config/Zconfig.json");
}catch(e){
  var Zconfig = {};
}
let baseurl = Zconfig.ddsbaseurl;
let baseport = Zconfig.ddsbaseport;
let rmf3filename = Zconfig.rmf3filename;
let mvsResource = Zconfig.mvsResource;
let ddshttp = Zconfig.ddshhttptype;
let lspr = Zconfig.PCI
let ddsauth = Zconfig.ddsauth;
let ddsid = Zconfig.ddsuser;
let ddspass = Zconfig.ddspwd;
const url = require('url');

/**
 * RMFMonitor3getRequest is the GET function for retrieving data from RMF monitor III.
 * @param {string} baseurl - The the IP address or the symbolic name of the DDS server, obtained from Zconfig file. 
 * @param {string} baseport - The port of the DDS server, obtained from Zconfig file.
 * @param {string} rmf3filename - The filename of the XML document you want to retrieve, followed by the extension .xml (rmfm3.xml), obtained from Zconfig file.
 * @param {string} params - Can contain Monitor III report name, Monitor III resource identifier, Monitor III field id. Format: { report, resource, id }.
 * @param {XML} fn - Callback function which returns an XML containing data from Monitor III.
 */
function RMFMonitor3getRequest(baseurl, baseport, rmf3filename, params, fn) { //fn is to return value from callback
  //Use backtick for URL string formatting
  var urlParams = "?";
  for (const param in params) {
    if (!params[param]) {
      continue;
    }
    urlParams = urlParams.concat(`${param}=${params[param]}&`);
  }
  urlParams = urlParams.slice(0, urlParams.length - 1);
  var RMF3URL = `${ddshttp}://${baseurl}:${baseport}/gpm/${rmf3filename}${urlParams}`; //Dynamically create URL
  if(ddsauth === 'true'){
    axios.get(RMF3URL, {
      auth: {
        username: ddsid,
        password: ddspass
      }
    })
    .then(function (response) {
      // handle success
      fn(response.data);
      //console.log(response.data);
    })
    .catch(function (error) {
      // handle error
      try{
        if(parseInt(error.response.status) === 401){
          fn("UA");
        }else{
          fn(error["errno"]);
        }
      }catch(e){
        fn(error["errno"]);
      }
      
      //console.log(error.response.status);
      //console.log(error);
    })
    .then(function () {
      // always executed
    });
  }else{
    axios.get(RMF3URL)
    .then(function (response) {
      // handle success
      fn(response.data);
    })
    .catch(function (error) {
      // handle error
      //console.log(error)
      try{
        if(parseInt(error.response.status) === 401){
          fn("UA");
        }else{
          fn(error["errno"]);
        }
      }catch(e){
        fn(error["errno"]);
      }
    })
    .then(function () {
      // always executed
    });

  }
  
}

//***** */
function RMFMonitor3getInfo(baseurl, baseport, rmf3filenames, urlResource, fn) { //fn is to return value from callback
  //Use backtick for URL string formatting
  var RMF3URL = `${ddshttp}://${baseurl}:${baseport}/gpm/reports/${rmf3filenames}?resource=${urlResource}`; //Dynamically create URL

  if(ddsauth === 'true'){
    axios.get(RMF3URL, {
      auth: {
        username: ddsid,
        password: ddspass
      }
    })
    .then(function (response) {
      // handle success
      fn(response.data);
    })
    .catch(function (error) {
      // handle error
      try{
        if(parseInt(error.response.status) === 401){
          fn("UA");
        }else{
          fn(error["errno"]);
        }
      }catch(e){
        fn(error["errno"]);
      }
    })
    .then(function () {
      // always executed
    });
  }else{
    axios.get(RMF3URL)
    .then(function (response) {
      // handle success
      fn(response.data);
    })
    .catch(function (error) {
      // handle error
      //console.log(error)
      try{
        if(parseInt(error.response.status) === 401){
          fn("UA");
        }else{
          fn(error["errno"]);
        }
      }catch(e){
        fn(error["errno"]);
      }
    })
    .then(function () {
      // always executed
    });

  }
}

/**
 * RmfIII Function for Realtime Report Processing
 * @param {string} req - User Request
 * @param {JSON} res - Express Response
 * Endpoint: <app IP>:<app port>/rmfm3?report=<name>
 * Example: localhost:3090/rmfm3?report=CPC - This returns Monitor III CPC report.
 */
module.exports.rmfIII = async function (req, res) { //Controller Function for Realtime Report Processing
  var ulrParm; //variable for parm parameter in the User Specified URL
  var ulrFilename;
  var urlReport;
  var urlLpar_parms; //variable for lpar_parms parameter in the User Specified URL
  var urlJobParm; //variable for job parameter in the User Specified URL
  var urlResource = mvsResource; // default resource
  var urlRange;
  if(req.query.report){
    urlReport = (req.query.report).toUpperCase(); //variable for report parameter in the User Specified URL
  }
  if (req.query.parm) { // checks if user has specify a value for parm parameter in the URL
    ulrParm = (req.query.parm).toUpperCase(); //Sets urlParm to values specified by the user in the URL
  }
  if (req.query.lpar_parms) { // checks if user has specify a value for lpar_parms parameter in the URL
    urlLpar_parms = (req.query.lpar_parms).toUpperCase(); //Sets urlLpar_parms to value specified by the user in the URL
  }
  if (req.query.job) {// checks if user has specify a value for job parameter in the URL
    urlJobParm = (req.query.job).toUpperCase(); //Sets urlJobParm to value specified by the user in the URL
  }
  if (req.query.resource) { // checks if user has specify a value for resource parameter
    urlResource = req.query.resource;
  }
  if (req.query.range) {
    urlRange = req.query.range;
  }
  // querying specific field
  if (req.query.id && req.query.id.toUpperCase() !== "LIST") {
    RMFMonitor3getRequest(baseurl, baseport, "perform.xml", { resource: urlResource, id: req.query.id }, function (data) {
      //res.json(data);
      if(data === "DE" || data === "NE" || data === "UA" || data === "EOUT"){ 
        var string = encodeURIComponent(`${data}`);
        res.redirect('/rmfm3/error?emsg=' + string);
      }else{
        RMFMonitor3parser.RMF3fieldParser(data, function (result){
          if(result["msg"]){ //Data Error from parser, when parser cannor parse the XML file it receives 
            var data = result["data"];
            res.redirect(`/rmfm3/error?emsg=${data}`);
          }else{
            res.json(result);
          }
        });
      }
    });
  } else if (req.query.id && req.query.id.toUpperCase() === "LIST") {
    RMFMonitor3getRequest(baseurl, baseport, "listmetrics.xml", { resource: urlResource }, function (data) {
      //res.json(data);
      if(data === "DE" || data === "NE" || data === "UA" || data === "EOUT"){ 
        var string = encodeURIComponent(`${data}`);
        res.redirect('/rmfm3/error?emsg=' + string);
      }else{
        RMFMonitor3parser.RMF3idListParser(data, function (result){
          if(result["msg"]){ //Data Error from parser, when parser cannor parse the XML file it receives 
            var data = result["data"];
            res.redirect(`/rmfm3/error?emsg=${data}`);
          }else{
            res.json(result);
          }
        });
      }
    });
  } else if(req.query.reports){
    ulrFilename = (req.query.reports).toUpperCase() + ".xml";
    RMFMonitor3getInfo(baseurl, baseport, ulrFilename, urlResource, function (data){
      //res.json(data);
      if(data === "DE" || data === "NE" || data === "UA" || data === "EOUT"){ 
        var string = encodeURIComponent(`${data}`);
        res.redirect('/rmfm3/error?emsg=' + string);
      }else{
        RMFMonitor3parser.RMF3bodyParser(data, function (result){
          if(result["msg"]){ //Data Error from parser, when parser cannor parse the XML file it receives 
            var data = result["data"];
            res.redirect(`/rmfm3/error?emsg=${data}`);
          }else{
            res.json(result);
          }
        });
      }
    });
  }else{
    if (urlReport === "CPC") { // checks if user has specify the value "CPC" for report parameter in the URL
    displayCPC(urlReport, ulrParm, urlLpar_parms, function (result) { //A call to displayCPC function is made with a callback function as parameter
      //Check for DE= Data Error from DDS, NE= Node Version Error, UA = User Authentication Error, EOUT= Request Time out error
      if(result === "DE" || result === "NE" || result === "UA" || result === "EOUT"){ 
        var string = encodeURIComponent(`${result}`);
        res.redirect('/rmfm3/error?emsg=' + string);
      }else if(result["msg"]){ //Data Error from parser, when parser cannor parse the XML file it receives
        var data = result["data"];
        res.redirect(`/rmfm3/error?emsg=${data}`);
      }else{
        res.json(result); //Express respond with the result returned from displayCPC function
      }
    });
    } else if (urlReport === "PROC") { // checks if user has specify the value "PROC" for report parameter in the URL
      displayPROC(urlReport, ulrParm, urlJobParm, function (result) { //A call to displayPROC function is made with a callback function as parameter
        if(result === "DE" || result === "NE" || result === "UA" || result === "EOUT"){ 
          var string = encodeURIComponent(`${result}`);
          res.redirect('/rmfm3/error?emsg=' + string);
        }else if(result["msg"]){ //Data Error from parser, when parser cannor parse the XML file it receives
          var data = result["data"];
          res.redirect(`/rmfm3/error?emsg=${data}`);
        }else{
          res.json(result); //Express respond with the result returned from displayPROC function
        }
        //res.json(result); //Express respond with the result returned from displayPROC function
      });
    } else if (urlReport === "USAGE") { // checks if user has specify the value "USAGE" for report parameter in the URL
      displayUSAGE(urlReport, ulrParm, urlJobParm, function (result) { //A call to displayUSAGE function is made with a callback function as parameter
        if(result === "DE" || result === "NE" || result === "UA" || result === "EOUT"){ 
          var string = encodeURIComponent(`${result}`);
          res.redirect('/rmfm3/error?emsg=' + string);
        }else if(result["msg"]){ //Data Error from parser, when parser cannor parse the XML file it receives
          var data = result["data"];
          res.redirect(`/rmfm3/error?emsg=${data}`);
        }else{
          res.json(result); //Express respond with the result returned from displayUSAGE function
        }
        //res.json(result); //Express respond with the result returned from displayUSAGE function
      });
    } else if (urlReport === "MIPS") { // checks if user has specify the value "USAGE" for report parameter in the URL
      displayCPC("CPC", ulrParm, urlJobParm, function (result) { //A call to displayCPC function is mgoing to return a json formatted RMFIII CPC Report
        for(i in result["table"]){
          if (result["table"][i]["CPCPPNAM"] === "VIRPT"){
            var virpt_tou = result["table"][i]['CPCPLTOU'];
            var virpt_normalise = parseFloat(virpt_tou)  / 100
            var virpt_mips = virpt_normalise * lspr
            
            var response = {};
            response['lpar_name'] = result["table"][i]['CPCPPNAM'];
            response['lpar_tou'] = result["table"][i]['CPCPLTOU'];
            response['lpar_tou_normalized'] = virpt_normalise;
            response['lpar_mips'] = virpt_mips;

            //console.log(response);
            res.json(response);
          }
        }
        //console.log(result["table"]["CPCPPNAM"] === "VIRPT");
        // //Express respond with the result returned from displayUSAGE function
      });
    } else{ //Any other report
      RMFMonitor3getRequest(baseurl, baseport, rmf3filename, { report: urlReport, resource: urlResource, range: urlRange }, function (data) {
        //res.json(data);
        if(data === "DE" || data === "NE" || data === "UA" || data === "EOUT"){ 
          var string = encodeURIComponent(`${data}`);
          res.redirect('/rmfm3/error?emsg=' + string);
        }else{
          RMFMonitor3parser.RMF3bodyParser(data, function (result){
            if(result["msg"]){ //Data Error from parser, when parser cannor parse the XML file it receives 
              var data = result["data"];
              res.redirect(`/rmfm3/error?emsg=${data}`);
            }else{
              res.json(result);
            }
          });
        }
      });
    }
  }
};

/**
 * DisplayCPC function handles the processing of Monitor III CPC report based on parameters specicied by User in the URL(e.g /rmfm3?report=CPC).
 * @param {string} urlReport - The report name specified by User in the URL(e.g /rmfm3?report=CPC).
 * @param {string} urlParm - The value of "parm" parameter Specified by User in the URL(e.g /rmfm3?report=CPC&parm=CPCHMSU).
 * @param {string} urlLpar_parms - The value of "lpar" parameter Specified by User in the URL(e.g /rmfm3?report=CPC&lpar=VIRPT).
 * @param {JSON} fn - Callback Function that returns JSON response based on parameters specicied by User in the URL(e.g /rmfm3?report=CPC).
 * "report" parameter is mandatory, "parm" and "lpar" parameters are optional in the URL (e.g /rmfm3?report=CPC&parm=CPCHLMSU&lpar=VIRPT).
 * User can specify 0, 1 or All optional parameters. 
 */
function displayCPC(urlReport, urlParm, urlLpar_parms, fn) {
  RMFMonitor3getRequest(baseurl, baseport, rmf3filename, { report: urlReport, resource: mvsResource }, function (data) {
    if(data === 'EPROTO'){
      fn("NE")
    }else if(data === 'ENOTFOUND'){
      fn("DE")
    }else if(data === 'UA'){
      fn("UA")
    }else if(data === 'ETIMEDOUT'){
      fn("EOUT")
    }else{
      try {
        RMFMonitor3parser.RMF3bodyParser(data, function (result) {
          if(result["msg"]){
            fn({msg: "Err", error: result["error"], data: result["data"]});
          }else{
            var RMF3bodyParserResult = result; // Parse JSON Response returned by RMF3bodyParser through call back function result argument.
            var col = []; // a collection variable  
            var jsonResponse = {}; // an object for JsonResponse. to be displayed in browser using Express.
            var caption = RMF3bodyParserResult["caption"]; // caption variable for RMF3bodyParserResult caption key
            var table = RMF3bodyParserResult["table"]; // table variable for RMF3bodyParserResult table key
            if (urlParm === undefined && urlLpar_parms === undefined) { //checks if ulrParm and urlLpar_parms parameters are not specified
              fn(RMF3bodyParserResult); //Function returns RMF3bodyParserResult
            } else if (urlLpar_parms === undefined) { // checks if only lpar is not specified
              if (urlParm === "ALL") { // check if urlParm value is equal to "ALL"
                jsonResponse = {}; // Prepares the necesary jsonResponse and its key/value content
                jsonResponse.timestart = RMF3bodyParserResult.timestart;
                jsonResponse.timeend = RMF3bodyParserResult.timeend;
                jsonResponse.caption = RMF3bodyParserResult.caption;
              } else { // else if urlLpar_parms is not equal to "ALL"
                var de = RMF3bodyParserResult['caption'][urlParm]; //a temporary value to check if RMF3bodyParserResult caption contains the value of urlParm specified by user in the URL 
                if (de === undefined) { // de is equal to undefined if RMF3bodyParserResult caption does not contain the urlParm value
                  table.forEach((i) => { //Loop through RMF3bodyParserResult table to check for urlParm
                    var d = { "CPCPPNAM": i["CPCPPNAM"], [urlParm]: i[urlParm] } //a temporary dictionary of argument and its value
                    col.push(d); //push the dictionary to col 
                  });
                  jsonResponse = {};// Prepares the necesary jsonResponse and its key/value content
                  jsonResponse.timestart = RMF3bodyParserResult.timestart;
                  jsonResponse.timeend = RMF3bodyParserResult.timeend;
                  jsonResponse.lpar = col;
                } else { //else if de is not equal to undefined
                  jsonResponse = {}; // Prepares the necesary jsonResponse and its key/value content
                  jsonResponse.timestart = RMF3bodyParserResult.timestart;
                  jsonResponse.timeend = RMF3bodyParserResult.timeend;
                  jsonResponse[urlParm] = de;
                }
              }
              fn(jsonResponse); //Express displays jsonResponse
            } else { //if urlLpar_parms and urlparm are specified
              if (caption === undefined) { //if caption is not available
                table.forEach((i) => { //Loop through RMF3bodyParserResult table to check for urlParm
                  var d = { "CPCPPNAM": i["CPCPPNAM"], [urlParm]: i[urlParm] } //a temporary dictionary of argument and its value
                  col.push(d); //push the dictionary to col
                });
                jsonResponse = {}; // Prepares the necesary jsonResponse and its key/value content
                jsonResponse.timestart = RMF3bodyParserResult.timestart;
                jsonResponse.timeend = RMF3bodyParserResult.timeend;
                jsonResponse.lpar = col;
                if (urlLpar_parms === "ALL_CP") { //checks if urlLpar_parms is equal to "ALL_CP"
                  jsonResponse.lpar = RMF3bodyParserResult.table; //add this line to jsonResponse
                } else { //else if urlLpar_parm is not equal to "ALL_CP"
                  var table = RMF3bodyParserResult['table']; // RMF3bodyParserResult table
                  table.forEach((i) => { //Loop through RMF3bodyParserResult table to check for urlLpar_parms
                    if (i["CPCPPNAM"] === urlLpar_parms) {
                      jsonResponse.lpar = i;  //add this line to jsonResponse
                    }
                  });
                };
              } else { // else if caption is RMF3bodyParserResult defined
                var de = RMF3bodyParserResult['caption'][urlParm]; //a temporary value to check if RMF3bodyParserResult caption contains the value of urlParm specified by user in the URL 
                if (urlParm === "ALL") { // check if urlParm value is equal to "ALL"
                  jsonResponse = {}; // Prepares the necesary jsonResponse and its key/value content
                  jsonResponse.timestart = RMF3bodyParserResult.timestart;
                  jsonResponse.timeend = RMF3bodyParserResult.timeend;
                  jsonResponse.caption = RMF3bodyParserResult.caption;
                  if (urlLpar_parms === "ALL_CP") { //checks if urlLpar_parms is equal to "ALL_CP"
                    jsonResponse.lpar = RMF3bodyParserResult.table; //add this line to jsonResponse
                  } else { //else if urlLpar_parm is not equal to "ALL_CP"
                    var table = RMF3bodyParserResult['table'];
                    table.forEach((i) => { //Loop through RMF3bodyParserResult table to check for urlLpar_parms
                      if (i["CPCPPNAM"] === urlLpar_parms) {
                        jsonResponse.lpar = i; //add this line to jsonResponse
                      }
                    });
                  };
                } else if (de === undefined && urlParm === undefined) { // de is equal to undefined if RMF3bodyParserResult caption does not contain the urlParm value
                  jsonResponse = {}; // Prepares the necesary jsonResponse and its key/value content
                  jsonResponse.timestart = RMF3bodyParserResult.timestart;
                  jsonResponse.timeend = RMF3bodyParserResult.timeend;
                  if (urlLpar_parms === "ALL_CP") {//checks if urlLpar_parms is equal to "ALL_CP"
                    jsonResponse.lpar = RMF3bodyParserResult.table; //add this line to jsonResponse
                  } else { //else if urlLpar_parm is not equal to "ALL_CP"
                    var table = RMF3bodyParserResult['table'];
                    table.forEach((i) => { //Loop through RMF3bodyParserResult table to check for urlLpar_parms
                      if (i["CPCPPNAM"] === urlLpar_parms) {
                        jsonResponse.lpar = i; //add this line to jsonResponse
                      }
                    });
                  };
                } else if (de === undefined) { // de is equal to undefined if RMF3bodyParserResult caption does not contain the urlParm value
                  table.forEach((i) => { //Loop through RMF3bodyParserResult table to check for urlLpar_parms
                    var d = { "CPCPPNAM": i["CPCPPNAM"], [urlParm]: i[urlParm] } //a temporary dictionary of argument and its value
                    col.push(d);
                  });
                  jsonResponse = {}; // Prepares the necesary jsonResponse and its key/value content
                  jsonResponse.timestart = RMF3bodyParserResult.timestart;
                  jsonResponse.timeend = RMF3bodyParserResult.timeend;
                  jsonResponse.lpar_parm = col;
                  if (urlLpar_parms === "ALL_CP") { //checks if urlLpar_parms is equal to "ALL_CP"
                    jsonResponse.lpar = RMF3bodyParserResult.table;
                  } else {
                    var table = RMF3bodyParserResult['table'];
                    table.forEach((i) => {  //Loop through RMF3bodyParserResult table to check for urlLpar_parms
                      if (i["CPCPPNAM"] === urlLpar_parms) {
                        jsonResponse.lpar = i;
                      }
                    });
                  };
                } else {
                  jsonResponse = {}; // Prepares the necesary jsonResponse and its key/value content
                  jsonResponse.timestart = RMF3bodyParserResult.timestart;
                  jsonResponse.timeend = RMF3bodyParserResult.timeend;
                  jsonResponse[urlParm] = de;
                  if (urlLpar_parms === "ALL_CP") {
                    jsonResponse.lpar = RMF3bodyParserResult.table;
                  } else {
                    var table = RMF3bodyParserResult['table'];
                    table.forEach((i) => {  //Loop through RMF3bodyParserResult table to check for urlLpar_parms
                      if (i["CPCPPNAM"] === urlLpar_parms) {
                        jsonResponse.lpar = i;
                      }
                    });
                  };
                }
                fn(jsonResponse); //function returns jsonResponse
              }
            }
            
          }
          
        });
      } catch (err) {
        fn(data)
      }
    }
    
  });
};

/**
 * DisplayPROC Function controls monitor III PROC Report Processing.
 * @param {string} urlReport - The report name specified by User in the URL(e.g /rmfm3?report=PROC).
 * @param {string} arg - The value of "parm" parameter Specified by User in the URL(e.g /rmfm3?report=PROC&parm=PRCPSVCL).
 * @param {string} job - The value of "job" parameter Specified by User in the URL(e.g /rmfm3?report=PROC&job=ZOWESVR3).
 * @param {string} fn - Callback Function that returns JSON response based on parameters specicied by User in the URL(e.g /rmfm3?report=PROC).
 * "report" parameter is mandatory, "parm" and "job" parameters are optional in the URL (e.g /rmfm3?report=PROC&parm=PRCPSVCL&job=ZOWESVR3).
 * User can specify 0, 1 or All optional parameters.
 */
function displayPROC(urlReport, arg, job, fn) {
  RMFMonitor3getRequest(baseurl, baseport, rmf3filename, { report: urlReport, resource: mvsResource }, function (data) { //Send GET request for PROC data to Monitor III.
    if(data === 'EPROTO'){
      fn("NE")
    }else if(data === 'ENOTFOUND'){
      fn("DE")
    }else if(data === 'UA'){
      fn("UA")
    }else if(data === 'ETIMEDOUT'){
      fn("EOUT")
    }else{
      try { //try
        RMFMonitor3parser.RMF3bodyParser(data, function (result) { //send returned XML to Monitor III parser.
          if(result["msg"]){
            fn({msg: "Err", error: result["error"], data: result["data"]});
          }else{
            var RMF3bodyParserResult = result; //save returned JSON from the parser to RMF3bodyParserResult variable.
            var col = []; //an Empty Collection.
            var jsonResponse = {}; //jsonResponse collection.
            var table = RMF3bodyParserResult["table"]; //save the table section of PROC report into "table" variable.
            if (arg === undefined && job === undefined) { //checks if parm and lpar parameters are not specified.
              fn(result); //return JSON from the parser.
            } else if (job === undefined) { //checks if only lpar is not specified.
              table.forEach((i) => { //Loop through table.
                var d = { "PRCPJOB": i["PRCPJOB"], [arg]: i[arg] } //a temporary dictionary of argument and its value.
                col.push(d); // push temporary dictionary to col array.
              });
              jsonResponse = {}; //Prepare JSON Response.
              jsonResponse.timestart = RMF3bodyParserResult.timestart; //timestart key and value.
              jsonResponse.timeend = RMF3bodyParserResult.timeend; //timeend key and value.
              jsonResponse.job = col; //job key and value.
              fn(jsonResponse); //return jsonResponse.
            } else { //JOB is specified
              if (arg === undefined) { //if "parm" parameter is not specified in the URL(e.g /rmfm3?report=PROC&job=ZOWESVR3).
                jsonResponse = {}; //Prepare JSON Response
                jsonResponse.timestart = RMF3bodyParserResult.timestart; // timestart key and value
                jsonResponse.timeend = RMF3bodyParserResult.timeend; // timeend key and value
                if (job === "ALL_JOBS") { // if user specified "ALL_JOBS" as the value of job parameter.
                  jsonResponse.job = RMF3bodyParserResult.table; //Add the entire table section of JSON returned by parser to jsonResponse. 
                } else { // if user specified a value for job parameter.
                  var table = RMF3bodyParserResult['table']; //save the table section of PROC report into "table" variable.
                  table.forEach((i) => { //Loop through table
                    if (i["PRCPJOB"] === job) { //if the value of PRCPJOB matches the value of job in the URL(e.g /rmfm3?report=PROC&job=ZOWESVR3).
                      jsonResponse.job = i; //add job key value pair to jsonResponse
                    }
                  });
                };
              } else {// if user specified all parameters in the URL(e.g /rmfm3?report=PROC&parm=PRCPSVCL&job=ZOWESVR3).
                table.forEach((i) => { //Loop through table
                  var d = { "PRCPJOB": i["PRCPJOB"], [arg]: i[arg] } //a temporary dictionary of argument and its value
                  col.push(d); //push temporary dictionary into col array
                });
                jsonResponse = {}; //Prepare JSON Response
                jsonResponse.timestart = RMF3bodyParserResult.timestart; //timestart key and value
                jsonResponse.timeend = RMF3bodyParserResult.timeend; //timeend key and value
                jsonResponse.job_parm = col; //job_parm for parm value specified by user in the URL(e.g /rmfm3?report=PROC&parm=PRCPSVCL&job=ZOWESVR3).
                if (job === "ALL_JOBS") { // if user specified "ALL_JOBS" as the value of job parameter.
                  jsonResponse.job = RMF3bodyParserResult.table; //Add the entire table section of JSON returned by parser to jsonResponse. 
                } else { // if user specified a value for job parameter.
                  var table = RMF3bodyParserResult['table']; //save the table section of PROC report into "table" variable.
                  table.forEach((i) => { //Loop through table
                    if (i["PRCPJOB"] === job) { //if the value of PRCPJOB matches the value of job in the URL(e.g /rmfm3?report=PROC&job=ZOWESVR3).
                      jsonResponse.job = i; //add job key value pair to jsonResponse
                    }
                  });
                };
              }
              fn(jsonResponse); //return jsonResponse
            }
          }
        });
      } catch (err) {
        fn(err) // return error
      }
    }
  });
};

/**
 * DisplayUsage Function controls the processing of Monitor III USAGE report
 * @param {string} urlReport - The report name specified by User in the URL(e.g /rmfm3?report=USAGE).
 * @param {string} arg - The value of "parm" parameter Specified by User in the URL(e.g /rmfm3?report=USAGE&parm=PRCPSVCL).
 * @param {string} job - The value of "job" parameter Specified by User in the URL(e.g /rmfm3?report=PROC&job=ZOWESVR3).
 * @param {string} fn - Callback Function that returns JSON response based on parameters specicied by User in the URL(e.g /rmfm3?report=PROC).
 * "report" parameter is mandatory, "parm" and "job" parameters are optional in the URL (e.g /rmfm3?report=USAGE&parm=PRCPSVCL&job=ZOWESVR3).
 * User can specify 0, 1 or All optional parameters.
 */
function displayUSAGE(urlReport, arg, job, fn) { //function for processing of Monitor III USAGE report
  RMFMonitor3getRequest(baseurl, baseport, rmf3filename, { report: urlReport, resource: mvsResource }, function (data) { //Send GET request for USAGE data to Monitor III.
    if(data === 'EPROTO'){
      fn("NE")
    }else if(data === 'ENOTFOUND'){
      fn("DE")
    }else if(data === 'UA'){
      fn("UA")
    }else if(data === 'ETIMEDOUT'){
      fn("EOUT")
    }else{
      try { //try
        RMFMonitor3parser.RMF3bodyParser(data, function (result) {  //send returned XML to Monitor III parser;
          if(result["msg"]){
            fn({msg: "Err", error: result["error"], data: result["data"]});
          }else{
            var RMF3bodyParserResult = result; //save returned JSON from the parser to RMF3bodyParserResult variable
            var col = []; //col array
            var jsonResponse = {}; //jsonResponse Collection
            var table = RMF3bodyParserResult["table"]; //save the table section of USAGE report into "table" variable.
            if (arg === undefined && job === undefined) { //checks if parm and lpar parameters are not specified
              fn(result); //
            } else if (job === undefined) { // checks if only JOB is not specified
              table.forEach((i) => { //Loop through table
                var d = { "JUSPJOB": i["JUSPJOB"], [arg]: i[arg] } //a temporary dictionary of argument and its value
                col.push(d); //push temporary dictionary to col array.
              });
              jsonResponse = {}; //Prepare JSON Response
              jsonResponse.timestart = RMF3bodyParserResult.timestart; //timestart key and value.
              jsonResponse.timeend = RMF3bodyParserResult.timeend; //timeend key and value.
              jsonResponse.job = col; //job key and value.
              fn(jsonResponse); //return jsonResponse.
            } else { //JOB is specified
              if (arg === undefined) { //if "parm" parameter is not specified in the URL(e.g /rmfm3?report=USAGE&job=ZOWESVR3).
                jsonResponse = {}; //Prepare JSON Response
                jsonResponse.timestart = RMF3bodyParserResult.timestart; //timestart key value pair
                jsonResponse.timeend = RMF3bodyParserResult.timeend; //timeend key value pair
                if (job === "ALL_JOBS") { //if user specified "ALL_JOBS" as the value of job parameter.
                  jsonResponse.job = RMF3bodyParserResult.table; //save the table section of USAGE report into "table" variable.
                } else { // if user specified a value for job parameter.
                  var table = RMF3bodyParserResult['table']; //save the table section of USAGE report into "table" variable.
                  table.forEach((i) => { //Loop through table
                    if (i["JUSPJOB"] === job) { //if the value of JUSPJOB matches the value of job in the URL(e.g /rmfm3?report=USAGE&job=ZOWESVR3).
                      jsonResponse.job = i; //add job key value pair to jsonResponse
                    }
                  });
                };
              } else { // if user specified all parameters in the URL(e.g /rmfm3?report=USAGE&parm=PRCPSVCL&job=ZOWESVR3).
                table.forEach((i) => { //Loop through table
                  var d = { "JUSPJOB": i["JUSPJOB"], [arg]: i[arg] } //a temporary dictionary of argument and its value
                  col.push(d);
                });
                jsonResponse = {}; //Prepare JSON Response
                jsonResponse.timestart = RMF3bodyParserResult.timestart; //timestart key value pair
                jsonResponse.timeend = RMF3bodyParserResult.timeend; //timeend key value pair
                jsonResponse.job_parm = col; //job_parm for parm value specified by user in the URL(e.g /rmfm3?report=PROC&parm=PRCPSVCL&job=ZOWESVR3).
                if (job === "ALL_JOBS") { //if user specified "ALL_JOBS" as the value of job parameter.
                  jsonResponse.job = RMF3bodyParserResult.table; //save the table section of USAGE report into "table" variable.
                } else { // if user specified a value for job parameter.
                  var table = RMF3bodyParserResult['table']; //save the table section of USAGE report into "table" variable.
                  table.forEach((i) => { //Loop through table
                    if (i["JUSPJOB"] === job) { //if the value of JUSPJOB matches the value of job in the URL(e.g /rmfm3?report=USAGE&job=ZOWESVR3).
                      jsonResponse.job = i; //add job key value pair to jsonResponse
                    }
                  });
                };
    
              }
              fn(jsonResponse); //return jsonResponse
            }
          }
          
        });
      } catch (err) {
        fn(result)
      }
    }
  });
};