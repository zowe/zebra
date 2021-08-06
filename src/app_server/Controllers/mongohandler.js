var timehandler = require("./RMFPPcontroller");
let cpcdoc = require("../Models/cpcdocSchema")
let procdoc = require("../Models/procdocSchema")
let usagedoc = require("../Models/usagedocSchema")
let wkldoc = require("../Models/workloaddocSchema")
var MongoClient = require('mongodb').MongoClient;
//var mongoose = require( 'mongoose' );
//var url = "mongodb://localhost:27017/";
var Zconfig = require("../../config/Zconfig");
var mongourl = Zconfig['mongourl'] ;
var mongoport = Zconfig['mongoport'] ;
var dbname = Zconfig['dbname'];
var dbauth = Zconfig['useDbAuth'];
var dbuser = Zconfig['dbUser'];
var dbpwd = Zconfig['dbPassword'];
var dbinterval = Zconfig['dbinterval'];
var authSource = Zconfig['authSource'];

var dbURI = `mongodb://${mongourl}:${mongoport}/${dbname}`; //MongoDB URI with no authentication
var dbURIAuth = `mongodb://${dbuser}:${dbpwd}@${mongourl}:${mongoport}/${dbname}?authMechanism=DEFAULT&authSource=${authSource}`; //MongoDB URI with authentication

/**
 * mongoReport handles the presentation of MongoDB data in Zebra UI
 */
module.exports.mongoReport = function(req, res) {
    var type = req.body.rtype; // the report type in the request
    var date = req.body.date; // the report date in the request
    var duration = req.body.duration; // the report duration from the request
    var time = req.body.time; // the report time from the request\
    
    // Decide what kind of filter to use
    var filter;
    if (type != 'Select One' && date === 'nil' && duration === 'nil' && time === 'nil') { // if only value for type parameter is specified
        filter = {}
    }else if (type != 'Select One' && date != 'nil' && duration === 'nil' && time === 'nil'){ // if value for type and date parameters are specified
        filter = getDateFilter(date);
    }else if (type != 'Select One' && date != 'nil' && duration != 'nil' && time === 'nil'){ // if value for type, date and duration parameters are specified
        filter = getDurationFilter(date, duration);
    }else if (type != 'Select One' && date != 'nil' && time != 'nil'){ // if value for type, date and time parameters are specified
        filter = getTimeFilter(date, time);
    }else{ //if a user did not specify type
        res.render("mongot", {nodata: {}}) //Express return no data
        return;
    }

    if (type=== 'CPC'){ // if the value for type is CPC
        getDoc("cpcactivities", filter, function(data){ //function makes a connection to cpcactivities collection in MongoDB and return the data
            res.render("mongot", {cpcdata: data}) // Express renders the CPC data on the UI
        });
    }else if(type=== 'PROC') { //if the value for type is PROC
        getDoc("procactivities", filter, function(data){ //function makes a connection to procactivities collection in MongoDB and return the data
            res.render("mongot", {procdata: data}) // Express renders the PROC data on the UI
        });
    }else if(type === 'USAGE'){ //if the value for type is USAGE
        getDoc("usageactivities", filter, function(data){ //function makes a connection to usageactivities collection in MongoDB and return the data
            res.render("mongot", {usagedata: data}) // Express renders the usage data on the UI
        });
    }else if(type === 'Workload'){ //if the value for type is Workload
        getDoc("workloadactivities", filter, function(data){ //function makes a connection to workloadactivities collection in MongoDB and return the data
            res.render("mongot", {wlkdata: data}) // Express renders the Workload data on the UI
        });
    }else{ //if a user did not specify type
        res.render("mongot", {nodata: {}}) //Express return no data
        return;
    }
}

/**
 * Retrieves the given report type
 * @param {String} collection - name of mongo collection
 * @param {Object} filter - conditions to filter the documents
 * @param {Object} fn - returns the data stored in cpcactivities
 */
function getDoc(collection, filter, fn){
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection(collection).find(filter).toArray(function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                try{ 
                    fn(result); // return the array of all data in cpcactivities
                }catch(err){ 
                    fn({}) // retuen emptry object
                }
                db.close(); //close database connection
            })
        });
    }else{
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection(collection).find(filter).toArray(function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                try{ 
                    fn(result); // return the array of all data in cpcactivities
                }catch(err){ 
                    fn({}) // retuen emptry object
                }
                db.close(); //close database connection
            })
        });   
    }
}

/**
 * Creates a filter to get data with the given date
 * @param {string} date - the date of the reports to return in MM/DD/YYYY format
 */
function getDateFilter(date){
    var filterSplit = date.split("/") //split the filterdate using "/"
    var month =  ("0" + filterSplit[0]).slice(-2); //Month in the filterdate 
    var day = ("0" + filterSplit[1]).slice(-2); //Day in the filterdate 
    var year = filterSplit[2] //Year in the filterdate
    var filterDateTime = new Date(Date.parse(`${year}-${month}-${day}`));
    var nextDay = new Date(filterDateTime.getTime()+1000*60*60*24);;
    return { "datetime": { "$gte": filterDateTime, "$lt": nextDay } };
}

/**
 * Creates a filter to get data on the given date within the given duration
 * @param {String} date -the date of the reports to return in MM/DD/YYYY format
 * @param {String} duration - the duration of the reports to return in hh.mm.ss:hh.mm.ss format
 */
function getDurationFilter(date, duration){
    var filterSplit = date.split("/") //split the filterdate using "/"
    var month =  ("0" + filterSplit[0]).slice(-2); //Month in the filterdate 
    var day = ("0" + filterSplit[1]).slice(-2); //Day in the filterdate 
    var year = filterSplit[2] //Year in the filterdate
    var durationSplit = duration.split(":"); //split duration using ":"
    var startTime = durationSplit[0].split("."); //split starttime using "."
    var stopTime = durationSplit[1].split("."); //split stoptime using "."
    var startHour = startTime[0] //starttime hour
    var startMinute = startTime[1] //starttime minute
    var stopHour = stopTime[0] //stoptime hour
    var stopMinute = stopTime[1] //stoptime minute
    var startDateTime = new Date(Date.parse(`${year}-${month}-${day}T${startHour}:${startMinute}:00`));
    var stopDateTime = new Date(Date.parse(`${year}-${month}-${day}T${stopHour}:${stopMinute}:00`));
    return { "datetime": { "$gte": startDateTime, "$lte": stopDateTime } };
}

/**
 * Creates a filter to get data on the given date at the given time
 * @param {String} date - the date of the report to return in MM/DD/YYYY format
 * @param {String} time - the time of the report to return
 */
function getTimeFilter(date, time){
    var filterSplit = date.split("/") //split the filterdate using "/"
    var month =  ("0" + filterSplit[0]).slice(-2); //Month in the filterdate 
    var day = ("0" + filterSplit[1]).slice(-2); //Day in the filterdate 
    var year = filterSplit[2] //Year in the filterdate
    var startTime = time.split("."); //split time using "."
    var startHour = startTime[0] //time hour
    var startMinute = startTime[1]//time minute
    var startDateTime = new Date(Date.parse(`${year}-${month}-${day}T${startHour}:${startMinute}:00`));
    var stopDateTime = new Date(startDateTime.getTime()+1000*parseInt(dbinterval, 10));
    return { "datetime": { "$gte": startDateTime, "$lte": stopDateTime } };
}