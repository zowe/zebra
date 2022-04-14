// Using old JS parsing algorithm for now
// TODO: Update parser

const xml2js = require("xml2js");
// Import xml2js library
const parser = new xml2js.Parser(); // Initialize xml2js parser
// transform all attribute and tag names and values to uppercase

/**
 * General parser for parsing RMF monitor I XML data to JSON - OLD VERSION
 * @param {string} xml - Workload XML data from RMF Monitor I
 */
module.exports = async function parsePostprocessorReport(xml) {
  try {
    const result = await parser.parseStringPromise(xml);
    let finalJSON = {}; // Collection for storing JSON of Parsed XML
    const postprocessors = result.ddsml.postprocessor;
    for (a in postprocessors) {
    // Loop through postprocessor sections
    let singleReport = {};
    const segments = postprocessors[a].segment;
    const resourceName = postprocessors[a].resource[0].resname[0];
    const reportId = postprocessors[a].metric[0].$.id;
    var allSegmentCollection = {};
    for (b in segments) {
        // Loop through segment sections
        const parts = segments[b].part;
        const segmentName = segments[b].name[0];
        const message = segments[b]['message']; // represent segment message value in the XML
        let partCollection = {};
        for (c in parts) {
        // Loop through part sections
        let partName = parts[c].name;
        const varlist = parts[c]["var-list"];
        const { table } = parts[c];
        let fieldCollection = {};

        if (varlist) {
            // If part contains a list of variables
            const variables = varlist[0].var;
            for (d in variables) {
            fieldCollection[variables[d].name[0]] = variables[d].value[0];
            }
        }

        if (table) {
            // If part contains a table
            const tableColumnHeader = table[0]["column-headers"][0].col;
            const tableBody = table[0].row;
            const columnheadCollection = [];
            const finalTableReport = [];
            for (i in tableColumnHeader) {
            columnheadCollection[i] = tableColumnHeader[i]._
                ? tableColumnHeader[i]._
                : "Name";
            }

            if (tableBody !== undefined) {
            // If table is not empty
            for (i in tableBody) {
                const partTable = {};
                for (j in columnheadCollection) {
                partTable[columnheadCollection[j]] = tableBody[i].col[j];
                }
                finalTableReport.push(partTable);
            }
            }

            if (!varlist) {
            // If part contains only table and no var list
            fieldCollection = finalTableReport;
            } else {
            fieldCollection.Table = finalTableReport;
            }
        }

        if (partName && Array.isArray(partName)) {
            // Makes sure that partName is not an array (special case)
            partName = partName[0];
        }
        if (partName && partName !== "") {
            // If part already has a name
            partCollection[partName] = fieldCollection;
        } else {
            partCollection.Info = fieldCollection;
        }

        // Removes unnecessary INFO tag if it is only part of segment
        if (
            Object.keys(partCollection).length === 1 &&
            Object.keys(partCollection)[0] === "Info"
        ) {
            partCollection = { ...partCollection.Info };
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
    singleReport.Report = postprocessors[a].metric[0].description[0];
    singleReport.System = resourceName;
    singleReport.Timestamp =
        postprocessors[a]["time-data"][0]["display-start"][0]._;
    if (reportId === "WLMGL") {
        // SPECIAL CASE MAPPING
        const segKeys = Object.keys(allSegmentCollection);
        singleReport = {
        ...singleReport,
        Classes: segKeys.map((key) => {
            return {
            Name: key,
            ...allSegmentCollection[key],
            };
        }),
        };
    } else {
        singleReport = {
        ...singleReport,
        ...allSegmentCollection,
        };
    }

    if (finalJSON[reportId]) {
        // If report ID is already been used, push to array
        finalJSON[reportId].push(singleReport);
    } else {
        // If not, create array with initial value
        finalJSON[reportId] = [singleReport];
    }
    }
    // If only one report ID, report IDs are unnecessary so extract data into root object
    const finalKeys = Object.keys(finalJSON);
    if (finalKeys.length === 1) {
    finalJSON = { ...finalJSON[finalKeys[0]] };
    }
    return finalJSON;
  } catch (err) {
    // if parsing XML didn't went smooth
    throw new Error("Something went wrong when attempting to parse XML document: " + err.message);
  }
};
