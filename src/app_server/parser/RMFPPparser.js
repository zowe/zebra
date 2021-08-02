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
            var key1 = result['ddsml']['postprocessor']; // keys1 represent all postprocessor report sections
            //For loop to create dictionary/JSON 
            for (k in key1) { //looping through all postprocessor sections, one at a time: k is an integer startinf from zero and increase with each iteration
                var cpuMachineType = key1[k]['segment'][0]['part'][0]['var-list'][0]['var'][0]['value'][0];
                var cpuModelType = key1[k]['segment'][0]['part'][0]['var-list'][0]['var'][1]['value'][0];
                var CPUSectiontable = key1[k]['segment'][0]['part'][0]['table'][0]["row"] // Rows in CPU Section of XML
                var CPUsectioncolumnheader = key1[k]['segment'][0]['part'][0]['table'][0]['column-headers'][0]['col']; // Column headers in CPU Section of XML
                var numProcName = key1[k]['segment'][1]['part'][1]['name'][0]; // Number of Physical Processors section name
                var numProcTable = key1[k]['segment'][1]['part'][1]['table'][0]['row']; // Table of Number of Physical Processors section
                var partitionDataName = key1[k]['segment'][1]['part'][2]['name'][0]; // Partion data section name
                var partitionDataTable = key1[k]['segment'][1]['part'][2]['table'][0]['row']; // Table of the partition data section
                var partitionDataColumnHead = key1[k]['segment'][1]['part'][2]['table'][0]['column-headers'][0]['col']; //Columnhead of the partition data section
                var resourceName = key1[k]['resource'][0]['resname'][0];
                var resourceType = key1[k]['resource'][0]['restype'][0];
                var PDCH = [] //partition data columnheader collection
                var FPDR = [] //final partition data report collection 
                for (i in partitionDataColumnHead) { //looping through partitionDataColumnHead
                    PDCH[i] = partitionDataColumnHead[i]['_']; //populating the partition data columnheader collection
                };

                for (i in partitionDataTable) {   //looping through partitionDatatable
                    var PDTB = {} //Partition data Table body collection
                    for (j in PDCH) { //looping through partition Data ColumnHead
                        PDTB[PDCH[j]] = partitionDataTable[i].col[j]; //creating a key value pairs for each lpar in the partion data table  
                    }
                    FPDR.push(PDTB); //populating final partition data report collection
                };

                var FNPT = {} // final number of phys proc table
                var regExp = /\(([^)]+)\)/; // used to get shorthand proc name
                for (var i = 0; i < numProcTable.length - 1; i++) {
                    var matches = regExp.exec(numProcTable[i]['col'][0])
                    FNPT[matches[1]] = numProcTable[i]['col'][1]
                }

                CPUColumnhead = [] // CPU columnheader collection
                for (i in CPUsectioncolumnheader) { //looping through CPUsectioncolumnheader
                    CPUColumnhead[i] = CPUsectioncolumnheader[i]['_']; //populating the CPU columnheader collection
                };

                finalCPUTable = [];//final CPU report collection
                for (i in CPUSectiontable) {   //looping through CPUsectiontable
                    CPUtable = {} //CPU table data collection
                    for (j in CPUColumnhead) {//looping through CPU ColumnHead
                        CPUtable[CPUColumnhead[j]] = CPUSectiontable[i].col[j]; //creating a key value pairs for each CPU in the CPU table  
                    }
                    finalCPUTable.push(CPUtable); //populating final CPU report collection
                };

                var finalCPUReport = { Machine: cpuMachineType, Model: cpuModelType, Table: finalCPUTable };

                parsedPostprocessor = {}; //collection  for individual parsed postprocessor, one at a time
                parsedPostprocessor['Report'] = key1[k]['metric'][0]["description"][0]; // Report key value pair
                parsedPostprocessor['Timestamp'] = key1[k]['time-data'][0]['display-start'][0]['_']; // Timestamp key value pair
                parsedPostprocessor[resourceType] = resourceName;
                parsedPostprocessor['CPU'] = finalCPUReport; // CPU key value pair
                parsedPostprocessor[numProcName] = FNPT;
                parsedPostprocessor[partitionDataName] = FPDR;
                //parsedPostprocessor['partitionDataName'] = partitionDataName; // partitionDataName key value pair
                //parsedPostprocessor['partitionDataBody'] = FPDR; // partionDataBody key value pair

                finalJSON.push(parsedPostprocessor); //populating FinalJSON with parsedPostprocessor
            }
            fn(finalJSON); //function returns parsed postprocessor
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
                AllsegmentCollection = []; // A JSON collection for all segments
                for (b in segments) { // loop through segments in the XML
                    var parts = segments[b]['part']; // represent segment part value in the XML
                    var message = segments[b]['message']; // represent segment message value in the XML
                    var segmentName = segments[b]['name']; // represent segment name in the XML
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
                            fieldCollection["Table"] = finaltableReport;
                        }
                        // Add to part
                        if (partName) { // if part name atrribute is present in the XML
                            partCollection[partName] = fieldCollection; //populate part collections with partname as key and finaltableReport as value
                        } else { // if part name atrribute is not present in the XML
                            partCollection['Info'] = fieldCollection; //populate part collections with "info" as key and finaltableReport as value
                        }
                        if (segmentName) { // if segment name atrribute is present in the XML
                            segmentCollection[segmentName] = partCollection; //populate segment collections with segmentname as key and partCollection as value
                        } else { // if segment name atrribute is not present in the XML
                            segmentCollection['Segment'] = partCollection; //populate segment collections with "Info" as key and partCollection as value
                        }

                    }
                    AllsegmentCollection.push(segmentCollection) //Push segment collection into all segments
                }
                singleWLMPPReport['Report'] = postprocessors[a]['metric'][0]["description"][0]; //singleWLMPPReport report key value pair
                singleWLMPPReport['Timestamp'] = postprocessors[a]['time-data'][0]['display-start'][0]['_']; //singleWLMPPReport Timestamp key value pair
                singleWLMPPReport['ReportSegments'] = AllsegmentCollection; //singleWLMPPReport reportSegments key value pairs

                //console.log(ppReport);
                allWLMPPJSON.push(singleWLMPPReport);  //push single workload postprocessor JSON into All workload post processor JSON

            } // loop ending
            fn(allWLMPPJSON); // return All workload post processor JSON
        });
    } catch (err) { // if error
        fn({msg: 'Err', error: err, data: data}); // return error
    }
}