var fs = require('fs');
var path = require('path');

var DCOL_MEMORY_DIR = path.join(__dirname, '..', '..', 'config', 'dcolMemory');

function ensureDirectoryExists(directory, callback) {
    fs.mkdir(directory, function(err) {
        if (err && err.code !== 'EEXIST') {
            callback(err);
        } else {
            callback(null);
        }
    });
}

function readLparData(lpar, callback) {
    var filePath = path.join(DCOL_MEMORY_DIR, lpar + '.json');
    ensureDirectoryExists(DCOL_MEMORY_DIR, function(err) {
        if (err) {
            return callback(err);
        }
        fs.readFile(filePath, 'utf8', function(err, data) {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.log('No existing data for ' + lpar + ', initializing with empty object');
                    fs.writeFile(filePath, JSON.stringify({}), 'utf8', function(writeErr) {
                        if (writeErr) {
                            return callback(writeErr);
                        }
                        callback(null, {});
                    });
                } else {
                    return callback(err);
                }
            } else {
                try {
                    var parsedData = JSON.parse(data);
                    callback(null, parsedData);
                } catch (parseError) {
                    callback(parseError);
                }
            }
        });
    });
}

function writeLparData(lpar, data, callback) {
    var filePath = path.join(DCOL_MEMORY_DIR, lpar + '.json');
    ensureDirectoryExists(DCOL_MEMORY_DIR, function(err) {
        if (err) {
            return callback(err);
        }
        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', callback);
    });
}

function updateLparData(lpar, newData, callback) {
    readLparData(lpar, function(err, currentData) {
        if (err) {
            return callback(err);
        }

        
        for (const key in newData) {
            if (newData.hasOwnProperty(key)) {
                if (typeof newData[key] === 'object' && newData[key] !== null && !Array.isArray(newData[key]) && currentData[key]) {
                    currentData[key] = { ...currentData[key], ...newData[key] };
                } else {
                    currentData[key] = newData[key];
                }
            }
        }

        writeLparData(lpar, currentData, function(writeErr) {
            if (writeErr) {
                return callback(writeErr);
            }
            callback(null, currentData);
        });
    });
}

module.exports = {
    readLparData: readLparData,
    writeLparData: writeLparData,
    updateLparData: updateLparData
};
