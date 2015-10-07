
var express = require('express');
var proxy = require('express-http-proxy');
var cors = require('cors');

var app = express();
app.use(cors());

app.use('/proxy', proxy('0.0.0.0:8983', {
  filter: function(req, res) {
     return req.method == 'GET';
  },
  forwardPath: function(req, res) {
    var path = require('url').parse(req.url).path;
    console.log(path);
    return path;
  }
}));

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
})
