'use strict';

function create_dummy_workspace(parentWs) {
  var options = {parentWorkspace: parentWs ? parentWs : null};
  var workspace = {id: Blockly.utils.genUid(), options};
  Blockly.WorkspaceTree.add(workspace);
  return workspace;
}

function create_dummy_block(workspace, childBlocks) {
  return {
    workspace: workspace,
    getDescendants: function() {
      return Blockly.Block.prototype.getDescendants.call(this);
    },
    getChildren: function() {
      return childBlocks;
    },
    getAllMutators: function() {
      return Blockly.Block.prototype.getAllMutators.call(this);
    }
  };
}

function create_dummy_workbench(block) {
  var workspace = create_dummy_workspace(block.workspace);
  var workbench = {
    getWorkspace: function() {return workspace;}
  };
  block.mutator = workbench;
  return workbench;
}

function isSameSet(arr1, arr2) {
  if (arr1.length != arr2.length) {
    return false;
  }
  var checked = [];
  for (var i = 0, x; x = arr1[i]; i++) {
    var index = arr2.indexOf(x);
    if (index == -1) {
      return false;
    } else if (checked[index]) {
      return false;
    }
    checked[index] = true;
  }
  return true;
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

function test_type_workspace_tree_getFamily() {
  var ws1 = create_dummy_workspace();
  var ws2 = create_dummy_workspace(ws1);
  var ws3 = create_dummy_workspace(ws1);
  var ws4 = create_dummy_workspace(ws3);

  assertEquals(Blockly.WorkspaceTree.getFamily(ws1).length, 4);
  assertEquals(Blockly.WorkspaceTree.getFamily(ws2).length, 4);
  assertEquals(Blockly.WorkspaceTree.getFamily(ws3).length, 4);
  assertEquals(Blockly.WorkspaceTree.getFamily(ws4).length, 4);

  ws4.options.parentWorkspace = ws1;
  assertEquals(Blockly.WorkspaceTree.getFamily(ws4).length, 1);
  assertEquals(Blockly.WorkspaceTree.getFamily(ws4)[0], ws4);

  ws4.options.parentWorkspace = ws3;
  Blockly.WorkspaceTree.remove(ws4);
  ws4.options.parentWorkspace = ws1;
  Blockly.WorkspaceTree.add(ws4);

  var node4 = Blockly.WorkspaceTree.find(ws4.id);
  assertEquals(Blockly.WorkspaceTree.getFamily(ws4).length, 4);
  assertEquals(node4.getParent_().workspace, ws1);

  Blockly.WorkspaceTree.remove(ws1);
  assertEquals(Blockly.WorkspaceTree.getFamily(ws1).length, 0);
}

function test_type_workspace_tree_getParentBefore() {
  var ws1 = create_dummy_workspace();
  var ws2 = create_dummy_workspace(ws1);
  var ws3 = create_dummy_workspace(ws1);
  var ws4 = create_dummy_workspace(ws3);
  var ws5 = create_dummy_workspace(ws4);

  assertEquals(Blockly.WorkspaceTree.parentBefore(ws5, ws1), ws3);
  assertEquals(Blockly.WorkspaceTree.parentBefore(ws5, ws2), null);
  assertEquals(Blockly.WorkspaceTree.parentBefore(ws4, ws3), ws4);
  assertEquals(Blockly.WorkspaceTree.parentBefore(ws3, ws2), null);
  assertEquals(Blockly.WorkspaceTree.parentBefore(ws4, ws4), null);
  assertEquals(Blockly.WorkspaceTree.parentBefore(ws1, ws5), null);
  assertEquals(Blockly.WorkspaceTree.parentBefore(ws2, ws2), null);

  assertEquals(Blockly.WorkspaceTree.parentBefore(ws5, ws3), ws4);
  var node4 = Blockly.WorkspaceTree.find(ws4.id);
  delete node4.children[ws5.id];
  assertEquals(Blockly.WorkspaceTree.parentBefore(ws5, ws3), null);

  assertEquals(Blockly.WorkspaceTree.parentBefore(ws2, ws1), ws2);
  ws2.options.parentWorkspace = null;
  assertEquals(Blockly.WorkspaceTree.parentBefore(ws2, ws1), null);
}

function test_type_workspace_tree_getMutatorsUnderBlock() {
  var ws1 = create_dummy_workspace();
  var ws2 = create_dummy_workspace(ws1);
  var b1 = create_dummy_block(ws2, []);
  var b2 = create_dummy_block(ws2, [b1]);
  var b3 = create_dummy_block(ws2, [b2]);
  var wb_b1 = create_dummy_workbench(b1);
  var wb_b3 = create_dummy_workbench(b3);

  var ws3 = create_dummy_workspace(ws1);
  var b4 = create_dummy_block(ws3, []);
  var wb_b4 = create_dummy_workbench(b4);

  var ws4 = create_dummy_workspace(ws3);
  var b5 = create_dummy_block(ws4, []);
  var b6 = create_dummy_block(ws4, [b5]);
  var wb_b6 = create_dummy_workbench(b6);
  var b7 = create_dummy_block(wb_b6.getWorkspace(), []);
  var wb_b7 = create_dummy_workbench(b7);

  var ws5 = create_dummy_workspace(ws4);
  var b8 = create_dummy_block(ws5, []);
  var wb_b8 = create_dummy_workbench(b8);

  var ms = Blockly.WorkspaceTree.getChildrenUnderBlock(b1);
  assertTrue(isSameSetHelp(ms, [wb_b1]));

  ms = Blockly.WorkspaceTree.getChildrenUnderBlock(b2);
  assertTrue(isSameSetHelp(ms, [wb_b1]));

  ms = Blockly.WorkspaceTree.getChildrenUnderBlock(b3);
  assertTrue(isSameSetHelp(ms, [wb_b1, wb_b3]));

  ms = Blockly.WorkspaceTree.getChildrenUnderBlock(b4);
  assertTrue(isSameSetHelp(ms, [wb_b4]));

  ms = Blockly.WorkspaceTree.getChildrenUnderBlock(b5);
  assertTrue(isSameSetHelp(ms, []));

  ms = Blockly.WorkspaceTree.getChildrenUnderBlock(b6);
  assertTrue(isSameSetHelp(ms, [wb_b6, wb_b7]));

  ms = Blockly.WorkspaceTree.getChildrenUnderBlock(b7);
  assertTrue(isSameSetHelp(ms, [wb_b7]));

  ms = Blockly.WorkspaceTree.getChildrenUnderBlock(b8);
  assertTrue(isSameSetHelp(ms, [wb_b8]));

  function isSameSetHelp(arr1, arr2) {
    var arr2 = goog.array.map(arr2, function(m) {return m.getWorkspace();});
    return isSameSet(arr1, arr2);
  }
}
