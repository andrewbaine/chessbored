
var needle = require('needle');
var mkdirp = require('mkdirp');
var nimble = require('nimble');
var winston = require('winston');

winston.log('info', 'Hello distributed log files!');
winston.info('Hello again distributed logs');

var methods = {
  GET: "get",
  HEAD: "head",
}

var contentTypes = {
  PGN: "application/x-chess-pgn",
  HTML: "text/html; charset=UTF-8" 
}

var q = [
  {
    url: 'http://www.theweekinchess.com/',
    method: methods.HEAD,
  }];

var crawl = function() {  
  if (q.length > 0) {
    var next = q.pop();
    var url = next.url;
    var method = next.method;
    var contentType = next.contentType;

    winston.info("Begin processing " + method + " " + url + "(" + contentType + ")");
    if (method == methods.GET) {
      winston.info("getting...");
      winston.info(contentType == contentTypes.HTML);
      if (contentType == contentTypes.PGN) {
        var fileName = url.replace(/^http:\/\//, "");
        winston.info("fileName is " + fileName);
        nimble.serial([
          function(callback) {
            var d = path.dirname(fileName);
            mkdirp(d, function(err) { 
              if (err) {
                winston.error(err); 
              } else {
                winston.info("successfully made " + d);
                callback();
              }
            });
          },
          function(callback) {
            var out = fs.createWriteStream(fileName);
            needle.get(url).pipe(out);
            console.log("download of " + url  + " is in progress");
            callback();
          }
        ]);
      } else if (contentType == contentTypes.HTML) {
        winston.info("getting html...");
        needle.get(url,function(error, response) {
          if (error) {
            winston.error(error);
          } else {
            var body = response.body;
            var re = /<a href="(.*?)"/g;
            var m;
            while (m = re.exec(body)) {
              winston.info("url: " + m[1]);
            }
          }
        });
      }
    } else if (method == methods.HEAD) {
      needle.head(url, function(error, response) {
        if (error) {
          console.log(error);
        } else {
          var contentType = response.headers['content-type'];
          if (contentType.indexOf("text/html") == 0) {
            q.push(
              {
                url: url,
                method: methods.GET,
                contentType: contentTypes.HTML
              });
          } else if (contentType.indexOf('pgn') != -1) {
            q.push(
              {
                url: url,
                method: methods.GET,
                contentType: contentTypes.PGN
              });
          } else {
            console.log("declining to continue with " + url + " because content type is " + contentType);
          }
        }
      });
    }
  } else {
      console.log("q is empty");
  }
}; // end function crawl

var intervalObject = setInterval(crawl, 5000);
