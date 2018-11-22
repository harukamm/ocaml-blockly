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

function test_type_workspace_tree_getParent() {
  var ws1 = create_dummy_workspace();
  var ws2 = create_dummy_workspace(ws1);
  var ws3 = create_dummy_workspace(ws1);
  var ws4 = create_dummy_workspace(ws3);

  var node1 = Blockly.WorkspaceTree.find(ws1.id);
  assertEquals(node1.getParent_(), null);

  var node2 = Blockly.WorkspaceTree.find(ws2.id);
  assertEquals(node2.getParent_(), node1);

  delete node1.children[ws3.id];
  var node3 = Blockly.WorkspaceTree.find(ws3.id);
  assertEquals(ws3.options.parentWorkspace, ws1);
  assertEquals(node3.getParent_(), null);

  var node4 = Blockly.WorkspaceTree.find(ws4.id);
  ws4.options.parentWorkspace = ws1;
  assertEquals(node4.getParent_(), null);
}
