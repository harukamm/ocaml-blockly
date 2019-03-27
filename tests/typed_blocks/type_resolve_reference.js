'use strict';

function test_resolve_reference_letNested() {
  var workspace = create_typed_workspace();
  try {
    var letBlock1 = workspace.newBlock('let_typed');
    var letBlock2 = workspace.newBlock('let_typed');
    setVariableName(letBlock1, 'hoge');
    setVariableName(letBlock2, 'hoge');
    letBlock1.getInput('EXP2').connection.connect(letBlock2.outputConnection);

    var exp2 = letBlock2.getInput('EXP2').connection;
    var ctx = letBlock2.allVisibleVariables(exp2);
    assertEquals(ctx.getVariable('hoge'), getVariable(letBlock2));
  } finally {
    workspace.dispose();
  }
}

function test_resolve_reference_letTreeSepareted() {
  var workspace = create_typed_workspace();
  try {
    var letBlock1 = workspace.newBlock('let_typed');
    var letBlock2 = workspace.newBlock('let_typed');
    var varBlock = workspace.newBlock('variables_get_typed');
    setVariableName(letBlock1, 'x');
    setVariableName(letBlock2, 'x');
    setVariableName(varBlock, 'x');
    letBlock1.getInput('EXP2').connection.connect(varBlock.outputConnection);

    var exp2 = letBlock2.getInput('EXP2').connection;
    assertTrue(letBlock1.resolveReference(exp2, true));
    assertEquals(getVariable(letBlock1),
        getVariable(varBlock).getBoundValue());
  } finally {
    workspace.dispose();
  }
}

function test_resolve_reference_NotShareVariables() {
  var workspace = create_typed_workspace();
  try {
    var intArith = workspace.newBlock('int_arithmetic_typed');
    var letBlock1 = workspace.newBlock('let_typed');
    var letBlock2 = workspace.newBlock('let_typed');
    var varBlock1 = workspace.newBlock('variables_get_typed');
    var varBlock2 = workspace.newBlock('variables_get_typed');
    setVariableName(letBlock1, 'x');
    setVariableName(letBlock2, 'x');
    setVariableName(varBlock1, 'x');
    setVariableName(varBlock2, 'x');

    // [let x = <> in [ <[let x = <> in <[x]>]> + <x> ]]
    letBlock2.getInput('EXP2').connection.connect(intArith.outputConnection);
    intArith.getInput('A').connection.connect(letBlock1.outputConnection);
    intArith.getInput('B').connection.connect(varBlock2.outputConnection);
    letBlock1.getInput('EXP2').connection.connect(varBlock1.outputConnection);

    // Arithmetic blocks are disconnected from outer let-block, variable 'x'
    // on the right operand can not be resolved.
    assertFalse(intArith.resolveReference(null));
  } finally {
    workspace.dispose();
  }
}

function test_resolve_reference_letNestedTreeWithDifferenctNames() {
  var workspace = create_typed_workspace();
  try {
    var letBlock1 = workspace.newBlock('let_typed');
    var letBlock2 = workspace.newBlock('let_typed');
    var varBlock = workspace.newBlock('variables_get_typed');
    setVariableName(letBlock1, 'x');
    setVariableName(letBlock2, 'y');
    setVariableName(varBlock, 'y');

    // [let y = <> in <[let x = <> in <[y]>]>]
    letBlock2.getInput('EXP2').connection.connect(
        letBlock1.outputConnection);
    letBlock1.getInput('EXP2').connection.connect(varBlock.outputConnection);
    assertEquals(getVariable(letBlock2),
        getVariable(varBlock).getBoundValue());

    assertTrue(letBlock2.resolveReference(null, true));
    assertEquals(getVariable(letBlock2),
        getVariable(varBlock).getBoundValue());
  } finally {
    workspace.dispose();
  }
}

