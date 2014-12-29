'use strict';

var orm         = require('orm');
var dbSettings  = require('../configs/db');

var connection = null;

function setup(db, cb) {
  require('./users/users')(orm, db);
  require('./posts/post')(orm, db);
  require('./posts/comment')(orm, db);

  process.on('exit', function(){
    console.log('closing DB connection...');
    db.close();
  });

  return cb(null, db);
}

module.exports = function (cb) {
  if (connection) {
    return cb(null, connection);
  }

  orm.connect(dbSettings, function (err, db) {
    if (err) {
      return cb(err);
    }

    connection = db;
    db.settings.set('instance.returnAllErrors', true);
    setup(db, cb);
  });
};