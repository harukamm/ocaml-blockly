'use strict';

function test_type_transfer_block_workspace_simpleValueBlock() {
  var workspace = create_typed_workspace();
  var otherWorkspace = create_typed_workspace()
  try {
    var originalBlock = workspace.newBlock('let_typed');
    var value1 = originalBlock.getField('VAR').getVariable();
    var transferredBlock = virtually_transfer_workspace(originalBlock,
        otherWorkspace);
    var value2 = transferredBlock.getField('VAR').getVariable();
    assertTrue(value1 != value2);
    assertTrue(value1.getId() != value2.getId());
  } finally {
    workspace.dispose();
    otherWorkspace.dispose();
  }
}

function test_type_transfer_block_workspace_simpleVariableBlocksRestoreName() {
  var workspace = create_typed_workspace();
  var otherWorkspace = create_typed_workspace()
  try {
    var originalBlock = workspace.newBlock('let_typed');
    setVariableName(originalBlock, 'ii');
    var value1 = originalBlock.getField('VAR').getVariable();
    // Accidentally clear the database of variables..
    Blockly.BoundVariables.clearWorkspaceVariableDB(workspace);
    var transferredBlock = virtually_transfer_workspace(originalBlock,
        otherWorkspace);
    var value2 = transferredBlock.getField('VAR').getVariable();
    assertTrue(value1.getVariableName() === 'ii');
    assertTrue(value1.getVariableName() === value2.getVariableName());

    originalBlock = workspace.newBlock('variables_get_typed');
    setVariableName(originalBlock, 'xx');
    var reference1 = originalBlock.getField('VAR').getVariable();
    var transferredBlock = virtually_transfer_workspace(originalBlock,
        otherWorkspace);
    var reference2 =  transferredBlock.getField('VAR').getVariable();
    assertTrue(reference1.getVariableName() === 'xx');
    assertTrue(reference1.getVariableName() === reference2.getVariableName());
  } finally {
    workspace.dispose();
    otherWorkspace.dispose();
  }
}

function test_type_transfer_block_workspace_valueBlockWithReferences() {
  var workspace = create_typed_workspace();
  var otherWorkspace = create_typed_workspace()
  try {
    var originalBlock = workspace.newBlock('let_typed');
    var varBlock = workspace.newBlock('variables_get_typed');
    var originalValue = originalBlock.getField('VAR').getVariable();
    var reference = varBlock.getField('VAR').getVariable();
    reference.setBoundValue(originalValue);
    assertTrue(originalValue.referenceCount() == 1);
    assertTrue(reference.getBoundValue() == originalValue);

    var transferredBlock = virtually_transfer_workspace(originalBlock,
        otherWorkspace);
    var transferredValue = transferredBlock.getField('VAR').getVariable();
    assertTrue(originalValue != transferredValue);

    assertTrue(reference.getBoundValue() == transferredValue);
  } finally {
    workspace.dispose();
    otherWorkspace.dispose();
  }
}

function test_type_transfer_block_workspace_nestedValueBlocks() {
  var workspace = create_typed_workspace();
  var otherWorkspace = create_typed_workspace()
  try {
    // [ let i = <> in < [i] > ]
    var originalLetBlock = workspace.newBlock('let_typed');
    var originalVarBlock = workspace.newBlock('variables_get_typed');
    setVariableName(originalLetBlock, 'i');
    setVariableName(originalVarBlock, 'i');
    originalLetBlock.getInput('EXP2').connection.connect(
        originalVarBlock.outputConnection);
    var originalValue = originalLetBlock.getField('VAR').getVariable();
    var originalReference = originalVarBlock.getField('VAR').getVariable();

    // Another getter block, which doesn't connect to the originalLetBlock,
    // but its reference is bound to the originalValue.
    var varBlock = workspace.newBlock('variables_get_typed');
    var reference = varBlock.getField('VAR').getVariable();
    setVariableName(varBlock, 'i');
    reference.setBoundValue(originalValue);

    assertTrue(originalValue.getSourceBlock() == originalLetBlock);
    assertTrue(originalValue.referenceCount() == 2);
    assertTrue(originalValue == originalReference.getBoundValue());
    assertTrue(originalValue == reference.getBoundValue());

    var newLetBlock = virtually_transfer_workspace(originalLetBlock,
        otherWorkspace);
    var newVarBlock = newLetBlock.getInputTargetBlock('EXP2');
    var newValue = newLetBlock.getField('VAR').getVariable();
    var newReference = newVarBlock.getField('VAR').getVariable();

    // The originalValue has been disposed of.
    assertTrue(!originalValue.getSourceBlock());
    assertTrue(newValue.referenceCount() == 2);
    assertTrue(newValue == newReference.getBoundValue());
    assertTrue(newValue == reference.getBoundValue());
  } finally {
    workspace.dispose();
    otherWorkspace.dispose();
  }
}

