'use strict';

function test_type_expr_clearTypes() {
  var int1 = new Blockly.TypeExpr.INT();
  var bool1 = new Blockly.TypeExpr.BOOL();
  int1.clear();
  bool1.clear();
  assertTrue(typeof int1.val === 'undefined');
  assertTrue(typeof bool1.val === 'undefined');
  assertTrue(Blockly.TypeExpr.INT_ == int1.label);
  assertTrue(Blockly.TypeExpr.BOOL_ == bool1.label);
  var p = new Blockly.TypeExpr.TVAR('P', null);
  var q = new Blockly.TypeExpr.TVAR('Q', null);
  var pair1 = new Blockly.TypeExpr.PAIR(p, q);
  var ptr1 = new Blockly.TypeExpr.TVAR('R', pair1);
  var ptr2 = new Blockly.TypeExpr.TVAR('S', ptr1);
  ptr2.clear();
  assertTrue(ptr2.val == null);
  assertTrue(ptr1.val === pair1);
}

function test_type_expr_unifyPairType() {
  var p = new Blockly.TypeExpr.TVAR('P', null);
  var q = new Blockly.TypeExpr.TVAR('Q', null);
  var pair1 = new Blockly.TypeExpr.PAIR(p, q);
  var int1 = new Blockly.TypeExpr.INT();
  var bool1 = new Blockly.TypeExpr.BOOL();
  var n = new Blockly.TypeExpr.TVAR('N', int1);
  var o = new Blockly.TypeExpr.TVAR('O', bool1);
  var pair2 = new Blockly.TypeExpr.PAIR(n, o);
  assertTrue(pair1.ableToUnify(pair2));
}

function test_type_expr_occurTypeName() {
  var p = new Blockly.TypeExpr.TVAR('P', null);
  var q = new Blockly.TypeExpr.TVAR('Q', null);
  var pair1 = new Blockly.TypeExpr.PAIR(p, q);
  var n = new Blockly.TypeExpr.TVAR('N', null);
  var o = new Blockly.TypeExpr.TVAR('O', null);
  var pair2 = new Blockly.TypeExpr.PAIR(n, o);
  var sum = new Blockly.TypeExpr.SUM(pair1, pair2);
  assertTrue(sum.occur('P'));
  assertTrue(sum.occur('O'));
  assertFalse(sum.occur('xx'));
}

function test_type_expr_typesToString() {
  var tvar1 = new Blockly.TypeExpr.TVAR('A', null);
  var tvar2 = new Blockly.TypeExpr.TVAR('B', tvar1);
  assertEquals(tvar2.toString(), '<B=<A=null>>');
  assertEquals(tvar2.toString(true), '<A=null>');
  var int1 = new Blockly.TypeExpr.INT();
  var float1 = new Blockly.TypeExpr.FLOAT();
  var bool1 = new Blockly.TypeExpr.BOOL();
  tvar1.val = int1;
  var list1 = new Blockly.TypeExpr.LIST(tvar2);
  assertEquals(list1.toString(), 'LIST[<B=<A=INT>>]');
  assertEquals(list1.toString(true), 'LIST[INT]');
  var pair1 = new Blockly.TypeExpr.PAIR(int1, tvar2);
  assertEquals(pair1.toString(), 'PAIR[INT * <B=<A=INT>>]');
  assertEquals(pair1.toString(true), 'PAIR[INT * INT]');
  tvar1.val = float1;
  var sum1 = new Blockly.TypeExpr.SUM(float1, tvar2);
  assertEquals(sum1.toString(), 'SUM[FLOAT * <B=<A=FLOAT>>]');
  assertEquals(sum1.toString(true), 'SUM[FLOAT * FLOAT]');
  tvar1.val = bool1;
  var fun1 = new Blockly.TypeExpr.FUN(tvar1, tvar2);
  assertEquals(fun1.toString(), 'FUN((<A=BOOL>) -> (<B=<A=BOOL>>))');
  assertEquals(fun1.toString(true), 'FUN((BOOL) -> (BOOL))');
}

function test_type_expr_derefereceWithSideEffect() {
  function assertValueEquals(t1, t2) {
    assertEquals(t1.label, t2.label);
    if (t1.label == Blockly.TypeExpr.TVAR_)
      assertEquals(t1.name, t2.name);
    var children1 = t1.getChildren();
    var children2 = t2.getChildren();
    for (var i = 0; i < children1.length; i++) {
      var child1 = children1[i];
      var child2 = children2[i];
      assertValueEquals(child1, child2);
    }
  }
  var int1 = new Blockly.TypeExpr.INT();
  var float1 = new Blockly.TypeExpr.FLOAT();
  var bool1 = new Blockly.TypeExpr.BOOL();
  var tvarX = new Blockly.TypeExpr.TVAR('X', null);
  var tvarToInt1 = new Blockly.TypeExpr.TVAR('A', int1);
  var tvarToInt2 = new Blockly.TypeExpr.TVAR('B', tvarToInt1);
  var tvarToFloat1 = new Blockly.TypeExpr.TVAR('C', float1);
  var tvarToFloat2 = new Blockly.TypeExpr.TVAR('D', tvarToFloat1);
  var tvarToBool1 = new Blockly.TypeExpr.TVAR('E', bool1);
  var tvarToBool2 = new Blockly.TypeExpr.TVAR('F', tvarToBool1);
  var tvarToX1 = new Blockly.TypeExpr.TVAR('G', tvarX);
  var tvarToX2 = new Blockly.TypeExpr.TVAR('H', tvarToX1);
  var list1 = new Blockly.TypeExpr.LIST(tvarToInt2);
  var list1Expected = new Blockly.TypeExpr.LIST(int1);
  assertValueEquals(list1.deepDeref(), list1Expected);
  var pair1 = new Blockly.TypeExpr.PAIR(tvarToFloat1, tvarToBool1);
  var pair1Expected = new Blockly.TypeExpr.PAIR(float1, bool1);
  assertValueEquals(pair1.deepDeref(), pair1Expected);
  var sum1 = new Blockly.TypeExpr.SUM(tvarToFloat2, tvarToX2);
  var sum1Expected = new Blockly.TypeExpr.SUM(float1, tvarX);
  assertValueEquals(sum1.deepDeref(), sum1Expected);
  var fun1 = new Blockly.TypeExpr.FUN(tvarToBool2, tvarToInt1);
  var fun1Expected = new Blockly.TypeExpr.FUN(bool1, int1);
  assertValueEquals(fun1.deepDeref(), fun1Expected);
}

