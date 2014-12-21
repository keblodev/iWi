'use strict';

var express         = require('express');
var path            = require('path');
var serverSettings  = require('./configs/server');
//var dbSettings      = require('./configs/db');
var envSettings     = require('./configs/environment');

//DB
//TODO: move DB init to separate module
//var mongoose      = require('mongoose');
//TODO: separate it to dev and production
//mongoose.connect('mongodb://ok2.local:27017/iwish-test-db');

// getting client platform
// var optimist = require('optimist');
// var client = (optimist.argv.client || 'angular') + '_app';

//TODO: refactor this sh''t
//app.mongoose = mongoose;

module.exports.start = function (done) {
  var app = express();

  envSettings(app);

  app.listen(serverSettings.port, function () {
    console.log( 'Listening on port ' + serverSettings.port );

    if (done) {
      return done(null, app);//, server);
    }
  }).on('error', function (e) {
    if (e.code === 'EADDRINUSE') {
      console.log('Address in use. Is the server already running?'.red);
    }
    if (done) {
      return done(e);
    }
  });
};

// If someone ran: 'node server.js' then automatically start the server
if (path.basename(process.argv[1],'.js') === path.basename(__filename,'.js')) {
  module.exports.start();
}