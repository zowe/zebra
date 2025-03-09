/**
 * Simple script to toggle debug settings
 * Run with: node toggleDebug.js [setting] [value]
 * 
 * Examples:
 *   node toggleDebug.js RMF3_DEBUG true
 *   node toggleDebug.js PARSER_DEBUG false
 *   node toggleDebug.js all true
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config', 'debugConfig.js');

// Read current config
let configContent = fs.readFileSync(configPath, 'utf8');

// Get command line arguments
const setting = process.argv[2];
const value = process.argv[3] === 'true';

if (!setting) {
  console.log('Usage: node toggleDebug.js [setting] [value]');
  console.log('Available settings: RMF3_DEBUG, PARSER_DEBUG, DB_DEBUG, all');
  console.log('Values: true, false');
  process.exit(1);
}

if (setting.toLowerCase() === 'all') {
  // Update all settings
  configContent = configContent.replace(/RMF3_DEBUG: (true|false)/g, `RMF3_DEBUG: ${value}`);
  configContent = configContent.replace(/PARSER_DEBUG: (true|false)/g, `PARSER_DEBUG: ${value}`);
  configContent = configContent.replace(/DB_DEBUG: (true|false)/g, `DB_DEBUG: ${value}`);
  
  console.log(`All debug settings set to: ${value}`);
} else {
  // Update specific setting
  const regex = new RegExp(`${setting}: (true|false)`, 'g');
  if (!configContent.match(regex)) {
    console.log(`Setting '${setting}' not found in config file.`);
    process.exit(1);
  }
  
  configContent = configContent.replace(regex, `${setting}: ${value}`);
  console.log(`Debug setting '${setting}' set to: ${value}`);
}

// Write updated config back to file
fs.writeFileSync(configPath, configContent);
console.log('Debug configuration updated. Restart the application for changes to take effect.'); 