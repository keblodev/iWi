'use strict';

//loading .env file
var dotenv = require('dotenv');
dotenv.load();

var path            = require('path');
var cookieParser    = require('cookie-parser');
var logger          = require('morgan');
var bodyParser      = require('body-parser');
var express         = require('express');
var serverSettings  = require('./server');
var models          = require('../models/');
var assignRoutes    = require('../router');
//TODO uncomment when we'l have favicon
// var favicon      = require('serve-favicon');

module.exports = function (app) {
  // app.use(express.static(path.join(serverSettings.path, 'public')));

  app.use(logger('dev' ));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  // uncomment after placing your favicon in /public
  //app.use(favicon(__dirname + '/public/favicon.ico'));
  app.use(cookieParser());

  //setting environment {development | production}
  //app.set('env', process.NODE_ENV);

  //setting _client dir
  app.set('clientDir', serverSettings.clientDir);
  //A BIG security hole right here. TODO: figure out what assets should be shared
  app.use(express.static(serverSettings.clientDir));

  // view engine setup

  app.set('views', path.resolve(serverSettings.serverDir, 'views'));
  app.set('view engine', 'jade');

  // app.use(express.methodOverride());
  app.use(function (req, res, next) {
    models(function (err, db) {
      if (err) {
        return next(err);
      }

      req.models = db.models;
      req.db     = db;

      return next();
    });
  });

  app = assignRoutes(app);
};