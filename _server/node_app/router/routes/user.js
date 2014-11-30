'use strict';

var express = require('express');
var router = express.Router();

// GET /user
router.get('/', function(req, res) {
  res.render('index', {title: 'USER main Page'});
});

// GET /user/info
router.get('/info', function (req, res) {
  res.render('index', {title: 'USER INFO page'});
});

module.exports = router;
