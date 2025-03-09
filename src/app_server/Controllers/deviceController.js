const axios = require('axios');
const mysql = require('mysql2/promise');
const deviceJSONController = require('./deviceJSONController');

const runningProcesses = {};
const monitoringIntervals = {};

function parseDate(dateString) {
    // Format: MM/DD/YYYY
    const [month, day, year] = dateString.split('/');
    const formattedMonth = month.padStart(2, '0');
    const formattedDay = day.padStart(2, '0');
    return `${year}-${formattedMonth}-${formattedDay}`;
}

function parseTime(timeString) {
    // Format: HH.MM.SS
    const [hour, minute, second] = timeString.split('.');
    const formattedHour = hour.padStart(2, '0');
    const formattedMinute = minute.padStart(2, '0');
    const formattedSecond = second.padStart(2, '0');
    return `${formattedHour}:${formattedMinute}:${formattedSecond}`;
}

function parseTimestamp(timeString) {
    if (!timeString || typeof timeString !== 'string') {
        console.error('Invalid timestamp input:', timeString);
        return null;
    }

    try {
        const [datePart, timePart] = timeString.split('-');
        if (!datePart || !timePart) {
            console.error('Invalid timestamp format:', timeString);
            return null;
        }

        const [month, day, year] = datePart.split('/');
        const [hour, minute, second] = timePart.split('.');

        if (!month || !day || !year || !hour || !minute || !second) {
            console.error('Invalid timestamp parts:', timeString);
            return null;
        }

        const formattedYear = year;
        const formattedMonth = month.padStart(2, '0');
        const formattedDay = day.padStart(2, '0');
        const formattedHour = hour.padStart(2, '0');
        const formattedMinute = minute.padStart(2, '0');
        const formattedSecond = second.padStart(2, '0');

        return `${formattedYear}-${formattedMonth}-${formattedDay} ${formattedHour}:${formattedMinute}:${formattedSecond}`;
    } catch (error) {
        console.error('Error parsing timestamp:', error);
        return null;
    }
}

function replaceNulls(obj) {
    if (obj === null || obj === undefined || obj === "") {
        return 0;
    } else if (Array.isArray(obj)) {
        return obj.map(replaceNulls);
    } else if (typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = replaceNulls(value);
        }
        return result;
    }
    return obj;
}

async function createDatabaseAndTable(connection) {
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS device_activity_report (
                id INT AUTO_INCREMENT PRIMARY KEY,
                root_variable INT DEFAULT NULL,
                report VARCHAR(255) DEFAULT NULL,
                \`system\` VARCHAR(255) DEFAULT NULL,
                \`timestamp\` DATETIME DEFAULT NULL,
                total_samples INT DEFAULT NULL,
                iodf_name_suffix VARCHAR(10) DEFAULT NULL,
                iodf_creation_date DATE DEFAULT NULL,
                iodf_creation_time TIME DEFAULT NULL,
                configuration_state VARCHAR(255) DEFAULT NULL,
                info JSON DEFAULT NULL,
                storage_groups JSON DEFAULT NULL,
                device_numbers JSON DEFAULT NULL,
                volume_serial_numbers JSON DEFAULT NULL,
                KEY \`idx_root_variable\` (root_variable),
                KEY \`idx_timestamp\` (\`timestamp\`)
            )
        `);

        console.log('Database and table setup completed');
    } catch (error) {
        console.error('Error in database/table creation:', error);
        throw error;
    }
}