function test_resolve_reference_letFixedBoundValue() {
  var workspace = create_typed_workspace();
  try {
    var letBlock1 = workspace.newBlock('let_typed');
    var letBlock2 = workspace.newBlock('let_typed');
    var value1 = getVariable(letBlock1);
    var value2 = getVariable(letBlock2);
    var varBlockBoundTo1 = workspace.newBlock('variables_get_typed');
    var varBlockBoundTo2 = workspace.newBlock('variables_get_typed');

    setVariableName(letBlock1, 'i');
    setVariableName(letBlock2, 'i');
    setVariableName(varBlockBoundTo1, 'i');
    setVariableName(varBlockBoundTo2, 'i');

    getVariable(varBlockBoundTo1).setBoundValue(value1);
    getVariable(varBlockBoundTo2).setBoundValue(value2);

    letBlock1.getInput('EXP2').connection.connect(letBlock2.outputConnection);

    var exp2 = letBlock2.getInput('EXP2').connection;
    var exp1 = letBlock2.getInput('EXP1').connection;

    assertFalse(varBlockBoundTo1.resolveReference(exp2));
    assertTrue(varBlockBoundTo1.resolveReference(exp1));

    assertTrue(varBlockBoundTo2.resolveReference(exp2));
    assertFalse(varBlockBoundTo2.resolveReference(exp1));
  } finally {
    workspace.dispose();
  }
}

function test_resolve_reference_clearCyclicReference() {
  var workspace = create_typed_workspace();
  try {
    var letBlock1 = workspace.newBlock('let_typed');
    var letBlock2 = workspace.newBlock('let_typed');
    var listBlock = workspace.newBlock('lists_create_with_typed');
    var varBlock1 = workspace.newBlock('variables_get_typed');
    var varBlock2 = workspace.newBlock('variables_get_typed');
    var otherVarBlock1 = workspace.newBlock('variables_get_typed');
    var otherVarBlock2 = workspace.newBlock('variables_get_typed');

    setVariableName(letBlock1, 'h')
    setVariableName(letBlock2, 'm')
    setVariableName(varBlock1, 'h')
    setVariableName(varBlock2, 'm')
    setVariableName(otherVarBlock1, 'h')
    setVariableName(otherVarBlock2, 'm')

    letBlock1.getInput('EXP2').connection.connect(letBlock2.outputConnection);
    letBlock2.getInput('EXP2').connection.connect(listBlock.outputConnection);
    listBlock.getInput('ADD0').connection.connect(varBlock1.outputConnection);
    listBlock.getInput('ADD1').connection.connect(varBlock2.outputConnection);

    var value1 = getVariable(letBlock1);
    var value2 = getVariable(letBlock2);
    var reference1 = getVariable(varBlock1);
    var reference2 = getVariable(varBlock2);
    var otherReference1 = getVariable(otherVarBlock1);
    var otherReference2 = getVariable(otherVarBlock2);

    otherReference1.setBoundValue(value1);
    otherReference2.setBoundValue(value2);

    assertEquals(value1.referenceCount(), 2);
    assertEquals(value2.referenceCount(), 2);
    assertEquals(reference1.getBoundValue(), value1);
    assertEquals(reference2.getBoundValue(), value2);
    assertEquals(otherReference1.getBoundValue(), value1);
    assertEquals(otherReference2.getBoundValue(), value2);

    Blockly.BoundVariables.clearCyclicReferenceOnBlock(letBlock1);

    assertEquals(value1.referenceCount(), 1);
    assertEquals(value2.referenceCount(), 1);
    assertTrue(!reference1.getBoundValue());
    assertTrue(!reference1.getBoundValue());
    assertEquals(otherReference1.getBoundValue(), value1);
    assertEquals(otherReference2.getBoundValue(), value2);
  } finally {
    workspace.dispose();
  }
}

function test_resolve_reference_collectAllBoundVariables() {
  var workspace = create_typed_workspace();
  try {
    var letBlock = workspace.newBlock('let_typed');
    var varBlock1 = workspace.newBlock('variables_get_typed');
    var varBlock2 = workspace.newBlock('variables_get_typed');
    setVariableName(letBlock, 'x');
    setVariableName(varBlock1, 'x');
    setVariableName(varBlock2, 'x');

    var value = getVariable(letBlock);
    var reference1 = getVariable(varBlock1);
    var reference2 = getVariable(varBlock2);

    reference1.setBoundValue(value);
    reference2.setBoundValue(value);

    var boundVariables = [value, reference1, reference2];
    assertTrue(isSameSet(boundVariables, value.getAllBoundVariables()));
    assertTrue(isSameSet(boundVariables, reference1.getAllBoundVariables()));
    assertFalse(isSameSet([value], reference2.getAllBoundVariables()));
  } finally {
    workspace.dispose();
  }
}

