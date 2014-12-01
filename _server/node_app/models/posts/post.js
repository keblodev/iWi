'use strict';

// var moment = require('moment');

module.exports = function (orm, db) {
  db.define('post', {
      //TODO
      createdAt : { type: 'date', required: true, time: true }
    },
    {
      hooks: {
        beforeValidation: function () {
          this.createdAt = new Date();
        }
      },
      validations: {
        //TODO
      },
      methods: {
        //TODO
      }
  });
};