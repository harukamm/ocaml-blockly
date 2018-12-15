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
    setVariableName(originalBlock, 'ii');
    var reference1 = originalBlock.getField('VAR').getVariable();
    assertFalse(originalBlock.resolveReference(null));
    var exp2 = transferredBlock.getInput('EXP2').connection;
    assertTrue(originalBlock.resolveReference(exp2));
    var transferredBlock = virtually_transfer_workspace(originalBlock,
        otherWorkspace, originalBlock.outputConnection, exp2);
    var reference2 =  transferredBlock.getField('VAR').getVariable();
    assertTrue(reference1.getVariableName() === 'ii');
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
    setVariableName(originalBlock, 'x');
    setVariableName(varBlock, 'x');
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

function test_type_transfer_block_workspace_workbenchBlocksTransferred() {
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
    varBlock3.outputConnection.connect(letBlockOnWB.getInput('EXP2').connection);
    getVariable(varBlock4).setBoundValue(letValue);
    getVariable(varBlockIsolated).setBoundValue(letValue);
    assertTrue(letValue.referenceCount() == 4);
    assertTrue(letWBValue.referenceCount() == 1);

    function testsConditionDuringTransferring() {
      assertTrue(letBlockOnMain.isTransferring());
      assertTrue(!letBlockOnWB.isTransferring());
      assertTrue(varBlock1.isTransferring());
      assertTrue(!varBlock2.isTransferring());
      assertTrue(!varBlock3.isTransferring());
      assertTrue(!varBlock4.isTransferring());
      assertTrue(!varBlockIsolated.isTransferring());
    }

    assertFalse(letBlockOnMain.resolveReference(null));
    letWBValue.setVariableName('j');
    assertTrue(letBlockOnMain.resolveReference(null));
    var newBlock = virtually_transfer_workspace(letBlockOnMain, otherWorkspace,
        null, null, testsConditionDuringTransferring);
    var newLetValue = getVariable(newBlock);
    var newVarBlock1 = newBlock.getInputTargetBlock('EXP2');
    assertTrue(newLetValue.referenceCount() == 4);
    assertTrue(getVariable(newVarBlock1).getBoundValue() == newLetValue);
    assertTrue(getVariable(varBlockIsolated).getBoundValue() == newLetValue);
    assertTrue(getVariable(varBlock2).getBoundValue() == newLetValue);
    assertTrue(getVariable(varBlock3).getBoundValue() == letWBValue);
    assertTrue(getVariable(varBlock4).getBoundValue() == newLetValue);

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
    assertNotEquals(originalExp1Type,
        getVariable(originalLetBlock).getTypeExpr());
    assertEquals(originalExp1Type,
        getVariable(originalLetBlock).getTypeExpr().deref());

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
    assertFalse(originalExp1Type ==
        getVariable(newLetBlock).getTypeExpr());
    assertTrue(originalExp1Type.deref() ==
        getVariable(newLetBlock).getTypeExpr().deref());
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

    var orphanVarBlock = workspace.newBlock('variables_get_typed');
    var orphanReference = getVariable(orphanVarBlock);
    orphanReference.setVariableName('flag');
    orphanReference.setBoundValue(originalLetValue);

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
    assertFalse(originalExp1Type ==
        getVariable(newLetBlock).getTypeExpr());
    assertTrue(originalExp1Type.deref().label ==
        getVariable(newLetBlock).getTypeExpr().deref().label);

    // See orphan reference block.
    var newLetValue = getVariable(newLetBlock);
    assertEquals(orphanReference.getBoundValue(), newLetValue);
    assertEquals(orphanReference.getTypeExpr().deref().label,
        Blockly.TypeExpr.BOOL_);

    // Disconnect the bool block from the let block.
    var exp1 = newLetBlock.getInput('EXP1').connection;
    exp1.disconnect();
    assertEquals(newLetValue.getTypeExpr().val, exp1.typeExpr);
    assertNull(exp1.typeExpr.val);
    assertEquals(orphanReference.getTypeExpr().deref(), exp1.typeExpr);
    var type = orphanReference.getTypeExpr();
    assertTrue(type.val == exp1.typeExpr || type.val == newLetValue.getTypeExpr());
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

    function checks() {
      assertEquals(outerValue.referenceCount(), 2);
      assertEquals(outerValue, referenceX.getBoundValue());
    }
    var localConnection = originalLetBlock.outputConnection;
    var targetConnection = outerLetBlock.getInput('EXP2').connection;
    var newLetBlock = virtually_transfer_workspace(originalLetBlock,
        workspace, localConnection, targetConnection, checks);
    var newValue = getVariable(newLetBlock);
    var newVarBlockX = newLetBlock.getInputTargetBlock('EXP1');
    var newVarBlockY = newLetBlock.getInputTargetBlock('EXP2');
    var newReferenceX = getVariable(newVarBlockX);
    var newReferenceY = getVariable(newVarBlockY);

    assertEquals(outerValue.referenceCount(), 1);

    assertEquals(null, referenceX.getBoundValue());
    assertEquals(null, referenceY.getBoundValue());
    assertEquals(outerValue, newReferenceX.getBoundValue());
    assertEquals(newValue, newReferenceY.getBoundValue());
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
    assertNotEquals(copiedLetBlock.getInput('EXP1').connection.typeExpr,
        copiedValue.getTypeExpr());
    assertEquals(copiedLetBlock.getInput('EXP1').connection.typeExpr,
        copiedValue.getTypeExpr().deref());
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
    assertEquals(newValue.getTypeExpr().deref().label, Blockly.TypeExpr.BOOL_);
    assertEquals(originalReferenceTypeExpr, newReference.getTypeExpr());
    assertEquals(otherReference.getBoundValue(), newValue);
    assertEquals(otherReference.getTypeExpr().deref().label,
        Blockly.TypeExpr.BOOL_);

    transBlock.getInput('EXP1').connection.disconnect(
        transBlock.getInputTargetBlock('EXP1').outputConnection);

    assertNotEquals(newReference.getTypeExpr().deref(), newValue.getTypeExpr());
    assertEquals(newReference.getTypeExpr().deref(), newValue.getTypeExpr().deref());

    // Type-expr of otherVarBlock is out of date because otherVarBlock is not
    // connected to transBlock. To update it, call
    // otherVarBlock.updateTypeInference().
    assertNotEquals(otherReference.getTypeExpr().deref(),
        newValue.getTypeExpr());
    otherVarBlock.updateTypeInference(true);
    assertNotEquals(otherReference.getTypeExpr().deref(), newValue.getTypeExpr());
    assertEquals(otherReference.getTypeExpr().deref(), newValue.getTypeExpr().deref());
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

    function check(oldBlock, newBlock) {
      var env = newBlock.getPotentialContext();
      assertTrue('x' in env);
      assertEquals(Object.keys(env).length, 1);
      assertEquals(env['x'], letValue);
      env = newBlock.allVisibleVariables();
      assertEquals(Object.keys(env).length, 0);
    }

    // Transfer the arithmetic blocks [ <[x]> + <> ] to another workspace.
    var intArith1_trans = virtually_transfer_workspace(intArith1, workspace,
        intArith1.outputConnection, exp2);
    assertTrue(intArith1.resolveReference(exp2));
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

    assertNotEquals(referenceTypExpr.deref(), letValue.getTypeExpr());
    assertEquals(referenceTypExpr.deref(), letValue.getTypeExpr().deref());
  } finally {
    if (workbench) {
      workbench.dispose();
    }
    workspace.dispose();
  }
}