function test_resolve_reference_renameVariableCheck() {
  var workspace = create_typed_workspace();
  try {
    var letBlock1 = workspace.newBlock('let_typed');
    var letBlock2 = workspace.newBlock('let_typed');
    var varBlock = workspace.newBlock('variables_get_typed');
    setVariableName(letBlock1, 'x');
    setVariableName(letBlock2, 'y');
    setVariableName(varBlock, 'x');

    var value1 = getVariable(letBlock1);
    var value2 = getVariable(letBlock2);
    var reference = getVariable(varBlock);

    // [let x = <> in <[let y = <> in <[x]>]>]
    letBlock1.getInput('EXP2').connection.connect(letBlock2.outputConnection);
    letBlock2.getInput('EXP2').connection.connect(varBlock.outputConnection);
    assertFalse(Blockly.BoundVariables.canRenameTo(value1, 'y'));
    assertFalse(Blockly.BoundVariables.canRenameTo(value2, 'x'));
    assertFalse(Blockly.BoundVariables.canRenameTo(reference, 'y'));
    assertTrue(Blockly.BoundVariables.canRenameTo(value1, 'z'));
    assertTrue(Blockly.BoundVariables.canRenameTo(reference, 'z'));

    // [let y = <> in <[let x = <> in <[x]>]>]
    varBlock.outputConnection.disconnect();
    letBlock1.getInput('EXP2').connection.connect(varBlock.outputConnection);
    letBlock2.getInput('EXP2').connection.connect(letBlock1.outputConnection);
    assertTrue(Blockly.BoundVariables.canRenameTo(value1, 'y'));
    assertTrue(Blockly.BoundVariables.canRenameTo(reference, 'y'));
    assertTrue(Blockly.BoundVariables.canRenameTo(value2, 'x'));

    // [let x = <[let y = <> in <>]> in <[x]>]
    letBlock2.getInput('EXP2').connection.disconnect(
        letBlock1.outputConnection);
    letBlock1.getInput('EXP1').connection.connect(letBlock2.outputConnection);
    assertTrue(Blockly.BoundVariables.canRenameTo(value1, 'y'));
    assertTrue(Blockly.BoundVariables.canRenameTo(value1, 'y'));
    assertTrue(Blockly.BoundVariables.canRenameTo(reference, 'y'));
    assertTrue(Blockly.BoundVariables.canRenameTo(value2, 'x'));
    assertTrue(Blockly.BoundVariables.canRenameTo(value2, 'x\''));
  } finally {
    workspace.dispose();
  }
}

function test_resolve_reference_renameVariableCheckWithWorkbench() {
  var workspace = create_typed_workspace();
  var workbenchList = [];
  try {
    var letBlock1 = workspace.newBlock('let_typed');
    var letBlock2 = workspace.newBlock('let_typed');
    var letBlock3 = workspace.newBlock('let_typed');
    setVariableName(letBlock1, 'x');
    setVariableName(letBlock2, 'y');
    setVariableName(letBlock3, 'z');

    letBlock1.getInput('EXP2').connection.connect(letBlock2.outputConnection);
    letBlock2.getInput('EXP2').connection.connect(letBlock3.outputConnection);

    workbenchList.push(create_mock_workbench(letBlock1));
    workbenchList.push(create_mock_workbench(letBlock2));
    workbenchList.push(create_mock_workbench(letBlock3));

    var value1 = getVariable(letBlock1);
    var value2 = getVariable(letBlock2);
    var value3 = getVariable(letBlock3);

    var refBlocks1 = workbenchList[0].blocksForFlyout_();
    var refBlocks2 = workbenchList[1].blocksForFlyout_();
    var refBlocks3 = workbenchList[2].blocksForFlyout_();

    assertTrue(Blockly.BoundVariables.canRenameTo(value1, 'z'));
    assertTrue(Blockly.BoundVariables.canRenameTo(value2, 'z'));
    assertTrue(Blockly.BoundVariables.canRenameTo(value3, 'x'));
  } finally {
    for (var i = 0, wb; wb = workbenchList[i]; i++) {
      wb.dispose();
    }
    workspace.dispose();
  }
}

