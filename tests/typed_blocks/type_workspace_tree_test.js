'use strict';

function create_dummy_workspace(parentWs) {
  var options = {parentWorkspace: parentWs ? parentWs : null};
  var workspace = {
    id: Blockly.utils.genUid(),
    options: options,
    dispose: function() {
      Blockly.WorkspaceTree.remove(this);
    }
  };
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
    getAllWorkbenches: function() {
      return Blockly.Block.prototype.getAllWorkbenches.call(this);
    }
  };
}

function create_dummy_workbench(block) {
  var workspace = create_dummy_workspace(block.workspace);
  workspace.isMutator = true;
  var workbench = {
    block_: block,
    workspace_: workspace,
    getWorkspace: function() {
      return this.workspace_;
    },
    adaptWorkspace_: function() {},
    removeChangeListener: function() {},
    releaseWorkspace: function() {
      Blockly.Workbench.prototype.releaseWorkspace.call(this);
    },
    replaceWorkspace: function(workbench) {
      Blockly.Workbench.prototype.replaceWorkspace.call(this, workbench);
    }
  };
  block.workbenches = [workbench];
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

function isSameSetMutator(arr1, arr2) {
  var arr2 = goog.array.map(arr2, function(m) {return m.getWorkspace();});
  return isSameSet(arr1, arr2);
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

function createDummyWorkbenches() {
  var obj = {};
  obj.ws1 = create_dummy_workspace();
  obj.ws2 = create_dummy_workspace(obj.ws1);
  obj.b1 = create_dummy_block(obj.ws2, []);
  obj.b2 = create_dummy_block(obj.ws2, [obj.b1]);
  obj.b3 = create_dummy_block(obj.ws2, [obj.b2]);
  obj.wb_b1 = create_dummy_workbench(obj.b1);
  obj.wb_b3 = create_dummy_workbench(obj.b3);

  obj.ws3 = create_dummy_workspace(obj.ws1);
  obj.b4 = create_dummy_block(obj.ws3, []);
  obj.wb_b4 = create_dummy_workbench(obj.b4);

  obj.ws4 = create_dummy_workspace(obj.ws3);
  obj.b5 = create_dummy_block(obj.ws4, []);
  obj.b6 = create_dummy_block(obj.ws4, [obj.b5]);
  obj.wb_b6 = create_dummy_workbench(obj.b6);
  obj.b7 = create_dummy_block(obj.wb_b6.getWorkspace(), []);
  obj.wb_b7 = create_dummy_workbench(obj.b7);

  obj.ws5 = create_dummy_workspace(obj.ws4);
  obj.b8 = create_dummy_block(obj.ws5, []);
  obj.wb_b8 = create_dummy_workbench(obj.b8);
  return obj;
}

function test_type_workspace_tree_getMutatorsUnderBlock() {
  var obj = createDummyWorkbenches();

  var ms = Blockly.WorkspaceTree.getWorkbenchUnderBlock(obj.b1);
  assertTrue(isSameSetMutator(ms, [obj.wb_b1]));

  ms = Blockly.WorkspaceTree.getWorkbenchUnderBlock(obj.b2);
  assertTrue(isSameSetMutator(ms, [obj.wb_b1]));

  ms = Blockly.WorkspaceTree.getWorkbenchUnderBlock(obj.b3);
  assertTrue(isSameSetMutator(ms, [obj.wb_b1, obj.wb_b3]));

  ms = Blockly.WorkspaceTree.getWorkbenchUnderBlock(obj.b4);
  assertTrue(isSameSetMutator(ms, [obj.wb_b4]));

  ms = Blockly.WorkspaceTree.getWorkbenchUnderBlock(obj.b5);
  assertTrue(isSameSetMutator(ms, []));

  ms = Blockly.WorkspaceTree.getWorkbenchUnderBlock(obj.b6);
  assertTrue(isSameSetMutator(ms, [obj.wb_b6, obj.wb_b7]));

  ms = Blockly.WorkspaceTree.getWorkbenchUnderBlock(obj.b7);
  assertTrue(isSameSetMutator(ms, [obj.wb_b7]));

  ms = Blockly.WorkspaceTree.getWorkbenchUnderBlock(obj.b8);
  assertTrue(isSameSetMutator(ms, [obj.wb_b8]));
}

function test_type_workspace_tree_changeMutatorParent() {
  var obj = createDummyWorkbenches();

  var ws = obj.wb_b8.getWorkspace();
  var node = Blockly.WorkspaceTree.find(ws.id);
  assertEquals(node.getParent_().workspace, obj.ws5);
  obj.wb_b2 = create_dummy_workbench(obj.b2);
  obj.wb_b2.replaceWorkspace(obj.wb_b8);
  assertEquals(node.getParent_().workspace, obj.ws2);
  assertNull(obj.wb_b8.getWorkspace());
  assertEquals(obj.wb_b2.getWorkspace(), ws);

  var ms = Blockly.WorkspaceTree.getWorkbenchUnderBlock(obj.b8);
  assertTrue(isSameSetMutator(ms, []));
  ms = Blockly.WorkspaceTree.getWorkbenchUnderBlock(obj.b2);
  assertTrue(isSameSetMutator(ms, [obj.wb_b1, obj.wb_b2]));
  ms = Blockly.WorkspaceTree.getWorkbenchUnderBlock(obj.b3);
  assertTrue(isSameSetMutator(ms, [obj.wb_b1, obj.wb_b3, obj.wb_b2]));

  ws = obj.wb_b6.getWorkspace();
  node = Blockly.WorkspaceTree.find(ws.id);
  assertEquals(node.getParent_().workspace, obj.ws4);
  obj.wb_b5 = create_dummy_workbench(obj.b5);
  obj.wb_b5.replaceWorkspace(obj.wb_b6);
  assertEquals(node.getParent_().workspace, obj.ws4);
  assertNull(obj.wb_b6.getWorkspace());
  assertEquals(obj.wb_b5.getWorkspace(), ws);

  ms = Blockly.WorkspaceTree.getWorkbenchUnderBlock(obj.b6);
  assertTrue(isSameSetMutator(ms, [obj.wb_b7, obj.wb_b5]));
  ms = Blockly.WorkspaceTree.getWorkbenchUnderBlock(obj.b5);
  assertTrue(isSameSetMutator(ms, [obj.wb_b7, obj.wb_b5]));
}
