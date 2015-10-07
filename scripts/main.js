require.config({
  baseUrl: 'scripts',
  paths: {
    // the left side is the module ID,
    // the right side is the path to
    // the jQuery file, relative to baseUrl.
    // Also, the path should NOT include
    // the '.js' file extension. This example
    // is using jQuery 2.1.1 located at
    // js/lib/jquery-2.1.1.js, relative to
    // the HTML page.
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
  $(function() {
    var model = {
      moves: [],
      i: 0,
      engine: engine.create(),
      reset: function() {
        this.moves = [];
        this.i = 0;
        this.engine = engine.create();
      }
    };

    var controller = {
      reset: function(pgnText) {
        view.reset();
        model.reset();
        if (pgnText) {
          var parsed = pgn.parseGame(pgnText);
          var moves = parsed.moves;
          model.moves = _.map(moves, function(x) { return { san: x };});
          for (var i = 0; i < model.moves.length; i++) {
            view.appendMove(model.moves[i].san, i);
          }
        }
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

          var fen = model.engine.fen();
          var successors = model.engine.successors();
          var san = move.san;
       
          view.chessboard.update(fen, successors);
          view.appendFen(fen);
          view.appendHuffman(fen);

          $("span.move").each(function(j, e) {
            if (j < model.i) {
              $(e).addClass("bold");
            }
          });
        }
      }
    };

    var view = {
      update(fen, successors) {
        this.chessboard.update(fen, successors);
      },
      reset: function() {
        $('.moves').empty();
        $("#fenlist").empty();
        $("#huffmanlist").empty();
      },
      appendFen: function(fen) {
        $("#fenlist").append($("<li>").html(fen));
      },
      appendHuffman: function(fen) {
        var encoded = huffman.encode(fen);
        $("#huffmanlist").append($("<li>").html(encoded.encodedBoard));
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

    $('.chessboard').each(function(i, e) {
      view.chessboard = chess.chessboard(e, {
        onMove: controller.move
      });
    });
                    
    $(".pgn form").submit(function(event) {
      event.preventDefault();
      var pgnText = $(this).find("textarea").val().split("\n");
      controller.reset(pgnText);
    });

    $("#next").click(function(event) {
      event.preventDefault();
      controller.next();
    });

    $("#play").click(function(event) {
      event.preventDefault();
      var intervalFunction = function() {
        if (model.i < model.moves.length) {
          controller.next();
        } else {
          clearInterval(model.intervalFunction);
        }
      };
      model.intervalFunction = setInterval(intervalFunction, 100);
    });
    controller.reset();
  });
});
