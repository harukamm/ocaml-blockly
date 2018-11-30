'use strict';

goog.provide('Blockly.WorkspaceTree');

Blockly.WorkspaceTree = function(workspace) {
  this.workspace = workspace;
  this.children = Object.create(null);
};

Blockly.WorkspaceTree.Root = new Blockly.WorkspaceTree(null);

Blockly.WorkspaceTree.NodeMap_ = Object.create(null);
Blockly.WorkspaceTree.NodeMap_['root'] = Blockly.WorkspaceTree.Root;

/**
 * Return a nested list of ids of workspace that pass the given filtering
 * rules.
 * @param {!Function} pred The function for a filtering rule.
 * @return {!Array} A list containing ids of workspace that pass the rule.
 */
Blockly.WorkspaceTree.filter = function(pred) {
  var lst = Blockly.WorkspaceTree.getChildren({id: 'root'});
  return lst.filter(pred);
};

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
 * Find the workspace with the specified ID.
 * @param {string} id ID of workspace to find.
 * @return {Blockly.Workspace} The founded workspace, or null.
 */
Blockly.WorkspaceTree.findWorkspace = function(id) {
  var node = Blockly.WorkspaceTree.find(id);
  return node ? node.workspace : null;
};

/**
 * Remove the workspace from the root of workspace tree.
 * @param {!Blockly.Workspace} workspace The workspace to delete.
 */
Blockly.WorkspaceTree.remove = function(workspace) {
  var id = workspace.id;
  var node = Blockly.WorkspaceTree.find(id);
  if (node) {
    Blockly.WorkspaceTree.removeNode(node);
  }
};

Blockly.WorkspaceTree.removeNode = function(node) {
  var childIds = Object.keys(node.children);
  for (var i = 0, id; id = childIds[i]; i++) {
    var childNode = node.children[id];
    Blockly.WorkspaceTree.removeNode(childNode);
  }
  var parentNode = node.getParent_();
  var id = node.workspace.id;
  if (parentNode) {
    delete parentNode.children[id];
  }
  delete Blockly.WorkspaceTree.NodeMap_[id];
};

/**
 * Is the workspace is the main one?
 * @param {!Blockly.Workspace} workspace Workspace to test.
 * @return {boolean} True if the workspace is main, false otherwise.
 */
Blockly.WorkspaceTree.isMain = function(workspace) {
  return workspace.id in Blockly.WorkspaceTree.Root.children;
};

/**
 * Return the parent of this node.
 * @return {Blockly.WorkspaceTree} The parent of this node, or null.
 */
Blockly.WorkspaceTree.prototype.getParent_ = function() {
  if (this.workspace.options.parentWorkspace) {
    var parentId = this.workspace.options.parentWorkspace.id;
    var parentNode = Blockly.WorkspaceTree.find(parentId);
    var childId = this.workspace.id;
    if (parentNode && childId in parentNode.children) {
      return parentNode;
    }
  }
  return null;
};

/**
 * Set the parent of this node. If this node already has a parent, remove it
 * first.
 * @param {Blockly.WorkspaceTree|null} newParentNode The parent node for this
 *     node. Null just to remove the current parent node.
 */
Blockly.WorkspaceTree.prototype.setParent_ = function(newParentNode) {
  var parentNode = this.getParent_();
  var id = this.workspace.id;
  if (parentNode) {
    // Remove the current parent node.
    delete parentNode.children[id];
    this.workspace.options.parentWorkspace = null;
  }
  if (newParentNode) {
    newParentNode.children[id] = this;
    this.workspace.options.parentWorkspace = newParentNode.workspace;
  }
};


/**
 * Find the lowest common ancestor between the given 2 nodes.
 * @param {!Blockly.WorkspaceTree} node1
 * @param {!Blockly.WorkspaceTree} node2
 * @return {Blockly.WorkspaceTree} The lowest common ancestor between 2 nodes,
 *     if it exists. Otherwise null.
 */
Blockly.WorkspaceTree.lca_ = function(node1, node2) {
  var visited = Object.create(null);
  while (node1 && node1 != Blockly.WorkspaceTree.Root) {
    visited[node1.workspace.id] = true;
    node1 = node1.getParent_();
  }
  while (node2 && node2 != Blockly.WorkspaceTree.Root) {
    if (node2.workspace.id in visited) {
      return node2;
    }
    node2 = node2.getParent_();
  }
  return null;
};

/**
 * Find the lowest common ancestor between the given 2 workspaces.
 * @param {!Blockly.Workspace} workspace1
 * @param {!Blockly.Workspace} workspace2
 * @return {Blockly.Workspace} The lowest common workspace, or null.
 */
Blockly.WorkspaceTree.lowestCommon = function(workspace1, workspace2) {
  var node1 = Blockly.WorkspaceTree.find(workspace1.id);
  var node2 = Blockly.WorkspaceTree.find(workspace2.id);
  var lca = Blockly.WorkspaceTree.lca_(node1, node2);
  return lca ? lca.workspace : null;
};

/**
 * Return whether the first workspace is a descendant of the second one. If two
 * workspaces are identical, return true.
 * @param {!Blockly.Workspace} childWs
 * @param {!Blockly.Workspace} parentWs
 * @return {boolean} True if the second workspace contains the first one.
 */
