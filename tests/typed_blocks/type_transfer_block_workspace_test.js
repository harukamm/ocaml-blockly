'use strict';

function create_typed_workspace() {
  var workspaceOptions = {
    typedVersion: true
  };
  return new Blockly.Workspace(workspaceOptions);
}

/**
 * Transfer block's workspace to the given workspace in the same way as
 * placeNewBlock() in Blockly.WorkspaceTransferManager.
 */
function virtually_transfer_workspace(oldBlock, targetWorkspace) {
  assertTrue(!Blockly.transferring);
  Blockly.transferring = oldBlock;

  try {
    var xml = Blockly.Xml.blockToDom(oldBlock);
    var newBlock = Blockly.Xml.domToBlock(xml, targetWorkspace);
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
