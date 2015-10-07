
"use strict";
require.config({
  baseUrl: 'scripts',
  paths: {
    'QUnit': 'qunit-1.16.0'
  },
  shim: {
    'QUnit': {
      exports: 'QUnit',
      init: function() {
        QUnit.config.autoload = false;
        QUnit.config.autostart = false;
      }
    }
  }
});

// require the unit tests.
require(['QUnit',
         'lib/base64'
        ],
  function(QUnit, base64) {
    QUnit.test("wikipedia-examples", function(assert) {
      var testCases = [
        {
          input: "any carnal pleasure.",
          output: "YW55IGNhcm5hbCBwbGVhc3VyZS4=",
        },
        {
          input: "any carnal pleasure",
          output: "YW55IGNhcm5hbCBwbGVhc3VyZQ==",
        },
        {
          input: "any carnal pleasur",
          output: "YW55IGNhcm5hbCBwbGVhc3Vy",
        },
        {
          input: "any carnal pleasu",
          output: "YW55IGNhcm5hbCBwbGVhc3U=",
        },
        {
          input: "any carnal pleas",
          output: "YW55IGNhcm5hbCBwbGVhcw==",
        },
      ];
      function f(testCase) {
        var input = testCase.input;
        var bytes = new Uint8Array(input.length);
        for (var i = 0; i < bytes.length; i++) {
          bytes[i] = input.charCodeAt(i);
        }
        var actualEncoding = base64.encode(bytes);
        var expectedEncoding = testCase.output;
        assert.equal(actualEncoding,
                     expectedEncoding,
                     '"' + testCase.input + '" was encoded successfully as "' + testCase.output + '"');
        var unencodedBytes = base64.decode(expectedEncoding);
        var unencodedString = String.fromCharCode.apply(null, unencodedBytes);
        assert.equal(unencodedString, input, '"' + testCase.output + "\" was decoded successfully as \"" + testCase.input   + '"');
      }
      for (var i = 0; i < testCases.length; i++) {
        f(testCases[i]);
      }
    });
    QUnit.load();
    QUnit.start();
  });