function test_type_transfer_block_workspace_mutatorBlocksTransferred() {
  var workspace = create_typed_workspace();
  var workbench;
  var nestedWorkbench;
  var otherWorkspace = create_typed_workspace()
  try {
    var letBlockOnMain = workspace.newBlock('let_typed');
    workbench = create_mock_workbench(letBlockOnMain);
    var letBlockOnWB = workbench.getWorkspace().newBlock('let_typed');
    nestedWorkbench = create_mock_workbench(letBlockOnWB);

    var varBlock1 = workspace.newBlock('variables_get_typed');
    var varBlock2 = workbench.getWorkspace().newBlock('variables_get_typed');
    var varBlock3 = workbench.getWorkspace().newBlock('variables_get_typed');
    var varBlock4 =
        nestedWorkbench.getWorkspace().newBlock('variables_get_typed');
    var varBlockIsolated = workspace.newBlock('variables_get_typed');
    setVariableName(letBlockOnMain, 'i');
    setVariableName(letBlockOnWB, 'i');
    setVariableName(varBlock1, 'i');
    setVariableName(varBlock2, 'i');
    setVariableName(varBlock3, 'i');
    setVariableName(varBlock4, 'i');
    setVariableName(varBlockIsolated, 'i');

    var letValue = getVariable(letBlockOnMain);
    var letWBValue = getVariable(letBlockOnWB);
    letBlockOnMain.getInput('EXP2').connection.connect(
        varBlock1.outputConnection);
    getVariable(varBlock2).setBoundValue(letValue);
    getVariable(varBlock3).setBoundValue(letWBValue);
    getVariable(varBlock4).setBoundValue(letValue);
    getVariable(varBlockIsolated).setBoundValue(letValue);

    function testsConditionDuringTransferring() {
      assertTrue(letBlockOnMain.isTransferring());
      assertTrue(letBlockOnWB.isTransferring());
      assertTrue(varBlock1.isTransferring());
      assertTrue(varBlock2.isTransferring());
      assertTrue(varBlock3.isTransferring());
      assertTrue(varBlock4.isTransferring());
      assertTrue(!varBlockIsolated.isTransferring());
    }

    var newBlock = virtually_transfer_workspace(letBlockOnMain, otherWorkspace,
        null, null, testsConditionDuringTransferring);
    var newLetValue = getVariable(newBlock);
    var newVarBlock1 = newBlock.getInputTargetBlock('EXP2');
    assertTrue(newLetValue.referenceCount() == 2);
    assertTrue(getVariable(newVarBlock1).getBoundValue() == newLetValue);
    assertTrue(getVariable(varBlockIsolated).getBoundValue() == newLetValue);

    // otherWorkspace has blocks 'newBlock' and 'newVarBlock1'.
    assertTrue(otherWorkspace.getAllBlocks().length == 2);
    // workspace has a single block 'varBlockIsolated'.
    assertTrue(workspace.getAllBlocks().length == 1);
  } finally {
    workspace.dispose();
    if (workbench) {
      workbench.dispose();
    }
    if (nestedWorkbench) {
      nestedWorkbench.dispose();
    }
    otherWorkspace.dispose();
  }
}

function test_type_transfer_block_workspace_newBlockShareTypeExpression() {
  var workspace = create_typed_workspace();
  var otherWorkspace = create_typed_workspace()
  try {
    var originalLetBlock = workspace.newBlock('let_typed');
    var originalVarBlock = workspace.newBlock('variables_get_typed');
    var originalExp1Type =
        originalLetBlock.getInput('EXP1').connection.typeExpr;
    var originalExp2Type =
        originalLetBlock.getInput('EXP2').connection.typeExpr;
    var originalVarType = originalVarBlock.outputConnection.typeExpr;

    setVariableName(originalLetBlock, 'x');
    setVariableName(originalVarBlock, 'x');
    originalLetBlock.getInput('EXP2').connection.connect(
        originalVarBlock.outputConnection);
    assertTrue(originalExp1Type ==
        getVariable(originalLetBlock).getTypeExpr());

    var newLetBlock = virtually_transfer_workspace(originalLetBlock,
        otherWorkspace);
    var newVarBlock = newLetBlock.getInputTargetBlock('EXP2');

    // See blocks' type expressions.
    assertTrue(originalExp1Type ==
        newLetBlock.getInput('EXP1').connection.typeExpr);
    assertTrue(originalExp2Type ==
        newLetBlock.getInput('EXP2').connection.typeExpr);
    assertTrue(originalExp2Type ==
        newLetBlock.outputConnection.typeExpr);
    assertTrue(originalVarType ==
        newVarBlock.outputConnection.typeExpr);

    // See variables' type expressions.
    assertTrue(getVariable(newLetBlock).getVariableName() === 'x');
    assertTrue(originalExp1Type ==
        getVariable(newLetBlock).getTypeExpr());
    assertTrue(originalVarType ==
        getVariable(newVarBlock).getTypeExpr());
  } finally {
    workspace.dispose();
    otherWorkspace.dispose();
  }
}

