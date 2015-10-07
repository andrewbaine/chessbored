
define ([], function() {

  function promotionsConsistent(a, b) {
    var s1 = a.indexOf('=');
    var s2 = b.indexOf('=');
    if (s1 == -1) {
      return s2 == -1;
    } else {
      if (s2 == -1) {
        return false;
      } else {
        return a.charCodeAt(s1 + 1) == b.charCodeAt(s2 + 1);
      }
    }
  }

  function destinationIndex(san) {
    for (var i = san.length - 1; i > 0; i--) {
      var code = san.charCodeAt(i);
      if (code >= 49 && code < 57) {
        return i - 1;
      }
    }
  }

  var sw = function(str, prefix) {
    if (str.length < prefix.length) {
      return false;
    }
    for (var i = 0; i < prefix.length; i++) {
      if (str.charAt(i) != prefix.charAt(i)) {
        return false;
      }
    }
    return true;
  };

  return {
    startsWith: sw,
    castling: {
      toString: function(x) {
        if (x) {
          var result = "";
          for (var i = 0; i < 4; i++) {
            if (x & (1 << i)) {
              result += "KQkq".charAt(i);
            }
          }
          return result;
        } else {
          return "-";
        }
      },
      toInt: function(x) {
        if (!x || x == "-") {
          return 0;
        }
        else {
          var result = 0;
          var j = 0;
          for (var i = 0; i < x.length; i++) {
            var c = x.charAt(i);
            while ("KQkq".charAt(j) != c) {
              j++;
            }
            result |= (1 << j);
            j++;
          }
          return result;
        }
      }
    },
    san: {
      consistent: function(a, b) {
        if (sw(a, "O-O") || sw(b, "O-O")) {
          if (sw(a, "O-O-O") && sw(b, "O-O-O")) {
            return true;
          }
          if (sw(a, "O-O-O") || sw(b, "O-O-O")) {
            return false;
          }
          return sw(a, "O-O") && sw(b, "O-O");
        }

        var re = /^([RNBQK])?([a-h])?([1-8])?(x)?([a-h][1-8])(=[RNBQ])?(\+#)?/;

        var m1 = re.exec(a);
        var m2 = re.exec(b);

        if (m1 == null) {
          throw new Error("no match for " + a);
        }
        if (m2 == null) {
          throw new Error("no match for " + b);
        }

        if (m1[1] != m2[1] // same piece
            || m1[5] != m2[5] // same destination
            || m1[6] != m2[6]) { // same promotion
          return false;
        }

        if (!m1[1]) { // pawn moves
          if (m2[1]) {
            return false;
          } else {
            return (m1[2] == m2[2] && m1[3] == m2[3] && m1[4] == m2[4]);
          }
        } else { // piece moves
          if (m1[2] && m2[2] && m1[2] != m2[2]) {
            return false;
          }
          if (m1[3] && m2[3] && m1[3] != m2[3]) {
            return false;
          }
        }
        return true;
      }
    }
  };
});
