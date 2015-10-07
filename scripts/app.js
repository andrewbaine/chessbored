require.config({
  baseUrl: 'scripts',
  paths: {
    jquery: 'jquery-2.1.1'
  }
});

require(['lib/underscore',
         'jquery',
         'lib/chess',
         'lib/chess/pgn-parser',
         'lib/chess/huffman',
         'lib/chess/chess-engine'
        ],
        function(u, $, chess, pgn, huffman, engine) {

          var drawResults = function() {
            var successors = model.engine.successors();
            var fen = model.engine.fen();
            view.chessboard.update(fen, successors);

            var encodedBoard = huffman.encode(fen).encodedBoard;
            model.currentEncodedBoard = encodedBoard;
            model.currentEncodedMoves = [];

            for (var i = 0; i < successors.length; i++) {
              var move = successors[i];
              model.engine.move(move);
              var obj = {
                encodedBoard: huffman.encode(model.engine.fen()).encodedBoard,
                san: move.san
              }
              model.currentEncodedMoves.push(obj);
              console.log();
              model.engine.back();
            }
            model.currentEncodedMoves.sort(
              function(a, b) {
                if (a.encodedBoard < b.encodedBoard) {
                  return -1;
                } else if (a.encodedBoard == b.encodedBoard) {
                  return 0;
                } else {
                  return 1;
                }
              });

            $.getJSON("http://search.chessdiscover.com:3000/proxy/solr/collection1/select",
                      {
                        q: "fromBoard:" + huffman.encode(fen).encodedBoard,
                        sort: "goodNess desc, min(passiveElo, activeElo) desc"
                      }, function(data) {
                        controller.updateSearchResults(data);
                      });
        
        
            $("span.move").each(function(j, e) {
              if (j < model.i) {
                $(e).addClass("bold");
              }
            });
          };

  var makeSpan = function(cssClass, htmlContents) {
    return $("<span>").addClass(cssClass).html(htmlContents);
  }
  var model = {
    currentEncodedBoard: null,
    moves: [],
    i: 0,
    engine: engine.create(),
    reset: function() {
      this.moves = [];
      this.i = 0;
      this.engine = engine.create();
    }
  };

  var clicker = function(san) {
    return function(event) {
      event.preventDefault();
      controller.move({ san: san});
    }
  };

  var controller = {
    updateSearchResults: function(data) {
      var results = $("<ol>");
      var docs = data.response.docs;
      for (var i = 0; i < docs.length; i++) {
        var li = $("<li>")
        var resultDiv = $("<div>").appendTo(li);
        var doc = docs[i];
        if (doc.hasOwnProperty("toBoard")) {
          var toBoard = doc.toBoard;
          var m = model.currentEncodedMoves[toBoard];
          var san = m.san;
          resultDiv.append($("<div>").addClass("san").append($("<h3>").addClass("san").append(
            $('<a href="' + san + '">').html(san)
              .click(clicker(san)))));
        }
        var div = $("<div>").addClass("result").appendTo(resultDiv);
        var headline = $("<h3>").addClass("headline");
        var white = makeSpan("white", doc.white);
        var black = makeSpan("black", doc.black);
        var v = makeSpan("v", "v");
        var result = makeSpan("result", doc.result);
        headline.append(white);
/**
        if (doc.hasOwnProperty("whiteElo")) {
          headline.append(makeSpan("whiteElo", "(" + doc.whiteElo + ")")); 
        }
*/
        headline.append(v)
          .append(black);
/**
        if (doc.hasOwnProperty("blackElo")) {
          headline.append(makeSpan("blackElo", "(" + doc.blackElo + ")")); 
        }
*/

        headline.append(result);
        var subHeadline = $("<p>").addClass("subHeadline");
        var event = $("<span>").addClass("event").html(doc.event.trim());
        var site = $("<span>").addClass("site").html(doc.site);
        subHeadline.append(event).append(site)
        var date = ""
        if (doc.hasOwnProperty("year")) {
          var date = doc.year;
          if (doc.hasOwnProperty("month") && doc.hasOwnProperty("day")) {
            date += "-" + doc.month + "-" + doc.day;
          }
          subHeadline.append($("<span>").addClass("dash").html("-"))
            .append($("<span>").addClass("date").html(date))
        }

        div.append(headline).append(subHeadline);
        if (doc.hasOwnProperty("move")) {
          var moveIndex = 1 + Math.floor(doc.moveIndex / 2);
          var activeColor = doc.activeColor;
          var moveLabel = "" + moveIndex + ".&nbsp";
          if (activeColor == 'black') {
            moveLabel += "&hellip;&nbsp;";
          }
          var blurb = $("<p>").addClass("blurb");
          blurb.append(makeSpan("activeColor", doc.activeColor));
          if (doc.hasOwnProperty("activeElo")) {
            blurb.append(makeSpan("elo", "(" + doc.activeElo + ")"));
          }
          blurb
            .append(makeSpan("plays", "plays"))
            .append(makeSpan("move", moveLabel + doc.move));
          if (doc.result != "*") {
            var resultDescription = "en route to ";
            if (doc.result == "1/2-1/2") {
              resultDescription += "draw with";
            } else if (doc.result == (doc.activeColor == "white" ? "1-0" : "0-1" )) {
              resultDescription += "win over";
            } else if (doc.result == (doc.activeColor == "black" ? "1-0" : "0-1" )) {
              resultDescription += "loss to";
            }
            blurb.append(makeSpan("result", resultDescription));
            blurb.append(makeSpan("passiveColor", doc.activeColor == "white" ? "black" : "white"));
            if (doc.hasOwnProperty("passiveElo")) {
              blurb.append(makeSpan("elo", "(" + doc.passiveElo + ")"));
            }

          }
          div.append(blurb);
        }
        
        results.append(li);
      }
      $("#results").empty().append(results);
    },

    reset: function(pgnText) {
      view.reset();
      model.reset();
      view.update(model.engine.fen(), model.engine.successors());
    },
    move: function(move) {
      model.moves.push(move);
      view.appendMove(move.san, model.i);
      controller.next();
    },
    next: function() {
      if (model.i < model.moves.length) {
        var move = model.moves[model.i];
        model.engine.move(move);
        model.i += 1;
        drawResults();
      }


    }
  };
          
  var view = {
    update: function(fen, successors) {
      this.chessboard.update(fen, successors);
    },
    reset: function() {
      $('.moves').empty();
    },
    appendMove: function(san, n) {
      function moveSpan(x) {
        return $("<span>").addClass("move").html(x);
      }
      if (n % 40 == 0) {
        $('.moves').append($("<ol>").attr("start", 1 + (n / 2)));
      }
      var ol = $(".moves ol").filter(":last")
      if (n % 2 == 0) { // we need a new list element
        ol.append(
          $("<li>").append(moveSpan(san)).append(moveSpan("")));
      } else { // we're adding the 
        ol.find("span").filter(":last").html(san);
      }
    },
  };

  $(function() {
    $('.chessboard').each(function(i, e) {
      view.chessboard = chess.chessboard(e, {
        onMove: controller.move
      });
    });
                    
    controller.reset();
    drawResults();
  });
});
