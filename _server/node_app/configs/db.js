'use strict';
//TODO: add migrations folder
if (process.env.NODE_ENV === 'production') {
  var dbUser = process.env.MONGO_REMOTE_USER;
  var dbPass = process.env.MONGO_REMOTE_PASS;
  var dbLink = process.env.MONGO_REMOTE_LINK;

  if (!dbUser || !dbPass || !dbLink) {
    throw Error('Check your DB credentials in .env file! ' +
      ' \n dbUser: ' + dbUser +
      ' \n dbPass: ' + dbPass +
      ' \n dbLink: ' + dbLink
      );
  }
}


//mongo
var database = {
    development: {
      protocol : 'mongodb', // or "mysql", or "postgresql"
      query    : { pool: true },
      href     : 'mongodb://localhost/iwish-test-db', //  mongodb://user:pass@host:port/dbname - motherfuckers at orm2 don't know shit
      database : 'iwish-test-db',
      user     : '',
      password : ''
    },
    production: {
      protocol : 'mongodb',
      href     : 'mongodb://' + dbUser + ':' + dbPass + '@' + dbLink, // also those guys in orm2 don't join provided login and password in to that url! mongodb://user:pass@host:port/dbname
    }
};

//mysql
// var database = {
//     protocol : 'mysql',//'mongodb', // or "mysql", or "postgresql"
//     query    : { pool: true },
//     host     : '127.0.0.1',
//     database : 'white_label_development',
//     user     : 'root',
//     password : ''
// };

module.exports = database[process.env.NODE_ENV ? process.env.NODE_ENV : 'development'];
