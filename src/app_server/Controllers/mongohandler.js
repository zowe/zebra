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
var authSource = Zconfig['authSource']
//var user = dbuser.replace(/^"(.*)"$/, '$1');

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

    if (type != 'Select One' && date === 'nil' && duration === 'nil' && time === 'nil') { // if only value for type parameter is specified
        if (type=== 'CPC'){ // if the value for type is CPC
            cpcDoc(function(data){ //cpcDOC function makes a connection to cpcactivities collection in MongoDB and return the data
                res.render("mongot", {cpcdata: data}) // Express renders the CPC data on the UI
            });
        }else if(type=== 'PROC') { //if the value for type is PROC
            procDoc(function(data){ //procDOC function makes a connection to procactivities collection in MongoDB and return the data
                res.render("mongot", {procdata: data}) // Express renders the PROC data on the UI
            });
        }else if(type === 'USAGE'){ //if the value for type is USAGE
            usageDoc(function(data){ //usageDOC function makes a connection to usageactivities collection in MongoDB and return the data
                res.render("mongot", {usagedata: data}) // Express renders the usage data on the UI
            });
        }else if(type === "Workload"){ //if the value for type is Workload
            wlkDoc(function(data){ //wlkDOC function makes a connection to workloadactivities collection in MongoDB and return the data
                res.render("mongot", {wlkdata: data}) // Express renders the Workload data on the UI
            });
        }
    }else if (type != 'Select One' && date != 'nil' && duration === 'nil' && time === 'nil'){ // if value for type and date parameters are specified
        if (type=== 'CPC'){ // if the value for type is CPC
            cpcDoc(function(data){ //cpcDOC function makes a connection to cpcactivities collection in MongoDB and return the data
                filterDate(data, date, function(result){ //filterDate takes data returned by cpcDoc and returns only reports having the date specified
                    res.render("mongot", {cpcdata: result}) // Express renders the CPC data on the UI
                });
            });
        }else if(type=== 'PROC') { //if the value for type is PROC
            procDoc(function(data){ //procDOC function makes a connection to procactivities collection in MongoDB and return the data
                filterDate(data, date, function(result){ //filterDate takes data returned by procDoc and returns only reports having the date specified
                    res.render("mongot", {procdata: result}) // Express renders the PROC data on the UI
                });
            });
        }else if(type === 'USAGE'){ //if the value for type is USAGE
            usageDoc(function(data){ //usageDOC function makes a connection to usageactivities collection in MongoDB and return the data
                filterDate(data, date, function(result){ //filterDate takes data returned by usageDoc and returns only reports having the date specified
                    res.render("mongot", {usagedata: result}) // Express renders the USAGE data on the UI
                });
            });
        }else if(type === "Workload"){ //if the value for type is Workload
            wlkDoc(function(data){ //wlkDOC function makes a connection to workloadactivities collection in MongoDB and return the data
                filterDate(data, date, function(result){ //filterDate takes data returned by wlkDoc and returns only reports having the date specified
                    res.render("mongot", {wlkdata: result}) // Express renders the Workload data on the UI
                });
            });
        }
    }else if (type != 'Select One' && date != 'nil' && duration != 'nil' && time === 'nil'){ // if value for type, date and duration parameters are specified
        if (type=== 'CPC'){ // if the value for type is CPC
            cpcDoc(function(data){ //cpcDOC function makes a connection to cpcactivities collection in MongoDB and return the data
                filterDate(data, date, function(result){  //filterDate takes data returned by cpcDoc and returns only reports having the date specified
                    filterDuration(result, duration, function(dresult){ //filterDuration takes data from filterDate and returns reports based on the specified duration
                        res.render("mongot", {cpcdata: dresult}) // Express renders the CPC data on the UI
                    })
                });
            });
        }else if(type=== 'PROC') { // if the value for type is PROC
            procDoc(function(data){ //procDOC function makes a connection to procactivities collection in MongoDB and return the data
                filterDate(data, date, function(result){ //filterDate takes data returned by procDoc and returns only reports having the date specified
                    filterDuration(result, duration, function(dresult){ //filterDuration takes data from filterDate and returns reports based on the specified duration
                        res.render("mongot", {procdata: dresult}) // Express renders the PROC data on the UI
                    })
                });
            });
        }else if(type === 'USAGE'){ //if the value for type is USAGE
            usageDoc(function(data){ //usageDOC function makes a connection to usageactivities collection in MongoDB and return the data
                filterDate(data, date, function(result){ //filterDate takes data returned by usageDoc and returns only reports having the date specified
                    filterDuration(result, duration, function(dresult){ //filterDuration takes data from filterDate and returns reports based on the specified duration
                        res.render("mongot", {usagedata: dresult}) // Express renders the USAGE data on the UI
                    })
                });
            });
        }else if(type === "Workload"){ //if the value for type is Workload
            wlkDoc(function(data){ //wlkDOC function makes a connection to workloadactivities collection in MongoDB and return the data
                filterDate(data, date, function(result){//filterDate takes data returned by wlkDoc and returns only reports having the date specified
                    filterDuration(result, duration, function(dresult){ //filterDuration takes data from filterDate and returns reports based on the specified duration
                        res.render("mongot", {wlkdata: dresult}) // Express renders the Workload data on the UI
                    })
                });
            });
        }
    }else if (type != 'Select One' && date != 'nil' && time != 'nil'){ // if value for type, date and time parameters are specified
        if (type=== 'CPC'){ // if the value for type is CPC
            cpcDoc(function(data){ //cpcDOC function makes a connection to cpcactivities collection in MongoDB and return the data
                filterDate(data, date, function(result){ //filterDate takes data returned by cpcDoc and returns only reports having the date specified
                    filterTime(result, time, function(dresult){ //filterTime takes data from filterDate and returns reports based on the specified time
                        res.render("mongot", {cpcdata: dresult}) // Express renders the CPC data on the UI
                    })
                });
            });
        }else if(type=== 'PROC') { // if the value for type is PROC
            procDoc(function(data){ //procDOC function makes a connection to procactivities collection in MongoDB and return the data
                filterDate(data, date, function(result){ //filterDate takes data returned by procDoc and returns only reports having the date specified
                    filterTime(result, time, function(dresult){ //filterTime takes data from filterDate and returns reports based on the specified time
                        res.render("mongot", {procdata: dresult}) // Express renders the PROC data on the UI
                    })
                });
            });
        }else if(type === 'USAGE'){ // if the value for type is USAGE
            usageDoc(function(data){ //usageDOC function makes a connection to usageactivities collection in MongoDB and return the data
                filterDate(data, date, function(result){ //filterDate takes data returned by usageDoc and returns only reports having the date specified
                    filterTime(result, time, function(dresult){ //filterTime takes data from filterDate and returns reports based on the specified time
                        res.render("mongot", {usagedata: dresult})  // Express renders the USAGE data on the UI
                    })
                });
            });
        }else if(type === "Workload"){ // if the value for type is Workload
            wlkDoc(function(data){ //wlkDOC function makes a connection to workloadactivities collection in MongoDB and return the data
                filterDate(data, date, function(result){ //filterDate takes data returned by wlkDoc and returns only reports having the date specified
                    filterTime(result, time, function(dresult){ //filterTime takes data from filterDate and returns reports based on the specified time
                        res.render("mongot", {wlkdata: dresult}) // Express renders the Workload data on the UI
                    })
                });
            });
        }
    }else{ //if a user did not specify type
        res.render("mongot", {nodata: {}}) //Express return no data
    }
}

