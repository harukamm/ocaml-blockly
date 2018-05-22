'use strict';

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
