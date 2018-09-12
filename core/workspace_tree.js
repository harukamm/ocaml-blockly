'use strict';

goog.provide('Blockly.WorkspaceTree');

Blockly.WorkspaceTree = function(workspace) {
  this.workspace = workspace;
  this.children = Object.create(null);
};

Blockly.WorkspaceTree.Root = new Blockly.WorkspaceTree(null);

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
};

/**
 * Find the node of the given id from the root tree.
 * @param {!string} id The id of workspace to find.
 * @return {Blockly.WorkspaceTree}
 */
Blockly.WorkspaceTree.find = function(id) {
  var staq = [Blockly.WorkspaceTree.Root];
  while (staq.length) {
    var node = staq.pop();
    if (id in node.children) {
      return node.children[id];
    }
    var ids = Object.keys(node.children);
    for (var i = 0, childId; childId = ids[i]; i++) {
      staq.push(node.children[childId]);
    }
  }
  return null;
};

/**
 * Remove the workspace from the root of workspace tree.
 * @param {!Blockly.Workspace} workspace The workspace to delete.
 */
Blockly.WorkspaceTree.remove = function(workspace) {
  var staq = [Blockly.WorkspaceTree.Root];
  var id = workspace.id;
  while (staq.length) {
    var node = staq.pop();
    if (id in node.children) {
      delete node.children[id];
    }
    var ids = Object.keys(node.children);
    for (var i = 0, childId; childId = ids[i]; i++) {
      staq.push(node.children[childId]);
    }
  }
};
