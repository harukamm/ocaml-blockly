'use strict';

function create_typed_workspace() {
  var workspaceOptions = {
    typedVersion: true
  };
  return new Blockly.Workspace(workspaceOptions);
}

function test_type_transfer_block_workspace_simpleValueBlock() {
  var workspace = create_typed_workspace();
  var otherWorkspace = create_typed_workspace()
  try {
    var valueBlock = workspace.newBlock('let_typed');
    var xml = Blockly.Xml.blockToDom(valueBlock);
    var block = Blockly.Xml.domToBlock(xml, otherWorkspace);
    var value1 = valueBlock.getField('VAR').getVariable();
    var value2 = valueBlock.getField('VAR').getVariable();
    valueBlock.dispose();
    assertTrue(value1 == value2);
    // The following assertion would fail. The value no longer refers to the
    // block because of valueBlock.dispose().
    assertTrue(value2.getSourceBlock() == block);
  } finally {
    workspace.dispose();
  }
}