function test_type_transfer_block_workspace_fixOldListBlockTypeExpr() {
  var workspace = create_typed_workspace();
  var otherWorkspace = create_typed_workspace();
  try {
    var list = workspace.newBlock('lists_create_with_typed');
    assertEquals(list.outputConnection.typeExpr.label, Blockly.TypeExpr.LIST_);
    function check(oldBlock, newBlock) {
      // Type expressions in the oldBlock have been removed.
      assertNull(oldBlock.outputConnection.typeExpr);
      assertNull(oldBlock.getInput('ADD0').connection.typeExpr);
      assertNull(oldBlock.getInput('ADD1').connection.typeExpr);
      assertNull(oldBlock.getInput('ADD2').connection.typeExpr);
    }
    var transBlock = virtually_transfer_workspace(
        list, otherWorkspace, null, null, check);
  } finally {
    workspace.dispose();
    otherWorkspace.dispose();
  }
}

function test_type_transfer_block_workspace_nestedReferenceBlocksTransfer() {
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

    var floatArith = workbench.getWorkspace().newBlock('float_arithmetic_typed');
    var left = floatArith.getInput('A').connection;
    var exp2 = letBlock.getInput('EXP2').connection;

    assertTrue(referenceBlockWB.resolveReference(left));
    left.connect(referenceBlockWB.outputConnection);
    assertEquals(referenceTypExpr.deref().label, Blockly.TypeExpr.FLOAT_);

    assertTrue(referenceBlockWB.resolveReference(exp2));
    var transBlock = virtually_transfer_workspace(floatArith, workspace,
        floatArith.outputConnection, exp2);
    var referenceBlock = transBlock.getInputTargetBlock('A');
    var referenceTypExpr = getVariable(referenceBlock).getTypeExpr();
    // 'referenceTypExpr' already refers to float type before 'transBlock' got
    // connected to 'exp2' because type expressions in 'transBlock' have been
    // replaced with those in 'floatArith.'
    assertEquals(referenceTypExpr.deref().label, Blockly.TypeExpr.FLOAT_);
    assertEquals(letValue.getTypeExpr().deref().label, Blockly.TypeExpr.FLOAT_);
    // 'transBlock' connects to 'exp2.'
    exp2.connect(transBlock.outputConnection);
    assertEquals(referenceTypExpr.deref().label, Blockly.TypeExpr.FLOAT_);
    assertEquals(letValue.getTypeExpr().deref().label, Blockly.TypeExpr.FLOAT_);
    assertEquals(letBlock.getInput('EXP2').connection.typeExpr.deref().label,
        Blockly.TypeExpr.FLOAT_);
    // Variables on 'transBlock' are not bound in its context, but
    // disconnecting it from 'exp2' input is allowed for now.
    assertFalse(transBlock.resolveReference(null));
    assertTrue(transBlock.resolveReference(exp2));
    exp2.disconnect();

    assertEquals(referenceTypExpr.deref().label, Blockly.TypeExpr.FLOAT_);
    assertEquals(letValue.getTypeExpr().deref().label, Blockly.TypeExpr.FLOAT_);

    transBlock = virtually_transfer_workspace(transBlock,
        workbench.getWorkspace());
    referenceBlockWB = transBlock.getInputTargetBlock('A');
    referenceBlockWB.outputConnection.disconnect();
    referenceTypExpr = getVariable(referenceBlockWB).getTypeExpr();
    assertNotEquals(referenceTypExpr.deref(), letValue.getTypeExpr());
    assertEquals(referenceTypExpr.deref(), letValue.getTypeExpr().deref());

    var list = workbench.getWorkspace().newBlock('lists_create_with_typed');
    var add0 = list.getInput('ADD0').connection;
    assertTrue(referenceBlockWB.resolveReference(add0));
    add0.connect(referenceBlockWB.outputConnection);

    assertTrue(referenceBlockWB.resolveReference(exp2));

    function check(oldBlock, newBlock) {
      // Type expressions in the oldBlock have been removed.
      assertNull(oldBlock.outputConnection.typeExpr);
      assertNull(oldBlock.getInput('ADD0').connection.typeExpr);
      assertNull(oldBlock.getInput('ADD1').connection.typeExpr);
      assertNull(oldBlock.getInput('ADD2').connection.typeExpr);
    }

    var transBlock = virtually_transfer_workspace(list, workspace,
        list.outputConnection, exp2, check);
    exp2.connect(transBlock.outputConnection);
  } finally {
    if (workbench) {
      workbench.dispose();
    }
    workspace.dispose();
  }
}

