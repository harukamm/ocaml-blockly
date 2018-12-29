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

function test_type_expr_getTvarListFunc() {
  var m = new Blockly.TypeExpr.TVAR('M', null);
  var n = new Blockly.TypeExpr.TVAR('N', m);
  var l = new Blockly.TypeExpr.TVAR('L', n);
  assertTrue(isSameSet(m.getTvarList(), [m]));
  assertTrue(isSameSet(n.getTvarList(), [m]));
  assertTrue(isSameSet(l.getTvarList(), [m]));

  var list1 = new Blockly.TypeExpr.LIST(l);
  assertTrue(isSameSet(list1.getTvarList(), [m]));

  var x = new Blockly.TypeExpr.TVAR('X', list1);
  var y = new Blockly.TypeExpr.TVAR('Y', x);
  var z = new Blockly.TypeExpr.TVAR('Z', y);
  assertTrue(isSameSet(z.getTvarList(), [m]));

  var p = new Blockly.TypeExpr.TVAR('P', z)
  var pair1 = new Blockly.TypeExpr.PAIR(z, p);
  assertTrue(isSameSet(pair1.getTvarList(), [m, m]));

  var q = new Blockly.TypeExpr.TVAR('Q', null)
  var pair2 = new Blockly.TypeExpr.PAIR(z, q);
  assertTrue(isSameSet(pair2.getTvarList(), [q, m]));

  var bool1 = new Blockly.TypeExpr.BOOL();
  m.unify(bool1);
  assertTrue(isSameSet(m.getTvarList(), []));
  assertTrue(isSameSet(n.getTvarList(), []));
  assertTrue(isSameSet(l.getTvarList(), []));
  assertTrue(isSameSet(list1.getTvarList(), []));
  assertTrue(isSameSet(z.getTvarList(), []));
  assertTrue(isSameSet(pair1.getTvarList(), []));
  assertTrue(isSameSet(pair2.getTvarList(), [q]));

  var a = new Blockly.TypeExpr.TVAR('A', null);
  var b = new Blockly.TypeExpr.TVAR('B', null);
  var fun = Blockly.TypeExpr.createFunType([pair1, pair2, a, b, m, bool1]);
  assertTrue(isSameSet(fun.getTvarList(), [q, a, b]));
}

function test_type_expr_typeSchemes() {
  var env = {};

  var t1 = new Blockly.TypeExpr.TVAR('T1', null);
  env["var0"] = Blockly.Scheme.monoType(t1);

  var t2 = new Blockly.TypeExpr.TVAR('T2', null);
  var pair = new Blockly.TypeExpr.PAIR(t1, t2);
  // t1 * t2
  env["var1"] = Blockly.Scheme.monoType(t2);

  var m = new Blockly.TypeExpr.TVAR('M', null);
  var n = new Blockly.TypeExpr.TVAR('N', m);
  var l = new Blockly.TypeExpr.TVAR('L', n);
  var int1 = new Blockly.TypeExpr.INT();
  var fun = Blockly.TypeExpr.createFunType([int1, l, t1, t2]);
  // ∀m. int -> m -> t1 -> t2
  env["var2"] = Blockly.Scheme.create(env, fun);

  var x =  new Blockly.TypeExpr.TVAR('X', null);
  var y = new Blockly.TypeExpr.TVAR('Y', x);
  var a = new Blockly.TypeExpr.TVAR('A', null);
  var pair = new Blockly.TypeExpr.PAIR(x, a);
  var pair2 = new Blockly.TypeExpr.PAIR(pair, n);
  var list1 = new Blockly.TypeExpr.LIST(pair2);
  // ∀m.x.a. ((x * a) * m) list
  env["var3"] = Blockly.Scheme.create(env, list1);

  var o = new Blockly.TypeExpr.TVAR('O', null);
  var p = new Blockly.TypeExpr.TVAR('P', null);
  var float1 = new Blockly.TypeExpr.FLOAT();
  var fun2 = Blockly.TypeExpr.createFunType([o, p, float1, l, y, t1, t2]);
  // ∀o.p.m.x. o -> p -> float -> m -> x -> t1 -> t2
  env["var4"] = Blockly.Scheme.create(env, fun2);

  // float
  var h = new Blockly.TypeExpr.TVAR('H', float1);
  env["var5"] = Blockly.Scheme.create(env, h);

  assertTrue(isSameSet(env.var0.names, []));
  assertTrue(isSameSet(env.var1.names, []));
  assertEquals(env.var2.names.length, 1);
  assertEquals(env.var3.names.length, 3);
  assertEquals(env.var4.names.length, 4);
  assertEquals(env.var5.names.length, 0);
}