/**
 * cpcDoc handles retrieving CPC report
 * @param {Object} fn - returns the data stored in cpcactivities
 */
function cpcDoc(fn){
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection("cpcactivities").find({}).toArray(function(err, result){ //make an array of all data in cpcactivities 
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
            dbo.collection("cpcactivities").find({}).toArray(function(err, result){ //make an array of all data in cpcactivities 
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

function procDoc(fn){
    if (dbauth === 'true'){
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection("procactivities").find({}).toArray(function(err, result){ //make an array of all data in procactivities 
                if (err) throw err; //if there is an error, throw it
                try{ 
                    fn(result); // return the array of all data in procactivities
                }catch(err){ 
                    fn({}) // retuen emptry object
                }
                db.close(); //close database connection
            })
        });
    }else{
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection("procactivities").find({}).toArray(function(err, result){ //make an array of all data in procactivities
                if (err) throw err; //if there is an error, throw it
                try{ 
                    fn(result); // return the array of all data in procactivities
                }catch(err){ 
                    fn({}) // retuen emptry object
                }
                db.close(); //close database connection
            })
        });   
    }
}

function usageDoc(fn){
    if (dbauth === 'true'){
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection("usageactivities").find({}).toArray(function(err, result){ //make an array of all data in usageactivities
                if (err) throw err; //if there is an error, throw it
                try{ 
                    fn(result); // return the array of all data in usageactivities
                }catch(err){ 
                    fn({}) // retuen emptry object
                }
                db.close(); //close database connection
            })
        });
    }else{
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection("usageactivities").find({}).toArray(function(err, result){ //make an array of all data in usageactivities
                if (err) throw err; //if there is an error, throw it
                try{ 
                    fn(result); // return the array of all data in usageactivities
                }catch(err){ 
                    fn({}) // retuen emptry object
                }
                db.close(); //close database connection
            })
        });   
    }
}