async function insertData(connection, data, lpar) {
    try {
        const memory = await new Promise((resolve, reject) => {
            deviceJSONController.readLparData(lpar, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
        
        // Initialize processedTimestamps array if it doesn't exist
        const processedTimestamps = memory.processedTimestamps || [];
        let newDataInserted = false;
        let distinctTimestamps = new Set(); // Track distinct timestamps for this run

        // Add validation for data structure
        if (!data || typeof data !== 'object') {
            console.log('No valid data to insert');
            return;
        }

        console.log(`Previously processed timestamps count: ${processedTimestamps.length}`);
        
        for (const [rootVar, rootData] of Object.entries(data)) {
            // Add validation for timestamp
            if (!rootData || !rootData.Timestamp) {
                console.log(`Invalid data structure for root variable ${rootVar}`);
                continue;
            }

            try {
                const timestampStr = parseTimestamp(rootData.Timestamp);
                
                if (!timestampStr) {
                    console.log(`Invalid timestamp format for ${rootData.Timestamp}`);
                    continue;
                }

                // Skip if timestamp was processed in previous runs
                if (processedTimestamps.includes(timestampStr)) {
                    console.log(`Skipping timestamp ${timestampStr} - Already processed in previous runs`);
                    continue;
                }
                
                // Skip if timestamp was already processed in this run
                if (distinctTimestamps.has(timestampStr)) {
                    console.log(`Skipping timestamp ${timestampStr} - Already processed in this run`);
                    continue;
                }

                const daData = rootData['Direct Access Device Activity'];
                if (!daData) {
                    console.log(`No Direct Access Device Activity data found for root variable ${rootVar}`);
                    // Don't add to distinctTimestamps here since we're not processing it
                    continue;
                }

                // Only add to distinctTimestamps if we're actually going to process this data
                distinctTimestamps.add(timestampStr);

                const totalSamples = parseInt(daData['Total Samples']) || null;
                const iodfNameSuffix = daData['IODF Name Suffix'] || null;
                const iodfCreationDate = daData['IODF Creation Date'] ? parseDate(daData['IODF Creation Date']) : null;
                const iodfCreationTime = daData['IODF Creation Time'] ? parseTime(daData['IODF Creation Time']) : null;
                const configurationState = daData['Configuration State'] || null;

                const infoData = daData['Info'] || [];
                const storageGroups = [];
                const deviceNumbers = [];
                const volumeSerialNumbers = [];

                for (const item of infoData) {
                    if (item['Storage Group']) storageGroups.push(item['Storage Group']);
                    if (item['Device Number']) deviceNumbers.push(item['Device Number']);
                    if (item['Volume Serial Number']) volumeSerialNumbers.push(item['Volume Serial Number']);
                }

                const insertData = [
                    parseInt(rootVar),
                    rootData.Report || null,
                    rootData.System || null,
                    timestampStr,
                    totalSamples,
                    iodfNameSuffix,
                    iodfCreationDate,
                    iodfCreationTime,
                    configurationState,
                    JSON.stringify(replaceNulls(infoData)),
                    JSON.stringify(storageGroups),
                    JSON.stringify(deviceNumbers),
                    JSON.stringify(volumeSerialNumbers)
                ];

                try {
                    await connection.query(`
                        INSERT INTO device_activity_report (
                            root_variable, report, \`system\`, \`timestamp\`,
                            total_samples, iodf_name_suffix, iodf_creation_date,
                            iodf_creation_time, configuration_state, info,
                            storage_groups, device_numbers, volume_serial_numbers
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, insertData);

                    newDataInserted = true;
                } catch (error) {
                    console.error('Error inserting data:', error);
                    throw error;
                }
            } catch (error) {
                console.error(`Error processing data for root variable ${rootVar}:`, error);
                continue; // Skip this entry and continue with others
            }
        }

        // Update memory file if new data was inserted
        if (newDataInserted) {
            // Update memory file with only distinct timestamps
            const updatedTimestamps = [...processedTimestamps];
            distinctTimestamps.forEach(timestamp => {
                if (!updatedTimestamps.includes(timestamp)) {
                    updatedTimestamps.push(timestamp);
                }
            });
            
            console.log(`Updating memory with ${updatedTimestamps.length} processed timestamps (${distinctTimestamps.size} new)`);
            
            await new Promise((resolve, reject) => {
                deviceJSONController.writeLparData(lpar, { 
                    processedTimestamps: updatedTimestamps 
                }, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            console.log(`Data insertion completed successfully. Processed ${distinctTimestamps.size} new timestamps`);
        } else {
            console.log('No new data to insert');
        }
    } catch (error) {
        console.error('Error in data insertion:', error);
        throw error;
    }
}

async function fetchData(lpar, startDate, endDate, config) {
    const url = `${config.zebra_httptype}://${config.appurl}:${config.appport}/v1/${lpar}/rmfpp/DEVICE?start=${startDate}&end=${endDate}`;

    try {
        console.log(`Fetching data from: ${url}`);
        const response = await axios.get(url, {
            timeout: 300000
        });

        // Check if response contains error XML
        if (typeof response.data === 'string' && response.data.includes('GPM0743E')) {
            throw new Error('Data request too large. Try reducing the time range.');
        }

        // Check if response data is valid
        if (!response.data || typeof response.data !== 'object') {
            throw new Error('Invalid response data format');
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

function getNextDayDate(date) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
}

async function startDevice(req, res) {
    const { startDate, endDate, lpar, continuousMonitoring } = req.body;
    console.log(`startDevice called with params:`, { startDate, endDate, lpar, continuousMonitoring });

    if (runningProcesses[lpar] && runningProcesses[lpar].isRunning) {
        return res.status(400).json({ 
            success: false, 
            message: `Device process is already running for ${lpar}` 
        });
    }

    runningProcesses[lpar] = { 
        isRunning: true, 
        continuousMonitoring: continuousMonitoring,
        startDate: startDate,
        endDate: continuousMonitoring ? startDate : endDate
    };

    let mysqlConnection;
    let databaseCreated = false;

    try {
        const config = require('../../config/Zconfig.json');
        const rmfmon1Config = config.dds[lpar].rmfmon1;
        
        mysqlConnection = await mysql.createConnection({
            host: rmfmon1Config.mysql.host,
            user: rmfmon1Config.mysql.user,
            password: rmfmon1Config.mysql.password,
            multipleStatements: true
        });

        const [rows] = await mysqlConnection.query(`SHOW DATABASES LIKE '${lpar}'`);
        if (rows.length === 0) {
            await mysqlConnection.query(`CREATE DATABASE ${lpar}`);
            databaseCreated = true;
        }

        await mysqlConnection.query(`USE ${lpar}`);
        await createDatabaseAndTable(mysqlConnection);

        if (continuousMonitoring) {
            await collectData(lpar, startDate, null, config);
            startContinuousMonitoring(lpar, config);
        } else {
            await collectData(lpar, startDate, endDate, config);
            runningProcesses[lpar].isRunning = false;
        }

        res.json({ 
            success: true, 
            message: continuousMonitoring ? 'Device process started and running continuously' : 'Device process completed successfully',
            databaseCreated: databaseCreated
        });
    } catch (error) {
        console.error('Error in startDevice:', error);
        delete runningProcesses[lpar];
        res.status(500).json({ success: false, message: 'Error in Device process', error: error.message });
    } finally {
        if (!continuousMonitoring && mysqlConnection) {
            await mysqlConnection.end();
        }
    }
}

async function collectData(lpar, startDate, endDate, config) {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: config.dds[lpar].rmfmon1.mysql.host,
            user: config.dds[lpar].rmfmon1.mysql.user,
            password: config.dds[lpar].rmfmon1.mysql.password,
            database: lpar,
            multipleStatements: true
        });

        // If endDate is null (continuous monitoring), use startDate as endDate
        const effectiveEndDate = endDate || startDate;
        const data = await fetchData(lpar, startDate, effectiveEndDate, config);
        
        await connection.beginTransaction();
        await insertData(connection, data, lpar);
        await enforceDataRetention(connection, lpar);
        await connection.commit();

        // Update the startDate for next collection in continuous monitoring
        if (!endDate && runningProcesses[lpar]) {
            runningProcesses[lpar].startDate = getNextDayDate(startDate);
        }

        console.log(`Data collection cycle completed at ${new Date().toISOString()}`);
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error in data collection:', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

function startContinuousMonitoring(lpar, config) {
    const checkIntervalDays = parseInt(config.dds[lpar].rmfmon1.device.checkInterval);
    console.log(`Setting up continuous monitoring for ${lpar} with interval of ${checkIntervalDays} days`);

    monitoringIntervals[lpar] = setInterval(async () => {
        try {
            const currentStartDate = runningProcesses[lpar].startDate;
            console.log(`Collecting data for ${lpar} for date: ${currentStartDate}`);
            
            await collectData(lpar, currentStartDate, null, config);
            
            console.log(`Next collection for ${lpar} will be for date: ${runningProcesses[lpar].startDate}`);
        } catch (error) {
            console.error(`Error in continuous monitoring for ${lpar}:`, error);
        }
    }, checkIntervalDays * 24 * 60 * 60 * 1000); // Convert days to milliseconds
}

async function clearDatabase(req, res) {
    const { lpar } = req.body;
    const config = require('../../config/Zconfig.json');
    let connection;

    try {
        connection = await mysql.createConnection({
            host: config.dds[lpar].rmfmon1.mysql.host,
            user: config.dds[lpar].rmfmon1.mysql.user,
            password: config.dds[lpar].rmfmon1.mysql.password,
            database: lpar
        });

        await connection.query('TRUNCATE TABLE device_activity_report');

        // Explicitly set processedTimestamps to an empty array
        await new Promise((resolve, reject) => {
            deviceJSONController.writeLparData(lpar, { processedTimestamps: [] }, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log(`Cleared database and reset processedTimestamps for ${lpar}`);

        if (runningProcesses[lpar]) {
            delete runningProcesses[lpar];
        }

        res.json({ success: true, message: `Database ${lpar} and Device memory cleared successfully` });
    } catch (error) {
        console.error('Error clearing database and Device memory:', error);
        res.json({ success: false, message: 'Failed to clear database and Device memory: ' + error.message });
    } finally {
        if (connection) await connection.end();
    }
}

function stopContinuousMonitoring(req, res) {
    const { lpar } = req.body;
    console.log(`Attempting to stop Device process for ${lpar}`);

    if (runningProcesses[lpar]) {
        if (monitoringIntervals[lpar]) {
            clearInterval(monitoringIntervals[lpar]);
            delete monitoringIntervals[lpar];
        }
        delete runningProcesses[lpar];
        res.json({ success: true, message: `Stopped Device process for ${lpar}` });
    } else {
        res.status(400).json({ success: false, message: `No active Device process for ${lpar}` });
    }
}

function getRunningProcesses(req, res) {
    const runningProcessesInfo = {};
    for (const lpar in runningProcesses) {
        runningProcessesInfo[lpar] = {
            isRunning: runningProcesses[lpar].isRunning,
            continuousMonitoring: runningProcesses[lpar].continuousMonitoring
        };
    }
    res.json(runningProcessesInfo);
}

async function enforceDataRetention(connection, lpar) {
    try {
        const config = require('../../config/Zconfig.json');
        const retentionDays = config.dds[lpar].rmfmon1.device.dataRetention;

        if (retentionDays && retentionDays > 0) {
            const deleteQuery = `DELETE FROM device_activity_report 
                               WHERE timestamp < DATE_SUB(NOW(), INTERVAL ${retentionDays} DAY)`;
            await connection.query(deleteQuery);
            console.log(`Applied ${retentionDays} days retention policy for device in ${lpar}`);
        }
    } catch (error) {
        console.error('Error enforcing device data retention:', error);
        throw error;
    }
}

module.exports = {
    startDevice,
    clearDatabase,
    stopContinuousMonitoring,
    getRunningProcesses
}; 