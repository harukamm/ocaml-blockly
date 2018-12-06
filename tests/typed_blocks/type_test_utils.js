'use strict';

/**
 * Utility functions for typed block tests.
 */

function create_typed_workspace() {
  var workspaceOptions = {
    typedVersion: true
  };
  return new Blockly.Workspace(workspaceOptions);
}

/* Begin functions for variables. */

function getVariableFieldName(block) {
  switch (block.type) {
    case 'let_typed':
    case 'lambda_typed':
    case 'variables_get_typed':
      return 'VAR';
      break;
    default:
      assertTrue(false, 'Unexpected case.');
  }
}

function getVariableField(block) {
  var fieldName = getVariableFieldName(block);
  return block.getField(fieldName);
}

function getVariable(block) {
  var field = getVariableField(block);
  return field.getVariable();
}

function getVariableFieldDisplayedText(block) {
  var field = getVariableField(block);
  return field.getText();
}

function isOfBoundVariable(referenceBlock, valueBlock) {
  var reference = getVariable(referenceBlock);
  var value = getVariable(valueBlock);
  return reference.getBoundValue() == value;
}

function isVariableOf(varBlock, block, opt_variableName) {
  var name1 = getVariableFieldDisplayedText(varBlock);
  var name2 = getVariableFieldDisplayedText(block);
  var checkType;
  switch (block.type) {
    case 'let_typed':
      checkType = varBlock.outputConnection.typeExpr.deref() ==
          block.getInput('EXP1').connection.typeExpr.deref();
      break;
    case 'lambda_typed':
      checkType = varBlock.outputConnection.typeExpr.deref() ==
          block.outputConnection.typeExpr.arg_type.deref();
      break;
    default:
      return false;
  }
  return checkType && name1 === name2 &&
      (!opt_variableName || opt_variableName === name1);
}

function setVariableName(block, name) {
  var field = getVariableField(block);
  field.setVariableName(name);
}

function getValueScopeInput(block) {
  switch (block.type) {
    case 'let_typed':
      return block.getInput('EXP2');
    case 'lambda_typed':
      return block.getInput('RETURN');
    default:
      assertTrue(false);
  }
}

function createNestedValueBlock(workspace, size, getNthName) {
  var valueBlocks = [];
  for (var i = 0; i < size; i++) {
    var name = getNthName(i);
    if (i % 2 == 0) {
      var block = workspace.newBlock('let_typed');
    } else {
      var block = workspace.newBlock('lambda_typed');
    }
    setVariableName(block, name);
    var previousBlock = valueBlocks[valueBlocks.length - 1];
    if (previousBlock) {
      var input = getValueScopeInput(previousBlock);
      input.connection.connect(block.outputConnection);
    }
    valueBlocks.push(block);
  }
  return valueBlocks;
}

/* End functions for variables. */

/* Begin functions for workbenches. */

function getDefaultContextInputName(block) {
  switch (block.type) {
    case 'let_typed':
      return 'EXP2';
    case 'lambda_typed':
      return 'RETURN';
    default:
      return null;
  }
}

function create_mock_flyoutWorkspace(parentWorkspace) {
  var workspaceOptions = {
    typedVersion: true,
    parentWorkspace: parentWorkspace
  };
  var workspace = new Blockly.Workspace(workspaceOptions);
  workspace.isFlyout = true;
  workspace.newBlockSuper_ = workspace.newBlock;
  workspace.newBlock = function(name) {
    var block = this.newBlockSuper_(name);
    block.isInFlyout = true;
    return block;
  };
  return workspace;
}

function create_mock_workbench(block, opt_inputName) {
  var workspaceOptions = {
    typedVersion: true,
    parentWorkspace: block.workspace
  };
  var inputName = opt_inputName ?
      opt_inputName : getDefaultContextInputName(block);
  goog.asserts.assert(inputName);
  var connection = block.getInput(inputName).connection;
  var workspace = new Blockly.Workspace(workspaceOptions);
  var workbenchMock = {
    block_: block,
    workspace_: workspace,
    flyoutWorkspace_: null,
    contextConnection_: connection,
    getWorkspace: function() {
      return this.workspace_;
    },
    isWorkbench: function() {
      return true;
    },
    getBlockContext: function() {
      return Blockly.Workbench.prototype.getBlockContext.call(this);
    },
    getContext: function() {
      return Blockly.Workbench.prototype.getContext.call(this);
    },
    blocksForFlyout: function(opt_workspace) {
      if (opt_workspace) {
        var workspace = opt_workspace;
      } else {
        if (!this.flyoutWorkspace_) {
          this.flyoutWorkspace_ = create_mock_flyoutWorkspace(this.workspace_);
        }
        var workspace = this.flyoutWorkspace_;
      }
      return Blockly.Workbench.prototype.blocksForFlyout.call(this, workspace);
    },
    getFlyoutLanguageTree_: function() {
      var func = Blockly.Workbench.prototype.getFlyoutLanguageTree_;
      return func.call(this);
    },
    checkReference: function(env) {
      return Blockly.Workbench.prototype.checkReference.call(this, env);
    },
    removeChangeListener: function() {},
    adaptWorkspace_: function() {},
    releaseWorkspace: function() {
      Blockly.Workbench.prototype.releaseWorkspace.call(this);
    },
    replaceWorkspace: function(workbench) {
      Blockly.Workbench.prototype.replaceWorkspace.call(this, workbench);
    },
    dispose: function() {
      this.contextConnection_ = null;
      var removalIndex = this.block_.workbenches.indexOf(this);
      if (removalIndex != -1) {
        this.block_.workbenches.splice(removalIndex, 1);
      }

      this.block_ = null;
      if (this.workspace_) {
        this.workspace_.dispose();
        this.workspace_ = null;
      }
      if (this.flyoutWorkspace_) {
        this.flyoutWorkspace_.dispose();
        this.flyoutWorkspace_ = null;
      }
    }
  };
  if (goog.isArray(block.workbenches)) {
    block.workbenches.push(workbenchMock);
  } else {
    block.workbenches = [workbenchMock];
  }

  workspace.isMutator = true;
  workspace.ownerMutator_ = workbenchMock;

  return workbenchMock;
}

