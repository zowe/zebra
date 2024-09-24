// app_server/Controllers/hmaiJSONcontroller.js

var fs = require('fs');
var path = require('path');

var HMAI_MEMORY_DIR = path.join(__dirname, '..', '..', 'config', 'hmaiMemory');

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
    var filePath = path.join(HMAI_MEMORY_DIR, lpar + '.json');
    ensureDirectoryExists(HMAI_MEMORY_DIR, function(err) {
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
    var filePath = path.join(HMAI_MEMORY_DIR, lpar + '.json');
    ensureDirectoryExists(HMAI_MEMORY_DIR, function(err) {
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
        var updatedData = Object.assign({}, currentData, newData);
        writeLparData(lpar, updatedData, function(writeErr) {
            if (writeErr) {
                return callback(writeErr);
            }
            callback(null, updatedData);
        });
    });
}

module.exports = {
    readLparData: readLparData,
    writeLparData: writeLparData,
    updateLparData: updateLparData
};