Blockly.WorkspaceTree.isDescendant = function(childWs, parentWs) {
  var childNode = Blockly.WorkspaceTree.find(childWs.id);
  var parentNode = Blockly.WorkspaceTree.find(parentWs.id);
  var lca = Blockly.WorkspaceTree.lca_(childNode, parentNode);
  return lca == parentNode;
};

/**
 * Change a parent workspace of the given workspace.
 * @param {!Blockly.Workspace} childWs
 * @param {Blockly.WorkspaceTree|null} newParentNode The parent node for this
 *     node. Null just to remove the current parent node.
 */
Blockly.WorkspaceTree.setParent = function(childWs, parentWs) {
  var childNode = Blockly.WorkspaceTree.find(childWs.id);
  if (parentWs) {
    var parentNode = Blockly.WorkspaceTree.find(parentWs.id);
    childNode.setParent_(parentNode);
  } else {
    childNode.setParent_(null);
  }
};

/**
 * Finds the child workspace of the given parent workspace.
 * @param {!Blockly.Workspace} childWs
 * @param {!Blockly.Workspace} parentWs
 * @return {Blockly.Workspace|null} The workspace, or null.
 */
Blockly.WorkspaceTree.parentBefore = function(childWs, parentWs) {
  var node = Blockly.WorkspaceTree.find(childWs.id);
  while (node) {
    var parentNode = node.getParent_();
    if (parentNode && parentNode.workspace == parentWs) {
      return node.workspace;
    }
    node = parentNode;
  }
  return null;
};

/**
 * Return a list of workspace whose id is in the subtree.
 * @param {!Blockly.Workspace} workspace Workspace to specify the subtree.
 * @retrun {!Array} List of workspace.
 */
Blockly.WorkspaceTree.getChildren = function(workspace) {
  var subtree = Blockly.WorkspaceTree.find(workspace.id);
  var childrenWS = [];
  if (subtree) {
    var staq = [subtree];
    while (staq.length) {
      var n = staq.pop();
      var keys = Object.keys(n.children);
      for (var i = 0, childId; childId = keys[i]; i++) {
        var child = n.children[childId];
        childrenWS.push(child.workspace);
        staq.push(child);
      }
    }
  }
  return childrenWS;
};

/**
 * Return a list of all workspace related to the given workspace. Two workspace
 * is related if they share the same main workspace.
 * @param {!Blockly.Workspace} workspace Workspace whose related workspaces to
 *     get.
 * @return {!Array} List of related workspace.
 */
Blockly.WorkspaceTree.getFamily = function(workspace) {
  var node = Blockly.WorkspaceTree.find(workspace.id);

  // Make sure if the workspace exist in tree. If it doesn't exist, it means
  // that the workspace is already disposed of, so must return an empty array.
  if (node) {
    var prevParent;
    while (node) {
      prevParent = node;
      node = node.getParent_();
    }
    var mainNode = prevParent;
    var mainWorkspace = mainNode.workspace;
    var children = Blockly.WorkspaceTree.getChildren(mainWorkspace);
    return [mainWorkspace].concat(children);
  } else {
    return [];
  }
};

/**
 * Returns the workspace is a mutator the given block or its nested blocks
 * contain directly or indirectly. Would return true if the workspace is a nth
 * level nested mutator of the blocks, for instance.
 * @param {!Blockly.Workspace} workspace The workspace to be checked if it's
 *     held by the blocks.
 * @param {!Blockly.Block} block The block which might contain the mutator
 *     workspace inside.
 * @return {boolean} True if the workspace is held by the block or its nested
 *     blocks.
 */
Blockly.WorkspaceTree.isUnderBlocks = function(workspace, block) {
  var parentBefore = Blockly.WorkspaceTree.parentBefore(workspace,
      block.workspace);
  if (workspace.isMutator && parentBefore) {
    var mutators = block.getAllMutators();
    for (var i = 0, mutator; mutator = mutators[i]; i++) {
      var mutatorWorkspace = mutator ? mutator.getWorkspace() : null;
      if (mutatorWorkspace && mutatorWorkspace == parentBefore) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Get all of mutator workspaces which belong to the given block directly or
 * indirectly.
 * @param {!Blockly.Block} block The block whose mutators to search for.
 * @return {!Array.<!Blockly.Workspace>} A list of mutator workspaces.
 */
Blockly.WorkspaceTree.getChildrenUnderBlock = function(block) {
  var mutatorsOnBlock = block.getAllMutators();
  var children = [];
  for (var i = 0, mutator; mutator = mutatorsOnBlock[i]; i++) {
    var mutatorWorkspace = mutator.getWorkspace();
    if (mutatorWorkspace) {
      children.push(mutatorWorkspace);
      var nested = Blockly.WorkspaceTree.getChildren(mutatorWorkspace);
      // Exclude workspaces in a flyout. Get only mutator workspaces.
      nested = goog.array.filter(nested, function(ws) {return ws.isMutator;});
      Array.prototype.push.apply(children, nested);
    }
  }
  return children;
};