function test_type_expr_typeSchemesWithExpr() {
  // fun a -> let f = fun x -> a in fun y -> f
  var env = {};

  var a = new Blockly.TypeExpr.TVAR('A', null);
  var x = new Blockly.TypeExpr.TVAR('X', null);
  var f = new Blockly.TypeExpr.TVAR('F', null);
  var y = new Blockly.TypeExpr.TVAR('Y', null);

  // [fun a -> let f = fun x -> a in fun y -> f]
  env["a"] = Blockly.Scheme.monoType(a);

  // fun a -> [let f = fun x -> a in fun y -> f]
  var env0 = Object.assign({}, env);
  var fun = Blockly.TypeExpr.createFunType([x, a]);
  env0["f"] = Blockly.Scheme.create(env0, fun);

  // fun a -> let f = [fun x -> a] in fun y -> f
  var env1 = Object.assign({}, env);
  env1["x"] = Blockly.Scheme.monoType(x);

  // fun a -> let f = fun x -> [a] in fun y -> f

  // fun a -> let f = fun x -> a in [fun y -> f]
  var env2 = Object.assign({}, env0);
  env2["y"] = Blockly.Scheme.monoType(y);

  // fun a -> let f = fun x -> a in fun y -> [f]

  assertTrue(isSameSet(env.a.names, []));
  assertEquals(env0.f.names.length, 1);
  assertTrue(isSameSet(env1.x.names, []));
  assertTrue(isSameSet(env2.y.names, []));

  // ∀x. x -> a
  var scheme = env0.f;
  var inst = scheme.instantiate();
  var tvars = inst.getTvarList();
  assertEquals(tvars.length, 2);
  assertNotNull(goog.array.find(tvars, x => x.name === "A"));
  var another = goog.array.find(tvars, x => x.name !== "A");

  assertEquals(scheme.names.length, 1);
  assertNotEquals(scheme.names[0], "A");
  assertNotEquals(another.name, "A");
}

function test_type_expr_replaceChild() {
  var x =  new Blockly.TypeExpr.TVAR('X', null);
  var y = new Blockly.TypeExpr.TVAR('Y', x);
  var a = new Blockly.TypeExpr.TVAR('A', null);
  var pair = new Blockly.TypeExpr.PAIR(x, a);

  pair.replaceChild(x, y);
  pair.replaceChild(a, x);
  assertEquals(pair.first_type, y);
  assertEquals(pair.second_type, x);

  var n = new Blockly.TypeExpr.TVAR('N', null);
  var list1 = new Blockly.TypeExpr.LIST(pair);

  list1.replaceChild(pair, n);
  list1.replaceChild(n, x);
  list1.replaceChild(x, a);
  assertEquals(list1.element_type, a);

  var o = new Blockly.TypeExpr.TVAR('O', null);
  var p = new Blockly.TypeExpr.TVAR('P', null);
  var float1 = new Blockly.TypeExpr.FLOAT();
  // o -> float
  var fun = new Blockly.TypeExpr.FUN(o, float1);

  var float2 = new Blockly.TypeExpr.FLOAT();
  var failed = false;
  try {
    fun.replaceChild(float2, x);
  } catch (e) {
    failed = true;
  }
  assertTrue(failed);
  // o -> o
  fun.replaceChild(float1, o);
  // p -> o
  fun.replaceChild(o, p);
  // p -> p
  fun.replaceChild(o, p);
  // x -> p
  fun.replaceChild(p, x);
  assertEquals(fun.arg_type, x);
  assertEquals(fun.return_type, p);
}