function test_type_transfer_block_workspace_shareTypeExprWithPrimitive() {
  var workspace = create_typed_workspace();
  var otherWorkspace = create_typed_workspace()
  try {
    var originalLetBlock = workspace.newBlock('let_typed');
    var originalBoolBlock = workspace.newBlock('logic_boolean_typed')
    var originalExp1Type =
        originalLetBlock.getInput('EXP1').connection.typeExpr;
    var originalExp2Type =
        originalLetBlock.getInput('EXP2').connection.typeExpr;
    var originalLetValue = getVariable(originalLetBlock);

    originalLetBlock.getInput('EXP1').connection.connect(
        originalBoolBlock.outputConnection);
    setVariableName(originalLetBlock, 'flag');

    var newLetBlock = virtually_transfer_workspace(originalLetBlock,
        otherWorkspace);

    // See blocks' type expressions.
    assertTrue(originalExp1Type ==
        newLetBlock.getInput('EXP1').connection.typeExpr);
    assertTrue(Blockly.TypeExpr.BOOL_ ==
        newLetBlock.getInput('EXP1').connection.typeExpr.deref().label);
    assertTrue(originalExp2Type ==
        newLetBlock.getInput('EXP2').connection.typeExpr);
    assertTrue(originalExp2Type ==
        newLetBlock.outputConnection.typeExpr);

    // See variables' type expressions.
    assertTrue(getVariable(newLetBlock).getVariableName() === 'flag');
    assertTrue(originalExp1Type ==
        getVariable(newLetBlock).getTypeExpr());
  } finally {
    workspace.dispose();
    otherWorkspace.dispose();
  }
}

function test_type_transfer_block_workspace_cyclicReferences() {
  var workspace = create_typed_workspace();
  var otherWorkspace = create_typed_workspace();
  try {
    var outerLetBlock = workspace.newBlock('let_typed');
    var originalLetBlock = workspace.newBlock('let_typed');
    var originalVarBlockX = workspace.newBlock('variables_get_typed');
    var originalVarBlockY = workspace.newBlock('variables_get_typed');

    var outerValue = getVariable(outerLetBlock);
    var value = getVariable(originalLetBlock);
    var referenceX = getVariable(originalVarBlockX);
    var referenceY = getVariable(originalVarBlockY);

    setVariableName(outerLetBlock, 'x');
    setVariableName(originalLetBlock, 'y');
    setVariableName(originalVarBlockX, 'x');
    setVariableName(originalVarBlockY, 'y');

    // [let x = <> in <[let y = <[x]> in <[y]>]>]
    outerLetBlock.getInput('EXP2').connection.connect(
        originalLetBlock.outputConnection);
    originalLetBlock.getInput('EXP1').connection.connect(
        originalVarBlockX.outputConnection);
    originalLetBlock.getInput('EXP2').connection.connect(
        originalVarBlockY.outputConnection);

    assertFalse(referenceX.isCyclicReference(originalLetBlock));
    assertTrue(referenceX.isCyclicReference(outerLetBlock));
    assertTrue(referenceY.isCyclicReference(originalLetBlock));
    assertTrue(referenceY.isCyclicReference(outerLetBlock));

    assertEquals(outerValue, referenceX.getBoundValue());
    assertEquals(value, referenceY.getBoundValue());

    // Tests below fail for now because new blocks don't have the 'outerValue'
    // on their variable environment. The new blocks are not connected to
    // 'otherLetBlock' which contains 'outerValue'.

    // function checks() {
    //   assertEquals(outerValue.referenceCount(), 2);
    //   assertEquals(outerValue, referenceX.getBoundValue());
    // }
    // var newLetBlock = virtually_transfer_workspace(originalLetBlock,
    //     otherWorkspace, checks);
    // var newVarBlockX = newLetBlock.getInputTargetBlock('EXP1');
    // var newVarBlockY = newLetBlock.getInputTargetBlock('EXP2');
    // var newReferenceX = getVariable(newVarBlockX);
    // var newReferenceY = getVariable(newVarBlockY);

    // assertEquals(outerValue.referenceCount(), 1);

    // assertEquals(outerValue, newReferenceX.getBoundValue());
    // assertEquals(newValue, referenceY.getBoundValue());
  } finally {
    workspace.dispose();
    otherWorkspace.dispose();
  }
}