function wlkDoc(fn){
    if (dbauth === 'true'){
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection("workloadactivities").find({}).toArray(function(err, result){ //make an array of all data in workloadactivities
                if (err) throw err; //if there is an error, throw it
                try{ 
                    fn(result); // return the array of all data in workloadactivities
                }catch(err){ 
                    fn({}) // retuen emptry object
                }
                db.close(); //close database connection
            })
        });
    }else{
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection("workloadactivities").find({}).toArray(function(err, result){ //make an array of all data in workloadactivities
                if (err) throw err; //if there is an error, throw it
                try{ 
                    fn(result); // return the array of all data in workloadactivities
                }catch(err){ 
                    fn({}) // retuen emptry object
                }
                db.close(); //close database connection
            })
        });   
    }
}

/**
 * filterDate filters MongoDB data based on specified date
 * @param {object} data - Array of MongoDB documents to filter
 * @param {string} filterdate - the date of the reports to return
 * @param {object} fn - array of filtered MongoDB data that match the filterDate
 */
function filterDate(data, filterdate, fn){ 
    var filterResult = []; // initialize filterResult Array
    for (k in data){ // loop through data array provided
        var elemdate = data[k].date; // select the date parameter from the data at index k
        var elemsplit = elemdate.split("/"); // split the date using "/"
        var elemMonth = elemsplit[0]; //Month in the date 
        var elemDay = elemsplit[1]; //day in the date
        var elemYear = elemsplit[2]; //year in the date
        var filterSplit = filterdate.split("/") //split the filterdate using "/"
        var filterMonth =  ("0" + filterSplit[0]).slice(-2); //Month in the filterdate 
        var filterDay = ("0" + filterSplit[1]).slice(-2); //Day in the filterdate 
        var filterYear = filterSplit[2] //Year in the filterdate 
        if (elemMonth === filterMonth && elemDay === filterDay && elemYear === filterYear){ //compare the date of data at index k and filterdate
            filterResult.push(data[k]); // push data at index k into filterResult array
        }
    }
    fn(filterResult); //return filterResult Array
}

/**
 * filterDuration filters MongoDB data based on specified duration
 * @param {object} data - Array of MongoDB documents to filter
 * @param {strin} duration - the duration of the reports to return
 * @param {object} fn - array of filtered MongoDB data that fall within the duration specified
 */
function filterDuration(data, duration, fn){
    var filterResult = []; // initialize filterResult Array
    for (k in data){ // loop through data array provided
        var elemtime = data[k].time; // select the time parameter from the data at index k
        var elemsplit = elemtime.split(":"); // split the time using ":"
        var elemHour = elemsplit[0]; // Hour in the time
        var elemMinute = elemsplit[1]; // Minutes in the time
        var durationSplit = duration.split(":"); //split duration using ":"
        var startTime = durationSplit[0].split("."); //split starttime using "."
        var stopTime = durationSplit[1].split("."); //split stoptime using "."
        var startHour = startTime[0] //starttime hour
        var startMinute = startTime[1] //starttime minute
        var stopHour = stopTime[0] //stoptime hour
        var stopMinute = stopTime[1] //stoptime minute
        if (elemHour >= startHour && elemMinute >= startMinute){ //compare the time of data at index k and starttime of the duration
            if(elemHour === stopHour && elemMinute >= stopMinute){ //compare the time of data at index k and stoptime of the duration
                filterResult.push(data[k]); // push data at index k into filterResult array
                break;
            }
            filterResult.push(data[k]); // push data at index k into filterResult array
        }
    }
    fn(filterResult);//return filterResult Array

}

/**
 * filterTime filters MongoDB data based on specified time
 * @param {object} data - Array of MongoDB documents to filter
 * @param {string} time - the time of the report to return
 * @param {object} fn - array of filtered MongoDB data that matches the time specified
 */
function filterTime(data, time, fn){
    var filterResult = [];// initialize filterResult Array
    for (k in data){ // loop through data array provided
        var elemtime = data[k].time; // select the time parameter from the data at index k
        var elemsplit = elemtime.split(":"); // split the time using ":"
        var elemHour = elemsplit[0]; // Hour in the time
        var elemMinute = elemsplit[1];// Minutes in the time
        var startTime = time.split("."); //split time using "."
        var startHour = startTime[0] //time hour
        var startMinute = startTime[1]//time minute
        if (elemHour >= startHour && elemMinute >= startMinute){ //compare the time of data at index k and time
            filterResult.push(data[k]); // push data at index k into filterResult array
            break;
        }
    }
    fn(filterResult); //return filterResult Array

}