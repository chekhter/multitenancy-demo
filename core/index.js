'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const xssec = require('@sap/xssec');
const xsenv = require('@sap/xsenv');
//const JobSchedulerAPI = require('./lib/JobSchedulerAPI');
const RouteHandler = require('./routes');
const Logger = require('./lib/logger.js');

const https = require('https')
var appconfig = require('./mylib/app-config');
var job = require('./mylib/job-descriptor');
var jobManager = require('./mylib/job-manager');


const app = express();
let logger = new Logger();

const JWTStrategy = xssec.JWTStrategy;
passport.use(new JWTStrategy(xsenv.getServices({uaa: {tag: 'xsuaa'}}).uaa));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.authenticate('JWT', {session: false}));

function hasScope(scopeName) {
    return function (request, response, next) {
        if (!request.authInfo) {
            logger.error('Error creating SecurityContext');
            response.status(403).end('Forbidden');
            return;
        }

        logger.info(`Verifying scope (${scopeName}) in jwt`);
        if (!request.authInfo.checkLocalScope(scopeName)) {
            logger.error(`Missing the expected scope (${scopeName})`);
            response.status(403).end('Forbidden');
        } else {
            next();
        }
    };
}

app.get('/registerJob', hasScope('User'), async (req, res) => {
    logger.info('Request to register job has been received');
    try {
    	// Register job in job scheduler
    	//let jobDetails = await JobSchedulerAPI.registerJob(req);
        let jobDetails = await jobManager.registerJob(job, appconfig);
        logger.info(`Job registered for tenant (${req.authInfo.getIdentityZone()})`);
        res.status(201).json({
            message: `Job registered for tenant (${req.authInfo.getIdentityZone()})`,
            jobInfo: jobDetails.body,
        });
    } catch (error) {
        res.status(500).end(`Error occurred while creating job for tenant (${req.authInfo.getIdentityZone()})`);
    }
});

app.get('/getJobs', hasScope('User'), async (req, res) => {
    logger.info('Request to fetch all jobs has been received');
    try {
//        let jobResponse = await JobSchedulerAPI.getJobs(req);
        let allJobs = await jobManager.getJobs(appconfig);
        res.status(201).json(allJobs);
    } catch (error) {
        res.status(500).end(`Error occurred while fetching jobs for tenant (${req.authInfo.getIdentityZone()})`);
    }
});

app.get('/readModel', hasScope('User'), (req, res) => { // the scope should be SCHEDULER, actually
	var options = {
	   host: 'mdmorchestration-dev-site-entry.cfapps.sap.hana.ondemand.com',
	   port: 443,
	   path: "/odata/v2/manageDistributions/SubscriptionDistributions(guid'b6222ffd-9458-4e78-894a-15e39b74e4b2')"
	   //headers: {'Authorization': 'Basic ' + new Buffer(username + ':' + passw).toString('base64')}   
	};
	https.get(options, (resp) => {
		let data = '';

		// A chunk of data has been recieved.
		resp.on('data', (chunk) => {
			data += chunk;
		});

		// The whole response has been received. Print out the result.
		resp.on('end', () => {
			console.log("Test 1");
		    res.status(200).json({
		        'message': `Job executed successfully on behalf of tenant (${req.authInfo.getIdentityZone()})`,
		        'newFrequency': JSON.parse(data).Frequency
		    });
		});
	}).on('error', (e) => {
		console.log("Something went wrong" + JSON.stringify(e));
		console.error(e);
	});
});

app.get('/callback/v1.0/dependencies', hasScope('Callback'), RouteHandler.SaaSRegistryCallbacks.getDependencies);
app.put('/callback/v1.0/tenants/:tenant_id', hasScope('Callback'), RouteHandler.SaaSRegistryCallbacks.subscribeTenant);
app.delete('/callback/v1.0/tenants/:tenant_id', hasScope('Callback'), RouteHandler.SaaSRegistryCallbacks.subscribeTenant);

let PORT = process.env.PORT || 8088;
app.listen(PORT, function () {
    logger.info(`jsmt-sample-core listening at port ${PORT}`);
});