function test_type_transfer_block_workspace_NestedReferenceBlockInExp2() {
  var workspace = create_typed_workspace();
  var otherWorkspace = create_typed_workspace();
  try {
    var letBlock = workspace.newBlock('let_typed');
    var intArith = workspace.newBlock('int_arithmetic_typed');
    var varBlock = workspace.newBlock('variables_get_typed');
    setVariableName(letBlock, 'x');
    setVariableName(varBlock, 'x');
    letBlock.getInput('EXP2').connection.connect(intArith.outputConnection);
    intArith.getInput('A').connection.connect(varBlock.outputConnection);
    var transBlock = virtually_transfer_workspace(letBlock, otherWorkspace);
  } finally {
    workspace.dispose();
    otherWorkspace.dispose();
  }
}

function test_type_transfer_block_workspace_fixedWorkbenchDeleted() {
  var workspace = create_typed_workspace();
  var workbench1, workbench2;
  try {
    var letBlock1 = workspace.newBlock('let_typed');
    var letValue = getVariable(letBlock1);
    setVariableName(letBlock1, 'x');
    workbench1 = create_mock_workbench(letBlock1);
    var blocks = getFlyoutBlocksFromWorkbench(workbench1);
    assertEquals(blocks.length, 1);
    var referenceBlockWB = blocks[0];
    var listBlockWB = workbench1.getWorkspace().newBlock('lists_create_with_typed');
    var boolBlockWB = workbench1.getWorkspace().newBlock('logic_boolean_typed');
    listBlockWB.getInput('ADD0').connection.connect(
        referenceBlockWB.outputConnection);
    listBlockWB.getInput('ADD1').connection.connect(
        boolBlockWB.outputConnection);
    assertEquals(letValue.getTypeExpr().deref().label, Blockly.TypeExpr.BOOL_);

    var exp2 = letBlock1.getInput('EXP2').connection;
    var listTrans = virtually_transfer_workspace(listBlockWB, workspace,
        listBlockWB.outputConnection, exp2);
    exp2.connect(listTrans.outputConnection);
    assertEquals(letValue.getTypeExpr().deref().label, Blockly.TypeExpr.BOOL_);

    var listTrans2 = virtually_transfer_workspace(listTrans,
        workbench1.getWorkspace());
    assertEquals(letValue.getTypeExpr().deref().label, Blockly.TypeExpr.BOOL_);

    //workbench1.dispose();
    //workbench1 = null;
    var letBlock2 = workspace.newBlock('let_typed');
    workbench2 = create_mock_workbench(letBlock2);

    assertTrue(letBlock1.resolveReference(null));
    var originalWB1 = workbench1.getWorkspace();
    var letTrans = virtually_transfer_workspace(letBlock1,
        workbench2.getWorkspace());
    assertNotEquals(workbench1, letTrans.workbenches[0]);
    assertEquals(originalWB1, letTrans.workbenches[0].getWorkspace());

    var letValueTrans = getVariable(letTrans);
    assertEquals(letValueTrans.getTypeExpr().deref().label,
        Blockly.TypeExpr.BOOL_);
  } finally {
    if (workbench1) {
      workbench1.dispose();
    }
    if (workbench2) {
      workbench2.dispose();
    }
    workspace.dispose();
  }
}

