var logger = require('./gulp-logger');
var os = require('os');
var ps = require('ps-node');

// direct usage of console. runs command in separate child process.
// and it dies along with main process
var exec = require('child_process').exec

/*
*
* Creates background child process with passed shell-command execution
* Child process dies along with parent process
*
* @param shellCmnd {String}
*/
var _startBackgroundChildShellProcess = function(shellCmnd) {
    var child = exec(shellCmnd, function(error, stdout, stderr) {
      logger.log('info', stdout);
      logger.log('error', stderr);
      if (error !== null) {
          logger.log('error', error);
      }
    });

    child.stdout.on('data', function(data) {
        logger.log('info', data);
    });
    child.stderr.on('data', function(data) {
        logger.log('info', data);
    });
    child.on('close', function(code) {
        logger.log('closing c,e: ' + code);
    });
}

module.exports = {

  getLocalIP: function () {
    var interfaces = os.networkInterfaces();

    for (var interfaceName in interfaces) {
        for (var key in interfaces[interfaceName]) {
            var address = interfaces[interfaceName][key];
            if (address.family === 'IPv4' && !address.internal) {
                return address.address;
            }
        }
    }
  },

  killAndRestartServer: function(serverProcessName, restartGulpTaskShellCommand) {
    //TODO: move this method to utils-helper
    var server_process_pid = null

    ps.lookup({
        command: serverProcessName,
        psargs: 'ux'
        }, function(err, resultList ) {
        if (err) {
            throw new Error( err );
        }

        resultList.forEach(function( process ){
            if( process ){
              server_process_pid = process.pid;
                logger.log('info', 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
            }
        });

        if (server_process_pid) {
          ps.kill( resultList[0].pid, function(cb){
            if (err) {
                throw new Error( err );
            }
            else {
                logger.log('warn', 'Process ' + serverProcessName + ' has been killed! Restarting...');
                _startBackgroundChildShellProcess(restartGulpTaskShellCommand);
            }
          }.bind(this));
        }
        else {
          logger.log('warn','Process ' + serverProcessName + ' has NOT been killed! Starting...');
          _startBackgroundChildShellProcess(restartGulpTaskShellCommand);
        }
    });
  }
}