function test_resolve_reference_fixTypeInfOnIntArith() {
  var workspace = create_typed_workspace();
  var workbench;
  try {
    var letBlock1 = workspace.newBlock('let_typed');
    workbench = create_mock_workbench(letBlock1);
    setVariableName(letBlock1, 'x');

    var blocks = getFlyoutBlocksFromWorkbench(workbench,
        workbench.getWorkspace());
    assertEquals(blocks.length, 1);
    var referenceBlockWB1 = blocks[0];
    var referenceWB1 = getVariable(referenceBlockWB1);

    var blocks = getFlyoutBlocksFromWorkbench(workbench,
        workbench.getWorkspace());
    assertEquals(blocks.length, 1);
    var referenceBlockWB2 = blocks[0];
    var referenceWB2 = getVariable(referenceBlockWB2);

    function test(prototypeName, disconnectLeft) {
      var intArith = workbench.getWorkspace().newBlock(prototypeName);
      var expected = intArith.getInput('A').connection.typeExpr;
      intArith.getInput('A').connection.connect(
          referenceBlockWB1.outputConnection);
      intArith.getInput('B').connection.connect(
          referenceBlockWB2.outputConnection);
      var other;
      if (disconnectLeft) {
        referenceBlockWB1.outputConnection.disconnect();
        assertEquals(expected.label,
            referenceBlockWB2.outputConnection.typeExpr.deref().label);
        other = referenceBlockWB2.outputConnection;
      } else {
        referenceBlockWB2.outputConnection.disconnect();
        assertEquals(expected.label,
            referenceBlockWB1.outputConnection.typeExpr.deref().label);
        other = referenceBlockWB1.outputConnection;
      }
      assertEquals(expected.label,
          letBlock1.getInput('EXP1').connection.typeExpr.deref().label);
      other.disconnect();
    }
    test('int_arithmetic_typed', true);
    test('int_arithmetic_typed', false);
    test('float_arithmetic_typed', true);
    test('float_arithmetic_typed', false);
    test('logic_compare_typed', true);
    test('logic_compare_typed', false);
  } finally {
    if (workbench) {
      workbench.dispose();
    }
    workspace.dispose();
  }
}

