/**
 * THIS SCRIPT PULLS METRICS DEFINED IN 'metrics.json' AND SETS PROMETHEUS UP TO SCRAPE THEM
 */

// Packages
const axios = require('axios');
const prometheus = require('prom-client');

// Config
let appurl, appport, use_cert, dds, rmf3interval;

try {
  const config = require('./config/Zconfig.json');
  ({ appurl, appport, use_cert, dds, rmf3interval } = config);
} catch (error) {
  console.error("Error loading Zconfig.json:", error.message);
  // Provide default values
  appurl = 'localhost';
  appport = 3000;
  use_cert = false;
  dds = {};
  rmf3interval = 100;
}

// Now you can use these variables, whether they came from the config file or the default values
// Object to store metrics
let metrics = {};

// Function to sanitize metric names
function sanitizeMetricName(name) {
    return name.replace(/[^a-zA-Z0-9_]/g, '_'); // Replace any invalid characters with underscores
}

// Function to reload and scrape Prometheus metrics
function reloadMetrics() {
    // Load metrics from the JSON file into the metrics object
    metrics = require('./metrics.json');

    // Get a list of LPARs in DDS where usePrometheus is set to true
    const lpars = [];
    for (const lpar in dds) {
        if (dds[lpar].usePrometheus) {
            lpars.push(lpar);
        }
    }

    // Stop execution if no LPARs are set to use Prometheus
    if (lpars.length === 0) {
        return;
    }

    // Clear any existing Prometheus metrics to avoid duplicates
    prometheus.register.clear();

    // Iterate over each valid LPAR
    for (const lpar of lpars) {
        // Create an object to store unique DDS requests based on report and resource
        const requests = {};
        for (const metricName in metrics) {
            const metric = metrics[metricName];
            // Check if the metric is associated with the current LPAR
            if (metric.lpar === lpar) {
                // Add a unique request key to the requests object
                requests[metric.request.report + " " + (metric.request.resource ? metric.request.resource : dds[lpar]["mvsResource"])] = true;
            }
        }

        // Iterate over each unique DDS request
        for (const request in requests) {
            const [report, resource] = request.split(" ");
            // Fetch XML data from DDS using axios, this method is more efficient than calling our own API
            axios.get(`${use_cert === 'true' ? 'https' : 'http'}://${appurl}:${appport}/v1/${lpar}/rmf3/${report}?resource=${resource}`)
                .then((response) => {
                    const result = response.data;

                    // Process each metric for the current LPAR and DDS request
                    for (const metricName in metrics) {
                        const metric = metrics[metricName];
                        // Check if the metric matches the current report and resource
                        if (metric.request.report === report && metric.request.resource === resource) {
                            // Handle the case where the identifier value is "ALL"
                            if (metric.identifiers[0].value === "ALL") {
                                for (const entity of result['table']) {
                                    const identifierKey = metric.identifiers[0].key;
                                    const identifierValue = entity[identifierKey];
                                    const fieldValue = entity[metric.field];
                                    // Dynamically generate the metric name
                                    const dynamicMetricName = sanitizeMetricName(`${lpar}_${identifierValue}_${metricName.split("_")[2]}`);

                                    // Create a new Prometheus gauge for the metric
                                    const gauge = new prometheus.Gauge({
                                        name: dynamicMetricName,
                                        help: metric.desc,
                                        labelNames: ['parm']
                                    });

                                   //console.log(`Processing metric: ${dynamicMetricName}`);

                                    //console.log(`Field value: ${fieldValue}`);



                                    // Set the gauge value, handling NaN cases appropriately

                                    if (fieldValue === undefined || fieldValue === null || fieldValue === "" || isNaN(parseFloat(fieldValue))) {

                                        //console.log(`Setting NaN for ${dynamicMetricName}`);

                                        gauge.set({ parm: metric.field }, NaN);

                                    } else if (isNumeric(fieldValue)) {

                                        //console.log(`Setting value for ${dynamicMetricName}: ${fieldValue}`);

                                        gauge.set({ parm: metric.field }, parseFloat(fieldValue));

                                    } else {

                                        //console.log(`Setting NaN for ${dynamicMetricName}`);

                                        gauge.set({ parm: metric.field }, NaN);

                                    }

                                }

                            } else {

                                // Handle specific identifier value case

                                const value = getValue(result, metric);

                                const sanitizedMetricName = sanitizeMetricName(metricName);



                                // Create a new Prometheus gauge for the metric

                                const gauge = new prometheus.Gauge({

                                    name: sanitizedMetricName,

                                    help: metric.desc,

                                    labelNames: ['parm']

                                });



                                //console.log(`Processing metric: ${sanitizedMetricName}`);

                                //console.log(`Field value: ${value}`);



                                // Set the gauge value, handling NaN cases appropriately

                                if (value === undefined || value === null || value === "" || isNaN(parseFloat(value))) {

                                    //console.log(`Setting NaN for ${sanitizedMetricName}`);

                                    gauge.set({ parm: metric.field }, NaN);

                                } else if (isNumeric(value)) {

                                    //console.log(`Setting value for ${sanitizedMetricName}: ${value}`);

                                    gauge.set({ parm: metric.field }, parseFloat(value));

                                } else {

                                    //console.log(`Setting NaN for ${sanitizedMetricName}`);

                                    gauge.set({ parm: metric.field }, NaN);

                                }

                            }

                        }

                    }

                })

                .catch((err) => {

                    // Log any errors encountered during the axios request

                    //console.error(`Error processing ${request}:`, err);

                });

        }

    }

}

// Set an interval to also run the reloadMetrics function every RMF3 interval as it did before 
setInterval(reloadMetrics, parseInt(rmf3interval) * 1000);

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
            var passes = true;
            for (const condition of metric.identifiers) {
                if (entity[condition.key] !== condition.value) {
                    passes = false;
                    break;
                }
            }
            if (passes) {
                return entity[metric.field];
            }
        }
    }
    return null;
}

// HELPER FUNCTION TO CHECK IF FOUND VALUE IS FLOAT
function isNumeric(str) {
    return typeof str === "string" && !isNaN(str) && !isNaN(parseFloat(str));
}

// Exporting both the metrics and the reload function
module.exports = {
    reloadMetrics,
    getMetrics: () => metrics, // Function to get the current metrics
};