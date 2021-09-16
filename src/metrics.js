/**
 * THIS SCRIPT PULLS METRICS DEFINED IN 'metrics.json' AND SETS PROMETHEUS UP TO SCRAPE THEM
 */

// Packages
const prometheus = require('prom-client');

// Config
const { rmf3interval, dds } = require('./config/Zconfig.json');

// Helpers
const parse = require('./app_server/parser/RMFMonitor3parser').RMF3bodyParser;
const getDDS = require('./app_server/v1_Controllers/RMF3Controller').getDDS;

// Load in metrics from JSON
const metrics = require('./metrics.json');

// Scrape Prometheus metrics every RMF3 interval
setInterval(async () => {
    // Get LPARs in DDS that are set to usePrometheus = true
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
        for (const metricName in metrics) {
            var metric = metrics[metricName];
            if (metric.lpar === lpar) {
                requests[metric.request.report + " " + metric.request.resource] = true;
            }
        }
        // Loop through DDS requests
        for (const request in requests) {
            var [ report, resource ] = request.split(" ")
            var { ddshhttptype, ddsbaseurl, ddsbaseport, rmf3filename, ddsuser, ddspwd, ddsauth } = dds[lpar];
            // Get XML data from DDS (this method is more efficient than calling our own API with axios)
            getDDS(ddshhttptype, ddsbaseurl, ddsbaseport, rmf3filename, { report, resource }, ddsuser, ddspwd, ddsauth, (data) => { 
                if (data !== "DE" && data !== "NE" && data !== "UA" && data !== "EOUT") {
                    // Parse the result
                    parse(data, function (result) {
                        if(result["msg"]){ //Data Error from parser, when parser cannor parse the XML file it receives 
                            console.log(`Could not parse DDS results for Prometheus scrape (${report}): ${result["msg"]}`);
                        } else{
                            // Loop through metrics using this report
                            for (const metricName in metrics) {
                                var metric = metrics[metricName];
                                if (metric.request.report === report && metric.request.resource === resource) {
                                    // Get value of metric
                                    var value = getValue(result, metric);
                                    // If no match, log error and continue
                                    if (!value) {
                                        console.log(`Could not find field '${metric.field}' in report '${report}' for Prometheus metric '${metricName}'`);
                                        continue;
                                    }
                                    // If non numeric value is chosen, log error and continue
                                    if (!isNumeric(value)) {
                                        console.log(`Non-numeric error - the field '${metric.field}' in report '${report}' for Prometheus metric '${metricName}' is not numeric.`);
                                        continue;
                                    }
                                    try{
                                        (new prometheus.Gauge({
                                            name: metricName,
                                            help: metric.desc,
                                            labelNames: ['parm']
                                        })).set({
                                            parm: metric.field
                                        }, parseFloat(value));
                                    } catch(err) {
                                        console.log(err);
                                    }
                                }
                            }
                        }
                    });
                } else {
                    console.log(`Could not make DDS request for ${report} for Prometheus scrape`);
                }
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
            if (key === metric.field) {
                return data["caption"][metric.field];
            }
        }
    }
    // Check through table for value
    if (data["table"]) {
        for (const entity of data["table"]) {
            if (metric.id && entity[metric.id.key] === metric.id.value) {
                return entity[metric.field];
            } else if (!metric.id) {
                return entity[metric.field];
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