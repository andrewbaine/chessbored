
"use strict";
require.config({
  baseUrl: 'scripts',
  paths: {
    'QUnit': 'qunit-1.16.0',
    'cryptojs.core': "path/to/cryptojslib/components/core.js",
    'cryptojs.md5': "path/to/cryptojslib/components/md5.js",
    'cryptojs.base64': "path/to/cryptojslib/components/enc-base64.js"
  },
  shim: {
    'QUnit': {
      exports: 'QUnit',
      init: function() {
        QUnit.config.autoload = false;
        QUnit.config.autostart = false;
      }
    },
    'cryptojs.core': {
      exports: "CryptoJS"
    },
    'cryptojs.md5': {
      deps: ['cryptojs.core'],
      exports: "CryptoJS" //You can also use "CryptoJS.MD5"
    },
    'cryptojs.base64': {
      deps: ['cryptojs.core'],
      exports: "CryptoJS" //You can also use "CryptoJS.enc.Base64"
    }
  }
});

// require the unit tests.
require(['QUnit',
         'lib/chess/chess-engine',
         'lib/chess/pgn-parser',
         'lib/chess/huffman',
         'lib/underscore',
         'lib/chess/util',
         'tests/parse-test',
],
  function(Q, engine, pgn, huffman, underscore, util, parseTest) {
    parseTest.test();
    var movesAndFens = [
        { san: "e4", fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1" },
        { san: "c5", fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2" },
        { san: "Nf3", fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2" },
        { san: "d6", fen: "rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3" },
        { san: "Bb5+", fen: "rnbqkbnr/pp2pppp/3p4/1Bp5/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 1 3" },
        { san: "Bd7", fen: "rn1qkbnr/pp1bpppp/3p4/1Bp5/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 4" },
        { san: "Bxd7+", fen: "rn1qkbnr/pp1Bpppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4" },
        { san: "Qxd7", fen: "rn2kbnr/pp1qpppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5" },
        { san: "O-O", fen: "rn2kbnr/pp1qpppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 1 5" },
        { san: "Nf6", fen: "rn2kb1r/pp1qpppp/3p1n2/2p5/4P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 2 6" },
        { san: "e5", fen: "rn2kb1r/pp1qpppp/3p1n2/2p1P3/8/5N2/PPPP1PPP/RNBQ1RK1 b kq - 0 6" },
        { san: "dxe5", fen: "rn2kb1r/pp1qpppp/5n2/2p1p3/8/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 7" },
        { san: "Nxe5", fen: "rn2kb1r/pp1qpppp/5n2/2p1N3/8/8/PPPP1PPP/RNBQ1RK1 b kq - 0 7" },
        { san: "Qc8", fen: "rnq1kb1r/pp2pppp/5n2/2p1N3/8/8/PPPP1PPP/RNBQ1RK1 w kq - 1 8" },
        { san: "Qf3", fen: "rnq1kb1r/pp2pppp/5n2/2p1N3/8/5Q2/PPPP1PPP/RNB2RK1 b kq - 2 8" },
        { san: "e6", fen: "rnq1kb1r/pp3ppp/4pn2/2p1N3/8/5Q2/PPPP1PPP/RNB2RK1 w kq - 0 9" },
        { san: "d3", fen: "rnq1kb1r/pp3ppp/4pn2/2p1N3/8/3P1Q2/PPP2PPP/RNB2RK1 b kq - 0 9" },
        { san: "Be7", fen: "rnq1k2r/pp2bppp/4pn2/2p1N3/8/3P1Q2/PPP2PPP/RNB2RK1 w kq - 1 10" },
        { san: "Nc3", fen: "rnq1k2r/pp2bppp/4pn2/2p1N3/8/2NP1Q2/PPP2PPP/R1B2RK1 b kq - 2 10" },
        { san: "O-O", fen: "rnq2rk1/pp2bppp/4pn2/2p1N3/8/2NP1Q2/PPP2PPP/R1B2RK1 w - - 3 11" },
        { san: "Bf4", fen: "rnq2rk1/pp2bppp/4pn2/2p1N3/5B2/2NP1Q2/PPP2PPP/R4RK1 b - - 4 11" },
        { san: "Nbd7", fen: "r1q2rk1/pp1nbppp/4pn2/2p1N3/5B2/2NP1Q2/PPP2PPP/R4RK1 w - - 5 12" },
        { san: "Rfe1", fen: "r1q2rk1/pp1nbppp/4pn2/2p1N3/5B2/2NP1Q2/PPP2PPP/R3R1K1 b - - 6 12" },
        { san: "Nxe5", fen: "r1q2rk1/pp2bppp/4pn2/2p1n3/5B2/2NP1Q2/PPP2PPP/R3R1K1 w - - 0 13" },
        { san: "Bxe5", fen: "r1q2rk1/pp2bppp/4pn2/2p1B3/8/2NP1Q2/PPP2PPP/R3R1K1 b - - 0 13" },
        { san: "Qd7", fen: "r4rk1/pp1qbppp/4pn2/2p1B3/8/2NP1Q2/PPP2PPP/R3R1K1 w - - 1 14" },
        { san: "Qh3", fen: "r4rk1/pp1qbppp/4pn2/2p1B3/8/2NP3Q/PPP2PPP/R3R1K1 b - - 2 14" },
        { san: "Rad8", fen: "3r1rk1/pp1qbppp/4pn2/2p1B3/8/2NP3Q/PPP2PPP/R3R1K1 w - - 3 15" },
        { san: "Ne4", fen: "3r1rk1/pp1qbppp/4pn2/2p1B3/4N3/3P3Q/PPP2PPP/R3R1K1 b - - 4 15" },
        { san: "Nd5", fen: "3r1rk1/pp1qbppp/4p3/2pnB3/4N3/3P3Q/PPP2PPP/R3R1K1 w - - 5 16" },
        { san: "a3", fen: "3r1rk1/pp1qbppp/4p3/2pnB3/4N3/P2P3Q/1PP2PPP/R3R1K1 b - - 0 16" },
        { san: "f6", fen: "3r1rk1/pp1qb1pp/4pp2/2pnB3/4N3/P2P3Q/1PP2PPP/R3R1K1 w - - 0 17" },
        { san: "Bg3", fen: "3r1rk1/pp1qb1pp/4pp2/2pn4/4N3/P2P2BQ/1PP2PPP/R3R1K1 b - - 1 17" },
        { san: "e5", fen: "3r1rk1/pp1qb1pp/5p2/2pnp3/4N3/P2P2BQ/1PP2PPP/R3R1K1 w - - 0 18" },
        { san: "Qxd7", fen: "3r1rk1/pp1Qb1pp/5p2/2pnp3/4N3/P2P2B1/1PP2PPP/R3R1K1 b - - 0 18" },
        { san: "Rxd7", fen: "5rk1/pp1rb1pp/5p2/2pnp3/4N3/P2P2B1/1PP2PPP/R3R1K1 w - - 0 19" },
        { san: "f3", fen: "5rk1/pp1rb1pp/5p2/2pnp3/4N3/P2P1PB1/1PP3PP/R3R1K1 b - - 0 19" },
        { san: "Rc8", fen: "2r3k1/pp1rb1pp/5p2/2pnp3/4N3/P2P1PB1/1PP3PP/R3R1K1 w - - 1 20" },
        { san: "b3", fen: "2r3k1/pp1rb1pp/5p2/2pnp3/4N3/PP1P1PB1/2P3PP/R3R1K1 b - - 0 20" },
        { san: "Kf7", fen: "2r5/pp1rbkpp/5p2/2pnp3/4N3/PP1P1PB1/2P3PP/R3R1K1 w - - 1 21" },
        { san: "Nd2", fen: "2r5/pp1rbkpp/5p2/2pnp3/8/PP1P1PB1/2PN2PP/R3R1K1 b - - 2 21" },
        { san: "Bd8", fen: "2rb4/pp1r1kpp/5p2/2pnp3/8/PP1P1PB1/2PN2PP/R3R1K1 w - - 3 22" },
        { san: "Re4", fen: "2rb4/pp1r1kpp/5p2/2pnp3/4R3/PP1P1PB1/2PN2PP/R5K1 b - - 4 22" },
        { san: "Ba5", fen: "2r5/pp1r1kpp/5p2/b1pnp3/4R3/PP1P1PB1/2PN2PP/R5K1 w - - 5 23" },
        { san: "Nc4", fen: "2r5/pp1r1kpp/5p2/b1pnp3/2N1R3/PP1P1PB1/2P3PP/R5K1 b - - 6 23" },
        { san: "Bc3", fen: "2r5/pp1r1kpp/5p2/2pnp3/2N1R3/PPbP1PB1/2P3PP/R5K1 w - - 7 24" },
        { san: "Rf1", fen: "2r5/pp1r1kpp/5p2/2pnp3/2N1R3/PPbP1PB1/2P3PP/5RK1 b - - 8 24" },
        { san: "b5", fen: "2r5/p2r1kpp/5p2/1ppnp3/2N1R3/PPbP1PB1/2P3PP/5RK1 w - b6 0 25" },
        { san: "Nxe5+", fen: "2r5/p2r1kpp/5p2/1ppnN3/4R3/PPbP1PB1/2P3PP/5RK1 b - - 0 25" },
        { san: "fxe5", fen: "2r5/p2r1kpp/8/1ppnp3/4R3/PPbP1PB1/2P3PP/5RK1 w - - 0 26" },
        { san: "Bxe5", fen: "2r5/p2r1kpp/8/1ppnB3/4R3/PPbP1P2/2P3PP/5RK1 b - - 0 26" },
        { san: "Bd4+", fen: "2r5/p2r1kpp/8/1ppnB3/3bR3/PP1P1P2/2P3PP/5RK1 w - - 1 27" },
        { san: "Kh1", fen: "2r5/p2r1kpp/8/1ppnB3/3bR3/PP1P1P2/2P3PP/5R1K b - - 2 27" },
        { san: "Bxe5", fen: "2r5/p2r1kpp/8/1ppnb3/4R3/PP1P1P2/2P3PP/5R1K w - - 0 28" },
        { san: "Rxe5", fen: "2r5/p2r1kpp/8/1ppnR3/8/PP1P1P2/2P3PP/5R1K b - - 0 28" },
        { san: "Re8", fen: "4r3/p2r1kpp/8/1ppnR3/8/PP1P1P2/2P3PP/5R1K w - - 1 29" },
        { san: "Re4", fen: "4r3/p2r1kpp/8/1ppn4/4R3/PP1P1P2/2P3PP/5R1K b - - 2 29" },
        { san: "Nf6", fen: "4r3/p2r1kpp/5n2/1pp5/4R3/PP1P1P2/2P3PP/5R1K w - - 3 30" },
        { san: "Rxe8", fen: "4R3/p2r1kpp/5n2/1pp5/8/PP1P1P2/2P3PP/5R1K b - - 0 30" },
        { san: "Kxe8", fen: "4k3/p2r2pp/5n2/1pp5/8/PP1P1P2/2P3PP/5R1K w - - 0 31" },
        { san: "Kg1", fen: "4k3/p2r2pp/5n2/1pp5/8/PP1P1P2/2P3PP/5RK1 b - - 1 31" },
        { san: "Ke7", fen: "8/p2rk1pp/5n2/1pp5/8/PP1P1P2/2P3PP/5RK1 w - - 2 32" },
        { san: "Kf2", fen: "8/p2rk1pp/5n2/1pp5/8/PP1P1P2/2P2KPP/5R2 b - - 3 32" },
        { san: "Kd6", fen: "8/p2r2pp/3k1n2/1pp5/8/PP1P1P2/2P2KPP/5R2 w - - 4 33" },
        { san: "Ke3", fen: "8/p2r2pp/3k1n2/1pp5/8/PP1PKP2/2P3PP/5R2 b - - 5 33" },
        { san: "Re7+", fen: "8/p3r1pp/3k1n2/1pp5/8/PP1PKP2/2P3PP/5R2 w - - 6 34" },
        { san: "Kd2", fen: "8/p3r1pp/3k1n2/1pp5/8/PP1P1P2/2PK2PP/5R2 b - - 7 34" },
        { san: "Nd5", fen: "8/p3r1pp/3k4/1ppn4/8/PP1P1P2/2PK2PP/5R2 w - - 8 35" },
        { san: "g3", fen: "8/p3r1pp/3k4/1ppn4/8/PP1P1PP1/2PK3P/5R2 b - - 0 35" },
        { san: "Ne3", fen: "8/p3r1pp/3k4/1pp5/8/PP1PnPP1/2PK3P/5R2 w - - 1 36" },
        { san: "Ra1", fen: "8/p3r1pp/3k4/1pp5/8/PP1PnPP1/2PK3P/R7 b - - 2 36" },
        { san: "Nf5", fen: "8/p3r1pp/3k4/1pp2n2/8/PP1P1PP1/2PK3P/R7 w - - 3 37" },
        { san: "c3", fen: "8/p3r1pp/3k4/1pp2n2/8/PPPP1PP1/3K3P/R7 b - - 0 37" },
        { san: "Kd5", fen: "8/p3r1pp/8/1ppk1n2/8/PPPP1PP1/3K3P/R7 w - - 1 38" },
        { san: "Rf1", fen: "8/p3r1pp/8/1ppk1n2/8/PPPP1PP1/3K3P/5R2 b - - 2 38" },
        { san: "Re6", fen: "8/p5pp/4r3/1ppk1n2/8/PPPP1PP1/3K3P/5R2 w - - 3 39" },
        { san: "f4", fen: "8/p5pp/4r3/1ppk1n2/5P2/PPPP2P1/3K3P/5R2 b - - 0 39" },
        { san: "Ra6", fen: "8/p5pp/r7/1ppk1n2/5P2/PPPP2P1/3K3P/5R2 w - - 1 40" },
        { san: "Re1", fen: "8/p5pp/r7/1ppk1n2/5P2/PPPP2P1/3K3P/4R3 b - - 2 40" },
        { san: "Re6", fen: "8/p5pp/4r3/1ppk1n2/5P2/PPPP2P1/3K3P/4R3 w - - 3 41" },
        { san: "Rf1", fen: "8/p5pp/4r3/1ppk1n2/5P2/PPPP2P1/3K3P/5R2 b - - 4 41" },
        { san: "Ne3", fen: "8/p5pp/4r3/1ppk4/5P2/PPPPn1P1/3K3P/5R2 w - - 5 42" },
        { san: "Rf3", fen: "8/p5pp/4r3/1ppk4/5P2/PPPPnRP1/3K3P/8 b - - 6 42" },
        { san: "Ng4", fen: "8/p5pp/4r3/1ppk4/5Pn1/PPPP1RP1/3K3P/8 w - - 7 43" },
        { san: "h3", fen: "8/p5pp/4r3/1ppk4/5Pn1/PPPP1RPP/3K4/8 b - - 0 43" },
        { san: "Nf6", fen: "8/p5pp/4rn2/1ppk4/5P2/PPPP1RPP/3K4/8 w - - 1 44" },
        { san: "g4", fen: "8/p5pp/4rn2/1ppk4/5PP1/PPPP1R1P/3K4/8 b - - 0 44" },
        { san: "Ra6", fen: "8/p5pp/r4n2/1ppk4/5PP1/PPPP1R1P/3K4/8 w - - 1 45" },
        { san: "c4+", fen: "8/p5pp/r4n2/1ppk4/2P2PP1/PP1P1R1P/3K4/8 b - - 0 45" },
        { san: "Kd4", fen: "8/p5pp/r4n2/1pp5/2Pk1PP1/PP1P1R1P/3K4/8 w - - 1 46" },
        { san: "g5", fen: "8/p5pp/r4n2/1pp3P1/2Pk1P2/PP1P1R1P/3K4/8 b - - 0 46" },
        { san: "Rxa3", fen: "8/p5pp/5n2/1pp3P1/2Pk1P2/rP1P1R1P/3K4/8 w - - 0 47" },
        { san: "gxf6", fen: "8/p5pp/5P2/1pp5/2Pk1P2/rP1P1R1P/3K4/8 b - - 0 47" },
        { san: "gxf6", fen: "8/p6p/5p2/1pp5/2Pk1P2/rP1P1R1P/3K4/8 w - - 0 48" },
        { san: "cxb5", fen: "8/p6p/5p2/1Pp5/3k1P2/rP1P1R1P/3K4/8 b - - 0 48" },
        { san: "Rxb3", fen: "8/p6p/5p2/1Pp5/3k1P2/1r1P1R1P/3K4/8 w - - 0 49" },
        { san: "f5", fen: "8/p6p/5p2/1Pp2P2/3k4/1r1P1R1P/3K4/8 b - - 0 49" },
        { san: "Rb2+", fen: "8/p6p/5p2/1Pp2P2/3k4/3P1R1P/1r1K4/8 w - - 1 50" },
        { san: "Kc1", fen: "8/p6p/5p2/1Pp2P2/3k4/3P1R1P/1r6/2K5 b - - 2 50" },
        { san: "Rxb5", fen: "8/p6p/5p2/1rp2P2/3k4/3P1R1P/8/2K5 w - - 0 51" },
        { san: "Kc2", fen: "8/p6p/5p2/1rp2P2/3k4/3P1R1P/2K5/8 b - - 1 51" },
        { san: "Rb4", fen: "8/p6p/5p2/2p2P2/1r1k4/3P1R1P/2K5/8 w - - 2 52" },
        { san: "Rf4+", fen: "8/p6p/5p2/2p2P2/1r1k1R2/3P3P/2K5/8 b - - 3 52" },
        { san: "Ke3", fen: "8/p6p/5p2/2p2P2/1r3R2/3Pk2P/2K5/8 w - - 4 53" },
        { san: "Rg4", fen: "8/p6p/5p2/2p2P2/1r4R1/3Pk2P/2K5/8 b - - 5 53" },
        { san: "Rf4", fen: "8/p6p/5p2/2p2P2/5rR1/3Pk2P/2K5/8 w - - 6 54" },
        { san: "Rg7", fen: "8/p5Rp/5p2/2p2P2/5r2/3Pk2P/2K5/8 b - - 7 54" },
        { san: "a5", fen: "8/6Rp/5p2/p1p2P2/5r2/3Pk2P/2K5/8 w - a6 0 55" },
        { san: "Ra7", fen: "8/R6p/5p2/p1p2P2/5r2/3Pk2P/2K5/8 b - - 1 55" },
        { san: "Rxf5", fen: "8/R6p/5p2/p1p2r2/8/3Pk2P/2K5/8 w - - 0 56" },
        { san: "Rxa5", fen: "8/7p/5p2/R1p2r2/8/3Pk2P/2K5/8 b - - 0 56" },
        { san: "Rh5", fen: "8/7p/5p2/R1p4r/8/3Pk2P/2K5/8 w - - 1 57" },
        { san: "Rb5", fen: "8/7p/5p2/1Rp4r/8/3Pk2P/2K5/8 b - - 2 57" },
        { san: "Rxh3", fen: "8/7p/5p2/1Rp5/8/3Pk2r/2K5/8 w - - 0 58" },
        { san: "Rxc5", fen: "8/7p/5p2/2R5/8/3Pk2r/2K5/8 b - - 0 58" },
        { san: "Kf4", fen: "8/7p/5p2/2R5/5k2/3P3r/2K5/8 w - - 1 59" },
        { san: "d4", fen: "8/7p/5p2/2R5/3P1k2/7r/2K5/8 b - - 0 59" },
        { san: "f5", fen: "8/7p/8/2R2p2/3P1k2/7r/2K5/8 w - - 0 60" },
        { san: "Rb5", fen: "8/7p/8/1R3p2/3P1k2/7r/2K5/8 b - - 1 60" },
        { san: "Kg4", fen: "8/7p/8/1R3p2/3P2k1/7r/2K5/8 w - - 2 61" },
        { san: "d5", fen: "8/7p/8/1R1P1p2/6k1/7r/2K5/8 b - - 0 61" },
        { san: "f4", fen: "8/7p/8/1R1P4/5pk1/7r/2K5/8 w - - 0 62" },
        { san: "d6", fen: "8/7p/3P4/1R6/5pk1/7r/2K5/8 b - - 0 62" },
        { san: "Rh6", fen: "8/7p/3P3r/1R6/5pk1/8/2K5/8 w - - 1 63" },
        { san: "Rd5", fen: "8/7p/3P3r/3R4/5pk1/8/2K5/8 b - - 2 63" },
        { san: "f3", fen: "8/7p/3P3r/3R4/6k1/5p2/2K5/8 w - - 0 64" },
        { san: "d7", fen: "8/3P3p/7r/3R4/6k1/5p2/2K5/8 b - - 0 64" },
        { san: "f2", fen: "8/3P3p/7r/3R4/6k1/8/2K2p2/8 w - - 0 65" },
        { san: "d8=Q", fen: "3Q4/7p/7r/3R4/6k1/8/2K2p2/8 b - - 0 65" },
        { san: "Rc6+", fen: "3Q4/7p/2r5/3R4/6k1/8/2K2p2/8 w - - 1 66" },
        { san: "Kd2", fen: "3Q4/7p/2r5/3R4/6k1/8/3K1p2/8 b - - 2 66" },
        { san: "f1=Q", fen: "3Q4/7p/2r5/3R4/6k1/8/3K4/5q2 w - - 0 67" },
        { san: "Qg5+", fen: "8/7p/2r5/3R2Q1/6k1/8/3K4/5q2 b - - 1 67" },
        { san: "Kh3", fen: "8/7p/2r5/3R2Q1/8/7k/3K4/5q2 w - - 2 68" },
        { san: "Qh5+", fen: "8/7p/2r5/3R3Q/8/7k/3K4/5q2 b - - 3 68" },
        { san: "Kg3", fen: "8/7p/2r5/3R3Q/8/6k1/3K4/5q2 w - - 4 69" },
        { san: "Rg5+", fen: "8/7p/2r5/6RQ/8/6k1/3K4/5q2 b - - 5 69" },
        { san: "Kf2", fen: "8/7p/2r5/6RQ/8/8/3K1k2/5q2 w - - 6 70" },
        { san: "Qh2+", fen: "8/7p/2r5/6R1/8/8/3K1k1Q/5q2 b - - 7 70" },
        { san: "Kf3", fen: "8/7p/2r5/6R1/8/5k2/3K3Q/5q2 w - - 8 71" },
        { san: "Qg3+", fen: "8/7p/2r5/6R1/8/5kQ1/3K4/5q2 b - - 9 71" },
        { san: "Ke4", fen: "8/7p/2r5/6R1/4k3/6Q1/3K4/5q2 w - - 10 72" },
        { san: "Qd3+", fen: "8/7p/2r5/6R1/4k3/3Q4/3K4/5q2 b - - 11 72" },
        { san: "Kf4", fen: "8/7p/2r5/6R1/5k2/3Q4/3K4/5q2 w - - 12 73" },
        { san: "Qf5#", fen: "8/7p/2r5/5QR1/5k2/8/3K4/5q2 b - - 13 73" }];


    function checkFen(fen, assert) {
      var actual = engine.create(fen).fen();
      var expected = fen;
      assert.equal(actual, expected);
    }

    Q.test("test 3 moves", function(assert) {
      var e = engine.create();
      function f(expectedFen, move) {
        if (move) {
          e.move({ san: move });
        }
        var actualFen = e.fen();
        var message = (move ? ("after [" + move + "] ") : "") + "fen should be " + expectedFen;
        assert.equal(actualFen, expectedFen, message);
        checkFen(expectedFen, assert);
      }

      f("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
      f("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1", "e4");
      f("rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2", "c5");
      f("rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2", "Nf3");
    });

    Q.test("full-game", function(assert) {
      var e = engine.create();
      function f(san, fen, i) {
        var moveNumber = "" + (Math.floor(i / 2) + 1) + ".";
        var ellipsis = (i % 2) ? "..." : null;
        var message = [moveNumber, ellipsis, san, "should yield", fen].join(" ");
        e.move({ san: san });
        assert.equal(e.fen(), fen, message);
      }
      for (var i = 0; i < movesAndFens.length; i++) {
        var m = movesAndFens[i];
        f(m.san, m.fen, i);
      }

    });

    Q.test("each fen from full game should be invertible", function(assert) {

      for (var i = 0; i < movesAndFens.length; i++) {
        var m = movesAndFens[i];
        checkFen(m.fen, assert);
      }
    });

    Q.test("each fen from full game should be huffman encodable and invertible",
               function(assert) {
      for (var i = 0; i < movesAndFens.length; i++) {
        var m = movesAndFens[i];
        var encoding = huffman.encode(m.fen);
        var decoding = huffman.decode(encoding);
        var expectedTokens = m.fen.split(" ");
        var actualTokens = decoding.split(" ");

        assert.equal(actualTokens.length, expectedTokens.length, "both should have same length");
        assert.equal(actualTokens.length, 6, "length should be 6");

        for (var j = 0; j < actualTokens.length; j++) {
          var actualToken = actualTokens[j];
          var expectedToken = expectedTokens[j];
          if (j == 3) {
            if (expectedToken == "-") {
              assert.equal(actualToken, expectedToken);
            } else {
              var e = engine.create(m.fen);
              var found = false;
              var successors = e.successors();
              for (var k = 0; k < successors.length; k++) {
                var san = successors[k].san;
                if (san.indexOf("x" + expectedToken) != -1) {
                  found = true;
                }
              }
              if (found) {
                assert.equal(actualToken, expectedToken);
              } else {
                assert.equal(actualToken, "-");
              }
            }
          } else {
            assert.equal(actualToken, expectedToken);
          }
        }
      }
    });

    Q.test("pgn example", function(assert) {
      var lines = [
        '[Event "F/S Return Match"]',
        '[Site "Belgrade, Serbia Yugoslavia|JUG"]',
        '[Date "1992.11.04"]',
        '[Round "29"]',
        '[White "Fischer, Robert J."]',
        '[Black "Spassky, Boris V."]',
        '[Result "1/2-1/2"]',
        ' ',
        '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 {This opening is called the Ruy Lopez.}',
        '4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8  10. d4 Nbd7',
        '11. c4 c6 12. cxb5 axb5 13. Nc3 Bb7 14. Bg5 b4 15. Nb1 h6 16. Bh4 c5 17. dxe5',
        'Nxe4 18. Bxe7 Qxe7 19. exd6 Qf6 20. Nbd2 Nxd6 21. Nc4 Nxc4 22. Bxc4 Nb6',
        '23. Ne5 Rae8 24. Bxf7+ Rxf7 25. Nxf7 Rxe1+ 26. Qxe1 Kxf7 27. Qe3 Qg5 28. Qxg5',
        'hxg5 29. b3 Ke6 30. a3 Kd6 31. axb4 cxb4 32. Ra5 Nd5 33. f3 Bc8 34. Kf2 Bf5',
        '35. Ra7 g6 36. Ra6+ Kc5 37. Ke1 Nf4 38. g3 Nxh3 39. Kd2 Kb5 40. Rd6 Kc5 41. Ra6',
        'Nf2 42. g4 Bd3 43. Re6 1/2-1/2'];

      var actual = pgn.parseGame(lines);
      var expected = {
        tags: [
          {
            key: "Event",
            value: "F/S Return Match"
          },
          {
            key: "Site",
            value: "Belgrade, Serbia Yugoslavia|JUG"
          },
          {
            key: "Date",
            value: "1992.11.04"
          },
          {
            key: "Round",
            value: "29"
          },
          {
            key: "White",
            value: "Fischer, Robert J."
          },
          {
            key: "Black",
            value: "Spassky, Boris V."
          },
          {
            key: "Result",
            value: "1/2-1/2"
          }
        ],
        moves: [
          "e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7",
          "Re1", "b5", "Bb3", "d6", "c3", "O-O", "h3", "Nb8", "d4", "Nbd7",
          "c4", "c6", "cxb5", "axb5", "Nc3", "Bb7", "Bg5", "b4", "Nb1", "h6",
          "Bh4", "c5", "dxe5", "Nxe4", "Bxe7", "Qxe7", "exd6", "Qf6", "Nbd2",
          "Nxd6", "Nc4", "Nxc4", "Bxc4", "Nb6", "Ne5", "Rae8", "Bxf7+", "Rxf7",
          "Nxf7", "Rxe1+", "Qxe1", "Kxf7", "Qe3", "Qg5", "Qxg5", "hxg5", "b3", "Ke6",
          "a3", "Kd6", "axb4", "cxb4", "Ra5", "Nd5", "f3", "Bc8", "Kf2", "Bf5", "Ra7",
          "g6", "Ra6+", "Kc5", "Ke1", "Nf4", "g3", "Nxh3", "Kd2", "Kb5", "Rd6", "Kc5",
          "Ra6", "Nf2", "g4", "Bd3", "Re6"
        ]
      };
      assert.deepEqual(actual, expected, "all good");

    });

    Q.test("base64", function(assert) {
      var fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      var actual = huffman.encode(fen);

      var expected =  {
        activeColor: 0,
        diagonalReflection: false,
        encodedBoard: "AACQJAm0bVvIWeMZ6wR693znvruwHg==",
        fullMoveNumber: 1,
        halfMoveCount: 0,
        horizontalReflection: false,
        verticalReflection: false
      };

      assert.deepEqual(actual, expected);
      var backOut = huffman.decode(actual);
      assert.equal(backOut, fen);
    });


    Q.test("normalization tests", function(assert) {
      var testCases = [
        {
          fen: "5kr1/8/8/8/8/8/8/4K3 w - - 10 30",
          expected: {
            activeColor: 0,
            diagonalReflection: false,
            horizontalReflection: false,
            verticalReflection: false
          }
        },
        {
          fen: "4K3/8/8/8/8/8/8/5kr1 w - - 10 30",
          expected: {
            activeColor: 0,
            diagonalReflection: false,
            horizontalReflection: false,
            verticalReflection: true
          }
        },
        {
          fen: "1rk5/8/8/8/8/8/8/3K4 w - - 10 30",
          expected: {
            activeColor: 0,
            diagonalReflection: false,
            horizontalReflection: true,
            verticalReflection: false,

          }
        },
        {
          fen: "3K4/8/8/8/8/8/8/1rk5 w - - 10 30",
          expected: {
            activeColor: 0,
            diagonalReflection: false,
            horizontalReflection: true,
            verticalReflection: true,

          }
        },
        {
          fen: "8/8/8/8/7K/k7/r7/8 w - - 10 30",
          expected: {
            activeColor: 0,
            diagonalReflection: true,
            horizontalReflection: false,
            verticalReflection: false
          }
        },
        {
          fen: "8/r7/k7/7K/8/8/8/8 w - - 10 30",
          expected: {
            activeColor: 0,
            diagonalReflection: true,
            horizontalReflection: false,
            verticalReflection: true
          }
        },
        {
          fen: "8/8/8/8/K7/7k/7r/8 w - - 10 30",
          expected: {
            activeColor: 0,
            diagonalReflection: true,
            horizontalReflection: true,
            verticalReflection: false
          }
        },
        {
          fen: "8/7r/7k/K7/8/8/8/8 w - - 10 30",
          expected: {
            activeColor: 0,
            diagonalReflection: true,
            horizontalReflection: true,
            verticalReflection: true,

          }
        },
        {
          fen: "4k3/8/8/8/8/8/8/5KR1 b - - 10 30",
          expected: {
            activeColor: 1,
            diagonalReflection: false,
            horizontalReflection: false,
            verticalReflection: false,

          }
        },
        {
          fen: "5KR1/8/8/8/8/8/8/4k3 b - - 10 30",
          expected: {
            activeColor: 1,
            diagonalReflection: false,
            horizontalReflection: false,
            verticalReflection: true,

          }
        },
        {
          fen: "3k4/8/8/8/8/8/8/1RK5 b - - 10 30",
          expected: {
            activeColor: 1,
            diagonalReflection: false,
            horizontalReflection: true,
            verticalReflection: false,

          }
        },
        {
          fen: "1RK5/8/8/8/8/8/8/3k4 b - - 10 30",
          expected: {
            activeColor: 1,
            diagonalReflection: false,
            horizontalReflection: true,
            verticalReflection: true,

          }
        },
        {
          fen: "8/R7/K7/7k/8/8/8/8 b - - 10 30",
          expected: {
            activeColor: 1,
            diagonalReflection: true,
            horizontalReflection: false,
            verticalReflection: false,

          }
        },
        {
          fen: "8/8/8/8/7k/K7/R7/8 b - - 10 30",
          expected: {
            activeColor: 1,
            diagonalReflection: true,
            horizontalReflection: false,
            verticalReflection: true,

          }
        },
        {
          fen: "8/7R/7K/k7/8/8/8/8 b - - 10 30",
          expected: {
            activeColor: 1,
            diagonalReflection: true,
            horizontalReflection: true,
            verticalReflection: false,

          }
        },
        {
          fen: "8/8/8/8/k7/7K/7R/8 b - - 10 30",
          expected: {
            activeColor: 1,
            diagonalReflection: true,
            horizontalReflection: true,
            verticalReflection: true,

          }
        }
      ];
      for (var i = 0; i < testCases.length; i++) {
        var fen = testCases[i].fen;
        var expected = testCases[i].expected;
        expected.fullMoveNumber = 30;
        expected.halfMoveCount = 10;
        expected.encodedBoard = "AAAAAACAA7+wAA=="

        var actual = huffman.encode(fen);

        assert.deepEqual(actual, expected);
        var backOut = huffman.decode(actual);
        assert.equal(backOut, fen);
      }


      var fens = _.pluck(testCases, "fen");
      var len = _.uniq(fens).length;
      assert.equal(len, 16, "16 different fens should all canonicalize to the same encoding");

    });


    Q.test("castling normalization tests", function(assert) {

      var baseFen = "rn2kbnr/pp1qpppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 1 5";
      var expected = huffman.encode(baseFen);
      for (var i = 0; i < 16; i++) {
        var castling = util.castling.toString(i);
        var adjustedFen = "rnbq1rk1/pppp1ppp/5n2/4p3/2P5/3P4/PP1QPPPP/RN2KBNR w " + castling + " - 1 5"
        var actual = huffman.encode(adjustedFen);
        if (castling == "KQ") {
          assert.equal(actual.encodedBoard,
                       expected.encodedBoard,
                       castling + " yields equivalent encodings");
        } else {
          assert.notEqual(actual.encodedBoard,
                          expected.encodedBoard,
                          castling + " yields different encodings");
        }
      }
    });

    Q.test("test castling encoding", function(assert) {
      var testCases = ["-", "K", "Q", "KQ",
                       "k", "Kk", "Qk", "KQk",
                       "q", "Kq", "Qq", "KQq",
                       "kq", "Kkq", "Qkq", "KQkq"];

      for (var i = 0; i < testCases.length; i++) {
        var bits = i;
        var str = testCases[i];
        assert.equal(util.castling.toString(bits), str, "" + bits + " should decode to " + str);
        assert.equal(util.castling.toInt(str), bits, str + " should encode to " + bits);
      }

    });

    Q.test("test king on diagonal", function(assert) {
      var testCases = [
        "2k5/r7/8/8/8/5K2/8/8 w - - 3 65",
        "1r6/8/k7/8/8/5K2/8/8 w - - 3 65",
        "5k2/7r/8/8/8/2K5/8/8 w - - 3 65",
        "6r1/8/7k/8/8/2K5/8/8 w - - 3 65",
        "8/8/2K5/8/8/8/7r/5k2 w - - 3 65",
        "8/8/2K5/8/8/7k/8/6r1 w - - 3 65",
        "8/8/5K2/8/8/k7/8/1r6 w - - 3 65",
        "8/8/5K2/8/8/8/r7/2k5 w - - 3 65",


        "2K5/R7/8/8/8/5k2/8/8 b - - 3 65",
        "1R6/8/K7/8/8/5k2/8/8 b - - 3 65",
        "5K2/7R/8/8/8/2k5/8/8 b - - 3 65",
        "6R1/8/7K/8/8/2k5/8/8 b - - 3 65",
        "8/8/2k5/8/8/8/7R/5K2 b - - 3 65",
        "8/8/2k5/8/8/7K/8/6R1 b - - 3 65",
        "8/8/5k2/8/8/K7/8/1R6 b - - 3 65",
        "8/8/5k2/8/8/8/R7/2K5 b - - 3 65"];
      for (var i = 0; i < testCases.length; i++) {
        var t = testCases[i];
        var actual = huffman.encode(t).encodedBoard;
        var expected = "AAAAAAAOoMAA";
        assert.equal(actual, expected, t + " should encode to " + expected);
      }
        
    });

    Q.load();
    Q.start();
  });