function test_resolve_reference_collectContextForNestedBlocks() {
  var workspace = create_typed_workspace();
  var workbenchList = [];
  try {
    var varNamesOnMain = ["x1", "x2"];
    var blocksOnMain = createNestedValueBlock(
        workspace, varNamesOnMain.length,
        function(n) {return varNamesOnMain[n];});
    var lastOnMain = blocksOnMain[varNamesOnMain.length - 1];
    workbenchList.push(create_mock_workbench(lastOnMain));

    var varNamesOnWB = ["y1", "y2"];
    var blocksOnWB = createNestedValueBlock(
        workbenchList[0].getWorkspace(), varNamesOnWB.length,
        function(n) {return varNamesOnWB[n];});
    var lastOnWB = blocksOnWB[varNamesOnWB.length - 1];
    workbenchList.push(create_mock_workbench(lastOnWB));

    var varNamesOnWB2 = ["z1", "z2"];
    var blocksOnWB2 = createNestedValueBlock(
        workbenchList[1].getWorkspace(), varNamesOnWB2.length,
        function(n) {return varNamesOnWB2[n];});
    var lastOnWB2 = blocksOnWB2[varNamesOnWB2.length - 1];
    workbenchList.push(create_mock_workbench(lastOnWB2));

    var contextWorkspaceList = [];
    contextWorkspaceList.push(workspace);
    contextWorkspaceList.push(workbenchList[0].getWorkspace());
    contextWorkspaceList.push(workbenchList[1].getWorkspace());
    contextWorkspaceList.push(workbenchList[2].getWorkspace());

    var expectedBlocksList = [];
    expectedBlocksList.push([]);
    expectedBlocksList.push(blocksOnMain);
    expectedBlocksList.push(blocksOnMain.concat(blocksOnWB));
    expectedBlocksList.push(blocksOnMain.concat(blocksOnWB).concat(blocksOnWB2));

    for (var i = 0; i < expectedBlocksList.length; i++) {
      var ws = contextWorkspaceList[i];
      var valueBlocks = expectedBlocksList[i];
      var context = ws.getImplicitContext();
      var contextValues = context.getVariables();
      checkValuesPariedWithValueBlocks(contextValues, valueBlocks);
    }

    var expected = [];
    expected.push({
      "getContextEx": blocksOnMain, "getContext": blocksOnMain,
      "getBlockContext": [lastOnMain]
    });
    expected.push({
      "getContextEx": blocksOnWB,
      "getContext": blocksOnMain.concat(blocksOnWB),
      "getBlockContext": [lastOnWB]
    });
    expected.push({
      "getContextEx": blocksOnWB2,
      "getContext": blocksOnMain.concat(blocksOnWB).concat(blocksOnWB2),
      "getBlockContext": [lastOnWB2]
    });

    for (var i = 0, workbench; workbench = workbenchList[i]; i++) {
      var expectedMap = expected[i];
      var context = workbench.getContext(false);
      var expectedBlocks = expectedMap["getContextEx"];
      checkValuesPariedWithValueBlocks(context.getVariables(), expectedBlocks);
      var context = workbench.getContext();
      var expectedBlocks = expectedMap["getContext"];
      checkValuesPariedWithValueBlocks(context.getVariables(), expectedBlocks);
      var context = workbench.getBlockContext();
      var expectedBlocks = expectedMap["getBlockContext"];
      checkValuesPariedWithValueBlocks(context.getVariables(), expectedBlocks);
    }
  } finally {
    for (var i = 0, wb; wb = workbenchList[i]; i++) {
      wb.dispose();
    }
    workspace.dispose();
  }
}

function test_resolve_reference_removeReferenceBlocks() {
  var workspace = create_typed_workspace();
  try {
    var letBlock = workspace.newBlock('let_typed');
    setVariableName(letBlock, 'x');
    var varBlock1 = workspace.newBlock('variables_get_typed');
    var varBlock2 = workspace.newBlock('variables_get_typed');
    var varBlock3 = workspace.newBlock('variables_get_typed');
    setVariableName(varBlock1, 'x');
    setVariableName(varBlock2, 'x');
    setVariableName(varBlock3, 'x');
    var field = getVariableField(letBlock);
    var value = field.getVariable();
    var ref1 = getVariable(varBlock1);
    var ref2 = getVariable(varBlock2);
    var ref3 = getVariable(varBlock3);
    ref1.setBoundValue(value);
    ref2.setBoundValue(value);
    ref3.setBoundValue(value);

    field.dispose(true);
    var parentInput = goog.array.find(letBlock.inputList,
        function(inp) {return inp.fieldRow.indexOf(field) != -1});
    assertNotNull(parentInput);
    var index = parentInput.fieldRow.indexOf(field);
    assertNotEquals(index, -1);
    parentInput.fieldRow.splice(index, 1);
  } finally {
    workspace.dispose();
  }
}

