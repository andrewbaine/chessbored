
define([], function() {
  return {
    parseGame: function(lines) {
      var tags = [];
      var moveTextLines = [];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var tagMatches = line.match(/^\s*\[(\w+)\s*"(.*)"\s*\]\s*$/);
        if (tagMatches) {
          var key = tagMatches[1];
          var value = tagMatches[2];
          tags.push({ key: key, value: value});
        } else {
          var n = line.indexOf(';');
          if (n != -1) {
            line = line.substring(0, n);
          }
          if (line) {
            moveTextLines.push(line);
          }
        }
      }
      var moveText = moveTextLines.join(" ");
      moveText = moveText.replace(/\{.*?\}/g, " ");
      var moves = moveText.split(/\s+/);
      moves = moves.filter(function(x) {
        return x
          && !(/\d+\./.test(x))
          && x != "1/2-1/2"
          && x != "1-0"
          && x != "0-1"
          && x != "*";
      });
      return {
        tags: tags,
        moves: moves
      }
    }
  };

});
