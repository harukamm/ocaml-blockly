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
  var pair3 = new Blockly.TypeExpr.PAIR(pair1, pair2);
  assertTrue(pair3.occur('P'));
  assertTrue(pair3.occur('O'));
  assertFalse(pair3.occur('xx'));
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
  var fun1 = new Blockly.TypeExpr.FUN(tvarToBool2, tvarToInt1);
  var fun1Expected = new Blockly.TypeExpr.FUN(bool1, int1);
  assertValueEquals(fun1.deepDeref(), fun1Expected);
}

function test_type_expr_disconnect_types() {
  // t0 <-- t1 <-- t2 <-- t3
  //       ^
  //       |---- t4
  var tvar0 = new Blockly.TypeExpr.TVAR('0', null);
  var tvar1 = new Blockly.TypeExpr.TVAR('1', tvar0);
  var tvar2 = new Blockly.TypeExpr.TVAR('2', tvar1);
  var tvar3 = new Blockly.TypeExpr.TVAR('3', tvar2);
  var tvar4 = new Blockly.TypeExpr.TVAR('4', tvar1);

  tvar3.disconnect(tvar4);
  // Nothing is expected to change.
  assertEquals(tvar3.deref(), tvar0);
  assertEquals(tvar4.deref(), tvar0);

  tvar4.disconnect(tvar1);
  assertEquals(tvar4.deref(), tvar4);
  assertEquals(tvar3.deref(), tvar0);

  var int1 = new Blockly.TypeExpr.INT();
  tvar0.val = int1;
  tvar0.disconnect(int1);
  // Can not disconnect types if either one is a primitive type.
  assertEquals(tvar3.deref().label, Blockly.TypeExpr.INT_);
}

function test_type_expr_replaceTypeExprWith() {
  var workspace = create_typed_workspace();
  try {
    var letBlock1 = workspace.newBlock('let_typed');
    var letBlock2 = workspace.newBlock('let_typed');
    letBlock2.replaceTypeExprWith(letBlock1, false);
    var typeExp1_1 = letBlock1.getInput('EXP1').connection.typeExpr;
    var typeExp1_2 = letBlock2.getInput('EXP1').connection.typeExpr;
    var typeExp2_1 = letBlock1.outputConnection.typeExpr;
    var typeExp2_2 = letBlock2.outputConnection.typeExpr;
    assertEquals(typeExp1_1, typeExp1_2);
    assertEquals(typeExp2_1, typeExp2_2);

    var listBlock1 = workspace.newBlock('lists_create_with_typed');
    var boolBlock = workspace.newBlock('logic_boolean_typed');
    listBlock1.getInput('ADD0').connection.connect(boolBlock.outputConnection);
    var listBlock2 = workspace.newBlock('lists_create_with_typed');
    listBlock2.replaceTypeExprWith(listBlock1, true);
    assertEquals(listBlock2.outputConnection.typeExpr.element_type.deref().label,
        Blockly.TypeExpr.BOOL_);
    assertNull(listBlock1.outputConnection.typeExpr);
  } finally {
    workspace.dispose();
  }
}

function test_type_expr_isEquals() {
  var int1 = new Blockly.TypeExpr.INT();
  var int2 = new Blockly.TypeExpr.INT();
  var bool1 = new Blockly.TypeExpr.BOOL();
  var bool2 = new Blockly.TypeExpr.BOOL();
  var float1 = new Blockly.TypeExpr.FLOAT();
  var float2 = new Blockly.TypeExpr.FLOAT();
  assertTrue(Blockly.TypeExpr.equals(int1, int2));
  assertTrue(Blockly.TypeExpr.equals(bool1, bool2));
  assertTrue(Blockly.TypeExpr.equals(float1, float2));
  assertFalse(Blockly.TypeExpr.equals(bool1, int2));
  assertFalse(Blockly.TypeExpr.equals(int1, float1));

  var p1 = new Blockly.TypeExpr.TVAR('p1', null);
  var q1 = new Blockly.TypeExpr.TVAR('q1', null);
  var pair1 = new Blockly.TypeExpr.PAIR(p1, q1);
  var p2 = new Blockly.TypeExpr.TVAR('p2', null);
  var q2 = new Blockly.TypeExpr.TVAR('q2', null);
  var pair2 = new Blockly.TypeExpr.PAIR(p2, q2);
  assertFalse(Blockly.TypeExpr.equals(pair1, pair2));
  assertTrue(Blockly.TypeExpr.equals(pair1, pair1));
  assertTrue(Blockly.TypeExpr.equals(pair2, pair2));

  p1.name = 'p2';
  q1.name = 'q2';
  assertTrue(Blockly.TypeExpr.equals(pair1, pair2));

  var o = new Blockly.TypeExpr.TVAR('O', pair2);
  assertFalse(Blockly.TypeExpr.equals(o, pair2));
  var n = new Blockly.TypeExpr.TVAR('N', pair2);
  var m = new Blockly.TypeExpr.TVAR('M', n);
  assertFalse(Blockly.TypeExpr.equals(o, m));

  var list1 = new Blockly.TypeExpr.LIST(float1);
  var list2 = new Blockly.TypeExpr.LIST(float2);
  assertTrue(Blockly.TypeExpr.equals(list1, list2));

  var fun1 = new Blockly.TypeExpr.FUN(list1, list2);
  var t = new Blockly.TypeExpr.TVAR('T', list1);
  var fun2 = new Blockly.TypeExpr.FUN(t, list2);
  assertFalse(Blockly.TypeExpr.equals(fun1, fun2));
}

function test_type_expr_unifyAndClear() {
  // n -> BOOL
  var n = new Blockly.TypeExpr.TVAR('N', null);
  var bool1 = new Blockly.TypeExpr.BOOL();
  n.unify(bool1);
  assertEquals(n.val, bool1);

  // n -> BOOL
  //      ^
  // m ---|
  var m = new Blockly.TypeExpr.TVAR('M', null);
  n.unify(m);
  assertEquals(m.val, bool1);
  assertFalse(m.occur(n.name));
  // Note that the type variable 'm' is not bound to 'n.' It is bound to
  // boolean type that 'n' refers to, instead.

  n.clear();
  assertEquals(m.val, bool1);
  // 'm' is not bound to 'n', so 'm' is bound to boolean type even if type 'n'
  // is cleared.

  m.clear();
  n.unify(m);
  assertEquals(m.val, n);
  assertTrue(m.occur(n.name));
}
