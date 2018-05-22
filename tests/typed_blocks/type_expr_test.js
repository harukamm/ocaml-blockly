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
