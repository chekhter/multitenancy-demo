'use strict';

const randomstring = require('randomstring');

module.exports = {
	'name': randomstring.generate(12),
	'description': '1. Will run every 5 minutes',
	'active': true,
	'httpMethod': 'GET',
	'action': 'https://jsmt-sample-core-d041287.cfapps.sap.hana.ondemand.com/executeJob',
	schedules: [{
		'description': '2. Will run every 5 minutes',
		'cron': '* * * * * */5 0',
		'active': true,
		'data': {'message': 'Insert message from Nodejs'}
	}],
	'jobFunction': {'module': './lib/job-function', 'func': 'insertMessage'}
};
