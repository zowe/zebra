const axios = require('axios');
var RMFPPparser = require('../parser/RMFPPparser') //importing the RMFPPparser file
var Zconfig = require("../../config/Zconfig");
let baseurl = Zconfig.ddsbaseurl;
let baseport = Zconfig.ddsbaseport;
let rmfppfilename = Zconfig.rmfppfilename;
var minutesInterval = Zconfig.ppminutesInterval;
var ddshttp = Zconfig.ddshhttptype;
let ddsauth = Zconfig.ddsauth;
let ddsid = Zconfig.ddsuser;
let ddspass = Zconfig.ddspwd;

/**
 * RMFPPgetRequest is the Function for Sending GET Request to RMF Monitor I (Post-Processor Report).
 * @param {string} baseurl - The the IP address or the symbolic name of the DDS server, obtained from Zconfig file. 
 * @param {string} baseport - The port of the DDS server, obtained from Zconfig file.
 * @param {string} rmfppfilename - The filename of the XML document you want to retrieve, followed by the extension .xml (rmfm3.xml), obtained from Zconfig file. 
 * @param {string} urlReport - Monitor I report name, obtained from URL User Input.
 * @param {string} urlDate - Monitor I report start and end date(e.g 20200615,20200620), obtained from URL User Input.
 * @param {XML} fn - Callback function which returns an XML containing data from Monitor III.
 */
