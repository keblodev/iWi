'use strict';

var express = require('express');
var router = express.Router();

// GET /users
router.get('/', function(req, res) {
  req.models.users.find(function(err, users) {
    res.send(users);
  });
});

// GET /user/info
router.get('/info', function (req, res) {
  res.render('index', {title: 'USER INFO page'});
});

module.exports = router;
