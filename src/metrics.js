/**
 * THIS SCRIPT PULLS METRICS DEFINED IN 'metrics.json' AND SETS PROMETHEUS UP TO SCRAPE THEM
 */

// Packages
const axios = require('axios');
const prometheus = require('prom-client');

// Config
const { appurl, appport, use_cert, dds, rmf3interval } = require('./config/Zconfig.json');

// Metrics in memory
const metrics = require('./metrics.json');

// Scrape Prometheus metrics every RMF3 interval
setInterval(async () => {
    // Get LPARs in DDS that are set to usePrometheus = true

    // Load in metrics from JSON
    // const metrics = require('./metrics.json');

    const lpars = [];
    for (const lpar in dds) {
        if (dds[lpar].usePrometheus) {
            lpars.push(lpar);
        }
    }
    // Stop if no LPARs are using Prometheus
    if (lpars.length === 0) {
        return;
    }

    // Clear Prometheus register
    prometheus.register.clear();

    // Loop through valid LPARs
    for (const lpar of lpars) {
        // Dynamically get which DDS reports must be made to get data via the metrics
        var requests = {};
        var multi_true_request = {}
        for (const metricName in metrics) {
            var metric = metrics[metricName];
            if(metric.multi === true){
                if (metric.lpar === lpar) {
                    multi_true_request[metric.request.report + " " + (metric.request.resource ? metric.request.resource : dds[lpar]["mvsResource"])] = true;
                }
            }else{
                if (metric.lpar === lpar) {
                    requests[metric.request.report + " " + (metric.request.resource ? metric.request.resource : dds[lpar]["mvsResource"])] = true;
                }
            }
        }
        // Loop through DDS requests for single identifier 
        for (const request in requests) {
            var [ report, resource ] = request.split(" ")
            // Get XML data from DDS (this method is more efficient than calling our own API with axios)
            await axios.get(`${use_cert == 'true' ? 'https' : 'http'}://${appurl}:${appport}/v1/${lpar}/rmf3/${report}?resource=${resource}`)
                .then((response) => {
                    // Loop through metrics using this report
                    const result = response.data;
                    for (const metricName in metrics) {
                        var metric = metrics[metricName];
                        //Loop through Identifiers
                        for (var z in metric.identifiers)
                        {
                            // Check if users want data from all records in the JSON table having the metrics key
                            if(metric.identifiers[z].value === "ALL"){
                                for (i in result['table']) { // loop through the entities
                                    var mtrid = metricName.split("_")[2] // get the metric identifier provided by the user
                                    var JSONBody = result['table'][i];
                                    var name = `${lpar}_${JSONBody[metric.identifiers[z].key]}_${metric.identifiers[z].m_id}`; //append TOU(Total Utilization) to lpar name
                                    var value = JSONBody[metric.identifiers[z].field];
                                    try {
                                        (new prometheus.Gauge({
                                            name: name,
                                            help: metric.identifiers[z].desc,
                                            labelNames: ['parm']
                                        })).set({
                                            parm: metric.identifiers[z].field
                                        }, parseFloat(value));
                                    } catch (err) { 
                                        //console.log(err);
                                    }
                                }

                            }else{
                                if (metric.request.report === report && metric.request.resource === resource) {
                                    for (i in result['table']) { // loop through the entities
                                        var mtrid = metricName.split("_")[2] // get the metric identifier provided by the user
                                        var JSONBody = result['table'][i];
                                        if(JSONBody[metric.identifiers[z].key] == metric.identifiers[z].value)
                                        {
                                            var name = `${lpar}_${JSONBody[metric.identifiers[z].key]}_${metric.identifiers[z].m_id}`; //append TOU(Total Utilization) to lpar name
                                            var value = JSONBody[metric.identifiers[z].field];
                                            if (!value) {
                                                // console.log(`WARNING: Could not find field '${metric.field}' in report '${report}' for Prometheus metric '${metricName}'. Field could be missing because its value is 0, but make sure field is valid key.`);
                                                continue;
                                            }
                                            if (!isNumeric(value)) {
                                                console.log(`ERROR: Non-numeric error - the field '${metric.identifiers[z].field}' in report '${report}' for Prometheus metric '${metricName}' is not numeric.`);
                                                continue;
                                            }
                                            try {
                                                (new prometheus.Gauge({
                                                    name: name,
                                                    help: metric.identifiers[z].desc,
                                                    labelNames: ['parm']
                                                })).set({
                                                    parm: metric.identifiers[z].field
                                                }, parseFloat(value));
                                            } catch (err) { 
                                                //console.log(err);
                                            }
                                            break;
                                        }
                                        
                                    }
                                }
                            }
                        }    
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }

        // Loop through DDS requests for multiple identifier 
        for (const request in multi_true_request) {
            var [ report, resource ] = request.split(" ")
            // Get XML data from DDS (this method is more efficient than calling our own API with axios)
            await axios.get(`${use_cert == 'true' ? 'https' : 'http'}://${appurl}:${appport}/v1/${lpar}/rmf3/${report}?resource=${resource}`)
                .then((response) => {
                    // Loop through metrics using this report
                    const result = response.data;
                    for (const metricName in metrics) {
                        var metric = metrics[metricName];
                        //Loop through Identifiers
                        for (var z in metric.identifiers)
                        {
                            /* console.log(metric.identifiers[z].id[0].key)
                            console.log(metric.identifiers[z].id[1].key)
                            console.log("==================") */
                            //Check if users want data from all records in the JSON table having the metrics key
                             if(metric.identifiers[z].id[0].value === "ALL" && metric.identifiers[z].id[1].value === "ALL"){
                                for (i in result['table']) { // loop through the entities
                                    var JSONBody = result['table'][i];
                                    var name = `${lpar}_${JSONBody[metric.identifiers[z].id[0].key]}_${JSONBody[metric.identifiers[z].id[1].key]}_${metric.identifiers[z].m_id}`; //append TOU(Total Utilization) to lpar name
                                    var value = JSONBody[metric.identifiers[z].field];
                                    try {
                                        (new prometheus.Gauge({
                                            name: name,
                                            help: metric.identifiers[z].desc,
                                            labelNames: ['parm']
                                        })).set({
                                            parm: metric.identifiers[z].field
                                        }, parseFloat(value));
                                    } catch (err) { 
                                        //console.log(err);
                                    }
                                }

                            }else{
                                if (metric.request.report === report && metric.request.resource === resource) {
                                    for (i in result['table']) { // loop through the entities
                                        var JSONBody = result['table'][i];
                                        //console.log(JSONBody[metric.identifiers[z].id[0].key] == metric.identifiers[z].id[0].value)
                                        if(JSONBody[metric.identifiers[z].id[0].key] == metric.identifiers[z].id[0].value || JSONBody[metric.identifiers[z].id[1].key] == metric.identifiers[z].id[1].value)
                                        {
                                            var name = `${lpar}_${JSONBody[metric.identifiers[z].id[0].key]}_${JSONBody[metric.identifiers[z].id[1].key]}_${metric.identifiers[z].m_id}`; //append TOU(Total Utilization) to lpar name
                                            var value = JSONBody[metric.identifiers[z].field];
                                            if (!value) {
                                                // console.log(`WARNING: Could not find field '${metric.field}' in report '${report}' for Prometheus metric '${metricName}'. Field could be missing because its value is 0, but make sure field is valid key.`);
                                                continue;
                                            }
                                            if (!isNumeric(value)) {
                                                console.log(`ERROR: Non-numeric error - the field '${metric.identifiers[z].field}' in report '${report}' for Prometheus metric '${metricName}' is not numeric.`);
                                                continue;
                                            }
                                            try {
                                                (new prometheus.Gauge({
                                                    name: name,
                                                    help: metric.identifiers[z].desc,
                                                    labelNames: ['parm']
                                                })).set({
                                                    parm: metric.identifiers[z].field
                                                }, parseFloat(value));
                                            } catch (err) { 
                                                console.log(err);
                                            }
                                            break;
                                        }
                                        
                                    }
                                }
                            }
                        }    
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }
}, parseInt(rmf3interval) * 1000);

console.log("Prometheus scraping started");

// HELPER FUNCTION TO GET PROPER VALUE OF FIELD KEY IN JSON RESULT
function getValue (data, metric) {
    // Check through caption if it exists
    if (data["caption"]) {
        for (const key in data["caption"]) {
            if (key === metric.identifiers[z].field) {
                return data["caption"][metric.identifiers[z].field];
            }
        }
    }
    // Check through table for value
    if (data["table"]) {
        for (const entity of data["table"]) {
            var passes = true;
            for (const condition of metric.identifiers) {
                if (entity[condition.key] !== condition.value) {
                    passes = false;
                    break;
                }
            }
            if (passes) {
                return entity[metric.identifiers[z].field];
            }
        }
    }
    return null;
}

// HELPER FUNCTION TO CHECK IF FOUND VALUE IS FLOAT
function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

module.exports = metrics;