function test_resolve_reference_letRecParameterShadowing() {
  var workspace = create_typed_workspace();
  try {
    // let rec f = f
    var letBlock = workspace.newBlock('let_typed');
    letBlock.setRecursiveFlag(true);
    assertTrue(letBlock.isRecursive());
    var letVar = getVariable(letBlock);
    letVar.setVariableName('f');

    var exp1 = letBlock.getInput('EXP1').connection;
    var exp2 = letBlock.getInput('EXP2').connection;

    var recurVarBlock = workspace.newBlock('variables_get_typed');
    setVariableName(recurVarBlock, 'f');
    getVariable(recurVarBlock).setBoundValue(letVar);
    assertTrue(recurVarBlock.resolveReference(exp1));
    assertTrue(recurVarBlock.resolveReference(exp2));

    // let rec f f = f
    addArguments(letBlock, 'f');
    assertEquals(letBlock.argumentCount_, 1);
    assertNotNull(letBlock.typedValue['ARG0']);

    var argVar = letBlock.typedValue['ARG0'];
    argVar.setVariableName('f');
    assertFalse(recurVarBlock.resolveReference(exp1));
    assertTrue(recurVarBlock.resolveReference(exp2));

    var argVarBlock = workspace.newBlock('variables_get_typed');
    var reference = getVariable(argVarBlock);
    reference.setVariableName('f');
    reference.setBoundValue(argVar);
    exp1.connect(argVarBlock.outputConnection);
    assertEquals(letBlock.getRecursiveReferences().length, 0);

    // Expects that type scheme for variable f is ∀a. a -> a
    var scheme = letBlock.getTypeScheme('VAR');
    assertEquals(scheme.names.length, 1);
    var type = scheme.type.deepDeref();
    assertTrue(type.isFunction());
    var bindVar1 = type.arg_type;
    var bindVar2 = type.return_type;
    assertTrue(bindVar1.isTypeVar());
    assertTrue(bindVar2.isTypeVar());
    assertTrue(bindVar1.name === bindVar2.name);
    assertTrue(scheme.names.indexOf(bindVar1.name) != -1);
  } finally {
    workspace.dispose();
  }
}

function test_resolve_reference_letStatementSimple() {
  var workspace = create_typed_workspace();
  try {
    var letBlock1 = workspace.newBlock('letstatement_typed');
    var letBlock2 = workspace.newBlock('letstatement_typed');
    var letBlock3 = workspace.newBlock('let_typed');
    letBlock3.setIsStatement(true);
    letBlock1.nextConnection.connect(letBlock2.previousConnection);
    letBlock2.nextConnection.connect(letBlock3.previousConnection);
    var value1 = letBlock1.typedValue['VAR'];
    var varBlock = createReferenceBlock(value1, false);
    var exp1 = letBlock2.getInput('EXP1').connection;
    assertTrue(varBlock.resolveReference(exp1));
    var exp1 = letBlock3.getInput('EXP1').connection;
    assertTrue(varBlock.resolveReference(exp1));
    assertTrue(letBlock1.resolveReference(null));
  } finally {
    workspace.dispose();
  }
}