function test_type_transfer_block_workspace_NestedWorkbenchTransferring() {
  var workspace = create_typed_workspace();
  var workbench, nestedWorkbench;
  try {
    var letBlock = workspace.newBlock('let_typed');
    var letValueX = getVariable(letBlock);
    setVariableName(letBlock, 'x');
    workbench = create_mock_workbench(letBlock);
    var blocks = getFlyoutBlocksFromWorkbench(workbench);
    assertEquals(blocks.length, 1);
    var referenceBlockX = blocks[0];

    var letBlockWB = workbench.getWorkspace().newBlock('let_typed');
    var letValueY = getVariable(letBlockWB);
    setVariableName(letBlockWB, 'y');
    nestedWorkbench = create_mock_workbench(letBlockWB);
    var blocks = getFlyoutBlocksFromWorkbench(nestedWorkbench);
    assertEquals(blocks.length, 2);
    var referenceBlockY = blocks[0];
    var referenceY = getVariable(referenceBlockY);
    // workbench.getFlyoutLanguageTree_() does not guarantee any order. If
    // they seems to have been swapped, just swap them.
    if (referenceY.getVariableName() === 'x') {
      referenceBlockY = blocks[1];
      referenceY = getVariable(referenceBlockY);
    }

    var intArith = nestedWorkbench.getWorkspace().newBlock(
        'int_arithmetic_typed');
    intArith.getInput('A').connection.connect(
        referenceBlockY.outputConnection);
    assertEquals(referenceY.getTypeExpr().deref().label,
        Blockly.TypeExpr.INT_);
    assertEquals(letValueY.getTypeExpr().deref().label,
        Blockly.TypeExpr.INT_);

    //           |             |_  [x]  [<[y]> + <>]
    //           |               |/------------------
    //           |_  [let y = <> in <>]  /
    //             |/------------------
    // [let x = <> in <>]

    // Can not move the let-y block to the out-most workspace because it
    // contain a reference block to the variable named 'x.' Move the
    // reference block first.
    assertFalse(letBlockWB.resolveReference(null, false, workspace));
    var blockX = blocks[0] == referenceBlockY ? blocks[1] : blocks[0];
    virtually_transfer_workspace(blockX, workbench.getWorkspace());
    assertTrue(letBlockWB.resolveReference(null, false, workspace));

    var transBlock = virtually_transfer_workspace(letBlockWB, workspace);
    var transLetValueY = getVariable(transBlock);
    assertEquals(referenceY.getBoundValue(), transLetValueY);
    assertTrue(referenceY.getTypeExpr().deref().isInt());
    assertTrue(transLetValueY.getTypeExpr().deref().isInt());
    assertEquals(referenceY.getTypeExpr().deref().label,
        Blockly.TypeExpr.INT_);
    assertEquals(transLetValueY.getTypeExpr().deref().label,
        Blockly.TypeExpr.INT_);
  } finally {
    if (nestedWorkbench) {
      nestedWorkbench.dispose();
    }
    if (workbench) {
      workbench.dispose();
    }
    workspace.dispose();
  }
}

