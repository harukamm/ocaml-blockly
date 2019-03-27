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

function getVariableFieldName(block, opt_n) {
  switch (block.type) {
    case 'let_typed':
    case 'letrec_typed':
    case 'letstatement_typed':
    case 'lambda_typed':
    case 'variables_get_typed':
    case 'function_app_typed':
      return 'VAR';
    case 'defined_recordtype_typed':
      return 'DATANAME';
    case 'defined_datatype_typed':
      goog.asserts.assert(goog.isNumber(opt_n));
      return 'CTR' + opt_n;
    case 'create_construct_typed':
      return 'CONSTRUCTOR';
    default:
      assertTrue(false, 'Unexpected case.');
  }
}

function getVariableField(block, opt_n) {
  var fieldName = getVariableFieldName(block, opt_n);
  return block.getField(fieldName);
}

function getVariable(block, opt_n) {
  var field = getVariableField(block, opt_n);
  return field.getVariable();
}

function getVariableName(block, opt_n) {
  var field = getVariableField(block, opt_n);
  return field.getVariable().getVariableName();
}

function isOfBoundVariable(referenceBlock, valueBlock) {
  var reference = getVariable(referenceBlock);
  var value = getVariable(valueBlock);
  return reference.getBoundValue() == value;
}

function isVariableOf(varBlock, block, opt_variableName) {
  var name1 = getVariableName(varBlock);
  var name2 = getVariableName(block);
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

function createReferenceBlock(value, useAppBlock, opt_workspace) {
  var workspace = opt_workspace ? opt_workspace : value.getWorkspace();
  if (value.isConstructor()) {
    var prototypeName = 'create_construct_typed';
    assertTrue(!useAppBlock);
    var block = workspace.newBlock(prototypeName);
    var ref = block.getField('CONSTRUCTOR').getVariable();
  } else if (value.isRecord()) {
    var prototypeName = 'create_record_typed';
    assertTrue(!useAppBlock);
    var block = workspace.newBlock(prototypeName);
    var ref = block.getField('RECORD').getVariable();
  } else {
    var prototypeName = useAppBlock ? 'function_app_typed' :
      'variables_get_typed';
    var block = workspace.newBlock(prototypeName);
    var ref = block.typedReference['VAR'];
  }
  ref.setVariableName(value.getVariableName());
  ref.setBoundValue(value);
  return block;
}

function assertStructureInputSize(block, size) {
  switch (block.type) {
    case 'create_construct_typed':
      var filtered = goog.array.filter(block.inputList, function(inp) {
          return inp.name.match(/PARAM\d+/);});
      break;
    case 'create_record_typed':
      var filtered = goog.array.filter(block.inputList, function(inp) {
          return inp.name.match(/FIELD_INP\d+/);});
      break;
    default:
      assertTrue(false);
  }
  assertEquals(size, filtered.length);
}

function checkValuesPariedWithValueBlocks(values, valueBlocks) {
  assertEquals(values.length, valueBlocks.length);
  var blockValues = goog.array.map(valueBlocks,
      function(block) {return getVariable(block);});
  for (var i = 0, value; value = values[i]; i++) {
    assertNotNull(value);
    var index = blockValues.indexOf(value);
    assertNotEquals(index, -1);
    blockValues.splice(index, 1);
  }
  assertEquals(blockValues.length, 0);
}

function checkBlocksArePaired(valueBlocks, referenceBlocks) {
  assertEquals(valueBlocks.length, referenceBlocks.length);
  var values = goog.array.map(valueBlocks,
      function(block) {return getVariable(block);});
  for (var i = 0, refBlock; refBlock = referenceBlocks[i]; i++) {
    var ref = getVariable(refBlock);
    var value = ref.getBoundValue();
    assertNotNull(value);
    var index = values.indexOf(value);
    assertNotEquals(index, -1);
    values.splice(index, 1);
  }
  assertEquals(values.length, 0);
}

function isSameSet(arr1, arr2) {
  if (arr1.length != arr2.length) {
    return false;
  }
  var checked = [].concat(arr2);
  for (var i = 0, x; x = arr1[i]; i++) {
    var index = checked.indexOf(x);
    if (index == -1) {
      return false;
    } else {
      checked.splice(index, 1);
    }
  }
  assertEquals(checked.length, 0);
  return true;
}

/* End functions for variables. */

/* Begin functions for mutators. */

function create_mock_mutator(block, itemProto) {
  assertTrue(!block.mutator);
  var workspaceOptions = {
    typedVersion: false,
    parentWorkspace: block.workspace
  };
  assertTrue(goog.isFunction(block.decompose));
  assertTrue(goog.isFunction(block.compose));
  assertTrue(goog.isFunction(block.domToMutation));
  var workspace = new Blockly.Workspace(workspaceOptions);
  var mutatorMock = {
    block_: block,
    rootBlock_: block.decompose(workspace),
    workspace_: workspace,
    itemProtoName: itemProto,
    getWorkspace: function() {
      return this.workspace_;
    },
    isWorkbench: function() {
      return false;
    },
    _append: function() {
      var newBlock = this.workspace_.newBlock(itemProto);
      assertNotNull(this.rootBlock_);
      this.rootBlock_.append(newBlock);
    },
    _update: function() {
      if (goog.isFunction(this.block_.wouldChange)) {
        if (this.block_.wouldChange(this.rootBlock_)) {
          this.block_.compose(this.rootBlock_);
        }
      }
    },
    dispose: function() {
      this.block_.mutator = null;
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

  workspace.isMutator = true;
  workspace.ownerMutator_ = mutatorMock;

  return mutatorMock;
}

function disableAllTypeCheck(block) {
  var desc = block.getDescendants();
  for (var i = 0, child; child = desc[i]; i++) {
    var connections = child.getConnections_();
    for (var j = 0, conn; conn = connections[j]; j++) {
      conn.disableTypeCheck(true);
    }
  }
}

function addArguments(letBlock, additionalArgs) {
  assertTrue(letBlock.type === 'let_typed' ||
      letBlock.type === 'letrec_typed');
  if (goog.isString(additionalArgs)) {
    additionalArgs = additionalArgs.split(' ');
  }
  var mutator = create_mock_mutator(letBlock, 'parameters_arg_item');
  var oldArgc = letBlock.argumentCount_;
  for (var i = 0; i < additionalArgs.length; i++) {
    mutator._append();
  }
  mutator._update();
  assertEquals(letBlock.argumentCount_, oldArgc + additionalArgs.length);
  for (var i = 0; i < additionalArgs.length; i++) {
    var argValue = letBlock.typedValue['ARG' + i];
    argValue.setVariableName(additionalArgs[i]);
  }
  mutator.dispose();
}

function createLetBlockWithArguments(workspace, names, recFlag) {
  var nameList = names.split(' ');
  assertTrue(1 <= nameList.length);
  var varName = nameList[0];
  var argumentNames = nameList.splice(1);

  var prototypeName = recFlag ? 'letrec_typed' : 'let_typed';
  var letBlock = workspace.newBlock(prototypeName);
  assertEquals(letBlock.argumentCount_, 0);
  addArguments(letBlock, argumentNames);
  letBlock.typedValue['VAR'].setVariableName(varName);
  return letBlock;
}

/* End functions for mutators. */

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

function create_mock_workbench_impl_(workbenchClass, block, opt_connection) {
  var workspaceOptions = {
    typedVersion: true,
    parentWorkspace: block.workspace
  };
  var workspace = new Blockly.Workspace(workspaceOptions);
  var workbenchMock = {
    block_: block,
    workspace_: workspace,
    flyoutWorkspace_: null,
    contextConnection_: opt_connection || null,
    getWorkspace: function() {
      return this.workspace_;
    },
    getFlyoutWorkspace: function() {
      return this.flyoutWorkspace_ ? this.flyoutWorkspace_ : null;
    },
    isWorkbench: function() {
      return true;
    },
    acceptBlock: function() {
      return true;
    },
    getBlockContext: function() {
      return workbenchClass.prototype.getBlockContext.call(this);
    },
    getContext: function(opt_includeImplicit) {
      return workbenchClass.prototype.getContext.call(this,
          opt_includeImplicit);
    },
    blocksForFlyout_: function(opt_workspace) {
      if (opt_workspace) {
        var workspace = opt_workspace;
      } else {
        if (!this.flyoutWorkspace_) {
          this.flyoutWorkspace_ = create_mock_flyoutWorkspace(this.workspace_);
        }
        var workspace = this.flyoutWorkspace_;
      }
      return workbenchClass.prototype.blocksForFlyout_.call(this, workspace);
    },
    checkReference: function(env, opt_bind) {
      return workbenchClass.prototype.checkReference.call(this, env,
          opt_bind);
    },
    removeChangeListener: function() {},
    adaptWorkspace_: function() {},
    releaseWorkspace: function() {
      workbenchClass.prototype.releaseWorkspace.call(this);
    },
    replaceWorkspace: function(workbench) {
      workbenchClass.prototype.replaceWorkspace.call(this, workbench);
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

  if (opt_connection) {
    opt_connection.contextWorkbench = workbenchMock;
  }
  workspace.isMutator = true;
  workspace.ownerMutator_ = workbenchMock;

  return workbenchMock;
}

function create_mock_workbench(block, opt_inputName) {
  var inputName = opt_inputName ?
      opt_inputName : getDefaultContextInputName(block);
  goog.asserts.assert(inputName);
  var connection = block.getInput(inputName).connection;
  return create_mock_workbench_impl_(Blockly.Workbench, block, connection);
}

function create_mock_pattern_workbench(block) {
  return create_mock_workbench_impl_(Blockly.PatternWorkbench, block, null);
}

function getFlyoutBlocksFromWorkbench(workbench, opt_workspace) {
  var workspace = opt_workspace ? opt_workspace : workbench.getWorkspace();
  return workbench.blocksForFlyout_(workspace);
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
    var pendingTarget = opt_pendingTargetConnection || null;
    if (!newBlock.resolveReference(pendingTarget, true)) {
      throw 'variable couldn\'t be resolved';
    }
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

function connectAsStatements(prev, next) {
  assertEquals(prev.workspace, next.workspace);
  var workspace = prev.workspace;
  function wrapWithStatement(block) {
    assertNotNull(workspace);
    assertNotNull(block.outputConnection);
    var dummyStatement = workspace.newBlock('dummy_statement_typed');
    dummyStatement.getInput('VALUE').connection.connect(
        block.outputConnection, true);
    return dummyStatement;
  }
  if (!prev.nextConnection) {
    prev = wrapWithStatement(prev);
  }
  if (!next.previousConnection) {
    next = wrapWithStatement(next);
  }
  prev.nextConnection.connect(next.previousConnection);
  return prev;
}