function test_type_transfer_block_workspace_copyVariablesBlock() {
  var workspace = create_typed_workspace();
  try {
    var originalLetBlock = workspace.newBlock('let_typed');
    var originalVarBlock = workspace.newBlock('variables_get_typed');
    var otherVarBlock = workspace.newBlock('variables_get_typed');

    var value = getVariable(originalLetBlock);
    var reference = getVariable(originalVarBlock);
    var otherReference = getVariable(otherVarBlock);

    setVariableName(originalLetBlock, 'y');
    setVariableName(originalVarBlock, 'y');
    setVariableName(otherVarBlock, 'y');

    // [let x = <> in <[x]>]   [x]
    originalLetBlock.getInput('EXP2').connection.connect(
        originalVarBlock.outputConnection);
    otherReference.setBoundValue(value);

    assertEquals(value.referenceCount(), 2);

    var copiedLetBlock = copyAndPasteBlock(originalLetBlock);
    var copiedVarBlock = copiedLetBlock.getInputTargetBlock('EXP2');
    var copiedValue = getVariable(copiedLetBlock);
    var copiedReference = getVariable(copiedVarBlock);

    assertEquals(value.referenceCount(), 2);
    assertEquals(copiedValue.referenceCount(), 1);
    assertEquals(otherReference.getBoundValue(), value);
    assertEquals(copiedReference.getBoundValue(), copiedValue);

    assertNotEquals(copiedLetBlock.outputConnection.typeExpr.deref(),
        originalLetBlock.outputConnection.typeExpr.deref());
    assertNotEquals(copiedLetBlock.getInput('EXP1').connection.typeExpr.deref(),
        originalLetBlock.getInput('EXP2').connection.typeExpr.deref());
    assertEquals(copiedLetBlock.getInput('EXP1').connection.typeExpr,
        copiedValue.getTypeExpr());
    assertEquals(copiedVarBlock.outputConnection.typeExpr,
        copiedReference.getTypeExpr());
  } finally {
    workspace.dispose();
  }
}

function test_type_transfer_block_workspace_transferringBlockManyTimes() {
  var workspace = create_typed_workspace();
  var otherWorkspace = create_typed_workspace();
  try {
    var originalLetBlock = workspace.newBlock('let_typed');
    var originalBoolBlock = workspace.newBlock('logic_boolean_typed')
    var originalVarBlock = workspace.newBlock('variables_get_typed');
    var otherVarBlock = workspace.newBlock('variables_get_typed');

    var value = getVariable(originalLetBlock);
    var reference = getVariable(originalVarBlock);
    var otherReference = getVariable(otherVarBlock);
    var originalValueTypeExpr = value.getTypeExpr();
    var originalReferenceTypeExpr = reference.getTypeExpr();

    setVariableName(originalLetBlock, 'y');
    setVariableName(originalVarBlock, 'y');
    setVariableName(otherVarBlock, 'y');

    // [let y = <[true]> in <[y]>]   [y]
    originalLetBlock.getInput('EXP2').connection.connect(
        originalVarBlock.outputConnection);
    originalLetBlock.getInput('EXP1').connection.connect(
        originalBoolBlock.outputConnection);
    otherReference.setBoundValue(value);

    assertEquals(value.referenceCount(), 2);

    var transBlock = repeat_transfer_workspace(originalLetBlock,
        otherWorkspace, 10);
    var transVarBlock = transBlock.getInputTargetBlock('EXP2');

    var newValue = getVariable(transBlock);
    var newReference = getVariable(transVarBlock);

    assertEquals(newValue.referenceCount(), 2);
    assertEquals(originalValueTypeExpr, newValue.getTypeExpr());
    assertEquals(originalReferenceTypeExpr, newReference.getTypeExpr());
    assertEquals(otherReference.getBoundValue(), newValue);
    assertEquals(otherReference.getTypeExpr().deref().label,
        Blockly.TypeExpr.BOOL_);

    transBlock.getInput('EXP1').connection.disconnect(
        transBlock.getInputTargetBlock('EXP1').outputConnection);

    assertEquals(newReference.getTypeExpr().deref(), newValue.getTypeExpr());

    // Type-expr of otherVarBlock is out of date because otherVarBlock is not
    // connected to transBlock. To update it, call
    // otherVarBlock.updateTypeInference().
    assertNotEquals(otherReference.getTypeExpr().deref(),
        newValue.getTypeExpr());
    otherVarBlock.updateTypeInference(true);
    assertEquals(otherReference.getTypeExpr().deref(), newValue.getTypeExpr());
  } finally {
    workspace.dispose();
    otherWorkspace.dispose();
  }
}

