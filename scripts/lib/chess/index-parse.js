define(['lib/chess/chess-engine', 'lib/chess/huffman', 'lib/md5.min'], function(engine, huffman, md5) {

  var identityOrEmptyString = function(x) {
    return ((x != null) ? x : "");
  }

  var computeId = function(doc) {
    var md5String = "";
    md5String = md5String + ("|" + identityOrEmptyString(doc.event));
    md5String = md5String + ("|" + identityOrEmptyString(doc.site));
    md5String = md5String + ("|" + identityOrEmptyString(doc.date));
    md5String = md5String + ("|" + identityOrEmptyString(doc.round));
    md5String = md5String + ("|" + identityOrEmptyString(doc.white));
    md5String = md5String + ("|" + identityOrEmptyString(doc.black));
    md5String = md5String + ("|" + identityOrEmptyString(doc.result));
    md5String = md5String + ("|" + identityOrEmptyString(doc.moveIndex));
    var result = md5(md5String);
    return result;
  }

  function normalizeName(v) {
    var result = v.replace(/\((wh)\)|\((bl)\)/g, "").trim();
    result = result.replace(/,(\S)/g, ", $1");
    return result;
  }

  return {
    parse: function(parsedGame) {
      var documents = [];

      var event = null;
      var site = null;
      var year = null;
      var month = null;
      var day = null;
      var whiteTitle = null;
      var blackTitle = null;
      var whiteElo = null;
      var blackElo = null;
      var eco = null;
      var opening = null;
      var variation = null;
      var whiteFideId = null;
      var blackFideId = null;

      var tags = parsedGame.tags;
      for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];
        var key = tag.key;
        var value = tag.value.trim();
        switch(key) {
        case "Event":
          event = value;
          break;
        case "Site":
          site = value;
          break;
        case "Date":
          if (/\d{4}\...\.../.test(value)) {
            year = parseInt(value.substring(0, 4));
            var m = value.substring(5,7);
            if (/\d{2}/.test(m)) {
              month = parseInt(m);
              var d = value.substring(8, 10);
              if (/\d{2}/.test(d)) {
                day = parseInt(d);
              }
            }
          }
          break;
        case "Round":
          round = value;
          break;
        case  "White":
          white = normalizeName(value);
          break;
        case "Black":
          black = normalizeName(value);
          break;
        case "Result":
          result = value;
          break;
        case "WhiteTitle":
          whiteTitle = value;
          break;
        case "BlackTitle":
          blackTitle = value;
          break;
        case "WhiteElo":
          whiteElo = parseInt(value);
          break;
        case "BlackElo":
          blackElo = parseInt(value);
          break;
        case "ECO":
          eco = value;
          break;
        case "Opening":
          opening = value;
          break;
        case "Variation":
          variation = value;
          break;
        case "WhiteFideId":
          whiteFideId = value;
          break;
        case "BlackFideId":
          blackFideId = value;
          break;
        }
      }

      var makeDocument = function() {
        var doc = {};
        doc.event = event;
        doc.site = site;
        if (year) {
          doc.year = year;
        }
        if (month) {
          doc.month = month;
        }
        if (day) {
          doc.day = day;
        }
        doc.round = round;
        doc.white = white;
        doc.black = black;
        doc.result = result;
        if (whiteTitle) {
          doc.whiteTitle = whiteTitle;
        }
        if (whiteElo) {
          doc.whiteElo = whiteElo;
        }
        if (whiteFideId) {
          doc.whiteFideId = whiteFideId;
        }
        if (blackTitle) {
          doc.blackTitle = blackTitle;
        }
        if (blackElo) {
          doc.blackElo = blackElo;
        }
        if (blackFideId) {
          doc.blackFideId = blackFideId;
        }


        if (eco) {
          doc.eco = eco;
        }
        if (opening) {
          doc.opening = opening;
        }
        if (variation) {
          doc.variation = variation;
        }

        return doc;
      };

      var goodNess = (result == "1-0") ? 1 : (result == "0-1") ? -1 : 0;
      activeColor = 'white';
      var activeElo = whiteElo;
      var passiveElo = blackElo;

      var e = engine.create();
      var fromFen = e.fen();
      var fromBoard = huffman.encode(fromFen).encodedBoard;


      for (var i = 0; i < parsedGame.moves.length; i++) {

        var successors = e.successors();
        var toBoards = [];
        for (var j = 0; j < successors.length; j++) {
          var move = successors[j];
          e.move(move);
          var toBoard = huffman.encode(e.fen()).encodedBoard;
          toBoards.push(toBoard);
          e.back();
        }
        toBoards.sort();

        var move = parsedGame.moves[i];
        e.move({ san: move });

        var doc = makeDocument();
        var toFen = e.fen();
        var toBoard = huffman.encode(toFen).encodedBoard;

        doc.move = move;
        doc.moveIndex = i;
        doc.fromFen = fromFen;
        doc.fromBoard = fromBoard;
        doc.toFen = toFen;
        doc.toBoard = toBoards.indexOf(toBoard);
        doc.goodNess = goodNess;
        doc.activeColor = activeColor;
        if (activeElo) {
          doc.activeElo = activeElo;
        }
        if (passiveElo) {
          doc.passiveElo = passiveElo;
        }

        var id = computeId(doc);
        doc.id = id;
        documents.push(doc);

        goodNess = (-1 * goodNess);
        activeColor = activeColor == 'white' ? 'black' : 'white';
        var tmp = activeElo;
        activeElo = passiveElo;
        passiveElo = tmp;
        fromFen = toFen;
        fromBoard = toBoard;
      }
      var doc = makeDocument();

      doc.fromFen = fromFen;
      doc.fromBoard = fromBoard;
      doc.goodNess = goodNess;
      doc.activeColor = activeColor;
      if (activeElo) {
        doc.activeElo = activeElo;
      }
      if (passiveElo) {
        doc.passiveElo = passiveElo;
      }
      doc.id = computeId(doc);
      documents.push(doc);
      return documents;
    }
  }
});
