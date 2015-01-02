'use strict'

helper  = require '../helpers/specHelper'
should  = require 'should'

app = require(process.env.SERVER_APP_PATH + '/node_modules/express')()
# assign routes
require(process.env.SERVER_APP_PATH + '/router')(app)

describe "Users route", ->
  setup = (done) ->
    helper.create 'users', [
        {
          id  : 1,
          username: "john1"
        }, {
          id  : 2,
          username: "jane"
        }, {
          id  : 3,
          username: "john2"
        }
      ], done

  before (done) ->
    helper.connect (connection) ->
      db = connection
      setup(done)

  after (done) ->
    # Don't ever forget to close connections to DB!
    app.closeDbConnection()
    helper.closeDbConnection();
    done()

  it "should return users", (done) ->
     helper.request app
      .get '/users'
      .expect 200
      .end (err,res) ->
        if err?
          throw err;
        res.body.should.have.property('length').equal 3;
        done()