#!/usr/bin/env node

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const start = require('../lib/cmd/start');
const stop = require('../lib/cmd/stop');
const restart = require('../lib/cmd/restart');

/**
 * Command Line Interface for ZEBRA 
 */

yargs( hideBin(process.argv) )
    .usage('usage: $0 <command>')
    .command('start', 'Start the ZEBRA server.', (yargs) => {
        return yargs
            .option('port', {
                alias: 'P',
                type: 'number',
                description: 'Port on which the ZEBRA server runs. By default, it uses port 3090',
                requiresArg: true,
            })
            .option('username', {
                alias: 'u',
                type: 'string',
                description: 'Initial ZEBRA username. By default, it is `admin`.',
                requiresArg: true,
            })
            .option('password ', {
                alias: 'p',
                type: 'string',
                description: 'Initial ZEBRA password. By default, it is `admin`. Upon first login, you will be prompted to change it',
                requiresArg: true,
            })
            .option('config', {
                alias: 'c',
                type: 'string',
                description: 'Loads ZEBRA config from the given YAML config file path.',
                requiresArg: true,
            });
    }, (argv) => {
        /** START COMMAND */
    })
    .command('stop', 'Stop the running ZEBRA server.', (yargs) => yargs, (argv) => {
        /** STOP COMMAND */
    })
    .command('restart', 'Restart the running ZEBRA server.', (yargs) => yargs, (argv) => {
        /** RESTART COMMAND */
    })
    .help()
    .alias('help', 'h')
    .alias('version', 'v')
    .wrap(null)
    .parse();