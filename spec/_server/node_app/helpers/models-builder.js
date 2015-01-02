'use strict'

// var Users = reauire ('../models/users')
var common = require('./common');
var async  = require('async');

var db = null;

//models
var Users;

var models = {
  'users': Users
}

//Define models here
var _initModels = function() {

  models['users'] = db.define('users', {
    username: String
  })
}

module.exports.create = function (modelName, models, done) {
  var model = _getModelByName(modelName);

  _dropSync(model, function() {
    model.create(models, done);
  })
}

module.exports.connect = function(cb) {
    var opts = {};

    if (1 in arguments) {
        opts = arguments[0];
        cb   = arguments[1];
    }
    common.createConnection(opts, function (err, conn) {
        if (err) {
          throw err;
        }

        db = conn;
        db.drop(function (err) {
          _initModels();
          cb(conn);
        });
    });
};

module.exports.closeDbConnection = function(cb) {
    db.drop(function (err) {
      if (err) throw err;
      db.close();
    });
};

//*********** Private stuff

var _getModelByName = function(modelName) {
  var model = models[modelName.toLowerCase()];

  if (!model) {
    throw Error('There"s no such model as: ' + modelName);
  }

  return model;
}

var _dropSync = function (models, done) {
    if (!Array.isArray(models)) {
        models = [models];
    }

    async.eachSeries(models, function (item, cb) {
        item.drop(function (err) {
            if (err) throw err;

            item.sync(cb);
        });
    }, function (err) {
        if (common.protocol() != 'sqlite') {
            if (err) throw err;
        }
        done(err);
    });
};