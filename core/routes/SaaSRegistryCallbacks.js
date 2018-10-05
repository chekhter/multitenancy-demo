const xsenv = require('@sap/xsenv');
const Logger = require('../lib/logger.js');
let logger = new Logger();

let jobschedulerCredentials = xsenv.getServices({jobscheduler: {tag: 'jobscheduler'}}).jobscheduler;

exports.getDependencies = (req, res) => {
    logger.info('Get dependencies for subscription');
    let xsappname = jobschedulerCredentials.uaa.xsappname;
    res.status(200).json([{'appId': xsappname, 'appName': 'sap-jobscheduler'}]);
    res.status(200).json([]);
};

exports.subscribeTenant = (req, res) => {
    let payload = req.body;
    let subDomain = payload.subscribedSubdomain;
    logger.info(`Add subscription for tenant (${req.params.tenant_id}), subDomain (${subDomain}) in globalAccount (${payload.globalAccountGUID})`);
    let url = `https://${subDomain}-jsmt.cfapps.sap.hana.ondemand.com`;
    logger.info(`Sending tenant specific url (${url})`);
    res.status(200).send(url);
};

exports.unsubscribeTenant = (req, res) => {
    let payload = req.body;
    res.status(200).end(`Tenant (${req.params.tenant_id}) has been unsubscribed from application (${payload.subscriptionAppId})`);
};