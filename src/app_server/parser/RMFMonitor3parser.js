var xml2js = require('xml2js'); //Import xml2js module
var parser = new xml2js.Parser(); //Initialize parser
var fs = require('fs'); //Import fs module

/**
 * RMF3bodyParser handles conversion of Monitor III XML data to JSON
 * @param {XML} data - XML data passed to function
 * @param {JSON} fn - Callback function that returns parsed JSON
 */
module.exports.RMF3bodyParser = function (data, fn) {
    parser.parseString(data, function (err, result) {
        try {
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
            fn(parsedJSON); //return parsed JSON
        } catch (err) {
            fn({msg: 'Err', error: err, data: data});
            /*if(Object.keys(err).length === 0){
                fn("DE")
            }else{
                fn(err);
            }*/
            //fn("Parsing RMF III XML Failed! Check Connection to DDS server");
            
        }

    });

}

module.exports.RMF3fieldParser = function (data, fn) {
    parser.parseString(data, function (err, result) {
        if (err) {
            fn({msg: 'Err', error: err, data: data});
        }
        try {
            parsedJSON = {};
            parsedJSON.description = result['ddsml']['report'][0]['metric'][0]['description'][0]; // Initialize description of field
            parsedJSON.timestart = result['ddsml']['report'][0]['time-data'][0]['display-start'][0]['_']; //Initialize timestart variable
            parsedJSON.timeend = result['ddsml']['report'][0]['time-data'][0]['display-end'][0]['_']; //Initialize timeend variable
            parsedJSON.value = {} // Initialize table variable
            
            // loop through table in XML and add to data in JSON
            rows = result['ddsml']['report'][0]['row'];
            let index = 0
            let lastVal = null;
            rows.forEach( row => {
                let key = row['col'][0];
                if (key === "" || !key) {
                    key = `value ${index + 1}`;
                }
                let val = row['col'].slice(1);
                if (val.length === 1) {
                    val = val[0];
                }
                parsedJSON.value[key] = val;
                lastVal = val;
                index++;
            });
            if (index === 1) {
                parsedJSON.value = lastVal;
            } else if (index === 0) {
                parsedJSON.value = null;
            }

            fn(parsedJSON); //return parsed JSON

        } catch(err) {
            fn({msg: 'Err', error: err, data: data});
        }
    });
}

module.exports.RMF3idListParser = function (data, fn) {
    parser.parseString(data, function (err, result) {
        if (err) {
            fn({msg: 'Err', error: err, data: data});
        }
        try {
            parsedJSON = {};
            parsedJSON.title = "Metric ID numbers mapped to their associated descriptions";
            parsedJSON.resource = result['ddsml']['metric-list'][0]['resource'][0]['reslabel'][0];
            parsedJSON.metrics = {}
            let metrics = result['ddsml']['metric-list'][0]['metric'];
            metrics.forEach( metric => {
                if (!metric['description']) {
                    return;
                }
                parsedJSON.metrics[metric['$']['id']] = metric['description'][0];
            });
            fn(parsedJSON); //return parsed JSON

        } catch(err) {
            fn({msg: 'Err', error: err, data: data});
        }
    });
}