function test_resolve_reference_fixRemoveUndefinedRefInConstruct() {
  var workspace = create_typed_workspace();
  Blockly.mainWorkspace = workspace;
  try {
    // data bar = Foo of int|float
    // let a = <> in Foo (let b = <> in a +. b)
    // - If type constructor block is removed..
    // let a = <> in Foo
    //  let b = <> in <> +. b
    var defineCtr = workspace.newBlock('defined_datatype_typed');
    defineCtr.getField('DATANAME').setText('bar');
    var id = defineCtr.getStructureId();
    assertEquals(workspace.getCtorDataName(id), 'bar');
    var ctrValue = getVariable(defineCtr, 0);
    var ctr = createReferenceBlock(ctrValue);
    ctrValue.setVariableName('Foo');
    assertEquals(getVariableName(ctr), 'Foo');
    assertEquals(ctrValue.getTypeExpr().getDisplayText(), 'bar');
    var letBlockA = workspace.newBlock('let_typed');
    connectAsStatements(defineCtr, letBlockA);
    setVariableName(letBlockA, 'a');
    letBlockA.getInput('EXP2').connection.connect(ctr.outputConnection);

    function check(typeBlock, arithBlock, typeName) {
      assertEquals(letBlockA, ctr.getParent());
      var inp = ctr.getInput('PARAM0');
      assertNull(inp);
      var varA = createReferenceBlock(letBlockA.typedValue['VAR']);
      var letBlockB = workspace.newBlock('let_typed');
      var varB = createReferenceBlock(letBlockB.typedValue['VAR']);
      defineCtr.getInput('CTR_INP0').connection.connect(typeBlock.outputConnection);
      var inp = ctr.getInput('PARAM0');
      assertNotNull(inp);
      inp.connection.connect(letBlockB.outputConnection);
      letBlockB.getInput('EXP2').connection.connect(arithBlock.outputConnection);
      arithBlock.getInput('A').connection.connect(varA.outputConnection);
      arithBlock.getInput('B').connection.connect(varB.outputConnection);
      assertFalse(letBlockA.resolveReference(null));
      assertTrue(defineCtr.resolveReference(null));
      if (typeName === 'int') {
        assertTrue(inp.connection.typeExpr.isInt());
      } else if (typeName === 'float') {
        assertTrue(inp.connection.typeExpr.isFloat());
      } else {
        assertTrue(false);
      }
      typeBlock.outputConnection.disconnect();
      assertNull(ctr.getInput('PARAM0'));
      assertNull(varA.workspace); // disposed
      assertNull(arithBlock.getInputTargetBlock('A'));
      assertTrue(letBlockB.resolveReference(null));
      // let b = ? in ? + b
      assertNull(letBlockB.getParent());
      assertEquals(arithBlock.getParent(), letBlockB);
      assertEquals(varB.getParent(), arithBlock);
      assertEquals(arithBlock.getInputTargetBlock('B'), varB);
      assertEquals(letBlockA, ctr.getParent());
      varB.dispose();
    }
    var intType = workspace.newBlock('int_type_typed');
    var intArith = workspace.newBlock('int_arithmetic_typed');
    var floatType = workspace.newBlock('float_type_typed');
    var floatArith = workspace.newBlock('float_arithmetic_typed');
    check(intType, intArith, 'int');
    check(floatType, floatArith, 'float');
    check(intType, intArith, 'int');
  } finally {
    Blockly.mainWorkspace = null;
    workspace.dispose();
  }
}

function test_resolve_reference_fixLetStatementReferenceRemained() {
  var workspace = create_typed_workspace();
  try {
    // let x = ..
    // let y = x
    var letBlock1 = workspace.newBlock('letstatement_typed');
    var letBlock2 = workspace.newBlock('letstatement_typed');
    letBlock1.nextConnection.connect(letBlock2.previousConnection);
    var value1 = letBlock1.typedValue['VAR'];
    var varBlock = createReferenceBlock(value1);
    var exp1 = letBlock2.getInput('EXP1').connection;
    exp1.connect(varBlock.outputConnection);
    letBlock1.dispose(false /** Do not heal stack. */, true);
    assertNull(letBlock1.workspace);
    assertNull(letBlock2.workspace);
    assertNotNull(exp1);
    assertFalse(exp1.isConnected());
    assertNull(varBlock.workspace);
  } finally {
    workspace.dispose();
  }
}

function test_resolve_reference_datatypeDeclarationBlocksTriggerTypeInf() {
  var workspace = create_typed_workspace();
  try {
    var defineRecord = workspace.newBlock('defined_recordtype_typed');
    var recordValue = getVariable(defineRecord);
    var letBlock = workspace.newBlock('letstatement_typed');
    var intBlock = workspace.newBlock('int_typed');
    defineRecord.nextConnection.connect(letBlock.previousConnection);
    var exp1 = letBlock.getInput('EXP1').connection;
    exp1.connect(intBlock.outputConnection);
    assertTrue(exp1.typeExpr.deref().isInt());

    recordValue.setVariableName('record_name');
    var context = letBlock.allVisibleVariables(exp1);
    assertEquals(context.getStructureVariable('record_name'), recordValue);

    intBlock.outputConnection.disconnect();
    var defineCtor = workspace.newBlock('defined_datatype_typed');
    defineCtor.nextConnection.connect(letBlock.previousConnection);
    exp1.connect(intBlock.outputConnection);
    assertTrue(exp1.typeExpr.deref().isInt());

    var context = letBlock.allVisibleVariables(exp1);
    assertEquals(Object.keys(context.structureEnv_).length, 0);
  } finally {
    workspace.dispose();
  }
}
