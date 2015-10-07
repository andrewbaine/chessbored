
define(['lib/chess/util', 'lib/chess/engine'], function(util, chess) {

  var placement = function(gameState) {
    var result = "";
    for (var i = 0; i < 8; i++) {
      var blanks = 0;
      for (var j = 0; j < 8; j++) {
        var piece = gameState.board(7 - i, j);
        if (piece == null) {
          blanks++;
        } else {
          if (blanks > 0) {
            result += blanks;
            blanks = 0;
          }
          result += piece;
        }
      }
      if (blanks > 0) {
        result += blanks
        blanks = 0;
      }
      if (i < 7) {
        result += "/";
      }
    }
    return result;
  };

  var color = function(gameState) {
    var result = gameState.activeColor == 1 ? 'w' : 'b';
    return result;
  }

  var castling = function(gameState) {
    return util.castling.toString(gameState.castling);
  }

  var enPassant = function(ep) {
    return ep ? ep : "-";
  }

  var halfMove = function(gameState) {
    return gameState.halfMoveClock;
  }
  var fullMove = function(gameState) {
    return gameState.fullMoveNumber;
  }

  var gameStateWrapper = function(gameState) {
    var moves = [];
    var gameStates = [gameState];
    return {
      fen: function() {
        var gameState = gameStates[gameStates.length - 1];

        var result = [placement(gameState),
                      color(gameState),
                      castling(gameState),
                      enPassant(gameState.enPassantTarget),
                      halfMove(gameState),
                      fullMove(gameState)].join(' ');
        return result;
      },
      history: function() {
        return moves;
      },
      successors: function() {
        return gameStates[gameStates.length - 1].successors;
      },
      move: function(m) {
        var successors = this.successors();
        var foundMove = null;
        for (var i = 0; i < successors.length; i++) {
          var move = successors[i];
          if (util.san.consistent(m.san, move.san)) {
            if (foundMove) {
              throw {
                message: "two consistent moves found",
                move: m,
                move1: foundMove,
                move2: move
              };
            } else {
              foundMove = move;
            }
          }
        }
        if (foundMove == null) {
          throw {
            message: "no consistent move found",
            move: m
          };
        } else {
          var g = gameStates[gameStates.length - 1].move(foundMove);
          gameStates.push(g);
          moves.push(foundMove);
        }
      },
      back: function() {
        gameStates.pop();
        moves.pop();
      }
    };
  }

  return {
    create: function(fen) {
      var engine = (arguments.length == 0) ? chess.create() : chess.create(fen);
      return gameStateWrapper(engine);
    }
  }
});
