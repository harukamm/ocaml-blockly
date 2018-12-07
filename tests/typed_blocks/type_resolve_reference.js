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
    var env = letBlock2.allVisibleVariables(exp2);
    assertEquals(env['hoge'], getVariable(letBlock2));
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
    function isSameSet(varList1, varList2) {
      if (varList1.length != varList2.length) {
        return false;
      }
      for (var i = 0, variable; variable = varList1[i]; i++) {
        if (varList2.indexOf(variable) == -1) {
          return false;
        }
      }
      return true;
    }
    var letBlock = workspace.newBlock('let_typed');
    var varBlock1 = workspace.newBlock('variables_get_typed');
    var varBlock2 = workspace.newBlock('variables_get_typed');

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

    var refBlocks1 = workbenchList[0].blocksForFlyout();
    var refBlocks2 = workbenchList[1].blocksForFlyout();
    var refBlocks3 = workbenchList[2].blocksForFlyout();

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

    var expectedBlocksList = [];
    expectedBlocksList.push(blocksOnMain);
    expectedBlocksList.push(blocksOnMain.concat(blocksOnWB));
    expectedBlocksList.push(blocksOnMain.concat(blocksOnWB.concat(blocksOnWB2)));

    for (var i = 0, workbench; workbench = workbenchList[i]; i++) {
      var refBlocks = getFlyoutBlocksFromWorkbench(workbench);
      var expectedValueBlocks = expectedBlocksList[i];
      checkBlocksArePaired(expectedValueBlocks, refBlocks);
    }
  } finally {
    for (var i = 0, wb; wb = workbenchList[i]; i++) {
      wb.dispose();
    }
    workspace.dispose();
  }
}
