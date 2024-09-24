// app_server/Controllers/hmaiController.js
const FTP = require('ftp');
const mysql = require('mysql2/promise');
const path = require('path');
try{
    var config = require("../../config/Zconfig.json");
  }catch(e){
    var config = {};
  }
var hmaiJSONcontroller = require('./hmaiJSONcontroller');
const stream = require('stream');
const monitoringIntervals = {};
const tableHeaders = {
    clpr: ['TIMESTAMP', 'SMFRSDTE', 'SMFRSTME', 'SMFRSSID', 'SMFRSSSI', 'SMFRSIDT', 'SMFRSITM', 'SMFRSETM', 'SMFRSINT', 'SMFRSSYN', 'SMFRSMDL', 'SMFRSSN', 'SMFRSMIC', 'RRS3MPID', 'RRS3CLID', 'RRS3CLNM', 'RRS3CCUR', 'RRS3CWPU', 'RRS3CFPU', 'RRS3CSFU', 'RRS3CRRO', 'RRS3CRRH', 'RRS3CRWO', 'RRS3CRWH', 'RRS3CSRO', 'RRS3CSRH', 'RRS3CSWO', 'RRS3CSWH', 'RRS3CFRO', 'RRS3CFRH', 'RRS3CFWO', 'RRS3CFWH', 'RRS3CSOD', 'RRS3CNOD', 'RRS3CNOC', 'RRS3CNBD', 'RRS3CNBC'],
    ldev: ['TIMESTAMP', 'SMFRSDTE', 'SMFRSTME', 'SMFRSSID', 'SMFRSSSI', 'SMFRSIDT', 'SMFRSITM', 'SMFRSETM', 'SMFRSINT', 'SMFRSSYN', 'SMFRSMDL', 'SMFRSSN', 'SMFRSMIC', 'LDEVID', 'RRS2CU', 'RRS2CCA', 'RRS2SSID', 'RRS2DEVN', 'RRS2VSN', 'RRS2STOR', 'RRS2CYL', 'RRS2SCS', 'RRS2DVN', 'RRS2TYPE', 'RRS2CLID', 'RRS2MPID', 'RRS2PLID', 'RRS2PGRP', 'RRS2PSUB', 'RRS2EMUT', 'RRS2DTOD', 'RRS2BR', 'RRS2BRH', 'RRS2BW', 'RRS2BWH', 'RRS2SR', 'RRS2SRH', 'RRS2SW', 'RRS2SWH', 'RRS2CFR', 'RRS2CFRH', 'RRS2CFW', 'RRS2CFWH', 'RRS2STRK', 'RRS2OTRK', 'RRS2CTRK', 'RRS2RTRD', 'RRS2RTWR'],
    mpb: ['TIMESTAMP', 'SMFRSDTE', 'SMFRSTME', 'SMFRSSID', 'SMFRSSSI', 'SMFRSIDT', 'SMFRSITM', 'SMFRSETM', 'SMFRSINT', 'SMFRSSYN', 'SMFRSMDL', 'SMFRSSN', 'SMFRSMIC', 'RRS3MPID', 'RRS3MPNM', 'RRS3MUR', 'RRS3MUOT', 'RRS3MUOI', 'RRS3MUOE', 'RRS3MUMT', 'RRS3MUMI', 'RRS3MUBE', 'RRS3MURO'],
    mprank20: ['TIMESTAMP', 'SMFRSDTE', 'SMFRSTME', 'SMFRSSID', 'SMFRSSSI', 'SMFRSIDT', 'SMFRSITM', 'SMFRSETM', 'SMFRSINT', 'SMFRSSYN', 'SMFRSMDL', 'SMFRSSN', 'SMFRSMIC', 'RRS6MPB', 'RRS6MP', 'RRS6RPTY', 'RRS6ROWN', 'RRS6RUR', 'RRS6RID'],
    pgrp: ['TIMESTAMP', 'SMFRSDTE', 'SMFRSTME', 'SMFRSSID', 'SMFRSSSI', 'SMFRSIDT', 'SMFRSITM', 'SMFRSETM', 'SMFRSINT', 'SMFRSSYN', 'SMFRSMDL', 'SMFRSSN', 'SMFRSMIC', 'RRS4PGID', 'RRS4PSID', 'RRS4CLID', 'RRS4TYPE', 'RRS4MDEL', 'RRS4RLVL', 'RRS4PLID', 'RRS4BEMU', 'RRS4SODC', 'RRS4RODC', 'RRS4NOCD', 'RRS4NBDC', 'RRS4NBCD', 'RRS4NTDC', 'RRS4NTCD'],
    port: ['TIMESTAMP', 'SMFRSDTE', 'SMFRSTME', 'SMFRSSID', 'SMFRSSSI', 'SMFRSIDT', 'SMFRSITM', 'SMFRSETM', 'SMFRSINT', 'SMFRSSYN', 'SMFRSMDL', 'SMFRSSN', 'SMFRSMIC', 'RRS5POID', 'RRS5APID', 'RRS5WWN', 'RRS5LTYP', 'RRS5LADR', 'RRS5ERCS', 'RRS5EWCS', 'RRS5ERTS', 'RRS5EWTS', 'RRS5ERCB', 'RRS5EWCB', 'RRS5ERTB', 'RRS5EWTB', 'RRS5ERCT', 'RRS5EWCT', 'RRS5ERTT', 'RRS5EWTT', 'RRS5ERCO', 'RRS5EWCO']
};
function parseDirName(dirName) {
    const parts = dirName.split('_');
    if (parts.length >= 3 && parts[0].startsWith('D') && parts[0].length === 7 && parts[1].startsWith('T') && parts[1].length === 7) {
        const dateStr = parts[0].slice(1);
        const timeStr = parts[1].slice(1);
        const year = '20' + dateStr.slice(0, 2);
        const month = dateStr.slice(2, 4);
        const day = dateStr.slice(4, 6);
        const hour = timeStr.slice(0, 2);
        const minute = timeStr.slice(2, 4);
        const second = timeStr.slice(4, 6);
        return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    }
    return null;
}
function getTableNameFromFileName(fileName) {
    const metric = fileName.split('_').pop().split('.')[0].toLowerCase();
    return tableHeaders[metric] ? metric : null;
}
function promisifyFtpCommand(ftpClient, command, ...args) {
    return new Promise(function(resolve, reject) {
        ftpClient[command](...args, function(err, result) {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

async function checkForNewFiles(ftpClient, mysqlConnection, startDate, endDate, lpar, metrics) {
    console.log(`Checking for new files for ${lpar} from ${startDate} to ${endDate || 'now'}`);
    
    try {
        const visitedDirs = await new Promise((resolve, reject) => {
            hmaiJSONcontroller.readLparData(lpar, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
        
        await promisifyFtpCommand(ftpClient, 'cwd', config.dds[lpar].hmai.ftp.directory);
        const list = await promisifyFtpCommand(ftpClient, 'list');

        const startDateTime = new Date(startDate);
        const endDateTime = endDate ? new Date(endDate) : new Date();

        const newDirs = list.filter(function(item) {
            if (item.type !== 'd') return false;
            const dirDate = parseDirName(item.name);
            if (!dirDate) return false;
            const isNewDir = !visitedDirs[item.name];
            return isNewDir && dirDate >= startDateTime && dirDate <= endDateTime;
        });

        console.log(`Found ${newDirs.length} new directories to process for ${lpar}`);

        for (const dir of newDirs) {
            const fullPath = path.join(config.dds[lpar].hmai.ftp.directory, dir.name);
            try {
                await processDirectory(ftpClient, mysqlConnection, fullPath, lpar, metrics);
                const dirDate = parseDirName(dir.name);
                const updateData = { [dir.name]: dirDate.toISOString() };
                await new Promise((resolve, reject) => {
                    hmaiJSONcontroller.updateLparData(lpar, updateData, (updateErr, updatedData) => {
                        if (updateErr) reject(updateErr);
                        else {
                            console.log('Processed and updated ' + lpar + '.json with ' + dir.name);
                            resolve(updatedData);
                        }
                    });
                });
            } catch (error) {
                console.error('Error processing directory ' + dir.name + ' for ' + lpar + ':', error);
            }
        }
       
        console.log(`Finished processing ${newDirs.length} new directories for ${lpar}`);
        return newDirs.length;
    } catch (error) {
        console.error('Error in checkForNewFiles:', error);
        throw error;
    }
}

async function loadDataFromFTPToMySQL(ftpClient, mysqlConnection, remotePath, tableName, columns) {
    return new Promise((resolve, reject) => {
        ftpClient.get(remotePath, async (err, readStream) => {
            if (err) {
                console.error(`Error getting file ${remotePath}:`, err);
                reject(err);
                return;
            }

            console.log(`Started processing file: ${remotePath}`);

            const passthroughStream = new stream.PassThrough();
            readStream.pipe(passthroughStream);

            const sql = `LOAD DATA LOCAL INFILE 'stdin' INTO TABLE ${tableName} 
                         FIELDS TERMINATED BY ',' ENCLOSED BY '"' 
                         LINES TERMINATED BY '\\n' 
                         IGNORE 1 LINES (${columns.join(', ')})`;

            try {
                const [result] = await mysqlConnection.query({
                    sql: sql,
                    infileStreamFactory: () => passthroughStream
                });
                console.log(`Data loaded into ${tableName}: ${result.affectedRows} rows affected`);
                resolve(result);
            } catch (error) {
                console.error(`Error loading data into ${tableName}:`, error);
                reject(error);
            }
        });
    });
}
const runningProcesses = {};
async function startHMAI(req, res) {
    const { startDate, endDate, lpar, metrics, continuousMonitoring } = req.body;
    console.log(`startHMAI called with params:`, { startDate, endDate, lpar, metrics, continuousMonitoring });

    if (runningProcesses[lpar] && runningProcesses[lpar].isRunning) {
        return res.status(400).json({ success: false, message: `HMAI process is already running for ${lpar}` });
    }

    // Reset the configuration for this LPAR
    runningProcesses[lpar] = { 
        isRunning: true, 
        continuousMonitoring: continuousMonitoring,
        startDate: startDate,
        endDate: continuousMonitoring ? null : endDate
    };

    let mysqlConnection;
    let ftpClient;
    let databaseCreated = false;

    try {
        // Create MySQL connection
        mysqlConnection = await mysql.createConnection({
            host: config.dds[lpar].hmai.mysql.host,
            user: config.dds[lpar].hmai.mysql.user,
            password: config.dds[lpar].hmai.mysql.password,
            multipleStatements: true
        });
        console.log('MySQL connection established');

        // Check if database exists
        const [rows] = await mysqlConnection.query(`SHOW DATABASES LIKE '${lpar}'`);
        if (rows.length === 0) {
            // Create database and tables
            await mysqlConnection.query(`CREATE DATABASE ${lpar}`);
            databaseCreated = true;
            console.log(`Database ${lpar} created`);
        } else {
            console.log(`Database ${lpar} already exists`);
        }

        await mysqlConnection.query(`USE ${lpar}`);
        console.log(`Using database ${lpar}`);

        if (databaseCreated) {
            await createTables(mysqlConnection);
            console.log('Tables created');
        }

        // Start FTP connection
        ftpClient = new FTP();
        await new Promise((resolve, reject) => {
            ftpClient.on('ready', () => {
                console.log('FTP connection established');
                resolve();
            });
            ftpClient.on('error', reject);
            ftpClient.connect({
                host: config.dds[lpar].ddsbaseurl,
                user: config.dds[lpar].ddsuser,
                password: config.dds[lpar].ddspwd,
            });
        });

        console.log('Starting to check for new files');
        if (continuousMonitoring) {
            await checkForNewFiles(ftpClient, mysqlConnection, runningProcesses[lpar].startDate, null, lpar, metrics);
            startContinuousMonitoring(lpar, metrics);
        } else {
            await checkForNewFiles(ftpClient, mysqlConnection, runningProcesses[lpar].startDate, runningProcesses[lpar].endDate, lpar, metrics);
            runningProcesses[lpar].isRunning = false;
        }
        console.log('Finished checking for new files');

        // Enforce data retention after all files are processed
        await enforceDataRetention(mysqlConnection, lpar,metrics);

        res.json({ 
            success: true, 
            message: continuousMonitoring ? 'HMAI process started and running continuously' : 'HMAI process completed successfully',
            databaseCreated: databaseCreated,
            checkInterval: config.dds[lpar].hmai.checkInterval,
            continuousMonitoring: continuousMonitoring
        });
    } catch (error) {
        console.error('Error in startHMAI:', error);
        delete runningProcesses[lpar];
        res.status(500).json({ success: false, message: 'Error in HMAI process', error: error.message });
    } finally {
        if (!continuousMonitoring) {
            if (mysqlConnection) {
                try {
                    await mysqlConnection.end();
                    console.log('MySQL connection closed.');
                } catch (err) {
                    console.error('Error closing MySQL connection:', err);
                }
            }
            if (ftpClient && ftpClient.connected) {
                ftpClient.end();
                console.log('FTP connection closed.');
            }
        }
    }
}
async function processDirectory(ftpClient, mysqlConnection, dirPath, lpar, metrics) {
    console.log(`Processing directory: ${dirPath}`);
    // console.log(`Selected metrics:`, metrics);
    
    try {
        await promisifyFtpCommand(ftpClient, 'cwd', dirPath);
        const files = await promisifyFtpCommand(ftpClient, 'list');
        console.log(files)

        for (const file of files) {
            if (file.type === '-' && file.name.endsWith('.csv')) {
                const remotePath = `${dirPath}/${file.name}`;
                const tableName = getTableNameFromFileName(file.name);
                console.log(`Checking file: ${file.name}, Table name: ${tableName}`);
                if (tableName && metrics.includes(tableName)) {
                    try {
                        console.log(`Processing file: ${remotePath}`);
                        await loadDataFromFTPToMySQL(ftpClient, mysqlConnection, file.name, tableName, tableHeaders[tableName]);
                        console.log(`Successfully processed ${file.name}`);
                        
                        // Enforce data retention after each file is processed
                        await enforceDataRetention(mysqlConnection, lpar,metrics);
                    } catch (error) {
                        console.error(`Error processing ${file.name}:`, error);
                    }
                } else {
                    console.log(`Skipping file: ${file.name} (not in selected metrics)`);
                    console.log(`tableName: ${tableName}, metrics: ${metrics}`);
                }
            }
        }
    } catch (error) {
        console.error(`Error processing directory ${dirPath}:`, error);
    } finally {
        try {
            if (config.dds && config.dds[lpar] && config.dds[lpar].hmai && config.dds[lpar].hmai.ftp && config.dds[lpar].hmai.ftp.directory) {
                await promisifyFtpCommand(ftpClient, 'cwd', config.dds[lpar].hmai.ftp.directory);
            } else {
                console.error(`Invalid or missing HMAI FTP directory configuration for LPAR ${lpar}`);
            }
        } catch (error) {
            console.error(`Error changing back to base directory for LPAR ${lpar}:`, error);
        }
    }
}
    async function createTables(connection) {
        // Create tables
        const createTableQueries = [
            `CREATE TABLE clpr (
                clpr_id INT NOT NULL AUTO_INCREMENT,
                TIMESTAMP DATETIME DEFAULT NULL,
                SMFRSDTE VARCHAR(25) DEFAULT NULL,
                SMFRSTME VARCHAR(25) DEFAULT NULL,
                SMFRSSID VARCHAR(5) DEFAULT NULL,
                SMFRSSSI VARCHAR(5) DEFAULT NULL,
                SMFRSIDT VARCHAR(25) DEFAULT NULL,
                SMFRSITM TIME DEFAULT NULL,
                SMFRSETM VARCHAR(25) DEFAULT NULL,
                SMFRSINT INT NOT NULL,
                SMFRSSYN INT NOT NULL,
                SMFRSMDL VARCHAR(25) DEFAULT NULL,
                SMFRSSN INT NOT NULL,
                SMFRSMIC VARCHAR(12) DEFAULT NULL,
                RRS3MPID VARCHAR(5) DEFAULT NULL,
                RRS3CLID VARCHAR(5) DEFAULT NULL,
                RRS3CLNM VARCHAR(5) DEFAULT NULL,
                RRS3CCUR INT NOT NULL,
                RRS3CWPU INT NOT NULL,
                RRS3CFPU INT NOT NULL,
                RRS3CSFU INT NOT NULL,
                RRS3CRRO INT NOT NULL,
                RRS3CRRH INT NOT NULL,
                RRS3CRWO INT NOT NULL,
                RRS3CRWH INT NOT NULL,
                RRS3CSRO INT NOT NULL,
                RRS3CSRH INT NOT NULL,
                RRS3CSWO INT NOT NULL,
                RRS3CSWH INT NOT NULL,
                RRS3CFRO INT NOT NULL,
                RRS3CFRH INT NOT NULL,
                RRS3CFWO INT NOT NULL,
                RRS3CFWH INT NOT NULL,
                RRS3CSOD INT NOT NULL,
                RRS3CNOD INT NOT NULL,
                RRS3CNOC INT NOT NULL,
                RRS3CNBD INT NOT NULL,
                RRS3CNBC DECIMAL(12, 5) DEFAULT NULL,
                PRIMARY KEY (clpr_id),
                KEY TIMESTAMP_index (TIMESTAMP),
                KEY SMFRSSN_index (SMFRSSN)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
            `CREATE TABLE port (
                port_id INT NOT NULL AUTO_INCREMENT,
                TIMESTAMP DATETIME DEFAULT NULL,
                SMFRSDTE VARCHAR(25) DEFAULT NULL,
                SMFRSTME VARCHAR(25) DEFAULT NULL,
                SMFRSSID VARCHAR(5) DEFAULT NULL,
                SMFRSSSI VARCHAR(5) DEFAULT NULL,
                SMFRSIDT VARCHAR(25) DEFAULT NULL,
                SMFRSITM TIME DEFAULT NULL,
                SMFRSETM VARCHAR(25) DEFAULT NULL,
                SMFRSINT INT NOT NULL,
                SMFRSSYN INT NOT NULL,
                SMFRSMDL VARCHAR(25) DEFAULT NULL,
                SMFRSSN INT NOT NULL,
                SMFRSMIC VARCHAR(12) DEFAULT NULL,
                RRS5POID VARCHAR(5) DEFAULT NULL,
                RRS5APID VARCHAR(5) DEFAULT NULL,
                RRS5WWN VARCHAR(25) DEFAULT NULL,
                RRS5LTYP VARCHAR(12) DEFAULT NULL,
                RRS5LADR VARCHAR(12) DEFAULT NULL,
                RRS5ERCS INT NOT NULL,
                RRS5EWCS INT NOT NULL,
                RRS5ERTS INT NOT NULL,
                RRS5EWTS INT NOT NULL,
                RRS5ERCB DECIMAL(65,30) DEFAULT NULL,
                RRS5EWCB DECIMAL(65,30) DEFAULT NULL,
                RRS5ERTB DECIMAL(65,30) DEFAULT NULL,
                RRS5EWTB DECIMAL(65,30) DEFAULT NULL,
                RRS5ERCT INT NOT NULL,
                RRS5EWCT INT NOT NULL,
                RRS5ERTT INT NOT NULL,
                RRS5EWTT INT NOT NULL,
                RRS5ERCO INT NOT NULL,
                RRS5EWCO INT NOT NULL,
                PRIMARY KEY (port_id),
                KEY TIMESTAMP_index (TIMESTAMP),
                KEY SMFRSSN_index (SMFRSSN)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
            `CREATE TABLE ldev (
                ldev_id INT NOT NULL AUTO_INCREMENT,
                TIMESTAMP DATETIME DEFAULT NULL,
                SMFRSDTE VARCHAR(25) DEFAULT NULL,
                SMFRSTME VARCHAR(25) DEFAULT NULL,
                SMFRSSID VARCHAR(25) DEFAULT NULL,
                SMFRSSSI VARCHAR(5) DEFAULT NULL,
                SMFRSIDT VARCHAR(25) DEFAULT NULL,
                SMFRSITM TIME DEFAULT NULL,
                SMFRSETM VARCHAR(25) DEFAULT NULL,
                SMFRSINT INT NOT NULL,
                SMFRSSYN INT NOT NULL,
                SMFRSMDL VARCHAR(25) DEFAULT NULL,
                SMFRSSN INT NOT NULL,
                SMFRSMIC VARCHAR(12) DEFAULT NULL,
                LDEVID VARCHAR(12) DEFAULT NULL,
                RRS2CU VARCHAR(5) DEFAULT NULL,
                RRS2CCA VARCHAR(5) DEFAULT NULL,
                RRS2SSID VARCHAR(12) DEFAULT NULL,
                RRS2DEVN VARCHAR(25) DEFAULT NULL,
                RRS2VSN VARCHAR(25) DEFAULT NULL,
                RRS2STOR VARCHAR(25) DEFAULT NULL,
                RRS2CYL INT NOT NULL,
                RRS2SCS VARCHAR(5) DEFAULT NULL,
                RRS2DVN VARCHAR(25) DEFAULT NULL,
                RRS2TYPE VARCHAR(12) DEFAULT NULL,
                RRS2CLID VARCHAR(25) DEFAULT NULL,
                RRS2MPID VARCHAR(25) DEFAULT NULL,
                RRS2PLID VARCHAR(25) DEFAULT NULL,
                RRS2PGRP VARCHAR(25) DEFAULT NULL,
                RRS2PSUB VARCHAR(25) DEFAULT NULL,
                RRS2EMUT VARCHAR(25) DEFAULT NULL,
                RRS2DTOD VARCHAR(25) DEFAULT NULL,
                RRS2BR INT NOT NULL,
                RRS2BRH INT NOT NULL,
                RRS2BW INT NOT NULL,
                RRS2BWH INT NOT NULL,
                RRS2SR INT NOT NULL,
                RRS2SRH INT NOT NULL,
                RRS2SW INT NOT NULL,
                RRS2SWH INT NOT NULL,
                RRS2CFR INT NOT NULL,
                RRS2CFRH INT NOT NULL,
                RRS2CFW INT NOT NULL,
                RRS2CFWH INT NOT NULL,
                RRS2STRK INT NOT NULL,
                RRS2OTRK INT NOT NULL,
                RRS2CTRK INT NOT NULL,
                RRS2RTRD INT NOT NULL,
                RRS2RTWR INT NOT NULL,
                PRIMARY KEY (ldev_id),
                KEY TIMESTAMP_index (TIMESTAMP),
                KEY SMFRSSN_index (SMFRSSN)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
            `CREATE TABLE mpb (
                mpb_id INT NOT NULL AUTO_INCREMENT,
                TIMESTAMP DATETIME DEFAULT NULL,
                SMFRSDTE VARCHAR(25) DEFAULT NULL,
                SMFRSTME VARCHAR(25) DEFAULT NULL,
                SMFRSSID VARCHAR(5) DEFAULT NULL,
                SMFRSSSI VARCHAR(5) DEFAULT NULL,
                SMFRSIDT VARCHAR(25) DEFAULT NULL,
                SMFRSITM TIME DEFAULT NULL,
                SMFRSETM VARCHAR(25) DEFAULT NULL,
                SMFRSINT INT NOT NULL,
                SMFRSSYN INT NOT NULL,
                SMFRSMDL VARCHAR(25) DEFAULT NULL,
                SMFRSSN INT NOT NULL,
                SMFRSMIC VARCHAR(12) DEFAULT NULL,
                RRS3MPID VARCHAR(5) DEFAULT NULL,
                RRS3MPNM VARCHAR(5) DEFAULT NULL,
                RRS3MUR DECIMAL(12,2) DEFAULT NULL,
                RRS3MUOT DECIMAL(12,2) DEFAULT NULL,
                RRS3MUOI DECIMAL(12,2) DEFAULT NULL,
                RRS3MUOE INT NOT NULL,
                RRS3MUMT DECIMAL(12,2) DEFAULT NULL,
                RRS3MUMI INT NOT NULL,
                RRS3MUBE DECIMAL(12,2) DEFAULT NULL,
                RRS3MURO DECIMAL(12,2) DEFAULT NULL,
                PRIMARY KEY (mpb_id),
                KEY TIMESTAMP_index (TIMESTAMP),
                KEY SMFRSSN_index (SMFRSSN)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
            `CREATE TABLE mprank20 (
                mprank20_id INT NOT NULL AUTO_INCREMENT,
                TIMESTAMP DATETIME DEFAULT NULL,
                SMFRSDTE VARCHAR(25) DEFAULT NULL,
                SMFRSTME VARCHAR(25) DEFAULT NULL,
                SMFRSSID VARCHAR(5) DEFAULT NULL,
                SMFRSSSI VARCHAR(5) DEFAULT NULL,
                SMFRSIDT VARCHAR(25) DEFAULT NULL,
                SMFRSITM TIME DEFAULT NULL,
                SMFRSETM VARCHAR(25) DEFAULT NULL,
                SMFRSINT INT NOT NULL,
                SMFRSSYN INT NOT NULL,
                SMFRSMDL VARCHAR(25) DEFAULT NULL,
                SMFRSSN INT NOT NULL,
                SMFRSMIC VARCHAR(12) DEFAULT NULL,
                RRS6MPB VARCHAR(5) DEFAULT NULL,
                RRS6MP VARCHAR(5) DEFAULT NULL,
                RRS6RPTY VARCHAR(25) DEFAULT NULL,
                RRS6ROWN VARCHAR(25) DEFAULT NULL,
                RRS6RUR DECIMAL(12,2) DEFAULT NULL,
                RRS6RID VARCHAR(12) DEFAULT NULL,
                PRIMARY KEY (mprank20_id),
                KEY TIMESTAMP_index (TIMESTAMP),
                KEY SMFRSSN_index (SMFRSSN)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
            `CREATE TABLE pgrp (
                pgrp_id INT NOT NULL AUTO_INCREMENT,
                TIMESTAMP DATETIME DEFAULT NULL,
                SMFRSDTE VARCHAR(25) DEFAULT NULL,
                SMFRSTME VARCHAR(25) DEFAULT NULL,
                SMFRSSID VARCHAR(5) DEFAULT NULL,
                SMFRSSSI VARCHAR(5) DEFAULT NULL,
                SMFRSIDT VARCHAR(25) DEFAULT NULL,
                SMFRSITM TIME DEFAULT NULL,
                SMFRSETM VARCHAR(25) DEFAULT NULL,
                SMFRSINT INT NOT NULL,
                SMFRSSYN INT NOT NULL,
                SMFRSMDL VARCHAR(25) DEFAULT NULL,
                SMFRSSN INT NOT NULL,
                SMFRSMIC VARCHAR(12) DEFAULT NULL,
                RRS4PGID VARCHAR(25) DEFAULT NULL,
                RRS4PSID VARCHAR(25) DEFAULT NULL,
                RRS4CLID VARCHAR(25) DEFAULT NULL,
                RRS4TYPE VARCHAR(25) DEFAULT NULL,
                RRS4MDEL VARCHAR(12) DEFAULT NULL,
                RRS4RLVL VARCHAR(5) DEFAULT NULL,
                RRS4PLID VARCHAR(25) DEFAULT NULL,
                RRS4BEMU VARCHAR(12) DEFAULT NULL,
                RRS4SODC INT NOT NULL,
                RRS4RODC INT NOT NULL,
                RRS4NOCD INT NOT NULL,
                RRS4NBDC DECIMAL(65,30) DEFAULT NULL,
                RRS4NBCD DECIMAL(65,30) DEFAULT NULL,
                RRS4NTDC INT NOT NULL,
                RRS4NTCD INT NOT NULL,
                PRIMARY KEY (pgrp_id),
                KEY TIMESTAMP_index (TIMESTAMP),
                KEY SMFRSSN_index (SMFRSSN)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`
        ];
    
        for (const query of createTableQueries) {
            await connection.query(query);
        }
    }

        

        

    async function clearDatabase(req, res) {
        const { lpar } = req.body;
        const mysqlConfig = {
            ...config.dds[lpar].hmai.mysql,
            database: lpar,
        };
    
        let connection;
        try {
            connection = await mysql.createConnection(mysqlConfig);
    
            const tables = ['clpr', 'ldev', 'mpb', 'mprank20', 'pgrp', 'port'];
            for (const table of tables) {
                await connection.query(`TRUNCATE TABLE ${table}`);
            }
    
            // Clear HMAI memory for this LPAR
            await new Promise((resolve, reject) => {
                hmaiJSONcontroller.writeLparData(lpar, {}, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
    
            // Remove the LPAR from running processes if it exists
            if (runningProcesses[lpar]) {
                delete runningProcesses[lpar];
            }
    
            res.json({ success: true, message: `All tables in database ${lpar} and HMAI memory cleared successfully` });
        } catch (error) {
            console.error('Error clearing database and HMAI memory:', error);
            res.json({ success: false, message: 'Failed to clear database and HMAI memory: ' + error.message });
        } finally {
            if (connection) await connection.end();
        }
    }
async function getCSVData(req, res) {
    const { startDate, endDate, lpar } = req.body;
    console.log(`getCSVData called with params:`, { startDate, endDate, lpar });
    const ddsConfig = config.dds[lpar];
    const hmaiConfig = ddsConfig.hmai;
    let ftpClient;
    let mysqlConnection;

    try {
        // MySQL Connection
        mysqlConnection = await mysql.createConnection({
            ...hmaiConfig.mysql,
            supportBigNumbers: true,
            bigNumberStrings: true,
            flags: ['LOCAL_FILES'],
            multipleStatements: true
        });
        console.log(`Connected to MySQL without specifying database.`);

        // Check and create 'getcsv' database
        const [rows] = await mysqlConnection.query("SHOW DATABASES LIKE 'getcsv'");
        if (rows.length === 0) {
            console.log("'getcsv' database does not exist. Creating it now.");
            await mysqlConnection.query("CREATE DATABASE getcsv");
            console.log("'getcsv' database created successfully.");
        }

        await mysqlConnection.query('USE getcsv');
        console.log(`Switched to getcsv database.`);

        // Create tables if they don't exist
        await createGetCSVTables(mysqlConnection);
        console.log("Ensured all necessary tables exist in 'getcsv' database.");

        // Truncate tables
        const tableNames = Object.keys(tableHeaders);
        for (const tableName of tableNames) {
            await mysqlConnection.query(`TRUNCATE TABLE ${tableName}`);
            console.log(`Truncated table ${tableName}`);
        }

        // FTP Connection
        ftpClient = new FTP();
        await new Promise((resolve, reject) => {
            ftpClient.on('ready', resolve);
            ftpClient.on('error', reject);
            ftpClient.connect({
                host: ddsConfig.ddsbaseurl,
                user: ddsConfig.ddsuser,
                password: ddsConfig.ddspwd,
            });
        });
        console.log('FTP connection established.');

        // Process directories and load data
        console.log('Starting to process directories and load data...');
        await checkForNewFilesgetcsv(ftpClient, mysqlConnection, startDate, endDate, lpar, ddsConfig.hmai.ftp.directory);
        console.log('Finished processing directories and loading data.');

        // Fetch and send data
        const result = {};
        for (const tableName of tableNames) {
            const [rows] = await mysqlConnection.query(`SELECT * FROM ${tableName} LIMIT 100`);
            result[tableName] = rows;
            console.log(`Table ${tableName} has ${rows.length} rows fetched.`);
        }

        res.json({ success: true, message: 'CSV data processed and loaded into getcsv database.', data: result });
    } catch (error) {
        console.error('Error in getCSVData:', error);
        res.status(500).json({ success: false, message: 'Error processing CSV data', error: error.message });
    } finally {
        if (ftpClient && ftpClient.connected) {
            ftpClient.end();
            console.log('FTP connection closed.');
        }
        if (mysqlConnection) {
            await mysqlConnection.end();
            console.log('MySQL connection closed.');
        }
    }
}

async function checkForNewFilesgetcsv(ftpClient, mysqlConnection, startDate, endDate, lpar, basePath) {
    const directories = await getDirectoriesInRange(ftpClient, startDate, endDate, basePath);
    console.log(`Found ${directories.length} directories to process for ${lpar}`);

    for (const dir of directories) {
        console.log(`Processing directory: ${dir}`);
        try {
            await processDirectorygetcsv(ftpClient, mysqlConnection, dir);
        } catch (error) {
            console.error(`Error processing directory ${dir}:`, error);
        }
    }
}
async function processDirectorygetcsv(ftpClient, mysqlConnection, dirPath, lpar) {
    console.log(`Processing directory: ${dirPath}`);
    
    try {
        await promisifyFtpCommand(ftpClient, 'cwd', dirPath);
        const files = await promisifyFtpCommand(ftpClient, 'list');

        const allMetrics = ['clpr', 'ldev', 'mpb', 'mprank20', 'pgrp', 'port'];

        for (const file of files) {
            if (file.type === '-' && file.name.endsWith('.csv')) {
                const remotePath = `${dirPath}/${file.name}`;
                const tableName = getTableNameFromFileName(file.name);
                console.log(`Checking file: ${file.name}, Table name: ${tableName}`);

                if (tableName && allMetrics.includes(tableName)) {
                    try {
                        console.log(`Processing file: ${remotePath}`);
                        await loadDataFromFTPToMySQL(ftpClient, mysqlConnection, file.name, tableName, tableHeaders[tableName]);
                        console.log(`Successfully processed ${file.name}`);
                    } catch (error) {
                        console.error(`Error processing ${file.name}:`, error);
                    }
                } else {
                    console.log(`Skipping file: ${file.name} (not a recognized metric)`);
                }
            }
        }
    } catch (error) {
        console.error(`Error processing directory ${dirPath}:`, error);
    } finally {
        try {
            if (config.dds && config.dds[lpar] && config.dds[lpar].hmai && config.dds[lpar].hmai.ftp && config.dds[lpar].hmai.ftp.directory) {
                await promisifyFtpCommand(ftpClient, 'cwd', config.dds[lpar].hmai.ftp.directory);
            } else {
                console.error(`Invalid or missing HMAI FTP directory configuration for LPAR ${lpar}`);
            }
        } catch (error) {
            console.error(`Error changing back to base directory for LPAR ${lpar}:`, error);
        }
    }
}
async function getDirectoriesInRange(ftpClient, startDate, endDate, basePath) {
    try {
        await promisifyFtpCommand(ftpClient, 'cwd', basePath);
        const directories = await promisifyFtpCommand(ftpClient, 'list');
        const filteredDirs = directories.filter(dir => {
            const dirDate = parseDirName(dir.name);
            return dirDate && dirDate >= new Date(startDate) && dirDate <= new Date(endDate);
        });
        console.log(`Filtered directories: ${filteredDirs.map(dir => dir.name).join(', ')}`);
        return filteredDirs.map(dir => `${basePath}/${dir.name}`);
    } catch (error) {
        console.error(`Error getting directories in range:`, error);
        return [];
    }
}

async function createGetCSVTables(mysqlConnection) {
    // Define the same table structures as in your createDatabase function
    const createTableQueries = [
        `CREATE TABLE IF NOT EXISTS clpr (
                clpr_id INT NOT NULL AUTO_INCREMENT,
                TIMESTAMP DATETIME DEFAULT NULL,
                SMFRSDTE VARCHAR(25) DEFAULT NULL,
                SMFRSTME VARCHAR(25) DEFAULT NULL,
                SMFRSSID VARCHAR(5) DEFAULT NULL,
                SMFRSSSI VARCHAR(5) DEFAULT NULL,
                SMFRSIDT VARCHAR(25) DEFAULT NULL,
                SMFRSITM TIME DEFAULT NULL,
                SMFRSETM VARCHAR(25) DEFAULT NULL,
                SMFRSINT INT NOT NULL,
                SMFRSSYN INT NOT NULL,
                SMFRSMDL VARCHAR(25) DEFAULT NULL,
                SMFRSSN INT NOT NULL,
                SMFRSMIC VARCHAR(12) DEFAULT NULL,
                RRS3MPID VARCHAR(5) DEFAULT NULL,
                RRS3CLID VARCHAR(5) DEFAULT NULL,
                RRS3CLNM VARCHAR(5) DEFAULT NULL,
                RRS3CCUR INT NOT NULL,
                RRS3CWPU INT NOT NULL,
                RRS3CFPU INT NOT NULL,
                RRS3CSFU INT NOT NULL,
                RRS3CRRO INT NOT NULL,
                RRS3CRRH INT NOT NULL,
                RRS3CRWO INT NOT NULL,
                RRS3CRWH INT NOT NULL,
                RRS3CSRO INT NOT NULL,
                RRS3CSRH INT NOT NULL,
                RRS3CSWO INT NOT NULL,
                RRS3CSWH INT NOT NULL,
                RRS3CFRO INT NOT NULL,
                RRS3CFRH INT NOT NULL,
                RRS3CFWO INT NOT NULL,
                RRS3CFWH INT NOT NULL,
                RRS3CSOD INT NOT NULL,
                RRS3CNOD INT NOT NULL,
                RRS3CNOC INT NOT NULL,
                RRS3CNBD INT NOT NULL,
                RRS3CNBC DECIMAL(12, 5) DEFAULT NULL,
                PRIMARY KEY (clpr_id),
                KEY SMFRSSN_index (SMFRSSN)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
            `CREATE TABLE IF NOT EXISTS port (
                port_id INT NOT NULL AUTO_INCREMENT,
                TIMESTAMP DATETIME DEFAULT NULL,
                SMFRSDTE VARCHAR(25) DEFAULT NULL,
                SMFRSTME VARCHAR(25) DEFAULT NULL,
                SMFRSSID VARCHAR(5) DEFAULT NULL,
                SMFRSSSI VARCHAR(5) DEFAULT NULL,
                SMFRSIDT VARCHAR(25) DEFAULT NULL,
                SMFRSITM TIME DEFAULT NULL,
                SMFRSETM VARCHAR(25) DEFAULT NULL,
                SMFRSINT INT NOT NULL,
                SMFRSSYN INT NOT NULL,
                SMFRSMDL VARCHAR(25) DEFAULT NULL,
                SMFRSSN INT NOT NULL,
                SMFRSMIC VARCHAR(12) DEFAULT NULL,
                RRS5POID VARCHAR(5) DEFAULT NULL,
                RRS5APID VARCHAR(5) DEFAULT NULL,
                RRS5WWN VARCHAR(25) DEFAULT NULL,
                RRS5LTYP VARCHAR(12) DEFAULT NULL,
                RRS5LADR VARCHAR(12) DEFAULT NULL,
                RRS5ERCS INT NOT NULL,
                RRS5EWCS INT NOT NULL,
                RRS5ERTS INT NOT NULL,
                RRS5EWTS INT NOT NULL,
                RRS5ERCB DECIMAL(65,30) DEFAULT NULL,
                RRS5EWCB DECIMAL(65,30) DEFAULT NULL,
                RRS5ERTB DECIMAL(65,30) DEFAULT NULL,
                RRS5EWTB DECIMAL(65,30) DEFAULT NULL,
                RRS5ERCT INT NOT NULL,
                RRS5EWCT INT NOT NULL,
                RRS5ERTT INT NOT NULL,
                RRS5EWTT INT NOT NULL,
                RRS5ERCO INT NOT NULL,
                RRS5EWCO INT NOT NULL,
                PRIMARY KEY (port_id),
                KEY SMFRSSN_index (SMFRSSN)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
            `CREATE TABLE IF NOT EXISTS ldev (
                ldev_id INT NOT NULL AUTO_INCREMENT,
                TIMESTAMP DATETIME DEFAULT NULL,
                SMFRSDTE VARCHAR(25) DEFAULT NULL,
                SMFRSTME VARCHAR(25) DEFAULT NULL,
                SMFRSSID VARCHAR(25) DEFAULT NULL,
                SMFRSSSI VARCHAR(5) DEFAULT NULL,
                SMFRSIDT VARCHAR(25) DEFAULT NULL,
                SMFRSITM TIME DEFAULT NULL,
                SMFRSETM VARCHAR(25) DEFAULT NULL,
                SMFRSINT INT NOT NULL,
                SMFRSSYN INT NOT NULL,
                SMFRSMDL VARCHAR(25) DEFAULT NULL,
                SMFRSSN INT NOT NULL,
                SMFRSMIC VARCHAR(12) DEFAULT NULL,
                LDEVID VARCHAR(12) DEFAULT NULL,
                RRS2CU VARCHAR(5) DEFAULT NULL,
                RRS2CCA VARCHAR(5) DEFAULT NULL,
                RRS2SSID VARCHAR(12) DEFAULT NULL,
                RRS2DEVN VARCHAR(25) DEFAULT NULL,
                RRS2VSN VARCHAR(25) DEFAULT NULL,
                RRS2STOR VARCHAR(25) DEFAULT NULL,
                RRS2CYL INT NOT NULL,
                RRS2SCS VARCHAR(5) DEFAULT NULL,
                RRS2DVN VARCHAR(25) DEFAULT NULL,
                RRS2TYPE VARCHAR(12) DEFAULT NULL,
                RRS2CLID VARCHAR(25) DEFAULT NULL,
                RRS2MPID VARCHAR(25) DEFAULT NULL,
                RRS2PLID VARCHAR(25) DEFAULT NULL,
                RRS2PGRP VARCHAR(25) DEFAULT NULL,
                RRS2PSUB VARCHAR(25) DEFAULT NULL,
                RRS2EMUT VARCHAR(25) DEFAULT NULL,
                RRS2DTOD VARCHAR(25) DEFAULT NULL,
                RRS2BR INT NOT NULL,
                RRS2BRH INT NOT NULL,
                RRS2BW INT NOT NULL,
                RRS2BWH INT NOT NULL,
                RRS2SR INT NOT NULL,
                RRS2SRH INT NOT NULL,
                RRS2SW INT NOT NULL,
                RRS2SWH INT NOT NULL,
                RRS2CFR INT NOT NULL,
                RRS2CFRH INT NOT NULL,
                RRS2CFW INT NOT NULL,
                RRS2CFWH INT NOT NULL,
                RRS2STRK INT NOT NULL,
                RRS2OTRK INT NOT NULL,
                RRS2CTRK INT NOT NULL,
                RRS2RTRD INT NOT NULL,
                RRS2RTWR INT NOT NULL,
                PRIMARY KEY (ldev_id),
                KEY SMFRSSN_index (SMFRSSN)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
            `CREATE TABLE IF NOT EXISTS mpb (
                mpb_id INT NOT NULL AUTO_INCREMENT,
                TIMESTAMP DATETIME DEFAULT NULL,
                SMFRSDTE VARCHAR(25) DEFAULT NULL,
                SMFRSTME VARCHAR(25) DEFAULT NULL,
                SMFRSSID VARCHAR(5) DEFAULT NULL,
                SMFRSSSI VARCHAR(5) DEFAULT NULL,
                SMFRSIDT VARCHAR(25) DEFAULT NULL,
                SMFRSITM TIME DEFAULT NULL,
                SMFRSETM VARCHAR(25) DEFAULT NULL,
                SMFRSINT INT NOT NULL,
                SMFRSSYN INT NOT NULL,
                SMFRSMDL VARCHAR(25) DEFAULT NULL,
                SMFRSSN INT NOT NULL,
                SMFRSMIC VARCHAR(12) DEFAULT NULL,
                RRS3MPID VARCHAR(5) DEFAULT NULL,
                RRS3MPNM VARCHAR(5) DEFAULT NULL,
                RRS3MUR DECIMAL(12,2) DEFAULT NULL,
                RRS3MUOT DECIMAL(12,2) DEFAULT NULL,
                RRS3MUOI DECIMAL(12,2) DEFAULT NULL,
                RRS3MUOE INT NOT NULL,
                RRS3MUMT DECIMAL(12,2) DEFAULT NULL,
                RRS3MUMI INT NOT NULL,
                RRS3MUBE DECIMAL(12,2) DEFAULT NULL,
                RRS3MURO DECIMAL(12,2) DEFAULT NULL,
                PRIMARY KEY (mpb_id),
                KEY SMFRSSN_index (SMFRSSN)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
            `CREATE TABLE IF NOT EXISTS mprank20 (
                mprank20_id INT NOT NULL AUTO_INCREMENT,
                TIMESTAMP DATETIME DEFAULT NULL,
                SMFRSDTE VARCHAR(25) DEFAULT NULL,
                SMFRSTME VARCHAR(25) DEFAULT NULL,
                SMFRSSID VARCHAR(5) DEFAULT NULL,
                SMFRSSSI VARCHAR(5) DEFAULT NULL,
                SMFRSIDT VARCHAR(25) DEFAULT NULL,
                SMFRSITM TIME DEFAULT NULL,
                SMFRSETM VARCHAR(25) DEFAULT NULL,
                SMFRSINT INT NOT NULL,
                SMFRSSYN INT NOT NULL,
                SMFRSMDL VARCHAR(25) DEFAULT NULL,
                SMFRSSN INT NOT NULL,
                SMFRSMIC VARCHAR(12) DEFAULT NULL,
                RRS6MPB VARCHAR(5) DEFAULT NULL,
                RRS6MP VARCHAR(5) DEFAULT NULL,
                RRS6RPTY VARCHAR(25) DEFAULT NULL,
                RRS6ROWN VARCHAR(25) DEFAULT NULL,
                RRS6RUR DECIMAL(12,2) DEFAULT NULL,
                RRS6RID VARCHAR(12) DEFAULT NULL,
                PRIMARY KEY (mprank20_id),
                KEY SMFRSSN_index (SMFRSSN)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
            `CREATE TABLE IF NOT EXISTS pgrp (
                pgrp_id INT NOT NULL AUTO_INCREMENT,
                TIMESTAMP DATETIME DEFAULT NULL,
                SMFRSDTE VARCHAR(25) DEFAULT NULL,
                SMFRSTME VARCHAR(25) DEFAULT NULL,
                SMFRSSID VARCHAR(5) DEFAULT NULL,
                SMFRSSSI VARCHAR(5) DEFAULT NULL,
                SMFRSIDT VARCHAR(25) DEFAULT NULL,
                SMFRSITM TIME DEFAULT NULL,
                SMFRSETM VARCHAR(25) DEFAULT NULL,
                SMFRSINT INT NOT NULL,
                SMFRSSYN INT NOT NULL,
                SMFRSMDL VARCHAR(25) DEFAULT NULL,
                SMFRSSN INT NOT NULL,
                SMFRSMIC VARCHAR(12) DEFAULT NULL,
                RRS4PGID VARCHAR(25) DEFAULT NULL,
                RRS4PSID VARCHAR(25) DEFAULT NULL,
                RRS4CLID VARCHAR(25) DEFAULT NULL,
                RRS4TYPE VARCHAR(25) DEFAULT NULL,
                RRS4MDEL VARCHAR(12) DEFAULT NULL,
                RRS4RLVL VARCHAR(5) DEFAULT NULL,
                RRS4PLID VARCHAR(25) DEFAULT NULL,
                RRS4BEMU VARCHAR(12) DEFAULT NULL,
                RRS4SODC INT NOT NULL,
                RRS4RODC INT NOT NULL,
                RRS4NOCD INT NOT NULL,
                RRS4NBDC DECIMAL(65,30) DEFAULT NULL,
                RRS4NBCD DECIMAL(65,30) DEFAULT NULL,
                RRS4NTDC INT NOT NULL,
                RRS4NTCD INT NOT NULL,
                PRIMARY KEY (pgrp_id),
                KEY SMFRSSN_index (SMFRSSN)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`
    ];

    for (const query of createTableQueries) {
        await mysqlConnection.query(query);
    }
}
const fastcsv = require('fast-csv');



async function downloadCSV(req, res) {
    const { startDate, endDate, lpar, metric } = req.body;
    console.log(`downloadCSV called with params:`, { startDate, endDate, lpar, metric });

    const ddsConfig = config.dds[lpar];
    const hmaiConfig = ddsConfig.hmai;
    let mysqlConnection;

    try {
        mysqlConnection = await mysql.createConnection({
            ...hmaiConfig.mysql,
            supportBigNumbers: true,
            bigNumberStrings: true
        });

        await mysqlConnection.query('USE getcsv');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${metric}.csv`);

        const [fields] = await mysqlConnection.query(`DESCRIBE ${metric}`);
        const headers = fields.map(field => field.Field);

        const csvStream = fastcsv.format({ headers: true });
        csvStream.pipe(res);

        let offset = 0;
        const limit = 1000; // Adjust this value based on your needs and available memory

        while (true) {
            const [rows] = await mysqlConnection.query(`SELECT * FROM ${metric} LIMIT ? OFFSET ?`, [limit, offset]);
            
            if (rows.length === 0) break;

            for (const row of rows) {
                for (let key in row) {
                    if (typeof row[key] === 'bigint') {
                        row[key] = row[key].toString();
                    }
                }
                csvStream.write(row);
            }

            offset += limit;

            // Optional: Add a small delay to prevent overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        csvStream.end();
        console.log(`CSV streaming completed for ${metric}`);

    } catch (error) {
        console.error('Error in downloadCSV:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Error downloading CSV data', error: error.message });
        }
    } finally {
        if (mysqlConnection) {
            await mysqlConnection.end();
            console.log('MySQL connection closed.');
        }
    }
}
function startContinuousMonitoring(lpar, metrics) {
    const checkInterval = parseInt(config.dds[lpar].hmai.checkInterval);

    monitoringIntervals[lpar] = setInterval(async () => {
        let mysqlConnection;
        let ftpClient;

        try {
            // Create MySQL connection
            mysqlConnection = await mysql.createConnection({
                host: config.dds[lpar].hmai.mysql.host,
                user: config.dds[lpar].hmai.mysql.user,
                password: config.dds[lpar].hmai.mysql.password,
                database: lpar,
                multipleStatements: true
            });

            // Create FTP connection
            ftpClient = new FTP();
            await new Promise((resolve, reject) => {
                ftpClient.on('ready', resolve);
                ftpClient.on('error', reject);
                ftpClient.connect({
                    host: config.dds[lpar].ddsbaseurl,
                    user: config.dds[lpar].ddsuser,
                    password: config.dds[lpar].ddspwd,
                });
            });

            // Store connections in runningProcesses for cleanup
            runningProcesses[lpar].mysqlConnection = mysqlConnection;
            runningProcesses[lpar].ftpClient = ftpClient;

            const visitedDirs = await new Promise((resolve, reject) => {
                hmaiJSONcontroller.readLparData(lpar, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });

            const lastProcessedDate = Object.keys(visitedDirs).length > 0
                ? new Date(Math.max(...Object.keys(visitedDirs).map(dirName => parseDirName(dirName))))
                : runningProcesses[lpar].startDate;

                console.log(`Checking for new files for ${lpar} since ${lastProcessedDate}`);
                const newFoldersProcessed = await checkForNewFiles(ftpClient, mysqlConnection, lastProcessedDate, null, lpar, metrics);
    
                if (newFoldersProcessed > 0) {
                    console.log(`Processed ${newFoldersProcessed} new folders for ${lpar}`);
                    // Enforce data retention after new folders are processed
                    await enforceDataRetention(mysqlConnection, lpar,metrics);
                } else {
                    console.log(`No new folders found for ${lpar}`);
                }
    
            } catch (error) {
                console.error(`Error in continuous monitoring for ${lpar}:`, error);
            } finally {
            // Close MySQL connection
            if (mysqlConnection) {
                try {
                    await mysqlConnection.end();
                    console.log(`MySQL connection closed for ${lpar}`);
                } catch (err) {
                    console.error(`Error closing MySQL connection for ${lpar}:`, err);
                }
            }

            // Close FTP connection
            if (ftpClient) {
                ftpClient.end();
                console.log(`FTP connection closed for ${lpar}`);
            }
        }
    }, checkInterval * 60000); // Convert minutes to milliseconds

    runningProcesses[lpar] = { 
        isRunning: true, 
        continuousMonitoring: true,
        interval: monitoringIntervals[lpar]
    };

    console.log(`Started continuous monitoring for ${lpar}`);
}

// Add this new route handler
async function checkNewData(req, res) {
    const { lpar } = req.body;
    try {
        const mysqlConnection = await mysql.createConnection({
            host: config.dds[lpar].hmai.mysql.host,
            user: config.dds[lpar].hmai.mysql.user,
            password: config.dds[lpar].hmai.mysql.password,
            multipleStatements: true
        });

        const ftpClient = new FTP();
        await new Promise((resolve, reject) => {
            ftpClient.on('ready', resolve);
            ftpClient.on('error', reject);
            ftpClient.connect({
                host: config.dds[lpar].ddsbaseurl,
                user: config.dds[lpar].ddsuser,
                password: config.dds[lpar].ddspwd,
            });
        });

        const visitedDirs = await new Promise((resolve, reject) => {
            hmaiJSONcontroller.readLparData(lpar, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        const lastProcessedDate = Object.keys(visitedDirs).length > 0
            ? new Date(Math.max(...Object.values(visitedDirs).map(d => new Date(d))))
            : new Date(0);

        const newFoldersProcessed = await checkForNewFiles(ftpClient, mysqlConnection, lastProcessedDate, null, lpar, ['clpr', 'ldev', 'mpb', 'mprank20', 'pgrp', 'port']);

        mysqlConnection.end();
        ftpClient.end();

        res.json({ success: true, newFoldersProcessed });
    } catch (error) {
        console.error(`Error checking for new data for ${lpar}:`, error);
        res.status(500).json({ success: false, message: 'Error checking for new data', error: error.message });
    }
}
function stopContinuousMonitoring(req, res) {
    const { lpar } = req.body;
    console.log(`Attempting to stop HMAI process for ${lpar}`);

    if (runningProcesses[lpar]) {
        // Clear the monitoring interval
        if (monitoringIntervals[lpar]) {
            clearInterval(monitoringIntervals[lpar]);
            delete monitoringIntervals[lpar];
            console.log(`Cleared monitoring interval for ${lpar}`);
        }

        // Close database connection
        if (runningProcesses[lpar].mysqlConnection) {
            runningProcesses[lpar].mysqlConnection.end(err => {
                if (err) {
                    console.error(`Error closing MySQL connection for ${lpar}:`, err);
                } else {
                    console.log(`Closed MySQL connection for ${lpar}`);
                }
            });
        }

        // Close FTP connection
        if (runningProcesses[lpar].ftpClient) {
            runningProcesses[lpar].ftpClient.end();
            console.log(`Closed FTP connection for ${lpar}`);
        }

        // Remove the process from runningProcesses
        delete runningProcesses[lpar];
        console.log(`Removed ${lpar} from running processes`);

        res.json({ success: true, message: `Stopped HMAI process for ${lpar}` });
    } else {
        console.log(`No active HMAI process found for ${lpar}`);
        res.status(400).json({ success: false, message: `No active HMAI process for ${lpar}` });
    }
}
async function saveHMAIConfig(req, res) {
    console.log("saveHMAIConfig called with body:", req.body);
    const { lpar, defaultStartDate, continuousMonitoring } = req.body;
    
    try {
        if (!config.dds[lpar]) {
            console.log("Invalid LPAR:", lpar);
            return res.status(400).json({ success: false, message: 'Invalid LPAR' });
        }

        if (!config.dds[lpar].hmai) {
            config.dds[lpar].hmai = {};
        }

        config.dds[lpar].hmai.defaultStartDate = defaultStartDate;
        config.dds[lpar].hmai.continuousMonitoring = continuousMonitoring;

        console.log("Updated config for LPAR:", config.dds[lpar]);

        await fs.promises.writeFile("./config/Zconfig.json", JSON.stringify(config, null, '\t'), 'utf-8');
        
        console.log("Config saved successfully");
        res.json({ success: true, message: 'HMAI configuration saved successfully' });
    } catch (error) {
        console.error('Error saving HMAI configuration:', error);
        res.status(500).json({ success: false, message: 'Error saving HMAI configuration' });
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
    console.log('Sending running processes:', runningProcessesInfo);
    res.json(runningProcessesInfo);
}

function updateRunningProcess(lpar, isRunning) {
    runningProcesses[lpar] = isRunning;
}
const startHMAIForAllLpars = async (req, res) => {
    const startedLpars = [];
    const skippedLpars = [];
    const alreadyRunningLpars = [];
    const allMetrics = ['clpr', 'ldev', 'mpb', 'mprank20', 'pgrp', 'port'];

    for (const lpar in config.dds) {
        if (runningProcesses[lpar] && runningProcesses[lpar].isRunning) {
            alreadyRunningLpars.push(lpar);
            continue;
        }

        if (isLparConfiguredForHMAI(config.dds[lpar])) {
            try {
                await startHMAIForLpar(lpar, allMetrics, true);
                startedLpars.push(lpar);
            } catch (error) {
                console.error(`Error starting HMAI for LPAR ${lpar}:`, error);
                skippedLpars.push(lpar);
            }
        } else {
            skippedLpars.push(lpar);
        }
    }

    let message = 'HMAI process started for all configured LPARs';
    if (skippedLpars.length > 0 || alreadyRunningLpars.length > 0) {
        message += '. Some LPARs were skipped.';
    }

    res.json({ 
        success: true, 
        message: message,
        startedLpars: startedLpars,
        skippedLpars: skippedLpars,
        alreadyRunningLpars: alreadyRunningLpars
    });
};
async function startHMAIForLpar(lpar, metrics, continuousMonitoring, userSpecifiedStartDate) {
    console.log(`Starting HMAI for LPAR: ${lpar}`);

    if (runningProcesses[lpar] && runningProcesses[lpar].isRunning) {
        console.log(`HMAI process is already running for ${lpar}`);
        return;
    }

    let startDate;
    const visitedDirs = await new Promise((resolve, reject) => {
        hmaiJSONcontroller.readLparData(lpar, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });

    if (userSpecifiedStartDate) {
        startDate = new Date(userSpecifiedStartDate);
    } else if (Object.keys(visitedDirs).length === 0) {
        startDate = new Date(config.dds[lpar].hmai.defaultStartDate);
    } else {
        startDate = new Date(Math.max(...Object.keys(visitedDirs).map(dirName => parseDirName(dirName))));
    }

    console.log(`Using start date: ${startDate} for LPAR: ${lpar}`);

    runningProcesses[lpar] = { 
        isRunning: true, 
        continuousMonitoring: continuousMonitoring,
        startDate: startDate,
        endDate: null
    };

    let mysqlConnection;
    let ftpClient;
    let databaseCreated = false;

    try {
        // Create MySQL connection
        mysqlConnection = await mysql.createConnection({
            host: config.dds[lpar].hmai.mysql.host,
            user: config.dds[lpar].hmai.mysql.user,
            password: config.dds[lpar].hmai.mysql.password,
            multipleStatements: true
        });
        console.log(`MySQL connection established for ${lpar}`);

        // Check if database exists
        const [rows] = await mysqlConnection.query(`SHOW DATABASES LIKE '${lpar}'`);
        if (rows.length === 0) {
            // Create database and tables
            await mysqlConnection.query(`CREATE DATABASE ${lpar}`);
            databaseCreated = true;
            console.log(`Database ${lpar} created`);
        } else {
            console.log(`Database ${lpar} already exists`);
        }

        await mysqlConnection.query(`USE ${lpar}`);
        console.log(`Using database ${lpar}`);

        if (databaseCreated) {
            await createTables(mysqlConnection);
            console.log(`Tables created for ${lpar}`);
        }

        // Start FTP connection
        ftpClient = new FTP();
        await new Promise((resolve, reject) => {
            ftpClient.on('ready', () => {
                console.log(`FTP connection established for ${lpar}`);
                resolve();
            });
            ftpClient.on('error', reject);
            ftpClient.connect({
                host: config.dds[lpar].ddsbaseurl,
                user: config.dds[lpar].ddsuser,
                password: config.dds[lpar].ddspwd,
            });
        });

        console.log(`Starting to check for new files for ${lpar} from ${startDate}`);
        await checkForNewFiles(ftpClient, mysqlConnection, startDate, null, lpar, metrics);

        // Enforce data retention after all files are processed
        await enforceDataRetention(mysqlConnection, lpar,metrics);

        if (continuousMonitoring) {
            startContinuousMonitoring(lpar, metrics);
            console.log(`Continuous monitoring started for ${lpar}`);
        } else {
            runningProcesses[lpar].isRunning = false;
        }

    } catch (error) {
        console.error(`Error in startHMAI for ${lpar}:`, error);
        delete runningProcesses[lpar];
        throw error;
    } finally {
        if (ftpClient && ftpClient.connected) {
            ftpClient.end();
            console.log(`FTP connection closed for ${lpar}`);
        }
        if (!continuousMonitoring && mysqlConnection) {
            try {
                await mysqlConnection.end();
                console.log(`MySQL connection closed for ${lpar}`);
            } catch (err) {
                console.error(`Error closing MySQL connection for ${lpar}:`, err);
            }
        }
    }
}
function isLparConfiguredForHMAI(lparConfig) {
    return lparConfig.hmai &&
           lparConfig.hmai.ftp &&
           lparConfig.hmai.ftp.directory &&
           lparConfig.hmai.mysql &&
           lparConfig.hmai.mysql.host &&
           lparConfig.hmai.mysql.user &&
           lparConfig.hmai.mysql.password &&
           lparConfig.hmai.checkInterval &&
           lparConfig.hmai.defaultStartDate &&
           lparConfig.hmai.continuousMonitoring === true;
}
// const fs = require('fs').promises;
// async function readZconfig() {
//     const configPath = path.join(__dirname, '..', '..', 'config', 'Zconfig.json');
//     const data = await fs.readFile(configPath, 'utf8');
//     return JSON.parse(data);
// }

// Modify the enforceDataRetention function to use the configuration from Zconfig
async function enforceDataRetention(mysqlConnection, lpar, metrics) {
    try {
        // const zconfig = await readZconfig();
        const retentionConfig = config.dds[lpar].hmai.dataRetention;

        for (const metric of metrics) {
            const retentionDays = retentionConfig[metric];
            if (retentionDays !== undefined && retentionDays > 0) {
                const deleteQuery = `DELETE FROM ${metric} WHERE TIMESTAMP < DATE_SUB(NOW(), INTERVAL ${retentionDays} DAY)`;
                await mysqlConnection.query(deleteQuery);
                console.log(`Applied ${retentionDays} days retention policy for ${metric} in ${lpar}`);
            } else if (retentionDays === 0) {
                console.log(`Retaining all data for ${metric} in ${lpar}`);
            } else {
                console.log(`No retention policy set for ${metric} in ${lpar}`);
            }
        }
    } catch (error) {
        console.error('Error enforcing data retention:', error);
        throw error;
    }
}
module.exports = {
    startHMAI,
    enforceDataRetention,
    clearDatabase,
    downloadCSV,
    getCSVData,
    checkNewData,
    stopContinuousMonitoring,
    saveHMAIConfig,
    getRunningProcesses,
    updateRunningProcess,
    startHMAIForAllLpars,
};

