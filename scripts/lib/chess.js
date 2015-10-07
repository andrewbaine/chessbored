
define(["jquery", 'lib/jquery-ui-1.11.2/jquery-ui'],
       function($, jqueryui) {

  function drawBoard(el, fen, successors) {
    $(el).data("successors", successors);
    var am = successors;

    var movesBySource = {};
    for (var i = 0; i < am.length; i++) {
      var move = am[i];
      if (!movesBySource.hasOwnProperty(move.source)) {
        movesBySource[move.source] = [];
      }
      movesBySource[move.source].push(move.destination);
    }

    var charIndex = 0;
    var blanks = 0;
    $(el).find('.square').each(function(i, e) {
      var val = null;
      if (blanks == 0) {
        var next = fen.charAt(charIndex);
        charIndex++;
        if (next == "/") {
          next = fen.charAt(charIndex);
          charIndex++;
        }
        var intRegex = /^\d+$/;
        if (intRegex.test(next)) {
          blanks = parseInt(next);
        } else {
          val = next;
        }
      }
      $(e).empty();
      if (val) {
        var color = (val == val.toLowerCase()) ? 'b' : 'w';
        var piece = val.toUpperCase();
        var href = 'images/' + color + piece + '.png';
        var options = {
          start: function(event, ui) {
            var source = $(this).data('square');
            var destinations = movesBySource[source];
            $(el).find('.square').each(function(i, e) {
              var s = $(e).data('square');
              if (destinations && destinations.indexOf(s) != -1) {
                $(e)
                  .droppable('enable')
                  .droppable("option", "activeClass", "ui-state-highlight");
              } else {
                $(e).droppable('disable');
              }
            });
          },
          revert: "invalid"
        };
        var square = "abcdefgh".charAt(i % 8) + "12345678".charAt(7 - Math.floor(i / 8))
        $(e).append($('<img>').data("square", square)
                    .data('piece', val)
                    .attr('src', href)
                    .draggable(options));
      } else {
        blanks = blanks - 1;
      }
    });
  }

  return  {
    chessboard: function(e, options) {
      if (arguments.length < 2) {
        options = {};
      }
      var dialog = $('<div>').appendTo($(e));
      for (var i = 0; i < 8; i++) {
          var color = (i % 2 == 0) ? 'white' : 'black';
          var row = $('<div>');
          for (var j = 0; j < 8; j++) {
            var square = "abcdefgh".charAt(j) + "12345678".charAt(7 - i)
            row.append($('<div>')
                       .addClass(square + " square " + color)
                       .data("square", square)
                       .droppable({
                         drop: function(event, ui) {
                           var src = ui.draggable.data("square");
                           var dest = $(this).data("square");
                           var piece = ui.draggable.data("piece");
                           function f(promo) {
                             var finalMove = null;
                             var successors = $(e).data("successors");
                             var found = 0;
                             for (var i = 0; i < successors.length; i++) {
                               var m = successors[i];
                               if (m.source == src && m.destination == dest
                                  && (!promo || promo == m.promotion)) {
                                 found++;
                                 finalMove = m;
                               }
                             }
                             if (found != 1) {
                               throw new Error("looking for exactly 1 match; found " + found);
                             }
                             if (options.onMove) {
                               options.onMove(finalMove);
                             }
                           };
                           if ((piece == "P" &&  dest.charAt(1) == '8')
                              || (piece == 'p' && dest.charAt(1) == '1')) {
                             dialog.dialog({
                               buttons: [
                                 { text: 'Q', click: function() {  $( this ).dialog( "close" ); f('Q'); }},
                                 { text: 'R', click: function() {  $( this ).dialog( "close" ); f('R'); }},
                                 { text: 'B', click: function() {  $( this ).dialog( "close" ); f('B'); }},
                                 { text: 'N', click: function() {  $( this ).dialog( "close" ); f('N'); }}
                               ]
                             });
                           } else {
                             f(null);
                           }
                         }
                       }));
            color = (color == "black" ? "white": "black");
          }
          $(e).append(row);
      }
      return {
        update: function(fen, successors) {
          drawBoard(e, fen, successors);
        }
      };
    }
  };
});
