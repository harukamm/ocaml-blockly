'use strict';

function create_typed_workspace() {
  var workspaceOptions = {
    typedVersion: true
  };
  return new Blockly.Workspace(workspaceOptions);
}

function virtually_transfer_workspace(block, targetWorkspace) {
  var xml = Blockly.Xml.blockToDom(block);
  var block = Blockly.Xml.domToBlock(xml, targetWorkspace);
  return block;
}

function test_type_transfer_block_workspace_simpleValueBlock() {
  var workspace = create_typed_workspace();
  var otherWorkspace = create_typed_workspace()
  try {
    var originalBlock = workspace.newBlock('let_typed');
    var transferredBlock = virtually_transfer_workspace(originalBlock,
        otherWorkspace);
    var xml = Blockly.Xml.blockToDom(originalBlock);
    var block = Blockly.Xml.domToBlock(xml, otherWorkspace);
    var value1 = originalBlock.getField('VAR').getVariable();
    var value2 = originalBlock.getField('VAR').getVariable();
    originalBlock.setTransferring(true);
    originalBlock.dispose();
    assertTrue(value1 == value2);
    // The following assertion would fail. The value no longer refers to the
    // block because of originalBlock.dispose().
    assertTrue(value2.getSourceBlock() == block);
  } finally {
    workspace.dispose();
  }
}
