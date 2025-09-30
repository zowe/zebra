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

/**
 * Replaces any character that is NOT a letter, number, or underscore with an underscore.
 * @param {string} name The metric name to sanitize.
 * @returns {string} The sanitized metric name.
 */
function sanitizeMetricName(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, '_');
}

// Add this function to properly handle 3.1 format data
function process31FormatData(data, metric, lpar) {
    const results = [];
    if (!data.data) return results;

    data.data.forEach(row => {
        const identifierValue = row[metric.identifiers[0].key];
        const metricValue = row[metric.field];
        
        if (identifierValue && metricValue && metricValue !== "") {
            try {
                const mtrid = metric.name.split("_")[2];
                const name = `${lpar}_${identifierValue}_${mtrid}`;
                
                if (!isNaN(metricValue)) {
                    results.push({
                        name: name,
                        value: parseFloat(metricValue)
                    });
                }
            } catch (err) {
                console.log(`Error processing metric ${metric.name}:`, err);
            }
        }
    });
    return results;
}

// Maintain a map of created gauges so we don't re-create them
const metricGauges = {};

// The main scraping and registration loop
setInterval(async () => {
    try {
        const lpars = [];
        for (const lpar in dds) {
            if (dds[lpar].usePrometheus) {
                lpars.push(lpar);
            }
        }
        if (lpars.length === 0) return;

        for (const lpar of lpars) {
            const requests = {};
            for (const metricName in metrics) {
                const metric = metrics[metricName];
                if (metric.lpar === lpar) {
                    requests[metric.request.report] = metric.request.resource || dds[lpar]["mvsResource"];
                }
            }

            for (const report in requests) {
                const resource = requests[report];
                try {
                    const url = `${use_cert == 'true' ? 'https' : 'http'}://${appurl}:${appport}/v1/${lpar}/rmf3/${report}?resource=${resource}`;
                    const response = await axios.get(url);
                    const result = response.data;

                    Object.entries(metrics)
                        .filter(([_, m]) => m.lpar === lpar && m.request.report === report)
                        .forEach(([metricName, metric]) => {
                            if (metric.identifiers[0].value === "ALL") {
                                let metricsToRegister = [];
                                
                                if (result.data) {
                                    metricsToRegister = process31FormatData(result, { ...metric, name: metricName }, lpar);
                                } else if (result.table) {
                                    result.table.forEach(row => {
                                        const identifierValue = row[metric.identifiers[0].key];
                                        const metricValue = row[metric.field];
                                        
                                        if (identifierValue && metricValue && metricValue !== "" && !isNaN(metricValue)) {
                                            const mtrid = metricName.split("_")[2];
                                            const name = `${lpar}_${identifierValue}_${mtrid}`;
                                            metricsToRegister.push({
                                                name: name,
                                                value: parseFloat(metricValue)
                                            });
                                        }
                                    });
                                }

                                metricsToRegister.forEach(m => {
                                    const safeName = sanitizeMetricName(m.name);
                                    try {
                                        if (!metricGauges[safeName]) {
                                            metricGauges[safeName] = new prometheus.Gauge({
                                                name: safeName,
                                                help: `${metric.desc} (original_name: ${m.name})`,
                                                labelNames: ['parm']
                                            });
                                            // console.log(`[Metrics] Created new Prometheus gauge: ${safeName} (from ${m.name})`);
                                        }
                                        metricGauges[safeName].set({ parm: metric.field }, m.value);
                                    } catch (err) {
                                        console.error(`[Metrics] Error processing metric (Original: ${m.name}, Sanitized: ${safeName}):`, err.message);
                                    }
                                });
                            }
                        });
                } catch (error) {
                    console.error(`[Metrics] Error fetching report '${report}' for LPAR '${lpar}':`, error.message);
                }
            }
        }
    } catch (error)        {
        console.error('[Metrics] A critical error occurred in the scrape cycle:', error);
    }
}, parseInt(rmf3interval) * 1000);

console.log("Prometheus scraping service started.");

function handle31Format(data, metric) {
    if (metric.identifiers[0].value === "ALL") {
        const results = [];
        if (data.report && data.report[0] && data.report[0].row) {
            const report = data.report[0];
            const columnMap = {};
            if (report.columnHeaders && report.columnHeaders.col) {
                report.columnHeaders.col.forEach((col, index) => {
                    columnMap[index] = col.value;
                });
            }
            report.row.forEach(row => {
                const rowData = {};
                row.col.forEach((value, index) => {
                    rowData[columnMap[index]] = value;
                });
                const identifierValue = rowData[metric.identifiers[0].key];
                const metricValue = rowData[metric.field];
                if (identifierValue && metricValue && metricValue !== "") {
                    results.push({
                        identifier: identifierValue,
                        value: metricValue
                    });
                }
            });
            return results;
        }
    }
    if (data.report && data.report[0] && data.report[0].caption && data.report[0].caption.var) {
        const captionVar = data.report[0].caption.var.find(item => item.name === metric.field);
        if (captionVar && captionVar.value !== "") {
            return captionVar.value;
        }
    }
    return null;
}

function getValue(data, metric) {
    if (data.report || data.captions || data.data) {
        return handle31Format(data, metric);
    }
    if (data.caption) {
        for (const key in data.caption) {
            if (key === metric.field) {
                return data.caption[metric.field];
            }
        }
    }
    if (data.table) {
        for (const entity of data.table) {
            let passes = true;
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

function isNumeric(str) {
    if (typeof str != "string") return false;
    return !isNaN(str) && !isNaN(parseFloat(str));
}

module.exports = metrics;