'use strict';

var app = require('./config');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  console.log('Express servesr listening on posrt ' + server.address().port);
});