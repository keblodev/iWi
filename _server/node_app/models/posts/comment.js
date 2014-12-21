'use strict';

// var moment = require('moment');

module.exports = function (orm, db) {
  db.define('comment', {
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
        name: [
          orm.enforce.ranges.length(1, undefined, 'must be atleast 1 letter long'),
          orm.enforce.ranges.length(undefined, 32768, 'cannot be longer than 32768 letters')
        ]
      },
      methods: {
        //TODO
        //serialize: function () {

        //   var comments;

        //   if (this.comments) {
        //     comments = this.comments.map(function (c) { return c.serialize(); });
        //   } else {
        //     comments = [];
        //   }

        //   return {
        //     id        : this.id,
        //     title     : this.title,
        //     body      : this.body,
        //     createdAt : moment(this.createdAt).fromNow(),
        //     comments  : comments
        //   };
        // }
      }
  });
};