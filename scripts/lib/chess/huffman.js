
define(['lib/chess/chess-engine', 'lib/base64', 'lib/underscore', 'lib/chess/util'],
       function(engine, base64, underscore, util) {

  function invertCastlingBits(x) {
    var tmp = 0;
    tmp |= (x & 3) << 2;
    tmp |= (x >>> 2);
    return tmp;
  }

  var putKonLeftDiagonal = function(board) {
    for (var i = 4; i < 8; i++) {
      for (var j = 4; j < i; j++) {
        if (board[i * 8 + j] == ENCODINGS.K) {
          return false;
        }
      }
    }

    var difference = 0;
    for (var x = 4; x < 8; x++) {
      if (board[x * 8 + x] == ENCODINGS.K) { // king is on the diagonal
        // we need an arbitrary tie-breaking rule
        for (var i = 0; i < 8 && !difference; i++) {
          for (var j = (i + 1); j < 8 && !difference; j++) {
            difference = (board[i * 8 + j] - board[j * 8 + i]);
            if (difference > 0) {
              return false;
            }
          }
        }
        break;
      }
    }
    reflectDiagonally(board);
    return true;
  }

  var reflectDiagonally = function(board) {
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < i; j++) {
        var tmp = board[j * 8 + i];
        board[j * 8 + i] = board[i * 8 + j];
        board[i * 8 + j] = tmp;
      }
    }
  }

  var reflectHorizontally = function(board) {
    for (var i = 0; i < 8; i++) {
      for (var j = 4; j < 8; j++) {
        var tmp = board[i * 8 + j];
        board[i * 8 + j] = board[i * 8 + 7 - j];
        board[i * 8 + 7 - j] = tmp;
      }
    }
  };

  var reflectVertically = function(board) {
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 8; j++) {
        var tmp = board[i * 8 + j];
        board[i * 8 + j] = board[(7 - i) * 8 + j];
        board[(7 - i) * 8 + j] = tmp;
      }
    }
  };

  var noPawnsRemain = function(board) {
    for (var i = 0; i < board.length; i++) {
      if (board[i] == ENCODINGS.P || board[i] == ENCODINGS.p) {
        return false;
      }
    }
    return true;
  }

  var putKonBottom = function(board) {
    for (var i = board.length - 1; i > 31; i--) {
      if (board[i] == ENCODINGS.K) {
        return false;
      }
    }
    reflectVertically(board);
    return true;
  };

  var putKonRight= function(board) {
    var kingSquare = -1;
    for (var i = 0; i < 8; i++) {
      for (var j = 4; j < 8; j++) {
        var piece = board[i * 8 + j];
        if (piece == ENCODINGS.K) {
          return false;
        }
      }
    }
    for (var i = 0; i < 8; i++) {
      for (var j = 4; j < 8; j++) {
        var tmp = board[i * 8 + j];
        board[i * 8 + j] = board[i * 8 + 7 - j];
        board[i * 8 + 7 - j] = tmp;
      }
    }
    return true;
  };

  function encodedCastling(castling, color) {
    var result = util.castling.toInt(castling);
    if (color == 'b') {
      return invertCastlingBits(result);
    }
    return result;
  }

  var invertColors = function(board, binary) {
    var otherColorPiece = function(x) {
      if (x) {
        if (binary) {
          if (x % 2) {
            return x - 1; // 2 -> 1
          } else {
            return x + 1; // 1 -> 2
          }
        } else {
          if (x == x.toUpperCase()) {
            return x.toLowerCase();
          } else {
            return x.toUpperCase();
          }
        }
      } else {
        return x;
      }
    };

    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 8; j++) {
        var tmp = otherColorPiece(board[(7 - i) * 8 + j]);
        board[(7 - i) * 8 + j] = otherColorPiece(board[i * 8 + j]);
        board[i * 8 + j] = tmp;
      }
    }
  }

  var DECODING_INDICES = function(x) {
    return _.map(_.range(0, 64),
                 function(y) {
                   return x.indexOf(y);
                 });
  }([
    42, 43, 44, 45, 46, 47, 48, 49,
    41, 20, 21, 22, 23, 24, 25, 50,
    40, 19,  6,  7,  8,  9, 26, 51,
    39, 18,  5,  0,  1, 10, 27, 52,
    38, 17,  4,  3,  2, 11, 28, 53,
    37, 16, 15, 14, 13, 12, 29, 54,
    36, 35, 34, 33, 32, 31, 30, 55,
    63, 62, 61, 60, 59, 58, 57, 56
  ]);

  var ENCODING_INDICES = DECODING_INDICES;

  var board = new Array(64);

  var ENCODINGS = {
    p: 4, // 100
    P: 5, // 101
    b: 24, // 11000
    B: 25, // 11001
    n: 26, // 11010
    N: 27, // 11011
    r: 28, // 11100
    R: 29, // 11101
    q: 60, // 111100
    Q: 61, // 111101
    k: 62, // 111110
    K: 63  // 111111
  }

  return {
    encode: function(fen) {
      var tokens = fen.split(" ");
      var bytes = [];
      var index = 0;
      var i = 0;
      while (true) {
        var c = fen.charAt(i++);
        if (ENCODINGS.hasOwnProperty(c)) {
          board[index++] = ENCODINGS[c];
        } else if ("12345678".indexOf(c) != -1) {
          var a = parseInt(c);
          for (var j = 0; j < a; j++) {
            board[index++] = 0;
          }
        } else if (c == " ") {
          break;
        } else { // char should be '/'
          continue;
        }
      }

      var e = engine.create(fen);
      var color = tokens[1];

      var castlingEncoded = encodedCastling(tokens[2], color);

      var halfMoveCount = parseInt(tokens[4]);
      var fullMoveNumber = parseInt(tokens[5]);

      var ep = 0;
      if (tokens[3] != "-") {
        var enPassantTarget = tokens[3];
        var successors = e.successors();
        var actualEnPassantOpportunityExists = false;
        var capture = "x" + enPassantTarget;
        for (var i = 0; i < successors.length; i++) {
          var m = successors[i];
          if (m.san.indexOf(capture) != -1) {
            actualEnPassantOpporunityExists = true;
            break;
          }
        }
        var BLACK_PAWN = 5;
        var WHITE_PAWN = 4;

        if (actualEnPassantOpportunityExists) {
          var row = "12345678".indexOf(enPassantTarget[1]);
          var column = "abcdefgh".indexOf(enPassantTarget[0]);
          var attackingRow = (row == 5) ? 4 : 3;
          var victimPiece = (row == 5) ? BLACK_PAWN : WHITE_PAWN;
          var attackingPiece = victimPiece == WHITE_PAWN ? BLACK_PAWN : WHITE_PAWN;
          for (var i = 0; i < 8; i++) {
            if (board[row * 8 + i] == 0
                && board[attackingRow * 8 + i] == victimPiece
                && (i > 0 && (board[attackingRow * 8 + i - 1] == attackingPiece))
                   || (i < 7 && (board[attackingRow * 8 + i + 1] == attackingPiece))) {
              ep++;
            }
            if (i == column) {
              break;
            }
          }
        }
      }

      var byteIndex = -1;
      var i = 8;

      var BLACK_KING_SQUARE = -1;
      var WHITE_KING_SQUARE = -1;


      // the order is:
      //    1) invert colors
      //    2) reflect horizontally
      //    3) reflect vertically
      //    4) reflect diagonally
      if (color == 'b') {
        invertColors(board, true);
      }

      var horizontalReflection = false;
      var verticalReflection = false;
      var diagonalReflection = false;
      if (castlingEncoded == 0) {
        horizontalReflection = putKonRight(board);
        if (noPawnsRemain(board)) {
          verticalReflection = putKonBottom(board);
          diagonalReflection = putKonLeftDiagonal(board);
        }

      }

      var trailingZeroes = 0;
      for (var j = 0; j < ENCODING_INDICES.length; j++) {
        var index = ENCODING_INDICES[j];
        var piece = board[index];
        if (piece == ENCODINGS.k) {
          BLACK_KING_SQUARE = j;
        } else if (piece == ENCODINGS.K) {
          WHITE_KING_SQUARE = j;
        } else if (piece) {
          while (trailingZeroes != 0) {
            if (i == 8) {
              i = 0;
              bytes.push(0);
              byteIndex++;
            }
            i++;
            --trailingZeroes;
          }
          var buffer = [];
          while (piece) {
            buffer.push(piece & 1);
            piece = piece >>> 1;
          }
          for (var x = buffer.length - 1; x > -1; x--) {
            if (i == 8) {
              i = 0;
              bytes.push(0);
              byteIndex++;
            }
            var binary = buffer[x];
            bytes[byteIndex] |= (binary << i);
            i++;
          }
        } else {
          trailingZeroes++;
        }
      }

      var b1 = (BLACK_KING_SQUARE << 2) | (WHITE_KING_SQUARE >>> 4);
      var b2 = (WHITE_KING_SQUARE & 15) << 4;

      var encodedByte = 0;
      encodedByte |= (castlingEncoded << 1);
      encodedByte |= (ep << 5);

      bytes.push(b1);
      bytes.push(b2);
      bytes.push(encodedByte);

      var result = base64.encode(bytes);

      return {
        horizontalReflection: horizontalReflection,
        verticalReflection: verticalReflection,
        diagonalReflection: diagonalReflection,
        encodedBoard: base64.encode(bytes),
        halfMoveCount: halfMoveCount,
        fullMoveNumber: fullMoveNumber,
        activeColor: (color == 'b' ? 1 : 0)
      };
    },

    decode: function(obj) {
      var color = obj.activeColor == 0 ? "w" : "b";
      var result = base64.decode(obj.encodedBoard);
      var board = new Array(64);

      var i = 0;
      var index = 0;
      var b = result[i];

      function zero(i) {
        if (i < 8 * (result.length - 3)) {
          return !(result[Math.floor(i / 8)] & (1 << (i % 8)));
        } else {
          return true;
        }
      }

      function set(board, i, piece) {
        board[ENCODING_INDICES[i]] = piece;
      }

      var b1 = result[result.length - 3];
      var b2 = result[result.length - 2];
      var encodedByte = result[result.length - 1];

      var BLACK_KING_SQUARE = (b1 >>> 2);
      var WHITE_KING_SQUARE = ((b1 & 3) << 4) | (b2 >>> 4);

      set(board, BLACK_KING_SQUARE, 'k');
      set(board, WHITE_KING_SQUARE, 'K');

      var x = 0;
      for (var i = 0; i < 64; i++) {
        if (i == BLACK_KING_SQUARE ||
            i == WHITE_KING_SQUARE) {
          ;
        } else if (zero(x++)) { // 0
          set(board, i, 0);
        } else { // 1
          if (zero(x++)) { // 10
            if (zero(x++)) { // 100
              set(board, i, 'p');
            } else { // 101
              set(board, i, 'P');
            }
          } else { // 11
            if (zero(x++)) { // 110
              if (zero(x++)) { // 1100
                if (zero(x++)) { // 11000
                  set(board, i, 'b');
                } else { // 11001
                  set(board, i, 'B');
                }
              } else { // 1101
                if (zero(x++)) { // 11010
                  set(board, i, 'n');
                } else { // 11011
                  set(board, i, 'N');
                }
              }
            } else { // 111
              if (zero(x++)) { // 1110
                if (zero(x++)) { // 11100
                  set(board, i, 'r');
                } else { // 11101
                  set(board, i, 'R');
                }
              } else { // 1111
                if (zero(x++)) { // 11110
                  if (zero(x++)) { // 111100
                    set(board, i, 'q');
                  } else { // 111101
                    set(board, i, 'Q');
                  }
                } else { // 11111
                  if (zero(x++)) { // 111110
                    set(board, i, 'k');
                  } else { // 111111
                    set(board, i, 'K');
                  }
                }
              }
            }
          }
        }
      }


      // the order is THE OPPOSITE OF:
      //    1) invert colors
      //    2) reflect horizontally
      //    3) reflect vertically
      //    4) reflect diagonally


      if (obj.diagonalReflection) {
        reflectDiagonally(board);
      }
      if (obj.verticalReflection) {
        reflectVertically(board);
      }
      if (obj.horizontalReflection) {
        reflectHorizontally(board);
      }
      if (color == 'b') {
        invertColors(board, false);
      }

      var blanks = 0;
      var fen = "";
      for (var i = 0; i < 8; i++) {
        if (i != 0) {
          fen += "/";
        }
        for (var j = 0; j < 8; j++) {
          var piece = board[8 * i + j];
          if (piece == 0) {
            blanks++;
          } else {
            if (blanks) {
              fen += blanks;
            }
            blanks = 0;
            fen += piece;
          }
        }
        if (blanks) {
          fen += blanks;
          blanks = 0;
        }
      }

      fen += " " + color;

      var castlingBits = (encodedByte >>> 1) & 15;
      if (color == 'b') {
        castlingBits = invertCastlingBits(castlingBits);
      }

      var castling = util.castling.toString(castlingBits);
      fen += " " + castling;
      fen += " ";

      var ep = (encodedByte >>> 5);
      var enPassantTarget = "-";
      if (ep) {
        var epRow = (color == 'w') ? 5 : 2;
        var attackingRow = (color == 'w') ? 4: 3;
        var attackingPiece = (color == 'w') ? WHITE_PAWN : BLACK_PAWN;
        var victimPiece = (color == 'w') ? BLACK_PAWN : WHITE_PAWN;

        for (var i = 0; i < 8; i++) {
          if (board[epRow * 8 + i] == 0
              && board[attackingRow * 8 + i] == victimPiece
              && (i > 0 && (board[attackingRow * 8 + i - 1] == attackingPiece))
              || (i < 7 && (board[attackingRow * 8 + i + 1] == attackingPiece))) {
            ep--;
          }
          if (ep == 0) {
            enPassantTarget = "abcdefgh".charAt(i) + "12345678".charAt(epRow);
          }
        }
      }
      fen += (enPassantTarget + " ");

      fen += obj.halfMoveCount + " ";
      fen += obj.fullMoveNumber;

      return fen;
    }
  };

});
