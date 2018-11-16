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

function create_typed_workbench(parentWorkspace) {
  var workspaceOptions = {
    typedVersion: true,
    parentWorkspace: parentWorkspace
  };
  var workspace = new Blockly.Workspace(workspaceOptions);
  workspace.isMutator = true;
  return workspace;
}

function virtually_set_mutator(block, mutatorWorkspace) {
  mutatorWorkspace.isMutator = true;
  var getter = function() {
    return this;
  };
  block.mutator = {
    getWorkspace: getter.bind(mutatorWorkspace)
  };
}

/* End functions for workbenches. */

/**
 * Transfer block's workspace to the given workspace in the same way as
 * placeNewBlock() in Blockly.WorkspaceTransferManager.
 */
function virtually_transfer_workspace(oldBlock, targetWorkspace,
    opt_testDuringTransferring) {
  assertTrue(!Blockly.transferring);
  Blockly.transferring = oldBlock;

  try {
    var xml = Blockly.Xml.blockToDom(oldBlock);
    var newBlock = Blockly.Xml.domToBlock(xml, targetWorkspace);
    newBlock.replaceTypeExprWith(oldBlock);
    if (goog.isFunction(opt_testDuringTransferring)) {
      opt_testDuringTransferring();
    }
  } finally {
    Blockly.transferring = null;
  }

  Blockly.Events.disable();
  try {
    oldBlock.dispose();
  } finally {
    Blockly.Events.enable();
  }
  return newBlock;
}
