'use strict';

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  var path = require('path');
  var indexFilePath = path.resolve(req.app.get('clientDir'), 'index.html');
  res.sendFile(indexFilePath);
});

module.exports = router;