function getFlyoutBlocksFromWorkbench(workbench, opt_workspace) {
  var workspace = opt_workspace ? opt_workspace : workbench.getWorkspace();
  var xml = workbench.getFlyoutLanguageTree_();
  var childNodes = xml.childNodes;
  var blocks = [];
  for (var i = 0; i < childNodes.length; i++) {
    blocks.push(Blockly.Xml.domToBlock(childNodes[i], workspace));
  }
  return blocks;
}

/* End functions for workbenches. */

function create_mock_transfer_manager(block) {
  var manager = {
    topBlock_: block,
    workspace_: block.workspace,
    mainWorkspace_: block.workspace.getMainWorkspace(),
    initAvailableWorkspaces_: function() {
      return Blockly.WorkspaceTransferManager.prototype.initAvailableWorkspaces_.call(
          this);
    },
    allowedToTransferTo_: function(workspace) {
      return Blockly.WorkspaceTransferManager.prototype.allowedToTransferTo_.call(
          this, workspace);
    },
    dispose: function() {
      this.topBlock_ = null;
      this.workspace_ = null;
      this.mainWorkspace_ = null;
    }
  };
  return manager;
}

/**
 * Transfer block's workspace to the given workspace in the same way as
 * placeNewBlock() in Blockly.WorkspaceTransferManager.
 */
function virtually_transfer_workspace(oldBlock, targetWorkspace,
    opt_localConnection, opt_pendingTargetConnection,
    opt_testDuringTransferring) {
  var local = opt_localConnection ? opt_localConnection : null;
  var target = opt_pendingTargetConnection ?
      opt_pendingTargetConnection : null;
  setStartTransferring_(oldBlock, local, target);
  try {
    var xml = Blockly.Xml.blockToDom(oldBlock);
    // Create a new block with disabling type checks.
    var newBlock = Blockly.Xml.domToBlock(xml, targetWorkspace, true);
    newBlock.replaceTypeExprWith(oldBlock);
    mock_replaceWorkbenchWorkspaceWith(newBlock, oldBlock);

    if (goog.isFunction(opt_testDuringTransferring)) {
      opt_testDuringTransferring(oldBlock, newBlock);
    }
    oldBlock.dispose();

    // A new block has been built up and completely taken the place of the
    // old one completely. Finally trigger a type inference and variable
    // resolution to make sure that the block follows the connection rule.
    newBlock.resolveReference(null, true);
    newBlock.updateTypeInference();
  } finally {
    setStartTransferring_(null);
  }

  return newBlock;
}

function setStartTransferring_(block, connection, pendingTargetConnection) {
  Blockly.WorkspaceTransferManager.prototype.setStartTransferring_.call(null,
      block, connection, pendingTargetConnection);
}

function mock_replaceWorkbenchWorkspaceWith(newBlock, oldBlock) {
  var newBlockDesc = newBlock.getDescendants(true);
  var oldBlockDesc = oldBlock.getDescendants(true);
  for (var i = 0, oldChild; oldChild = oldBlockDesc[i]; i++) {
    var newChild = newBlockDesc[i];
    goog.asserts.assert(oldChild.type === newChild.type);
    if (goog.isArray(oldChild.workbenches)) {
      for (var j = 0, workbench; workbench = oldChild.workbenches[j]; j++) {
        var workspace = workbench.getWorkspace();
        var newWorkbench = create_mock_workbench(newChild);
        newWorkbench.replaceWorkspace(workbench);
      }
    }
  }
}

function repeat_transfer_workspace(oldBlock, targetWorkspace, opt_times) {
  var times = opt_times ? opt_times : 5;
  var block = oldBlock;
  var originalWorkspace = oldBlock.workspace;
  for (var i = 0; i < times; i++) {
    block = virtually_transfer_workspace(block, targetWorkspace);
    block = virtually_transfer_workspace(block, originalWorkspace);
  }
  block = virtually_transfer_workspace(block, targetWorkspace);

  return block;
}

function copyAndPasteBlock(block, opt_targetWorkspace) {
  assertTrue(block.isCopyable());

  var xml = Blockly.Xml.blockToDom(block);
  var targetWorkspace = opt_targetWorkspace ?
      opt_targetWorkspace : block.workspace;
  var newBlock = Blockly.Xml.domToBlock(xml, targetWorkspace);
  return newBlock;
}
