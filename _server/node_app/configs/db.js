'use strict';
//TODO: add migrations folder

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
      protocol : 'mongodb', // or "mysql", or "postgresql"
      query    : { pool: true },
      href     : 'mongodb://here_will_be_a_production_link/iwish-test-db', //  mongodb://user:pass@host:port/dbname - motherfuckers at orm2 don't know shit
      database : 'iwish-test-db',
      user     : '',
      password : ''
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