function test_type_expr_schemeInstantiate() {
  var a = new Blockly.TypeExpr.TVAR('A', null);
  var a1 = new Blockly.TypeExpr.TVAR('A1', a);
  var a2 = new Blockly.TypeExpr.TVAR('A2', a1);
  var b = new Blockly.TypeExpr.TVAR('B', null);
  var c = new Blockly.TypeExpr.TVAR('C', null);
  var c1 = new Blockly.TypeExpr.TVAR('C1', c);
  var x = new Blockly.TypeExpr.TVAR('X', null);
  var y = new Blockly.TypeExpr.TVAR('Y', null);
  var z = new Blockly.TypeExpr.TVAR('Z', null);
  var env = {};
  env["a"] = Blockly.Scheme.monoType(a);
  env["b"] = Blockly.Scheme.monoType(b);
  env["c"] = Blockly.Scheme.monoType(c);
  assertEquals(env["a"].type, a);
  assertEquals(env["b"].type, b);
  assertEquals(env["c"].type, c);

  // ∀xyz. a -> (x * x) -> b -> ((x * z) list) -> b -> c -> y -> y list
  var pair1 = new Blockly.TypeExpr.PAIR(x, x);
  var pair2 = new Blockly.TypeExpr.PAIR(x, z);
  var list1 = new Blockly.TypeExpr.LIST(pair2);
  var list2 = new Blockly.TypeExpr.LIST(y);
  var fun =
      Blockly.TypeExpr.createFunType([a, pair1, b, list1, b, c, y, list2]);
  var scheme = Blockly.Scheme.create(env, fun);

  assertEquals(scheme.names.length, 3);

  var inst = scheme.instantiate();
  var tvars = inst.getTvarList();
  var names = tvars.map(x => x.name);
  assertNotNull(goog.array.find(names, x => x === 'A'));
  assertNotNull(goog.array.find(names, x => x === 'B'));
  assertNotNull(goog.array.find(names, x => x === 'C'));
  assertNull(goog.array.find(names, x => x === 'X'));
  assertNull(goog.array.find(names, x => x === 'Y'));
  assertNull(goog.array.find(names, x => x === 'Z'));

  var flatten = inst.flatten();
  var xReplaced = flatten[1];
  assertEquals(goog.array.filter(names, x => x === xReplaced.name).length, 3);
  var yReplaced = flatten[8];
  assertEquals(goog.array.filter(names, x => x === yReplaced.name).length, 2);
  var zReplaced = flatten[5];
  assertEquals(goog.array.filter(names, x => x === zReplaced.name).length, 1);
  assertTrue(xReplaced.name !== yReplaced.name &&
      yReplaced.name !== zReplaced.name && xReplaced.name !== zReplaced.name);

  var freeNames = ['A', 'B', 'C'];
  assertTrue(freeNames.indexOf(xReplaced.name) == -1);
  assertTrue(freeNames.indexOf(yReplaced.name) == -1);
  assertTrue(freeNames.indexOf(zReplaced.name) == -1);
  for (var i = 0, tvar; tvar = tvars[i]; i++) {
    if (tvar.name === 'A') {
      assertEquals(tvar, a);
    } else if (tvar.name === 'B') {
      assertEquals(tvar, b);
    } else if (tvar.name === 'C') {
      assertEquals(tvar, c);
    }
  }
}

function test_type_expr_constructs() {
  // type yy = Foo of ...
  //         | Hoge of ...
  var xxType = new Blockly.TypeExpr.CONSTRUCT(null);
  var yyType = new Blockly.TypeExpr.CONSTRUCT('yy');
  var n = new Blockly.TypeExpr.TVAR('n', yyType);
  assertTrue(n.ableToUnify(n));
  assertTrue(n.ableToUnify(xxType));
  assertTrue(yyType.ableToUnify(xxType));
  assertTrue(xxType.ableToUnify(yyType));

  assertTrue(Blockly.TypeExpr.equals(yyType, yyType));
  assertFalse(Blockly.TypeExpr.equals(xxType, yyType));

  assertEquals(n.toString(), "<n=CONSTRUCT(yy)>");
  assertEquals(xxType.toString(), "CONSTRUCT(null)");
}