function test_type_transfer_block_workspace_workbenchHoldUnResolvedVariables() {
  var workspace = create_typed_workspace();
  var workbench1, workbench2;
  try {
    var letBlockX = workspace.newBlock('let_typed');
    var letValueX = getVariable(letBlockX);
    setVariableName(letBlockX, 'x');
    workbench1 = create_mock_workbench(letBlockX);
    var blocks = getFlyoutBlocksFromWorkbench(workbench1);
    assertEquals(blocks.length, 1);
    var referenceBlockX = blocks[0];

    var letBlockY = workspace.newBlock('let_typed');
    var letValueY = getVariable(letBlockY);
    setVariableName(letBlockY, 'y');
    workbench2 = create_mock_workbench(letBlockY);
    var blocks = getFlyoutBlocksFromWorkbench(workbench2,
        workbench2.getWorkspace());
    assertEquals(blocks.length, 1);
    var referenceBlockY = blocks[0];

    letBlockX.getInput('EXP2').connection.connect(letBlockY.outputConnection);
    var transBlockX = virtually_transfer_workspace(referenceBlockX,
        workbench2.getWorkspace());
    assertEquals(transBlockX.outputConnection.typeExpr.deref(),
        letValueX.getTypeExpr().deref());
    //                  |_  [ <[x]> + <[y]> ]  /
    //                    |/------------------
    // [let x = <> in <[let y = <> in <>]>]
    var intArith = workbench2.getWorkspace().newBlock('int_arithmetic_typed');
    intArith.getInput('A').connection.connect(transBlockX.outputConnection);
    intArith.getInput('B').connection.connect(referenceBlockY.outputConnection);
    assertEquals(Blockly.TypeExpr.INT_,
        getVariable(referenceBlockY).getTypeExpr().deref().label);

    var exp1 = letBlockX.getInput('EXP1').connection;
    var originalWBWrokspace = letBlockY.workbenches[0].getWorkspace();
    assertFalse(letBlockY.resolveReference(null));
    assertFalse(letBlockY.resolveReference(exp1));

    transBlockX.dispose();
    assertEquals(Blockly.TypeExpr.INT_,
        getVariable(referenceBlockY).getTypeExpr().deref().label);

    assertTrue(letBlockY.resolveReference(exp1));
    var transLetBlockY = virtually_transfer_workspace(letBlockY, workspace,
        letBlockY.outputConnection, exp1);
    transLetBlockY.outputConnection.connect(exp1);

    //           |_  [ <> + <[y]> ]  /
    //             |/------------------
    // [let x = <[let y = <> in <>]> in <[x]>]
    assertNull(letBlockY.workbenches[0].getWorkspace());
    assertEquals(transLetBlockY.workbenches[0].getWorkspace(), originalWBWrokspace);
    assertTrue(intArith.resolveReference(null));
    assertEquals(Blockly.TypeExpr.INT_,
        getVariable(referenceBlockY).getTypeExpr().deref().label);
    assertEquals(Blockly.TypeExpr.INT_,
        transLetBlockY.getInput('EXP1').connection.typeExpr.deref().label);
  } finally {
    if (workbench2) {
      workbench2.dispose();
    }
    if (workbench1) {
      workbench1.dispose();
    }
    workspace.dispose();
  }
}

