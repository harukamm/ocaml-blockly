'use strict';

function create_typed_workspace() {
  var workspaceOptions = {
    typedVersion: true
  };
  return new Blockly.Workspace(workspaceOptions);
}

function create_typed_workbench(parentWorkspace) {
  var workspaceOptions = {
    typedVersion: true,
    parentWorkspace: parentWorkspace
  };
  var workspace = new Blockly.Workspace(workspaceOptions);
  workspace.isMutator = true;
  return workspace;
}

/**
 * Transfer block's workspace to the given workspace in the same way as
 * placeNewBlock() in Blockly.WorkspaceTransferManager.
 */
function virtually_transfer_workspace(oldBlock, targetWorkspace,
    opt_testDuringTransferring) {
  assertTrue(!Blockly.transferring);
  Blockly.transferring = oldBlock;

  try {
    var xml = Blockly.Xml.blockToDom(oldBlock);
    var newBlock = Blockly.Xml.domToBlock(xml, targetWorkspace);
    if (goog.isFunction(opt_testDuringTransferring)) {
      opt_testDuringTransferring();
    }
  } finally {
    Blockly.transferring = null;
  }

  Blockly.Events.disable();
  try {
    oldBlock.dispose();
  } finally {
    Blockly.Events.enable();
  }
  return newBlock;
}

function virtually_set_mutator(block, mutatorWorkspace) {
  mutatorWorkspace.isMutator = true;
  var getter = function() {
    return this;
  };
  block.mutator = {
    getWorkspace: getter.bind(mutatorWorkspace)
  };
}

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
  var workbench = create_typed_workbench(workspace);
  var nestedWorkbench = create_typed_workbench(workbench);
  var otherWorkspace = create_typed_workspace()
  try {
    var letBlockOnMain = workspace.newBlock('let_typed');
    virtually_set_mutator(letBlockOnMain, workbench);
    var letBlockOnWB = workbench.newBlock('let_typed');
    virtually_set_mutator(letBlockOnWB, nestedWorkbench);

    var varBlock1 = workspace.newBlock('variables_get_typed');
    var varBlock2 = workbench.newBlock('variables_get_typed');
    var varBlock3 = workbench.newBlock('variables_get_typed');
    var varBlock4 = nestedWorkbench.newBlock('variables_get_typed');
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
        testsConditionDuringTransferring);
    var newLetValue = getVariable(newBlock);
    var newVarBlock1 = newBlock.getInputTargetBlock('EXP2');
    assertTrue(newLetValue.referenceCount() == 2);
    assertTrue(getVariable(newVarBlock1).getBoundValue() == newLetValue);
    assertTrue(getVariable(varBlockIsolated).getBoundValue() == newLetValue);

    // otherWorkspace has blocks 'newBlock' and 'newVarBlock1'.
    assertTrue(otherWorkspace.getAllBlocks().length == 2);
    // workspace has a single block 'varBlockIsolated'.
    assertTrue(workspace.getAllBlocks().length == 1);
  } catch(e) {
    console.log(e);
  } finally {
    workspace.dispose();
    workbench.dispose();
    nestedWorkbench.dispose();
    otherWorkspace.dispose();
  }
}
