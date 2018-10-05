'use strict';

const Logger = require('../lib/logger.js');

var _ = require('underscore');
var assert = require('assert');
var jobsc = require('@sap/jobs-client');

module.exports.registerJob = registerJob;
module.exports.getJobs = getJobs;


function registerJob(job, appconfig) {
  assert(job, 'job is required');
  assert(appconfig, 'appconfig is required');

  var options = {name: job.name, job: job};

  return new Promise(resolve => {
	  var scheduler = createScheduler(appconfig.jobs);
	  scheduler.upsertJob(options, function(err, body) {
	    if (err) {
	      return console.log('Failed to register job', err);
	      resolve(null);
	    }
	    console.log('Job registered successfully');
		resolve(body);
	  });
  });
}

function getJobs(appconfig) {
	return new Promise(resolve => {
		var scheduler = createScheduler(appconfig.jobs);
		scheduler.fetchAllJobs({}, function(err, body) {
			if (err) {
				console.log('Failed to obtain list of jobs', err);
				resolve(null);
			}
			resolve(body);
//			resolve({results: [{jobId: "myJob1", name: "My Job 1", tenantId: "Tenant 1"}, {jobId: "myJob2", name: "My Job 2", tenantId: "Tenant 2"}]});
		});
	});
}

function createScheduler(jobsconfig) {
  var options = _.extend(jobsconfig,
		  {baseURL: jobsconfig.url,
	  	   user: "sbss_gsbsarhuclm7k6lvfz5cvxe5fhmzc8euu801vs4mjbmdkqucrjsk2n5zpw6qktn0i/e=",
	  	   password: "aa_mtG5lB9zY31QVruU/ipC9SAGXL4="});
  return new jobsc.Scheduler(options);
}
