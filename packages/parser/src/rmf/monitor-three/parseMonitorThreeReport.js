var xml2js = require('xml2js'); //Import xml2js module
var parser = new xml2js.Parser(); //Initialize parser
var fs = require('fs'); //Import fs module

/**
 * RMF3bodyParser handles conversion of Monitor III XML data to JSON
 * @param {XML} data - XML data passed to function
 * @param {JSON} fn - Callback function that returns parsed JSON
 */
module.exports = async function parseMonitorThreeReport (xml) {
    try {
        const result = parser.parseStringPromise(xml);
        //Variables initialization from XML attributes
        var timestart = result['ddsml']['report'][0]['time-data'][0]['display-start'][0]['_']; //Initialize timestart variable
        var timeend = result['ddsml']['report'][0]['time-data'][0]['display-end'][0]['_']; //Initialize timeend variable
        var columnheader = result['ddsml']['report'][0]['column-headers'][0]['col']; //initialize columnhead variable
        var desc = result['ddsml']['report'][0]['metric'][0]['description'][0]; //initialize desc variable
        try { //not all reports have the caption XML attribute and this leads to error if the attribute is missing
            var tablebody = result['ddsml']['report'][0]['row']; //initialize tablebody variable
            var caption = result['ddsml']['report'][0]['caption'][0]['var']; //initialize caption variable
        }
        catch (err) {
        }
        //Collections 
        captions = {}; //collection for caption name and value pairs from XML
        tbody = []; //collection for table body name and value pairs from XML
        parsedJSON = {}; //Collection for JSON from parsed monitor III XML
        columnhead = []; //Collection for column header name and value pairs from XML

        //Loop for Column Header XML Atribute
        for (i in columnheader) {
            columnhead[i] = columnheader[i]['_']; //populate the colunmhead collection
        };
        var fLen = columnhead.length;  //get the length of the columnhead collection

        //Loop for Rows XML Attributes
        if (tablebody != undefined) {  //check if XML contains table body
            for (k in tablebody) { // Loop through table body
                var v = {}; // a temporary collection
                for (i = 0; i < fLen; i++) { //
                    v[columnhead[i]] = tablebody[k]['col'][i]; // loop through rows in tavle body of XML
                }
                tbody.push(v);  //Push rows to tbody collection
            }
        }


        //Loop for Caption XML Attribute
        if (caption === undefined) { //Check if capion varible is undefined
            //if caption is undefined, create final collection without caption key value pairs
            parsedJSON.title = desc; // parsed JSON title key value pair
            parsedJSON.timestart = timestart; // parsed JSON timestart key value pair
            parsedJSON.timeend = timeend; // parsed JSON timeend key value pair
            parsedJSON.columnhead = columnhead; // parsed JSON columnhead key value pair
            parsedJSON.table = tbody; // parsed JSON table key value pair

        } else {
            //if caption is defined, create final collection with caption key value pairs
            for (i in caption) { //loop through cation XML Attributes
                captions[caption[i].name[0]] = caption[i].value[0]; //Populate caption collection
            };
            parsedJSON.title = desc; // parsed JSON title key value pair
            parsedJSON.timestart = timestart; // parsed JSON timestart key value pair
            parsedJSON.timeend = timeend; // parsed JSON timeend key value pair
            parsedJSON.caption = captions;  //caption key value pairs
            parsedJSON.columnhead = columnhead; // parsed JSON columnhead key value pair
            parsedJSON.table = tbody; // parsed JSON table key value pair

        }
        return parsedJSON;
    } catch (err) {
        throw new Error("Something went wrong when attempting to parse XML document: " + err.message);
    }
};