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

function create_mock_workbench(block) {
  var workspaceOptions = {
    typedVersion: true,
    parentWorkspace: block.workspace
  };
  goog.asserts.assert(goog.isFunction(block.getWorkbenchContext));
  var workspace = new Blockly.Workspace(workspaceOptions);
  var mutatorMock = {
    block_: block,
    workspace_: workspace,
    getWorkspace: function() {
          return this.workspace_;
        },
    getContext: function() {
          return Blockly.Workbench.prototype.getContext.call(this);
        },
    getFlyoutLanguageTree_: function() {
          var func = Blockly.Workbench.prototype.getFlyoutLanguageTree_;
          return func.call(this);
        },
    dispose: function() {
          this.block_.mutator = null;
          this.block_ = null;
          this.workspace_.dispose();
          this.workspace_ = null;
        }
  };
  block.mutator = mutatorMock;

  workspace.isMutator = true;
  workspace.ownerMutator_ = mutatorMock;

  return mutatorMock;
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
    var newBlock = Blockly.Xml.domToBlock(xml, targetWorkspace);
    newBlock.replaceTypeExprWith(oldBlock);
    if (goog.isFunction(opt_testDuringTransferring)) {
      opt_testDuringTransferring(oldBlock, newBlock);
    }
  } finally {
    setStartTransferring_(null);
  }

  oldBlock.dispose();

  return newBlock;
}

function setStartTransferring_(block, connection, pendingTargetConnection) {
  Blockly.WorkspaceTransferManager.prototype.setStartTransferring_.call(null,
      block, connection, pendingTargetConnection);
}

function storePendingTarget(block, connection, pendingTargetConnection) {
  Blockly.WorkspaceTransferManager.prototype.storePendingTarget_.call(null,
      block, connection, pendingTargetConnection);
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
