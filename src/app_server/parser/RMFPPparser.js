var xml2js = require('xml2js'); // Import xml2js library
var parser = new xml2js.Parser(); // Initialize xml2js parser
var fs = require('fs'); // Import fs module
//transform all attribute and tag names and values to uppercase
/**
 * bodyParserforRmfCPUPP function handles parsing CPU monitor I XML data to JSON
 * @param {XML} data - CPU XML data from RMF Monitor I 
 * @param {JSON} fn - Callback funtion to return JSON of Parsed CPU XML
 */
module.exports.bodyParserforRmfCPUPP = function (data, fn) {//Function to parse RMFPP reports, fn is an argument for call back function
    try { //try to process xml
        parser.parseString(data, function (err, result) {
            var finalJSON = []; // Collection for storing JSON of Parsed CPU XML
            var postprocessors = result['ddsml']['postprocessor']; // keys1 represent all postprocessor report sections
            for (a in postprocessors) {
                var singleCPUReport = {};
                var segments = postprocessors[a]['segment'];
                var resourceName = postprocessors[a]['resource'][0]['resname'][0];
                var allSegmentCollection = {};
                for (b in segments) {
                    var parts = segments[b]['part'];
                    var segmentName = segments[b]['name'][0];
                    var segmentCollection = {};
                    var partCollection = {};
                    for (c in parts) {
                        var partName = parts[c]['name'];
                        var varlist = parts[c]['var-list'];
                        var table = parts[c]['table'];
                        var fieldCollection = {};

                        if (varlist) {
                            var variables = varlist[0]['var'];
                            for (d in variables) {
                                fieldCollection[variables[d]['name'][0]] = variables[d]['value'][0];
                            }
                        }

                        if (table) {
                            var tableColumnHeader = table[0]['column-headers'][0]['col'];
                            var tableBody = table[0]['row'];
                            var columnheadCollection = [];
                            var finalTableReport = [];
                            for (i in tableColumnHeader) {
                                columnheadCollection[i] = tableColumnHeader[i]['_'];
                            }

                            if (tableBody !== undefined) {
                                for ( i in tableBody) {
                                    var CPUtable = {}
                                    for (j in columnheadCollection) {
                                        CPUtable[columnheadCollection[j]] = tableBody[i]['col'][j];
                                    }
                                    finalTableReport.push(CPUtable);
                                }
                            }

                            if (!varlist) {
                                fieldCollection = finalTableReport;
                            } else {   
                                fieldCollection["Table"] = finalTableReport;
                            }
                        }

                        if (partName) {
                            partCollection[partName] = fieldCollection;
                        } else {
                            partCollection['Info'] = fieldCollection;
                        }
                        if (segmentCollection) {
                            allSegmentCollection[segmentName] = partCollection;
                        } else {
                            allSegmentCollection['Segment'] = partCollection;
                        }
                    }
                }
                singleCPUReport['Report'] = postprocessors[a]['metric'][0]["description"][0];
                singleCPUReport["System"] = resourceName;
                singleCPUReport['Timestamp'] = postprocessors[a]['time-data'][0]['display-start'][0]['_'];
                singleCPUReport = {
                    ...singleCPUReport,
                    ...allSegmentCollection
                };

                finalJSON.push(singleCPUReport);
            }
            fn(finalJSON);
        });
    } catch (err) {// if parsing XML didn't went smooth
        fn({msg: 'Err', error: err, data: data});// return the error 
    }
}

/**
 * bodyParserforRmfWLMPP function handles parsing Workload monitor I XML data to JSON
 * @param {XML} data - Workload XML data from RMF Monitor I 
 * @param {JSON} fn - Callback funtion to return JSON of Parsed CPU XML
 */
