
define([], function() {

  var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  return {
    decode: function(str, bytes) {
      if (arguments.length == 1) {
        var len = Math.floor(str.length / 4);
        if (str.endsWith("==")) {
          len = 3 * len - 2;
        } else if (str.endsWith("=")) {
          len = 3 * len - 1;
        } else {
          len = 3 * len;
        }
        bytes = new Uint8Array(len);
      }
      var n = 0;
      for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i);
        if (c == '=') {
          break;
        }
        var b = b64.indexOf(c);
        switch(i% 4) {
        case 0:
          bytes[n] = (b << 2);
          break;
        case 1:
          bytes[n] = bytes[n] | (b >>> 4);
          n++;
          bytes[n] = (b & 15) << 4;
          break;
        case 2:
          bytes[n] = bytes[n] | (b >>> 2);
          n++;
          bytes[n] = ((b & 3) << 6);
          break;
        case 3:
          bytes[n] = bytes[n] | b;
          n++;
          break;
        }
      }
      return bytes;
    },

    encode: function(bytes, len) {
      if (arguments.length == 1) {
        len = bytes.length;
      }
      var result = "";
      var index = 0;
      for (var i = 0; i < bytes.length; i++) {
        var b = bytes[i];
        switch(i % 3) {
        case 0:
          index = (b >>> 2);
          result += b64[index];
          index = (b & 3) << 4;
          break;
        case 1:
          index = index | (b >>> 4);
          result += b64[index];
          index = (b & 15) << 2;
          break;
        case 2:
          index = index | (b >>> 6);
          result += b64[index];
          index = b & 63;
          result += b64[index];
          break;
        }
      }
      if (len % 3 == 1) {
        result += b64[index];
        result += "==";
      } else if (len % 3 == 2) {
        result += b64[index];
        result += "=";
      }
      return result;
    }
  };
});
