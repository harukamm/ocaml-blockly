'use strict';

goog.provide('Blockly.WorkspaceTree');

Blockly.WorkspaceTree = function(workspace) {
  this.workspace = workspace;
  this.children = Object.create(null);
};

Blockly.WorkspaceTree.Root = new Blockly.WorkspaceTree(null);

Blockly.WorkspaceTree.NodeMap_ = Object.create(null);

/**
 * Add the workspace to the tree Blockly.WorkspaceTree.Root.
 * @param {!Blockly.Workspace} workspace Workspace to add to the root tree.
 */
Blockly.WorkspaceTree.add = function(workspace) {
  if (workspace.options.parentWorkspace) {
    var parentId = workspace.options.parentWorkspace.id;
    var parentNode = Blockly.WorkspaceTree.find(parentId);
  } else {
    var parentNode = Blockly.WorkspaceTree.Root;
  }
  var newNode = new Blockly.WorkspaceTree(workspace);
  parentNode.children[workspace.id] = newNode;
  Blockly.WorkspaceTree.NodeMap_[workspace.id] = newNode;
};

/**
 * Find the node of the given id from the root tree.
 * @param {!string} id The id of workspace to find.
 * @return {Blockly.WorkspaceTree}
 */
Blockly.WorkspaceTree.find = function(id) {
  if (id in Blockly.WorkspaceTree.NodeMap_) {
    return Blockly.WorkspaceTree.NodeMap_[id];
  }
  return null;
};

/**
 * Remove the workspace from the root of workspace tree.
 * @param {!Blockly.Workspace} workspace The workspace to delete.
 */
Blockly.WorkspaceTree.remove = function(workspace) {
  var id = workspace.id;
  var node = Blockly.WorkspaceTree.find(id);
  if (!node) {
    return;
  }
  delete Blockly.WorkspaceTree.NodeMap_[id];
  var parentNode = node.getParent_();
  if (parentNode) {
    delete parentNode.children[id];
  }
};