function RMFPPgetRequest(baseurl, baseport, rmfppfilename, urlReport, urlDate, fn) { //fn is to return value from callback
  //Use backtick for URL string formatting
  var RMFPPURL = `${ddshttp}://${baseurl}:${baseport}/gpm/${rmfppfilename}?reports=${urlReport}&date=${urlDate}`; //Dynamically create URL
  if(ddsauth === 'true'){
    axios.get(RMFPPURL, {
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
  }else{
    axios.get(RMFPPURL)
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
};

/**
 * Rmfpp handles Monitor I data processing
 * @param {string} req - User Request
 * @param {JSON} res - Express Response
 */
module.exports.rmfpp = async function (req, res) {//Controller Function for Realtime Report Processing
  var urlReportNumber, urlSvcCls, urlWlkd, urlTime, urlDuration, timestart, timeend;
  var urlReport = (req.query.report).toUpperCase(); //variable for report parameter in the User Specified URL
  var urlDate = (req.query.date).toUpperCase(); //variable for date parameter in the User Specified URL
  if (req.query.reportnumber) {
    urlReportNumber = (req.query.reportnumber).toUpperCase(); //variable for reportnumber parameter in the User Specified URL
  }
  if (req.query.SvcCls) {
    urlSvcCls = (req.query.SvcCls).toUpperCase(); //variable for reportnumber parameter in the User Specified URL
  }
  if (req.query.Wlkd) {
    urlWlkd = (req.query.Wlkd).toUpperCase(); //variable for reportnumber parameter in the User Specified URL
  }
  if (req.query.Time) {
    urlTime = (req.query.Time).toUpperCase(); //variable for reportnumber parameter in the User Specified URL
  }
  if (req.query.duration) {
    urlDuration = (req.query.duration).toUpperCase(); //variable for reportnumber parameter in the User Specified URL
    var cduration = urlDuration.split(","); //Split the user specified duration into timestart and timeend
    timestart = cduration[0]; //timestart from user specified duration
    timeend = cduration[1]; //timeend from user specified duration  
  }
  if (urlReport.length >= 3 && urlReport.slice(0,3) === "CPU") { //if user specified CPU as report name
    RMFPPgetRequest(baseurl, baseport, rmfppfilename, urlReport, urlDate, function (data) { //A call to the getRequestpp function made with a callback function as parameter
      if(data === "DE" || data === "NE" || data === "UA" || data === "EOUT"){ 
        var string = encodeURIComponent(`${data}`);
        res.redirect('/rmfpp/error?emsg=' + string);
      }else{
        RMFPPparser.bodyParserforRmfCPUPP(data, function (result) { //data returned by the getRequestpp callback function is passed to bodyParserforRmfPP function
          if(result["msg"]){ //Data Error from parser, when parser cannor parse the XML file it receives 
            var data = result["data"];
            res.redirect(`/rmfpp/error?emsg=${data}`);
          }else{
            res.json(result); //Express display all the result returned by the call back function
          }
          //res.json(result); 
        });
      }
    });
  } else if (urlReport.length >= 5 && urlReport.slice(0,5) === "WLMGL") { //if user specified WLMGL as report name
    RMFPPgetRequest(baseurl, baseport, rmfppfilename, urlReport, urlDate, function (data) { //A call to the getRequestpp function made with a callback function as parameter
      if(data === "DE" || data === "NE" || data === "UA" || data === "EOUT"){ 
        var string = encodeURIComponent(`${data}`);
        res.redirect('/rmfpp/error?emsg=' + string);
      }else{
        RMFPPparser.bodyParserforRmfWLMPP(data, function (result) { //data returned by the getRequestpp callback function is passed to bodyParserforRmfPP function
          if(result["msg"]){ //Data Error from parser, when parser cannor parse the XML file it receives 
            var data = result["data"];
            res.redirect(`/rmfpp/error?emsg=${data}`);
          }else{
            if (urlSvcCls != undefined) { //if user has specify value for the SvcCls(service classs) parameter
              try {
                var preSvcCls = 'Service Class '; //String
                filterClass(result, preSvcCls, urlSvcCls, urlTime, timestart, timeend, function (rdata) { //Call filterClass function
                  res.json(rdata); //Express Respond with the JSON returned by the filterClass function
                });
              } catch (err) { //catch error
                res.json(result);//Express Respond with the Error returned by the filterClass function
              }
            } else if (urlWlkd) { //if user has specify value for the Wlkd(workload) parameter
              try {
                var preWlkd = 'Workload '; //String
                filterClass(result, preWlkd, urlWlkd, urlTime, timestart, timeend, function (rdata) { //Call filterClass function
                  res.json(rdata); //Express Respond with the JSON returned by the filterClass function
                });
              } catch (err) { //catch error
                res.json(result);//Express Respond with the Error returned by the filterClass function
              }
            } else {
              res.json(result); //Express Respond with the full worload report if SvcCls or Wlkd parameters were not specified by user
            }
          }
        });
      }
    });

  }
};

/**
 * filterClass function filters Monitor I report based on user specified parameter in the URL
 * @param {string} data - Parsed(JSON) monitor I data returned by post processor parser
 * @param {string} preamble - a Service class/Workload class prefix
 * @param {string} SvcCls - used for 2 purposes, represents either SvcCls and wlkd values specified by user in the URL, depending on when the user calls filterClass function.
 * @param {string} CurrentTime - The value specified by user for time parameter in the URL
 * @param {string} timestart - The value for timestart from duration parameter specified by the user in the URL
 * @param {string} timeend - The value for timeend from duration parameter specified by the user in the URL
 * @param {JSON} fn - The callback function for JSON returned by filterClass Function
 */
function filterClass(data, preamble, SvcCls, CurrentTime, timestart, timeend, fn) { //Functio for wokload pp service classes filter
  if (CurrentTime === undefined && timestart === undefined && timeend === undefined) { //Checks if user did not specify any parameter in the query URL
    Allresponse = []; //Allresponse collection
    for (i in data) { //looping through all workload report
      var foundit; // indicator for when service class or workload class specified by user is found 
      var response = {} //JSON response collection 
      reportSegments = data[i]['ReportSegments'] //selecting a report segment based on the value of "i"
      var value = preamble + SvcCls; //construct value variable by adding the the value of preamble and SvcCls 
      for (j in reportSegments) { //loop through report segment 
        if (reportSegments[j][value]) {//if report segment contains "value" variable 
          foundit = reportSegments[j]; //foundit variable should be updated 
        }
      } //Prepare response JSON
      response['Report'] = data[i]['Report']; // JSON Response report key value pair
      response['Timestamp'] = data[i]['Timestamp']; //JSON Response timestamp key value pair
      response[preamble.trim()] = foundit; //JSON Response preamble string key value pair
      Allresponse.push(response) //Push response JSON to Allrespose collection
    }
    fn(Allresponse); //return Allresponse collection 
  } else if (timestart === undefined && timeend === undefined) { //if timestart and timeend are specified in the URL
    for (i in data) { //looping through all workload report
      var foundit; // indicator for when service class or workload class specified by user is found 
      var response = {}; // JSON response collection
      var timestamp = data[i]['Timestamp'].split("-"); //Split workload report timestamp
      if (timestamp[1] === CurrentTime) { //Checks if time from timestamp matches the time value specified by user in the URL
        reportSegments = data[i]['ReportSegments'] //Select report segment from the workload report 
        var value = preamble + SvcCls; // concatenate preamble and svccls values
        for (j in reportSegments) { //lopp through report segment 
          if (reportSegments[j][value]) { // check if report segment contains value we are looking for
            foundit = reportSegments[j]; // populate found it variable
          }
        }
        response['Report'] = data[i]['Report']; // JSON Response report key value pair
        response['Timestamp'] = data[i]['Timestamp']; //JSON Response timestamp key value pair
        response[preamble.trim()] = foundit; //JSON Response preamble string key value pair
        break; //stop loop
      }
    }
    fn(response); // return the JSON response
  } else { // if duration parameter is specified
    Allresponse = [];
    var rlist = []; //dummy list
    timeduration(timestart, timeend, rlist, function (timerange) { //call timeduration function
      for (i in data) { //loop through parsed workload report
        var foundit; // indicator for when service class or workload class specified by user is found
        var response = {}; // JSON response collection
        var timestamp = data[i]['Timestamp'].split("-"); // split workload report timestamp
        for (a in timerange) { //loop 
          if (timestamp[1] === timerange[a]) { // if workload report time matches a time within user specicified duration
            reportSegments = data[i]['ReportSegments'] // Select report segment
            var value = preamble + SvcCls; // concatenate preamble and svccls values
            for (j in reportSegments) { //loop through report segment
              if (reportSegments[j][value]) { // if reportsegment matches the value we are looking for
                foundit = reportSegments[j]; //populate found it
              }
            }
            response['Report'] = data[i]['Report']; // JSON Response report key value pair
            response['Timestamp'] = data[i]['Timestamp']; //JSON Response timestamp key value pair
            response[preamble.trim()] = foundit;//JSON Response preamble string key value pair
            Allresponse.push(response); // push response JSON into Allresponse array
          }
        }
      }
    });
    fn(Allresponse); //return Allresponse Array
  }
}

/**
 * Newtime function increae the provided time with the number of minutes specified by the ppminuteInterval in the Zconfig.json file.
 * @param {string} time - time provided
 * @param {string} timeInterval - amount of time to add to time provided to produce new time
 * @param {string} fn - Callback function that returns the new time.
 */
function newTime(time, timeInterval, fn) {
  var ntime = time.split("."); //splits time provided by "."
  var hour = parseInt(ntime[0]); // select hour section
  var minutes = parseInt(ntime[1]); // select minutes section
  var seconds = parseInt(ntime[2]); // select seconds section
  var newminutes; // new variable
  newminutes = minutes + parseInt(timeInterval); // increase minutes with the time interval provided
  if (newminutes >= 60) { // in new minutes equals or greater than 60
    minutes = newminutes - 60; // subtract 60 from new minutes
    hour += 1; // increase hour +1
    if (hour === 24) { // check if hour is now greater than or equal to 24
      return; // stop
    }

  } else { // if new minutes is not greater than 60
    minutes = newminutes; //populate minutes variable with new minutes
  }

  var formatedHour = ("0" + hour).slice(-2);//format hour to 2 digita
  var formatedminutes = ("0" + minutes).slice(-2); //format minutes to 2 digits
  var formatedseconds = ("0" + seconds).slice(-2); //format seconds to 2 digits

  var timeNow = formatedHour + "." + formatedminutes + "." + formatedseconds; // populate time now with new time
  fn(timeNow); //return timenow as new time
}

/**
 * timeduration function returns an array of times for a specific duration differenctiated by number of minutes specified by the ppminuteInterval in the Zconfig.json file.
 * @param {string} timestart - the starting time in the duration provided
 * @param {string} timeend - the timeend of the duration provided 
 * @param {string} clist - an array to populate the the time within the duration specified .. very important
 * @param {array} fn - Callback that returns the array with new times within the duration specified.
 */
function timeduration(timestart, timeend, clist, fn) {
  var flist = clist; //take over clist
  var timeendhour = parseInt(timeend[0]); // timeend hour
  var timeendminutes = parseInt(timeend[1]); //timeend minutes 
  var timestarthour = parseInt(timestart[0]); //timestart hour
  var timestartminutes = parseInt(timestart[1]); // timestart minutes
  var timenow = timestart; // populate timenow with value of timestart
  clist.push(timenow); // push timenow to clist array
  //do something with time now
  if (timestarthour === timeendhour && timestartminutes === timeendminutes) { //if timestart is equal to timenow
    timenow = timeend; // timenow is equal to timeend
    clist.push(timenow); // push timenow to clist array
  } else { //if timestart is not equal to timenow
    newTime(timenow, minutesInterval, function (data) { //pass timenow to newtime function which will increase timenow with number of minutes specified by the ppminuteInterval in the Zconfig.json file.
      timeduration(data, timeend, clist, function (data) {  // pass returned time to timeduration function
        //do nothing with returned list
      });
    });
  };
  fn(flist);
}



