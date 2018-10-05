'use strict';

var cfenv = require('cfenv');
var xsenv = require('@sap/xsenv');

module.exports = appConfig();

function appConfig() {
  var appEnv = cfenv.getAppEnv();

  var uri = (appEnv.app.uris && appEnv.app.uris[0]) || 'localhost';
  var jobs = xsenv.getServices({jobs: 'jsmt-sample-jobscheduler'}).jobs || {};

  return {host: uri, port: appEnv.port, url: 'http://' + uri, jobs: jobs};
}
