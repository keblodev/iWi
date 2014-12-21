'use strict';

var path = require('path');

//TODO: remove this once server and client can be built in single directory
//or do a NODE_END dependency
var basePath = path.resolve('../../');

var settings = {
  path       : path.normalize(path.join(__dirname, '..')),
  port       : process.env.NODE_PORT || 3000,
  clientDir  : path.resolve(basePath, '_client/dist'),
  serverDir  : path.resolve(basePath, '_server/dist')
};

module.exports = settings;