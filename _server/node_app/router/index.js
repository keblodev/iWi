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

      return next();
    });
  });

  app.use('/', require('./routes/home'));
  app.use('/users', require('./routes/users'));

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

// error handlers

// development error handler
// will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

// production error handler
// no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
};
