'use strict';

const xsenv = require('@sap/xsenv');
const randomstring = require('randomstring');
const Logger = require('./logger.js');
const Promise = require('bluebird');
const xssec = require('@sap/xssec');
const request = Promise.promisifyAll(require('request'));

let logger = new Logger();
let jobschedulerCredentials = xsenv.getServices({
    jobscheduler: {
        tag: 'jobscheduler',
    },
}).jobscheduler;

// function _validateResponse(response, expectedStatusCode) {
//     return response.statusCode === expectedStatusCode;
// }

// function _getResponseBody(response) {
//     if(!_validateResponse(response, 200)) {
//         throw new Error('Error validating response');
//     }
//     try {
//         return JSON.parse(response.body);
//     } catch(err) {
//         throw new Error('Error parsing request body');
//     }
// }

// function _jobSchedulerGetAPIPromise(api, bearerToken) {
//     logger.info(`Invoking jobscheduler api (${api}) using token: ${bearerToken}`);
//     return request.getAsync({
//         url: `${jobschedulerCredentials.url}/${api}`,
//         headers : {
//             'Authorization' : 'Bearer ' + bearerToken,
//         },
//     });
// }

function _jobSchedulerPostAPIPromise(api, body, bearerToken) {
    logger.info(`Invoking jobscheduler api (${api}) using token: ${bearerToken}`);
    return request.postAsync({
        url: `${jobschedulerCredentials.url}/scheduler/${api}`,
        headers : {
            'Authorization' : 'Bearer ' + bearerToken,
            'Content-type': 'application/json',
        },
        json: body,
    });
}

function getAccessToken(request, type) {
    let url = jobschedulerCredentials.uaa.url;
    if(type === xssec.constants.TYPE_USER_TOKEN) {
        let subDomain = request.authInfo.getSubdomain();
        url = url.substring(0,url.indexOf(':')) + '://' + subDomain + url.substring(url.indexOf('.'));
    }
    let credentials = {
        clientid: jobschedulerCredentials.uaa.clientid,
        clientsecret: jobschedulerCredentials.uaa.clientsecret,
        url: url,
    };

    logger.info(`Requesting user_token with info: ${JSON.stringify(credentials)}`);

    return new Promise((resolve, reject) => {
        request.authInfo.requestToken(credentials, type, null, function(error, token) {
            if(error) {
                logger.error(`Failed to fetch access token from url (${credentials.url}) using clientid (${credentials.clientid})`);
                return reject(error);
            }
            return resolve(token);
        });
    });
}

class JobSchedulerAPI {

    static async registerJob(request) {
        try {
            let token = await getAccessToken(request, xssec.constants.TYPE_USER_TOKEN);
            return await _jobSchedulerPostAPIPromise('jobs', {
                'name': randomstring.generate(12),
                'description': 'Job created for tenant: ' + request.authInfo.getIdentityZone(),
                'action': 'https://jsmt-sample-core.cfapps.sap.hana.ondemand.com/executeJob',
                'active': true,
                'httpMethod': 'GET',
                'schedules': [{
                    'cron': '* * * * * */5 0',
                    'description': 'This schedule runs every 5 minutes',
                    'active': 'true',
                },],
            }, token);
        } catch(error) {
            logger.error('Error occurred while creating job');
            logger.error(error);
            return null;
        }
    }
}

module.exports = JobSchedulerAPI;