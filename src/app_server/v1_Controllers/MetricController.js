const express = require('express');
const fs = require('fs');
const path = require('path');
const { Validator } = require('jsonschema');
const METRICS_PATH = path.resolve(__dirname, '../../metrics.json');


/**
 * Saves changes to JSON file containing metrics.
 * 
 * @param {fs.NoParamCallback} cb callback function
 */
const saveMetrics = (metrics, cb) => {
    fs.writeFile(METRICS_PATH, JSON.stringify(metrics), (err) => {
        if (err) {
            cb(err);
        } else {
            cb(null);
        }
    });
};


/**
 * Callback for validating the request body
 *
 * @callback BodyValidationCallback
 * @param {boolean} valid - true if valid, false if invalid
 * @param {string} msg - describes the issues if any found
 */

/**
 * Makes sure the request body is following the right schema
 * 
 * @param {ReadableStream<Uint8Array>} body - request body
 * @param {BodyValidationCallback} cb callback function
 */
const validateBody = (body, cb) => {
    const v = new Validator();
    const requestSchema = {
        "id": "/Request",
        "type": "object",
        "properties": {
            "report": { "type": "string" },
            "resource": { "type": "string" }
        },
        "required": ["report"]
    };
    const identifierSchema = {
        "id": "/Identifier",
        "type": "array",
        "items": {
            "properties": {
                "key": { "type": "string" },
                "value": { "type": "string" } 
            },
            "required": ["key", "value"]
        }
    };
    const metricSchema = {
        "id": "/Metric",
        "type": "object",
        "properties": {
            "lpar": { "type": "string" },
            "request": { "$ref": "/Request" },
            "identifiers": { "$ref": "/Identifier" },
            "field": { "type": "string" },
            "desc": { "type": "string" }
        },
        "required": ["lpar", "request", "field"]
    };
    v.addSchema(requestSchema, '/Request');
    v.addSchema(identifierSchema, '/Identifier');
    v.addSchema(metricSchema, '/Metric');
    const result = v.validate(body, metricSchema);
    if (result.valid) {
        cb(true, "");
    } else {
        var msg = "Invalid request body:\n\n";
        for (const error of result.errors) {
            msg += `'${error.name}' -> '${error.argument}'\n`;
        }
        cb(false, msg);
    }
}


/**
 * Creates a metric and saves the result to metrics.json
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
module.exports.create = (req, res) => {
    try {
        const metrics = require('../../metrics.json');
        const metricBody = req.body;
        const metricName = req.params.metric;
        if (!metricName) {
            res.status(404).json({ msg: `Metric name not provided.`, err: true });
            return;
        }
        validateBody(metricBody, (valid, msg) => {
            if (!valid) {
                res.status(400).json({ msg, err: true });
                return;
            }
            // Verify all
            if (metrics[metricName]) {
                res.status(400).json({ msg: `Metric '${metricName}' already exists.'`, err: true });
                return;
            }
            // Make changes
            metrics[metricName] = metricBody[metricName];
            saveMetrics(metrics, (err) => {
                if (err) {
                    delete metrics[metricName];
                    res.status(500).json({ msg: "Unable to save changes in metrics.", err: true })
                    return;
                }
                res.status(201).json({ msg: "Metrics were successfully created.", err: false });
                return;
            });
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({ msg: "Something went wrong.", err: true });
        return;
    }
}


/**
 * Retrieves all metrics in memory
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
module.exports.retrieve = (req, res) => {
    try {
        const metrics = require('../../metrics.json');
        if (!metrics) {
            res.status(404).json({ msg: "No metrics found.", err: true });
            return;
        }
        res.status(200).json({ metrics, msg: "Metrics successfully retrieved.", err: false });
        return;
    } catch(err) {
        res.status(500).json({ msg: "Something went wrong." });
        return;
    }
}


/**
 * Retrieves the given metric in the request parameters
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
module.exports.retrieveOne = (req, res) => {
    try {
        const metrics = require('../../metrics.json');
        const metricName = req.params.metric;
        if (!metrics || !metricName || !metrics[metricName]) {
            res.status(404).json({ msg: `Metric '${metricName}' not found.`, err: true });
            return;
        }
        res.status(200).json({ metric: metrics[metricName], msg: `Metric '${metricName}' successfully retrieved`, err: false });
        return;
    } catch(err) {
        res.status(500).json({ msg: "Something went wrong.", err: true });
        return;
    }
}


/**
 * Updates the contents of the given metric in the request parameters and saves the result to metrics.json
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
module.exports.update = (req, res) => {
    try {
        const metrics = require('../../metrics.json');
        const metricBody = req.body;
        const metricName = req.params.metric;
        if (!metrics || !metricName || !metrics[metricName]) {
            res.status(404).json({ msg: `Metric '${metricName}' does not exist.`, err: true });
            return;
        }
        validateBody(metricBody, (valid, msg) => {
            if (!valid) {
                res.status(400).json({ msg, err: true });
                return;
            }
            if (!metrics[metricName]) {
                res.status(404).json({ msg: `Metric '${metricName}' does not exist.'`, err: true });
                return;
            }
            const oldMetric = metrics[metricName];
            metrics[metricName] = metricBody[metricName];
            saveMetrics(metrics, (err) => {
                if (err) {
                    metrics[metricName] = oldMetric;
                    res.status(500).json({ msg: "Unable to save changes in metrics.", err: true })
                    return;
                }
                res.status(201).json({ msg: "Metrics were successfully created.", err: false });
                return;
            });
        });
    } catch(err) {
        res.status(500).json({ msg: "Something went wrong." });
        return;
    }
}


/**
 * Deletes the given metric in the request parameters and saves the results to metrics.json
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
module.exports.delete = (req, res) => {
    try {
        const metrics = require('../../metrics.json');
        const metricName = req.params.metric;
        if (!metrics || !metricName || !metrics[metricName]) {
            res.status(404).json({ msg: `Metric '${metricName}' does not exist.`, err: true });
            return;
        }
        const oldMetric = metrics[metricName];
        delete metrics[metricName];
        saveMetrics(metrics, (err) => {
            if (err) {
                metrics[metricName] = oldMetric;
                res.status(500).json({ msg: "Unable to save changes in metrics.", err: true })
                return;
            }
            res.status(200).json({ msg: `Metric '${metricName}' was successfully deleted.`, err: false });
            return;
        });
    } catch(err) {
        res.status(500).json({ msg: "Something went wrong." });
        return;
    }
}
