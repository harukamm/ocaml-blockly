'use strict';

var Test = {};

Test.USE_COMPRESSED = false;
// If true, run tests using compressed JS files. Both compressed and
// uncompressed ones are functionally identical, but compressed ones might not
// work if dependencies (e.g., goog.require()) are not provided correctly.

Test.UNCOMPRESSED_SCRIPTS = [
  '../../blockly_uncompressed.js',
  '../../msg/js/en.js',
  '../../blocks/typed_blocks.js',
  '../../blocks/parameters.js',
  '../../blocks/datatypes.js',
  '../../generators/typedlang.js',
  '../../generators/typedlang/blocks.js',
  '../../block_of_ocaml/utils.js',
  '../../block_of_ocaml/converter.js'
];

Test.COMPRESSED_SCRIPTS = [
  '../../block_of_ocaml/utils.js',
  '../../block_of_ocaml/converter.js',
  '../../blockly_compressed.js',
  '../../blocks_compressed.js',
  '../../typedlang_compressed.js',
  '../../msg/js/en.js'
];

var assertTrue, assertFalse;
var assertNotNull, assertNull, assertEquals, assertNotEquals;

(function() {
  var scripts = this.USE_COMPRESSED ?
      this.COMPRESSED_SCRIPTS : this.UNCOMPRESSED_SCRIPTS;
  for (var i = 0, src; src = scripts[i]; i++) {
    document.write(
        "<script type='text/javascript' src='" + src + "'></" +
        "script>");
  }
  if (!this.USE_COMPRESSED) {
    document.write('<script>goog.require(\'goog.testing.jsunit\');</script>');
    return;
  }
  // Can not load goog.testing.jsunit when using compressed blockly, so run
  // tests by imitating the module temporarily.
  window.addEventListener('load', function(e) {
    this.define_assert();
    this.run_tests();
  }.bind(this));
}).call(Test);

Test.run_tests = function() {
  var keys = Object.getOwnPropertyNames(window);
  var passed = 0;
  var failed = 0;
  for (var i = 0, key; key = keys[i]; i++) {
    if (!key.startsWith('test_')) {
      continue;
    }
    var func = window[key];
    if (!goog.isFunction(func)) {
      continue;
    }
    try {
      func.call();
      console.log('Test ' + key + ' passed (^-^)');
      passed++;
    } catch (e) {
      console.log('** Test ' + key + ' failed (;-;)');
      console.log(e);
      failed++;
    }
  }
  console.log('' + passed + ' tests passed. d(^-^)');
  console.log('' + failed + ' tests failed. (@.@)');
}

Test.define_assert = function() {
  assertTrue = function(x) {
    goog.asserts.assert(x === true);
  };
  assertFalse = function(x) {
    goog.asserts.assert(x === false);
  };
  assertNull = function(x) {
    goog.asserts.assert(goog.isNull(x));
  };
  assertNotNull = function(x) {
    goog.asserts.assert(!goog.isNull(x));
  };
  assertEquals = function(x, y) {
    goog.asserts.assert(x == y);
  };
  assertNotEquals = function(x, y) {
    goog.asserts.assert(x != y);
  };
}
