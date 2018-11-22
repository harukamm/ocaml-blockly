'use strict';

function create_dummy_workspace(parentWs) {
  var options = {parentWorkspace: parentWs ? parentWs : null};
  var workspace = {id: Blockly.utils.genUid(), options};
  Blockly.WorkspaceTree.add(workspace);
  return workspace;
}

function test_type_workspace_tree_removeChildren() {
  var ws1 = create_dummy_workspace();
  var ws2 = create_dummy_workspace(ws1);
  var ws3 = create_dummy_workspace(ws1);
  var ws4 = create_dummy_workspace(ws3);

  assertEquals(Blockly.WorkspaceTree.getChildren(ws1).length, 3);
  Blockly.WorkspaceTree.remove(ws3);
  assertEquals(Blockly.WorkspaceTree.getChildren(ws1).length, 1);
  assertFalse(ws4.id in Blockly.WorkspaceTree.NodeMap_);
}