function test_type_transfer_block_workspace_blocksOnDifferenceWorkspace() {
  var workspace = create_typed_workspace();
  var workbench;
  try {
    var letBlock = workspace.newBlock('let_typed');
    workbench = create_mock_workbench(letBlock);
    var int1 = workbench.getWorkspace().newBlock('int_typed');
    var exp2 = letBlock.getInput('EXP2').connection;

    var success = false;
    try {
      exp2.connect(int1.outputConnection);
      success = true;
    } catch (e) {
      // Connecting blocks must fail because they exist in difference
      // workspaces, but they are potentially allowed to connect
      // since both of blocks are allowed to be transferred to another
      // workspace.
      assertTrue(exp2.isConnectionAllowed(int1.outputConnection));
    }
    assertFalse(success);
    var transInt = virtually_transfer_workspace(int1, workspace);
    assertTrue(exp2.isConnectionAllowed(transInt.outputConnection));
    exp2.connect(transInt.outputConnection);
  } finally {
    if (workbench) {
      workbench.dispose();
    }
    workspace.dispose();
  }
}

function test_type_transfer_block_workspace_bugResolvedVariableConnectFails() {
  var workspace = create_typed_workspace();
  var workbench;
  try {
    var letBlock = workspace.newBlock('let_typed');
    var letValue = getVariable(letBlock);
    setVariableName(letBlock, 'x');
    workbench = create_mock_workbench(letBlock);
    var blocks = getFlyoutBlocksFromWorkbench(workbench);
    assertEquals(blocks.length, 1);
    var referenceBlockWB = blocks[0];
    var referenceWB = getVariable(referenceBlockWB);

    // [ <[x]> + <> ] on workbench
    var exp2 = letBlock.getInput('EXP2').connection;
    var intArith1 = workbench.getWorkspace().newBlock('int_arithmetic_typed');
    intArith1.getInput('A').connection.connect(
        referenceBlockWB.outputConnection);
    assertTrue(intArith1.resolveReference(exp2));

    var success = true;
    try {
      // Transfer the arithmetic blocks [ <[x]> + <> ] to another workspace.
      var intArith1_trans = virtually_transfer_workspace(intArith1, workspace,
          intArith1.outputConnection, exp2);
    } catch (e) {
      success = false;
    }
    assertTrue(intArith1.resolveReference(exp2));
    assertTrue(success);
    exp2.connect(intArith1_trans.outputConnection);
  } finally {
    if (workbench) {
      workbench.dispose();
    }
    workspace.dispose();
  }
}

function test_type_transfer_block_workspace_clearTypeInferenceByDisposeOfBlock() {
  var workspace = create_typed_workspace();
  var workbench;
  try {
    var letBlock = workspace.newBlock('let_typed');
    var letValue = getVariable(letBlock);
    setVariableName(letBlock, 'x');
    workbench = create_mock_workbench(letBlock);
    var blocks = getFlyoutBlocksFromWorkbench(workbench);
    assertEquals(blocks.length, 1);
    var referenceBlockWB = blocks[0];
    var referenceWB = getVariable(referenceBlockWB);
    var referenceTypExpr = referenceWB.getTypeExpr();

    var intArith1 = workbench.getWorkspace().newBlock('int_arithmetic_typed');
    var left = intArith1.getInput('A').connection;
    left.connect(referenceBlockWB.outputConnection);

    assertEquals(letValue.getTypeExpr().deref().label, Blockly.TypeExpr.INT_);

    intArith1.dispose();

    assertEquals(referenceTypExpr.deref(), letValue.getTypeExpr());
  } finally {
    if (workbench) {
      workbench.dispose();
    }
    workspace.dispose();
  }
}
