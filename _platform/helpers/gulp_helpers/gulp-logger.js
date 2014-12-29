var winston = require('winston');
var logger = new (winston.Logger)({
  levels: {
    trace: 0,
    input: 1,
    verbose: 2,
    prompt: 3,
    debug: 4,
    info: 5,
    data: 6,
    help: 7,
    warn: 8,
    error: 9
  },
  colors: {
    trace: 'magenta',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    debug: 'blue',
    info: 'cyan',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    error: 'red'
  }
});

logger.add(winston.transports.Console, {
  level: 'trace',
  prettyPrint: false,
  colorize: true,
  silent: false,
  timestamp: true
});

// uncomment is file-logging is needed
// logger.add(winston.transports.File, {
//   prettyPrint: false,
//   level: 'info',
//   silent: false,
//   colorize: true,
//   timestamp: true,
//   filename: './logs/dotenv-helper.log',
//   maxsize: 40000,
//   maxFiles: 10,
//   json: true
// });

module.exports = logger;