function test_type_transfer_block_workspace_fieldTypeExprReplaced() {
  var workspace = create_typed_workspace();
  var otherWorkspace = create_typed_workspace();
  try {
    var originalLetBlock = workspace.newBlock('let_typed');
    var originalValueType = getVariable(originalLetBlock).getTypeExpr();
    var originalExp1Type = originalLetBlock.getInput('EXP1').connection.typeExpr;
    var originalExp2Type = originalLetBlock.getInput('EXP2').connection.typeExpr;

    var transBlock = repeat_transfer_workspace(originalLetBlock,
        otherWorkspace, 10);
    var newValueType = getVariable(transBlock).getTypeExpr();
    var newExp1Type = transBlock.getInput('EXP1').connection.typeExpr;
    var newExp2Type = transBlock.getInput('EXP2').connection.typeExpr;

    assertEquals(originalExp1Type, newExp1Type);
    assertEquals(originalExp2Type, newExp2Type);
    assertNull(newExp1Type.val);
    assertNull(newExp2Type.val);
    assertTrue(newValueType.occur(newExp1Type.name));
    assertEquals(newValueType.val, newExp1Type);
  } finally {
    workspace.dispose();
    otherWorkspace.dispose();
  }
}

function test_type_transfer_block_workspace_lambdaBlockTransferManyTimes() {
  var workspace = create_typed_workspace();
  var otherWorkspace = create_typed_workspace();
  try {
    var originalLambdaBlock = workspace.newBlock('lambda_typed');
    var originalValueType = getVariable(originalLambdaBlock).getTypeExpr();

    function checkScheme(scheme) {
      assertNotNull(scheme);
      assertEquals(scheme.names.length, 0);
      assertEquals(scheme.type.label, Blockly.TypeExpr.TVAR_);
      assertEquals(scheme.type.name, originalValueType.name);

      var inst = scheme.instantiate();
      assertEquals(inst.label, Blockly.TypeExpr.TVAR_);
      assertEquals(inst.val, null);
      assertEquals(inst, originalValueType);
    }
    var scheme = originalLambdaBlock.getTypeScheme('VAR');
    checkScheme(scheme);

    var transBlock = repeat_transfer_workspace(originalLambdaBlock,
        otherWorkspace, 10);
    var newValueType = getVariable(transBlock).getTypeExpr();
    assertEquals(originalValueType, newValueType);
    var scheme = transBlock.getTypeScheme('VAR');
    checkScheme(scheme);
  } finally {
    workspace.dispose();
    otherWorkspace.dispose();
  }
}
