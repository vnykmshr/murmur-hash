'use strict';

var debug = require('debug')('murmur');

var murmurHash3 = require('../').v3;

var testargs = [
  ['I will not buy this record, it is scratched.'],
  [''],
  ['0'],
  ['01'],
  ['012'],
  ['0123'],
  ['01234'],
  ['0123456'],
  ['01234567'],
  ['012345678'],
  ['0123456789'],
  ['0123456789a'],
  ['0123456789ab'],
  ['0123456789abc'],
  ['0123456789abcd'],
  ['0123456789abcde'],
  ['0123456789abcdef'],
  ['', 1]
];

var x8632 = {
  title: 'x86 32bit Tests',
  method: 'x86',
  routine: 'hash32',
  results: [2832214938, 0, 3530670207, 1642882560, 3966566284, 3558446240,
    433070448, 183447976, 1451431763, 1350687357, 1891213601, 3564907726,
    2044149191, 4193546897, 439890777, 2250527230, 919068895, 1364076727]
};



var x86128 = {
  title: 'x86 128bit Tests',
  method: 'x86',
  routine: 'hash128',
  results: ['a0a9683b25ac5e40d9af2895890dddf5',
    '00000000000000000000000000000000', '0ab2409ea5eb34f8a5eb34f8a5eb34f8',
    '0f87acb4674f3b21674f3b21674f3b21', 'cd94fea54c13d78e4c13d78e4c13d78e',
    'dc378fea485d3536485d3536485d3536', '35c5b3ee7b3b211600ae108800ae1088',
    'b708d0a186d15c02495d053b495d053b', 'aa22bf849216040263b83c5e63b83c5e',
    '571b5f6775d48126d0205c304ca675dc', '0017a61e2e528b33a5443f2057a11235',
    '38a2ed0f921f15e42caa7f97a971884f', 'cfaa93f9b6982a7e53412b5d04d3d08f',
    'c970af1dcc6d9d01dd00c683fc11eee3', '6f34d20ac0a5114dae0d83c563f51794',
    '3c76c46d4d0818c0add433daa78673fa', 'fb7d440936aed30a48ad1d9b572b3bfd',
    '88c4adec54d201b954d201b954d201b9']
};

var x64128 = {
  title: 'x64 128bit Tests',
  method: 'x64',
  routine: 'hash128',
  results: ['c382657f9a06c49d4a71fdc6d9b0d48f',
    '00000000000000000000000000000000', '2ac9debed546a3803a8de9e53c875e09',
    '649e4eaa7fc1708ee6945110230f2ad6', 'ce68f60d7c353bdb00364cd5936bf18a',
    '0f95757ce7f38254b4c67c9e6f12ab4b', '0f04e459497f3fc1eccc6223a28dd613',
    '13eb9fb82606f7a6b4ebef492fdef34e', '8236039b7387354dc3369387d8964920',
    '4c1e87519fe738ba72a17af899d597f1', '3f9652ac3effeb248027a17cf2990b07',
    '4bc3eacd29d386297cb2d9e797da9c92', '66352b8cee9e3ca7a9edf0b381a8fc58',
    '5eb2f8db4265931e801ce853e61d0ab7', '07a4a014dd59f71aaaf437854cd22231',
    'a62dd5f6c0bf23514fccf50c7c544cf0', '4be06d94cf4ad1a787c35b5c63a708da',
    '4610abe56eff5cb551622daa78f83583']
};


// -- Test Code ---------------------------------------------------------
if (require.main === module) {
  (function () {
    var test = 0,
      pass = 0;

    [x8632, x86128, x64128].forEach(function (t) {
      debug('Begin test: ', t.title);
      var method = murmurHash3[t.method];

      testargs.forEach(function (args, idx) {
        test += 1;
        var computed = method[t.routine].apply(method, args);
        var result = computed === t.results[idx] ? 'ok!' : 'oh no!';
        if (computed === t.results[idx]) pass += 1;
        debug(t.method, t.routine, result, '"' + args.join(',') + '"');
        //debug('\'' + computed + '\'');
      });
    });

    console.log(test === pass ? 'All ' + test + ' tests passed!' :
      'Some tests ' + (test - pass) + ' failed!');
  })();
}
