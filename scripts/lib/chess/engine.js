
define (['lib/chess/util'], function(util) {

  var ROOK = 0;
  var KNIGHT = 1;
  var BISHOP = 2;
  var QUEEN = 3;
  var KING = 4;
  var PAWN = 5;

  var K = 1
  var Q = 2
  var k = 4
  var q = 8

  var COLOR = {
    WHITE: 1,
    BLACK: 0,
    otherColor: function(color) {
      return 1 - color;
    }
  }

  var LABELS = [
    null, null, null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null, null, null, null,
    null, null, "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1", null, null,
    null, null, "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2", null, null,
    null, null, "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3", null, null,
    null, null, "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4", null, null,
    null, null, "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5", null, null,
    null, null, "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6", null, null,
    null, null, "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7", null, null,
    null, null, "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8", null, null,
    null, null, null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null, null, null, null,
  ];
  var INVERSE_LABELS = function(l) {
    var result = {};
    for (var i = 0; i < l.length; i++) {
      var v = l[i];
      if (v) {
        result[v] = i;
      }
    }
    return result;
  }(LABELS);

  var PROMOTION_NAMES = {
    "R": 1,
    "N": 3,
    "B": 5,
    "Q": 7,
  };

  function applyMoveToBoard(newBoard, s, d, promotedPiece) {

    var captured = newBoard[d];
    var p = newBoard[s];

    newBoard[s] = 0;
    newBoard[d] = promotedPiece ? promotedPiece : p;


    // enPassant Capture
    if (p == 11) {
      if ((d - s) == 11 || (d - s) == 13) {
        if (captured == 0) {
          newBoard[d - 12] = 0;
        }
      }
    } else if (p == 12) {
      if ((d - s) == -11 || (d - s) == -13) {
        if (captured == 0) {
          newBoard[d + 12] = 0;
        }
      }
    } else if (p == 9) {
      if ((d - s) == 2) {
        newBoard[d+1] = 0;
        newBoard[s+1] = 1;
      } else if ((d - s) == -2) {
        newBoard[d-2] = 0;
        newBoard[d+1] = 1;
      }
    } else if (p == 10) {
      if ((d - s) == 2) {
        newBoard[d+1] = 0;
        newBoard[s+1] = 2;
      } else if ((d - s) == -2) {
        newBoard[d-2] = 0;
        newBoard[d+1] = 2;
      }
    }
  }

  function applyMove(gameState, board, src, dest, promotion) {
    var s = INVERSE_LABELS[src];
    var d = INVERSE_LABELS[dest];
    var newBoard = new Int8Array(board);
    var p = newBoard[s];
    var promotedPiece = promotion ?
      PROMOTION_NAMES[promotion] + (newBoard[s] == 11 ? 0 : 1)
      : p;

    applyMoveToBoard(newBoard, s, d, promotedPiece);

    var newEP = null;
    if (p == 11 && (d - s) > 13) {
      newEP = LABELS[(d - 12)];
    } else if (p == 12 && (s - d) > 13) {
      newEP = LABELS[(d + 12)];
    }

    var newCastling = gameState.castling;
    if (src == "a1" || src == "e1") {
      newCastling =  newCastling & (~Q)
    }
    if (src == "e1" || src == "h1") {
      newCastling =  newCastling & (~K)
    }
    if (src == "a8" || src == "e8") {
      newCastling =  newCastling & (~q)
    }
    if (src == "e8" || src == "h8") {
      newCastling =  newCastling & (~k)
    }

    var newHMC = gameState.halfMoveClock + 1;
    if (p == 11 || p == 12 || board[d] > 0) {
      newHMC = 0;
    }

    return makeGameState(newBoard,
                         COLOR.otherColor(gameState.activeColor),
                         newCastling,
                         newEP,
                         newHMC,
                         gameState.fullMoveNumber
                             + (gameState.activeColor == COLOR.WHITE ? 0 : 1));

  }

  function makeBoard() {
    return new Int8Array([
      -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
      -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
      -1,  -1,   1,   3,   5,   7,   9,   5,   3,   1,  -1,  -1,
      -1,  -1,  11,  11,  11,  11,  11,  11,  11,  11,  -1,  -1,
      -1,  -1,   0,   0,   0,   0,   0,   0,   0,   0,  -1,  -1,
      -1,  -1,   0,   0,   0,   0,   0,   0,   0,   0,  -1,  -1,
      -1,  -1,   0,   0,   0,   0,   0,   0,   0,   0,  -1,  -1,
      -1,  -1,   0,   0,   0,   0,   0,   0,   0,   0,  -1,  -1,
      -1,  -1,  12,  12,  12,  12,  12,  12,  12,  12,  -1,  -1,
      -1,  -1,   2,   4,   6,   8,  10,   6,   4,   2,  -1,  -1,
      -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
      -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
    ]);
  }

  var MOVE_VECTORS = [
    {
      n: 7,
      vectors: [-12, -1, 1, 12]
    },
    {
      n: 1,
      vectors: [-25, -23, -14, -10, 10, 14, 23, 25]
    },
    {
      n: 7,
      vectors: [-13, -11, 11, 13]
    },
    {
      n: 7,
      vectors: [-13, -12, -11, -1, 1, 11, 12, 13]
    },
    {
      n: 1,
      vectors: [-13, -12, -11, -1, 1, 11, 12, 13]
    },
  ];

  function makeMove(src, dest) {
    return {
      source: LABELS[src],
      destination: LABELS[dest]
    };
  }

  function addCandidates(candidates, board, i, pieceType, color) {
    var moveVector = MOVE_VECTORS[pieceType];
    for (var j = 0; j < moveVector.vectors.length; j++) {
      var location = i;
      var vector = moveVector.vectors[j];
      for (var k = 1; k <= moveVector.n; k++) {
        location += vector;
        var p = board[location];
        if (p < 0) {
          break;
        } else if (p == 0) {
          candidates.push(makeMove(i, location));
        } else if (p % 2 == color) {
          break;
        } else {
          candidates.push(makeMove(i, location));
          break;
        }
      }
    }
  }

  function availableMoves(gameState, board) {
    var activeColor = gameState.activeColor;
    var candidates = [];

    for (var i = 0; i < board.length; i++) {
      var piece = board[i];

      if (piece > 0 && (piece % 2 == activeColor)) {
        var pieceType = Math.floor((piece - 1) / 2);
        switch(pieceType) {
          case ROOK:
          case KNIGHT:
          case BISHOP:
          case QUEEN:
          case KING:
            addCandidates(candidates, board, i, pieceType, activeColor);
            break;
          case PAWN:
            var straightAhead = (activeColor == COLOR.WHITE ? 1 : -1);
            if (board[i + straightAhead * 12] == 0) {
              var move = makeMove(i, i + straightAhead * 12);
              candidates.push(move);
              if (((i < 48 && activeColor == COLOR.WHITE)
                  || (i > 96 && activeColor == COLOR.BLACK))
                  && board[i + straightAhead * 24] == 0) { // first row
                var move = makeMove(i, i + straightAhead * 24);
                candidates.push(makeMove(i, i + straightAhead * 24));
              }
            }
            var directions = [11, 13];
            for (var j = 0; j < directions.length; j++) {
              var direction = directions[j];
              var dest = i + straightAhead * direction;
              var p = board[dest];
              if ((p > 0 && p % 2 != activeColor)
                  || (p == 0
                      && dest == gameState.enPassantTarget)) {
                candidates.push(makeMove(i, dest));
              }
            }
            break;
        } // end switch
      } // end if piece active color
    }

    addCastlingCandidates(candidates, gameState, board);
    addEnPassantCandidates(candidates, gameState, board);

    var acceptedCandidates = candidates.filter(function(x) {
      return check.isMoveSafe(board,
                              INVERSE_LABELS[x.source],
                              INVERSE_LABELS[x.destination]);
    });

    var movesByDestination = [
      new Uint32Array(128),
      new Uint32Array(128),
      new Uint32Array(128),
      new Uint32Array(128),
    ];

    for (var i = 0; i < acceptedCandidates.length; i++) {
      var move = acceptedCandidates[i];
      var source = INVERSE_LABELS[move.source];
      var destination = INVERSE_LABELS[move.destination];

      var piece = Math.floor((board[source] - 1) / 2);

      if (piece < 4) {
        var r1 = Math.floor(source / 12) - 2;
        var c1 = (source % 12) - 2;

        var r2 = Math.floor(destination / 12) - 2;
        var c2 = (destination % 12) - 2;

        var index1 = r1 * 8 + c1;
        var index2 = r2 * 8 + c2;

        var mask1 = movesByDestination[piece][2*index2];
        var mask2 = movesByDestination[piece][2*index2 + 1];

        if (index1 < 32) {
          mask1 |= (1 << index1);
        } else {
          mask2 |= (1 << (index1 - 32));
        }
        movesByDestination[piece][2 * index2] = mask1;
        movesByDestination[piece][2 * index2 + 1] = mask2;
      }
    }

    // 00000000000000000000000011111111b
    var ROW = function() {
      var result = 0;
      for (var i = 0; i < 8; i ++) {
        result = result | (1 << i);
      }
      return result;
    }();

    // 00000001000000010000000100000001b
    var COLUMN = function() {
      var result = 0;
      for (var i = 0; i < 4; i++) {
        result = result | (1 << (i * 8));
      }
      return result;
    }();

    var result = [];
    for (var i = 0; i < acceptedCandidates.length; i++) {
      var move = acceptedCandidates[i];
      var source = INVERSE_LABELS[move.source];
      var destination = INVERSE_LABELS[move.destination];
      var piece = Math.floor((board[source] - 1) / 2);

      var r1 = Math.floor(source / 12) - 2;
      var c1 = (source % 12) - 2;
      var r2 = Math.floor(destination / 12) - 2;
      var c2 = (destination % 12) - 2;
      var index1 = r1 * 8 + c1;
      var index2 = r2 * 8 + c2;

      if (piece < 4) { // disambiguation is not needed for king or pawn
        var otherMoves1 = movesByDestination[piece][2 * index2];
        var otherMoves2 = movesByDestination[piece][2 * index2 + 1];
        if (index1 < 32) {
            otherMoves1 &= ~(1 << index1);
        } else {
          otherMoves2 &= ~(1 << (index1 - 32));
        }

        var rankDisNeeded = false;
        var fileDisNeeded = false;
        if (otherMoves1 || otherMoves2) {
          var column = COLUMN << (c1);
          var otherMovesFromSameColumn1 = otherMoves1 & column;
          var otherMovesFromSameColumn2 = otherMoves2 & column;

          if (!(otherMovesFromSameColumn1 || otherMovesFromSameColumn2)) {
            fileDisNeeded = true;
          } else {
            rankDisNeeded = true;
            if (r1 < 4) {
              var row = ROW << (8 * r1);
              var otherMovesFromSameRow = otherMoves1 & row;
              if (otherMovesFromSameRow) {
                fileDisNeeded = true;
              }
            } else {
              var row = ROW << (8 * (r1 - 4));
              var otherMovesFromSameRow = otherMoves2 & row;
              if (otherMovesFromSameRow) {
                fileDisNeeded = true;
              }
            }
          }
        }
        var dis = "";
        if (fileDisNeeded) {
          dis = dis + move.source[0];
        }
        if (rankDisNeeded) {
          dis = dis + move.source[1];
        }
        if (dis) {
          move.disambiguation = dis;
        }
      }
      if (board[destination] != 0
          || (piece == PAWN && c2 != c1)) {
        move.capture = "x";
      }

      var ppp = board[source];
      if (ppp < 11) {
        move.piece = "RRNNBBQQKK".charAt(ppp - 1);
      } else if (c2 != c1) {
        move.piece = move.source[0];
      }

      if (piece == PAWN && (r2 == 0 || r2 == 7)) {
        for (var x = 0; x < 4; x++) {
          var pm = Object.create(move);
          pm.promotion = "RNBQ".charAt(x);
          result.push(pm);
        }
      } else {
        result.push(move);
      }
    }

    function f(x) {
      return x ? x : "";
    }

    for (var i = 0; i < result.length; i++) {
      var move = result[i];
      var piece = f(move.piece);
      var disambiguation = f(move.disambiguation);
      if (piece == disambiguation) {
        disambiguation = "";
      }
      var capture = f(move.capture);
      var destination = move.destination;
      var promotion = move.promotion ? ("=" + move.promotion) : "";
      var san = piece + disambiguation + capture + destination + promotion;

      if (piece == 'K') {
        if (move.source == "e1") {
          if (move.destination == "g1") {
            san = "O-O";
          } else if (move.destination == "c1") {
            san = "O-O-O";
          }
        } else if (move.source == "e8") {
          if (move.destination == "g8") {
            san = "O-O";
          } else if (move.destination == "c8") {
            san = "O-O-O";
          }
        }
      }

      move.san = san;

    }

    return result;
  }

  function otherPromotionMoves(move) {
    var result = [];
    var otherPromotions = "RNB";
    for (var i = 0; i < otherPromotions.length; i++) {
      var promotionMove = Object.create(move);
      promotionMove.promotion = otherPromotions[i];
      result.push(promotionMove);
    }
    return result;
  }

  function addEnPassantCandidates(candidates, gameState, board) {
    var ep = gameState.enPassantTarget;
    if (ep) {
      ep = INVERSE_LABELS[ep];
      var pawn = ep < 60 ? 12 : 11;
      var vector = ep < 60 ? 1 : -1;
      var directions = [11, 13];
      for (var i = 0; i < directions.length; i++) {
        var src = ep + vector * directions[i];
        if (board[src] == pawn) {
          candidates.push(makeMove(src, ep));
        }
      }
    }
  }

  function isSquareChecked(board, square, attackingColor) {
    var attackingRook = 2;
    var attackingKnight = 4;
    var attackingBishop = 6;
    var attackingQueen = 8;
    var attackingKing = 10;
    var attackingPawn = 12;

    if (attackingColor == COLOR.WHITE) {
      attackingRook = 1;
      attackingKnight = 3;
      attackingBishop = 5;
      attackingQueen = 7;
      attackingKing = 9;
      attackingPawn = 11;
    }

    var columns = [-12, -1, 1, 12];
    for (var i = 0; i < columns.length; i++) {
      var c = columns[i];
      for (var x = square + c; board[x] != -1; x += c) {
        var piece = board[x];
        if (board[x] > 0) {
          if (piece == attackingQueen || piece == attackingRook) {
            return true;
          } else {
            break;
          }
        }
      }
    }

    var diagonals = [-13, -11, 11, 13];
    for (var i = 0; i < diagonals.length; i++) {
      var d = diagonals[i];
      for (var x = square + d; board[x] != -1; x += d) {
        var piece = board[x];
        if (board[x] > 0) {
          if (piece == attackingQueen || piece == attackingBishop) {
            return true;
          } else {
            break;
          }
        }
      }
    }

    var horsies = [-25, -23, -14, -10, 10, 14, 23, 25];
    for (var i = 0; i < horsies.length; i++) {
      var x = square + horsies[i];
      var piece = board[x];
      if (piece == attackingKnight) {
        return true;
      }
    }

    var all = [-13, -12, -11, -1, 1, 11, 12, 13];
    for (var i = 0; i < all.length; i++) {
      var x = square + all[i];
      var piece = board[x];
      if (piece == attackingKing) {
        return true;
      }
    }

    var pawns = attackingColor == COLOR.WHITE ? [-11, -13] : [11, 13];
    for (var i = 0; i < pawns.length; i ++) {
      var x = square + pawns[i];
      var piece = board[x];
      if (piece == attackingPawn) {
        return true;
      }
    }

    return false;
  }

  function addCastlingCandidates(candidates, gameState, board) {
    var board = board;
    if (gameState.activeColor == COLOR.WHITE) {
      if (gameState.castling & K) {
        if (board[30] == 9
            && board[31] == 0
            && board[32] == 0
            && board[33] == 1) {
          if (isSquareChecked(board, 30, COLOR.BLACK)) {
          } else if (isSquareChecked(board, 31, COLOR.BLACK)) {
          } else {
            candidates.push(makeMove(30, 32));
          }
        }
      }
      if (gameState.castling & Q) {
        if (board[30] == 9
            && board[29] == 0
            && board[28] == 0
            && board[27] == 0
            && board[26] == 1) {
          if (isSquareChecked(board, 30, COLOR.BLACK)) {
          } else if (isSquareChecked(board, 29, COLOR.BLACK)) {
          } else {
            candidates.push(makeMove(30, 28));
          }
        }
      }
    } else {
      if (gameState.castling & k) {
        if (board[114] == 10
            && board[115] == 0
            && board[116] == 0
            && board[117] == 2) {
          if (isSquareChecked(board, 114, COLOR.WHITE)) {
          } else if (isSquareChecked(board, 115, COLOR.WHITE)) {
          } else {
            candidates.push(makeMove(114, 116));
          }
        }
      }
      if (gameState.castling & q) {
        if (board[114] == 10
            && board[113] == 0
            && board[112] == 0
            && board[111] == 0
            && board[110] == 2) {
          if (isSquareChecked(board, 114, COLOR.WHITE)) {
          } else if (isSquareChecked(board, 113, COLOR.WHITE)) {
          } else {
            candidates.push(makeMove(114, 112));
          }
        }
      }
    }
  }

  function findKing(board, color) {
    var king = (color == COLOR.WHITE) ? 9 : 10;
    for (var i = 0; i < board.length; i++) {
      if (board[i] == king) {
        return i;
      }
    }
  }

  var check = {
    scratch: makeBoard(),
    isMoveSafe: function(board, source, destination) {
      var scratch = this.scratch;
      for (var i = 0; i < scratch.length; i++) {
        scratch[i] = board[i];
      }

      var movingColor = scratch[source] % 2;
      applyMoveToBoard(scratch, source, destination);

      var kingSquare = findKing(scratch, movingColor);

      return !isSquareChecked(scratch,
                              kingSquare,
                              COLOR.otherColor(movingColor));
    }
  };

  function makeGameState(brd,
                         color,
                         castling,
                         enPassantTarget,
                         halfMoveClock,
                         fullMoveNumber) {
    var result = {
      board: function(i, j) {
        var v = brd[(i + 2) * 12 + j + 2];
        if (v == 0) {
          return null;
        } else {
          return "RrNnBbQqKkPp".charAt(v - 1);
        }
      },

      move: function(m) {
        var foundMove = null;
        if (m.san) {
          var successors = this.successors;
          for (var i = 0; i < successors.length; i++) {
            var move = successors[i];
            if (util.san.consistent(m.san, move.san)) {
              if (foundMove) {
                throw "more than one consistent move: " + foundMove.san + " and " + move.san;
              } else {
                foundMove = move;
              }
            }
          }
          if (foundMove == null) {
            throw "no consistent moves found for " + m.san;
          } else {
            var result = applyMove(this, brd, m.source, m.destination, m.promotion);
            return result;
          }
        }
      },

      activeColor: color,
      castling: castling,
      enPassantTarget: enPassantTarget,
      halfMoveClock: halfMoveClock,
      fullMoveNumber: fullMoveNumber
    };

    result.successors = availableMoves(result, brd);
    return result;
  }

  return {
    create: function(fen) {
      if (arguments.length == 0) {
        fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      }
      var tokens = fen.split(" ");
      var board = makeBoard();
      var fenBoard = tokens[0];
      var row = 7;
      var col = 0;
      for (var i = 0; i < fenBoard.length; i++) {
        var c = fenBoard.charAt(i);
        if (c == "/") {
          row--;
          col = 0;
        } else {
          if (/\d/.test(c)) {
            var count = parseInt(c);
            for (var j = 0; j < count; j++) {
              board[(row + 2)* 12 + col + 2] = 0;
              col++;
            }
          } else {
            var piece = "RrNnBbQqKkPp".indexOf(c) + 1;
            board[(row + 2)* 12 + col + 2] = piece;
            col++;
          }
        }
      }

      var color = tokens[1] == 'w' ? COLOR.WHITE : COLOR.BLACK;
      var castling = util.castling.toInt(tokens[2]);

      var ep = tokens[3] == "-" ? null : tokens[3];
      var halfMoveClock = parseInt(tokens[4]);
      var fullMoveClock = parseInt(tokens[5]);

      return makeGameState(board,
                           color,
                           castling,
                           ep,
                           halfMoveClock,
                           fullMoveClock);
    }
  }

});
