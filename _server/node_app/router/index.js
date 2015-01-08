'use strict';

var models = require('../models/');

module.exports = function (app) {
  // app.use(express.methodOverride());
  app.use(function (req, res, next) {
    models(function (err, db) {
      if (err) {
        return next(err);
      }

      req.models = db.models;
      req.db     = db;

      app.closeDbConnection = function() {
        db.close();
      };

      return next();
    });
  });

  app.use('/', require('./routes/home'));
  app.use('/users', require('./routes/users'));

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    console.log('404 -|- path:' + req.originalUrl);
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

// error handlers

// development error handler
// will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res) {
      console.log('500 -|- path:' + req.originalUrl);
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }
  else {
  // production error handler
  // no stacktraces leaked to user
    app.use(function(err, req, res) {
      console.log('500 -|-prod-|- path:' + req.originalUrl);
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {}
      });
    });
  }
};
