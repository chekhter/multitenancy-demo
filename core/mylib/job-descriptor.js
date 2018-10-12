'use strict';

const randomstring = require('randomstring');

module.exports = {
	    'name': randomstring.generate(12),
	    'description': 'Job created',
	    'httpMethod': 'GET',
	    'action': 'https://jsmt-sample-endpoint-d041287.cfapps.sap.hana.ondemand.com/testEndpoint',
	    'active': true,
	    'schedules': [{
	        'cron': '* * * * */1 0 0',
	        'description': 'This schedule will run every hour',
	        'active': 'true',
	    }],
	    jobFunction: {module: './mylib/job-function', func: 'insertMessage'}
};