module.exports.bodyParserforRmfWLMPP = function (data, fn) {//Function to parse workload reports, fn is an argument for call back function
    try {
        parser.parseString(data, function (err, result) { //
            var postprocessors = result['ddsml']['postprocessor']; //represent all postprocessor report sections in the XML
            var allWLMPPJSON = []; // A JSON collection for all parsed Workload postprocessor sections
            for (a in postprocessors) { // loop through all postprocessor sections
                var singleWLMPPReport = {}; // JSON Collection for a single postprocession section of the XML
                var segments = postprocessors[a]['segment']; // represent segments each postprocessor section
                var resourceName = postprocessors[a]['resource'][0]['resname'][0];
                AllsegmentCollection = []; // A JSON collection for all segments
                for (b in segments) { // loop through segments in the XML
                    var parts = segments[b]['part']; // represent segment part value in the XML
                    var message = segments[b]['message']; // represent segment message value in the XML
                    var segmentName = segments[b]['name'][0]; // represent segment name in the XML
                    segmentCollection = {}; //A JSON for single XML segment
                    if (message) {  // if segment contains mesaage atrributes in the XML
                        var messageDescription = message[0]['description'][0]; // represent message description
                        var messageSeverity = message[0]['severity'][0]; // represent message severity
                        var messageCollection = {} // A JSON for message Collection
                        messageCollection['Description'] = messageDescription; // message Description key value pairs in messageCollection
                        messageCollection['Severity'] = messageSeverity; // message severity key value pairs in messageCollection
                        segmentCollection['Message'] = messageCollection; //message key value pair in segmentCollection
                    }
                    partCollection = {}; // A JSON collection for single part
                    for (c in parts) { //loop through segment parts value 
                        var partName = parts[c]['name']; // represent part name in the XML
                        var varlist = parts[c]['var-list']; // Represent variable list in the XML
                        var table = parts[c]['table']; // represent table in the XML
                        var fieldCollection = {}

                        if (varlist) { // if XML contains variable list
                            var variables = varlist[0]['var'] //represent the variables name and value in the XML
                            for (d in variables) { // loop through the variables
                                fieldCollection[variables[d]['name'][0]] = variables[d]['value'][0]; //populate variables collection with name and value from XML 
                            }

                        }
                        if (table) { //if report contains table attributes in the XML
                            var tablecolumnheader = table[0]['column-headers'][0]['col']; // represent column heads
                            var tableBody = table[0]['row']; // represent the rows
                            columnheadCollection = [] // An array for Column headers
                            finaltableReport = [];//final table report collection vontaining all rows
                            for (i in tablecolumnheader) { //loop through columnhead
                                columnheadCollection[i] = tablecolumnheader[i]['_']; //populate the colunmhead collection
                            };

                            //Loop for Rows XML Attributes
                            if (tableBody != undefined) { //if table body is not empty(0 rows)
                                for (i in tableBody) {   //looping through the rows
                                    WLMtable = {} //CPU table data collection
                                    for (j in columnheadCollection) {//looping through ColumnHead
                                        WLMtable[columnheadCollection[j]] = tableBody[i].col[j]; //creating a key value pairs for each row in the table with columnhead values serving as keys and rows as values 
                                    }
                                    finaltableReport.push(WLMtable);
                                };
                            }

                            if (!varlist) {
                                fieldCollection = finaltableReport;
                            } else {
                                fieldCollection["Table"] = finaltableReport;
                            }
                        }
                        // Add to part
                        if (partName) { // if part name atrribute is present in the XML
                            partCollection[partName] = fieldCollection; //populate part collections with partname as key and finaltableReport as value
                        } else { // if part name atrribute is not present in the XML
                            partCollection['Info'] = fieldCollection; //populate part collections with "info" as key and finaltableReport as value
                        }
                        if (segmentName) { // if segment name atrribute is present in the XML
                            segmentCollection = {
                                'Name': segmentName,
                                ...segmentCollection,
                                ...partCollection
                            }
                        } else { // if segment name atrribute is not present in the XML
                            segmentCollection = {
                                'Name': 'N/A',
                                ...segmentCollection,
                                ...partCollection
                            }
                        }

                    }
                    AllsegmentCollection.push(segmentCollection) //Push segment collection into all segments
                }
                singleWLMPPReport['Report'] = postprocessors[a]['metric'][0]["description"][0]; //singleWLMPPReport report key value pair
                singleWLMPPReport['Sysplex'] = resourceName;
                singleWLMPPReport['Timestamp'] = postprocessors[a]['time-data'][0]['display-start'][0]['_']; //singleWLMPPReport Timestamp key value pair
                singleWLMPPReport['Classes'] = AllsegmentCollection; //singleWLMPPReport reportSegments key value pairs

                //console.log(ppReport);
                allWLMPPJSON.push(singleWLMPPReport);  //push single workload postprocessor JSON into All workload post processor JSON

            } // loop ending
            fn(allWLMPPJSON); // return All workload post processor JSON
        });
    } catch (err) { // if error
        fn({msg: 'Err', error: err, data: data}); // return error
    }
}