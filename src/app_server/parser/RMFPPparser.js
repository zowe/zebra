var xml2js = require('xml2js'); // Import xml2js library
var parser = new xml2js.Parser(); // Initialize xml2js parser
//transform all attribute and tag names and values to uppercase

/**
 * General parser for parsing RMF monitor I XML data to JSON
 * @param {XML} data - Workload XML data from RMF Monitor I 
 * @param {JSON} fn - Callback funtion to return JSON of Parsed CPU XML
 */
module.exports.parse = (data, fn) => {
    try {
        parser.parseString(data, function (err, result) {
            var finalJSON = {}; // Collection for storing JSON of Parsed XML
            var postprocessors = result['ddsml']['postprocessor'];
            for (a in postprocessors) { // Loop through postprocessor sections
                var singleReport = {};
                var segments = postprocessors[a]['segment'];
                var resourceName = postprocessors[a]['resource'][0]['resname'][0];
                var reportId = postprocessors[a]['metric'][0]['$']['id'];
                var allSegmentCollection = {};
                for (b in segments) { // Loop through segment sections
                    var parts = segments[b]['part'];
                    var segmentName = segments[b]['name'][0];
                    var message = segments[b]['message']; // represent segment message value in the XML
                    var partCollection = {};
                    for (c in parts) { // Loop through part sections
                        var partName = parts[c]['name'];
                        var varlist = parts[c]['var-list'];
                        var table = parts[c]['table'];
                        var fieldCollection = {};

                        if (varlist) { // If part contains a list of variables
                            var variables = varlist[0]['var'];
                            for (d in variables) {
                                fieldCollection[variables[d]['name'][0]] = variables[d]['value'][0];
                            }
                        }

                        if (table) { // If part contains a table
                            var tableColumnHeader = table[0]['column-headers'][0]['col'];
                            var tableBody = table[0]['row'];
                            var columnheadCollection = [];
                            var finalTableReport = [];
                            for (i in tableColumnHeader) {
                                columnheadCollection[i] = tableColumnHeader[i]['_'] ? tableColumnHeader[i]['_'] : "Name";
                            }

                            if (tableBody !== undefined) { // If table is not empty
                                for ( i in tableBody) {
                                    var partTable = {}
                                    for (j in columnheadCollection) {
                                        partTable[columnheadCollection[j]] = tableBody[i]['col'][j];
                                    }
                                    finalTableReport.push(partTable);
                                }
                            }

                            if (!varlist) { // If part contains only table and no var list
                                fieldCollection = finalTableReport;
                            } else {   
                                fieldCollection["Table"] = finalTableReport;
                            }
                        }

                        if (partName && Array.isArray(partName)) { // Makes sure that partName is not an array (special case)
                            partName = partName[0];
                        }
                        if (partName && partName !== "") { // If part already has a name 
                            partCollection[partName] = fieldCollection;
                        } else {
                            partCollection['Info'] = fieldCollection;
                        }

                        // Removes unnecessary INFO tag if it is only part of segment
                        if (Object.keys(partCollection).length === 1 && Object.keys(partCollection)[0] === "Info") {
                            partCollection = { ...partCollection['Info'] };
                        }

                        if (message) {  // if segment contains mesaage atrributes in the XML
                            var messageDescription = message[0]['description'][0]; // represent message description
                            var messageSeverity = message[0]['severity'][0]; // represent message severity
                            var messageCollection = {} // A JSON for message Collection
                            messageCollection['Description'] = messageDescription; // message Description key value pairs in messageCollection
                            messageCollection['Severity'] = messageSeverity; // message severity key value pairs in messageCollection
                            partCollection = { "Message": messageCollection, ...partCollection };
                        }

                        // Set collection of data
                        allSegmentCollection[segmentName] = partCollection;

                    }
                }
                singleReport['Report'] = postprocessors[a]['metric'][0]["description"][0];
                singleReport["System"] = resourceName;
                singleReport['Timestamp'] = postprocessors[a]['time-data'][0]['display-start'][0]['_'];
                if (reportId === "WLMGL") { // SPECIAL CASE MAPPING
                    let segKeys = Object.keys(allSegmentCollection);
                    singleReport = {
                        ...singleReport,
                        "Classes": segKeys.map( (key) => {
                            return {
                                Name: key,
                                ...allSegmentCollection[key]
                            }
                        })
                    };
                } else {
                    singleReport = {
                        ...singleReport,
                        ...allSegmentCollection
                    };
                }

                if (finalJSON[reportId]) {  // If report ID is already been used, push to array
                    finalJSON[reportId].push(singleReport);
                } else {  // If not, create array with initial value
                    finalJSON[reportId] = [ singleReport ];
                }
            }
            // If only one report ID, report IDs are unnecessary so extract data into root object
            var finalKeys = Object.keys(finalJSON);
            if (finalKeys.length === 1) {
                finalJSON = { ...finalJSON[finalKeys[0]] }
            }
            fn(finalJSON);
        });
    } catch (err) {// if parsing XML didn't went smooth
        fn({msg: 'Err', error: err, data: data});// return the error 
    }
}