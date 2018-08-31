'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const xssec = require('@sap/xssec');
const xsenv = require('@sap/xsenv');
const JobSchedulerAPI = require('./lib/JobSchedulerAPI');
const RouteHandler = require('./routes');
const Logger = require('./lib/logger.js');

const app = express();
let logger = new Logger();

const JWTStrategy = xssec.JWTStrategy;
passport.use(new JWTStrategy(xsenv.getServices({
    uaa: {
        tag: 'xsuaa',
    },
}).uaa));

app.use(bodyParser.urlencoded({
    extended: false,
}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.authenticate('JWT', {
    session: false,
}));

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
        let jobDetails = await JobSchedulerAPI.registerJob(req);
        logger.info(`Job registered for tenant (${req.authInfo.getIdentityZone()})`);
        res.status(201).json({
            message: `Job registered for tenant (${req.authInfo.getIdentityZone()})`,
            jobInfo: jobDetails.body,
        });
    } catch (error) {
        res.status(500).end(`Error occurred while creating job for tenant (${req.authInfo.getIdentityZone()})`);
    }
});

app.get('/executeJob', hasScope('JOBSCHEDULER'), (req, res) => {
    res.status(200).json({
        'message': `Job executed successfully on behalf of tenant (${req.authInfo.getIdentityZone()})`,
        'subDomain': req.authInfo.getSubdomain(),
    });
});

app.get('/callback/v1.0/dependencies', hasScope('Callback'), RouteHandler.SaaSRegistryCallbacks.getDependencies);
app.put('/callback/v1.0/tenants/:tenant_id', hasScope('Callback'), RouteHandler.SaaSRegistryCallbacks.subscribeTenant);
app.delete('/callback/v1.0/tenants/:tenant_id', hasScope('Callback'), RouteHandler.SaaSRegistryCallbacks.subscribeTenant);

let PORT = process.env.PORT || 8088;
app.listen(PORT, function () {
    logger.info(`jsmt-sample-core listening at port ${PORT}`);
});