function test_type_expr_type_constructor() {
  var type1 = new Blockly.TypeExpr.TYPE_CONSTRUCTOR();
  var type2 = new Blockly.TypeExpr.TYPE_CONSTRUCTOR();
  var n = new Blockly.TypeExpr.TVAR('n', null);
  var m = new Blockly.TypeExpr.TVAR('m', n);
  assertTrue(type1.isTypeConstructor());
  assertTrue(type2.isTypeConstructor());
  assertTrue(type1.ableToUnify(type2));
  assertTrue(type1.ableToUnify(type2));
  assertFalse(m.ableToUnify(type1));
  assertFalse(m.ableToUnify(type2));

  // Can not compare type constructor type-expr so far. equals function always
  // returns false.
  assertFalse(Blockly.TypeExpr.equals(type1, type1));
  assertFalse(Blockly.TypeExpr.equals(type1, type2));

  assertEquals(type1.toString(), "TYPE_CONSTRUCTOR");
  assertEquals(type2.toString(), "TYPE_CONSTRUCTOR");
}

function test_type_expr_patternSimple() {
  var t = new Blockly.TypeExpr.TVAR('t', null);
  var lst = new Blockly.TypeExpr.LIST(t);
  var int1 = new Blockly.TypeExpr.INT();
  var type1 = new Blockly.TypeExpr.PATTERN(lst);
  var type2 = new Blockly.TypeExpr.PATTERN(int1);
  assertTrue(type1.isPattern());
  assertTrue(type2.isPattern());
  assertFalse(type1.ableToUnify(type2));
  assertFalse(type1.ableToUnify(type2));

  var intList = new Blockly.TypeExpr.LIST(int1);
  type2 = new Blockly.TypeExpr.PATTERN(intList);
  var n = new Blockly.TypeExpr.TVAR('n', null);
  assertTrue(type1.ableToUnify(type2));
  assertTrue(type2.ableToUnify(type1));
  assertFalse(n.ableToUnify(type1));
  assertFalse(n.ableToUnify(type2));

  type1.unify(type2);

  assertEquals(type1.getChildren().length, 0);
  assertEquals(type2.getChildren().length, 0);

  assertFalse(Blockly.TypeExpr.equals(type1, type2));

  assertEquals(type1.toString(), "PATTERN(LIST[<t=INT>])");
  assertEquals(type2.toString(), "PATTERN(LIST[INT])");
}

function test_type_expr_toDisplayText() {
  var t = new Blockly.TypeExpr.TVAR('T', null);
  var int1 = new Blockly.TypeExpr.INT();
  assertEquals(int1.getDisplayText(), 'int');
  var float1 = new Blockly.TypeExpr.FLOAT();
  assertEquals(float1.getDisplayText(), 'float');
  var bool1 = new Blockly.TypeExpr.BOOL();
  assertEquals(bool1.getDisplayText(), 'bool');
  var a = new Blockly.TypeExpr.TVAR('A', null);
  var b = new Blockly.TypeExpr.TVAR('B', a);
  assertEquals(b.getDisplayText(), '\'a');
  var list = new Blockly.TypeExpr.LIST(b);
  assertEquals(list.getDisplayText(), '\'a list');
  b.unify(bool1);
  assertEquals(list.getDisplayText(), 'bool list');
  var c = new Blockly.TypeExpr.TVAR('C', null);
  var pair = new Blockly.TypeExpr.PAIR(c, float1);
  assertEquals(pair.getDisplayText(), '\'c * float');

  var d = new Blockly.TypeExpr.TVAR('DDD', null);
  var fun = Blockly.TypeExpr.createFunType([pair, list, d, int1]);
  assertEquals(fun.getDisplayText(), '\'c * float -> bool list -> \'ddd -> int');

  var ctor = new Blockly.TypeExpr.CONSTRUCT('id');
  assertEquals(ctor.getDisplayText(), '');
  var tctor = new Blockly.TypeExpr.TYPE_CONSTRUCTOR();
  assertEquals(tctor.getDisplayText(), '<type>');
  var patt = new Blockly.TypeExpr.PATTERN(b);
  assertEquals(patt.getDisplayText(), '<pattern>');
}
