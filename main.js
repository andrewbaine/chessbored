var requirejs = require('requirejs');
var readline = require('readline');
var split = require('split');
var needle = require('needle');
var uuid = require('node-uuid');

requirejs.config({
  baseUrl: 'scripts',
  nodeRequire: require
});

requirejs(['lib/chess/chess-engine',
           'lib/chess/pgn-parser',
           'lib/chess/huffman',
           'lib/chess/index-parse'
          ],
function (engine, pgn, huffman, index) {

  var context = {
    postData: [],
    posts: 0,
    games: 0,
    moves: 0
  };

  function pushData(obj, force) {
    context.moves++;
    context.postData.push(obj);
    if (context.postData.length >= 5000) {
      post();
    }
  }

  function post() {
    console.log("posting " + context.posts, " with "
                + context.games + " games  and "
                + context.moves + " moves.");

    var postData = context.postData;
    context.postData = [];

//    console.log(postData);


    needle.request('POST',
                   'localhost:8983/solr/update/json',
                   postData,
                   { 
                     json: true,
                     timeout: 0 
                   },
                   function(err, resp) {
                     if (err) {
                       console.log(err);
                     } else if (resp.statusCode == 200) {
                       console.log(resp.body); // here you go, mister.
                     } else {
                       console.log("problem posting");
                       console.log(resp.body);
                     }
                   });                 
    context.posts++;
  }

  function f(lineList) {
    try {
      context.games = context.games + 1;
      var parsedGame = pgn.parseGame(lineList);
      var documents = index.parse(parsedGame);
      for (var i = 0; i < documents.length; i++) {
        pushData(documents[i]);
      }
    } catch(e) {
      console.log("PROBLEM WITH THIS GAME: \n" + lineList.join('\n'));
      for (var k in e) {
        console.log("\t" + k + "\t" + e[k]);
      }
    }
  }

  var mode = 'TAGS';
  var lineList = [];

  process.stdin
    .pipe(split())
    .on('data', function (line) {
      if (/^\s*$/.test(line) && mode == 'MOVES') {
        f(lineList);
        mode = 'TAGS';
        lineList = [];
      } else if (line[0] == "1" && line[1] == ".") {
        mode = 'MOVES';
      } else {

      }
      lineList.push(line);
    })
    .on('end', function() {
      post();
    });
  
});
