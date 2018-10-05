'use strict';

module.exports.insertMessage = insertMessage;

function insertMessage(req, res) {
  var params = req.body.data;

  console.log('Job started, params:', params, new Date().toTimeString());
  res.status(200).json({success: 'OK'});
}