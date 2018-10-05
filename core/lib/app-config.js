'use strict';

var cfenv = require('cfenv');
var xsenv = require('@sap/xsenv');
const Logger = require('../lib/logger.js');

module.exports = appConfig();

function appConfig() {
    logger.info('Test 11');
	var appEnv = cfenv.getAppEnv();
	var uri = (appEnv.app.uris && appEnv.app.uris[0]) || 'localhost';
    logger.info('Test 21 (${uri})');
	var jobs = xsenv.getServices({ jobs: 'jsmt-sample-jobscheduler' }).jobs || {};
    logger.info('Test 21 (${appEnv.port})');
	
	return {host: uri, port: appEnv.port, url: 'http://' + uri, jobs: jobs};
}
