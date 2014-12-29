'use strict'

var models = require('./models-builder');
var request = require('supertest');

module.exports.connect = models.connect;
module.exports.create = models.create;
module.exports.closeDbConnection = models.closeDbConnection;
module.exports.request = request;
