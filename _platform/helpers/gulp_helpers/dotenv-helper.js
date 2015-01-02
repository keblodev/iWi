var path = require('path');
var logger = require('./gulp-logger');

module.exports = function() {

  var self = this;

  var envMap = {
    CLIENT_NAME : null,
    SERVER_NAME : null,
    CLIENT_APP_PATH : null,
    SHARED_CLIENT_RESOURCES_PATH : null,
    CLIENT_BUILD_PATH : null,
    SERVER_APP_PATH : null,
    SERVER_BUILD_PATH : null
  };

  _envFileName = ".env";

  var _saveEnv = function(envMap) {
    var fs = require('fs');

    try {
      var envFilePath = path.resolve("./" + _envFileName);

      if (fs.existsSync(envFilePath)) {
        logger.log('warn', 'Clearing ..' + _envFileName);
         fs.writeFileSync(envFilePath, '');
         logger.log('info','Done Clearing. Saving...');
      }
       _writeEnvToFile(fs, envFilePath, envMap);
    }
    catch (e) {
      throw Error('Failed on file operation with' + _envFileName + '  ' + JSON.stringify(e));

      return false;
    }

    return true;
  };

  _writeEnvToFile = function(fs, envFilePath, envMap) {
    for(var envVarName in envMap) {
      if(envMap.hasOwnProperty(envVarName)) {
        var line = envVarName + ' = ' + envMap[envVarName];
        logger.log('warn','Adding.. ' + line);
        fs.appendFileSync(envFilePath, line.toString() + "\n");
      }
    }
  };

  self.setEnv = function(argv) {
        //default client: angular
    var clientName = (argv.client_app || "angular") + "_app",
        //default server: node
        serverName = (argv.server_app || "node") + "_app",
        clientAppPath =             path.resolve("_client/client_app/" + clientName),
        sharedClientResourcesPath = path.resolve("_client/shared_resources/"),
        clientBuildPath =           path.resolve("_client/dist"),
        serverAppPath =             path.resolve("_server/" + serverName),
        serverBuildPath =           path.resolve("_server/dist"),
    envMap = {
      CLIENT_NAME : clientName,
      SERVER_NAME : serverName,
      CLIENT_APP_PATH : clientAppPath,
      SHARED_CLIENT_RESOURCES_PATH : sharedClientResourcesPath,
      CLIENT_BUILD_PATH : clientBuildPath,
      SERVER_APP_PATH : serverAppPath,
      SERVER_BUILD_PATH : serverBuildPath
    };

    _saveEnv(envMap);

    return true;
  };

  self.getEnv = function() {

    logger.log('info','Getting Env');
    //loading .env file
    var dotenv = require('dotenv');
    if(!dotenv.load()) {
      logger.log('warn','NO ' + _envFileName +' file. Going to create one in root');
      var optimist = require('optimist');
      self.setEnv(optimist.argv);

      if(!dotenv.load()) {
        throw Error('Failed to load ' + _envFileName + '. Check your env permissions, or create it by hands in root');
        return false;
      }
    }

    logger.log('info','Got env variables from ' + _envFileName + ' . Checking...');

    if (!process.env.CLIENT_NAME ||
        !process.env.SERVER_NAME ||
        !process.env.CLIENT_APP_PATH ||
        !process.env.SHARED_CLIENT_RESOURCES_PATH ||
        !process.env.CLIENT_BUILD_PATH ||
        !process.env.SERVER_APP_PATH ||
        !process.env.SERVER_BUILD_PATH) {

        logger.log('warn','Some variables in ' + _envFileName + ' are not set!');
        logger.log('info',
        ' \n CLIENT_NAME: ' + process.env.CLIENT_NAME +
        ' \n SERVER_NAME: ' + process.env.SERVER_NAME +
        ' \n CLIENT_APP_PATH: ' + process.env.CLIENT_APP_PATH +
        ' \n SHARED_CLIENT_RESOURCES_PATH: ' + process.env.SHARED_CLIENT_RESOURCES_PATH +
        ' \n CLIENT_BUILD_PATH: ' + process.env.CLIENT_BUILD_PATH +
        ' \n SERVER_APP_PATH: ' + process.env.SERVER_APP_PATH +
        ' \n SERVER_BUILD_PATH: ' + process.env.SERVER_BUILD_PATH);
        logger.log('warn','Setting... \n');

        self.setEnv({
          client: process.env.CLIENT_NAME,
          server: !process.env.SERVER_NAME
        });

        if(!dotenv.load()) {
          throw Error('Failed to load ' + _envFileName + '. Check your env permissions, or create it by hands in root');

          return false;
        }
    }

    logger.info('Checked. All good.');

    return true;
  };
}