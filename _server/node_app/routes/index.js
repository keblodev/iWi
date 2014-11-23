var express = require('express');
var router = express.Router();

var self = this;
    self.path = require('path');

/* GET home page. */
router.get('/', function(req, res) {
  var indexFilePath = this.path.resolve(req.app.get('clientDir'), 'index.html');
  res.sendFile(indexFilePath);
}.bind(self));

module.exports = router;
