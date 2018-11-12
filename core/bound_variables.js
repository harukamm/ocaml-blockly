/**
 * @fileoverview Utility functions for variable binding.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

/**
 * @name Blockly.BoundVariables
 * @namespace
 **/
goog.provide('Blockly.BoundVariables');

goog.require('Blockly.BoundVariableValue');
goog.require('Blockly.BoundVariableValueReference');
goog.require('Blockly.Workspace');
goog.require('goog.string');


/**
 * Create a value on the given block.
 * @param {!Blockly.Block} block The block to add the value to.
 * @param {string} fieldName The name of the variable field.
 * @param {!Blockly.TypeExpr} valueTypeExpr The type for the value.
 * @param {string} scopeInputName The name of input on which the variable value
 *     is visible.
 * @param {!string} variableName The default name of this variable value.
 */
Blockly.BoundVariables.createValue = function(block, fieldName, valueTypeExpr,
      scopeInputName, variableName) {
  return new Blockly.BoundVariableValue(block, fieldName, valueTypeExpr,
      scopeInputName, variableName);
};

/**
 * Adds a value to the list of values.
 * @param {!Blockly.Workspace} workspace The workspace to add the value to.
 * @param {!Blockly.BoundVariableValue}
 */
Blockly.BoundVariables.addValue = function(workspace, value) {
  var block = value.getSourceBlock();
  var fieldName = value.getContainerFieldName();

  if (block.typedValue[fieldName] || value.inBlockDB) {
    throw 'The value is already added to the variable map of other block.';
  }
  block.typedValue[fieldName] = value;
  value.inBlockDB = true;

  var id = value.getId();
  var valueDB = workspace.getValueDB();

  if (valueDB[id] || value.inWorkspaceDB) {
    throw 'The value already exists in DB.';
  }
  valueDB[id] = value;
  value.inWorkspaceDB = true;
};

/**
 * Remove a value from the list of values.
 * @param {!Blockly.Workspace} workspace The workspace to remove the value
 *     from.
 * @param {!Blockly.BoundVariableValue}
 */
Blockly.BoundVariables.removeValue = function(workspace, value) {
  var block = value.getSourceBlock();
  var fieldName = value.getContainerFieldName();

  if (value.inBlockDB && !block.typedValue[fieldName]) {
    throw 'The value doesn\'t exist in DB.';
  }
  delete block.typedValue[fieldName];
  value.inBlockDB = false;

  var id = value.getId();
  var valueDB = workspace.getValueDB();

  if (value.inWorkspaceDB && !valueDB[id]) {
    throw 'The value doesn\'t exist in DB.';
  }
  delete valueDB[id];
  value.inWorkspaceDB = false;
};

/**
 * Find the value on workspace workspace with the specified ID.
 * @param {!Blockly.Workspace} workspace The workspace to search for the value.
 * @param {string} id ID of workspace to find.
 * @return {Blockly.BoundVariableValue} The sought after value or null.
 */
Blockly.BoundVariables.getValueById = function(workspace, id) {
  var valueDB = workspace.getValueDB();
  return valueDB[id] || null;
};

/**
 * Create a reference on the given block.
 * @param {!Blockly.Block} block The block to add the reference to.
 * @param {string} fieldName The name of the variable field.
 * @param {!Blockly.TypeExpr} typeExpr The type expression of the variable.
 * @param {!string} name The default variable name.
 */
Blockly.BoundVariables.createReference = function(block, fieldName, typeExpr,
    name) {
  return new Blockly.BoundVariableValueReference(block, fieldName, typeExpr,
    name);
};

/**
 * Add the reference to the given workspace.
 * @param {!Blockly.Workspace} workspce The workspace to add the reference to.
 * @param {!Blockly.BoundVariableValueReference} The reference to add.
 */
Blockly.BoundVariables.addReference = function(workspace, reference) {
  var id = reference.getId();
  var referenceDB = workspace.getReferenceDB();

  if (referenceDB[id] || reference.inWorkspaceDB) {
    throw 'The reference ID already exists in the DB.';
  }
  referenceDB[id] = reference;
  reference.inWorkspaceDB = true;
};

/**
 * Remove the reference with the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace to remove the reference
 *     from.
 * @param {!Blockly.BoundVariableValueReference} The reference to remove.
 */
Blockly.BoundVariables.removeReference = function(workspace, reference) {
  var id = reference.getId();
  var referenceDB = workspace.getReferenceDB();

  if (!referenceDB[id] || !reference.inWorkspaceDB) {
    throw 'The reference doesn\'t exist in DB.';
  }
  delete referenceDB[id];
  reference.inWorkspaceDB = false;
};

/**
 * Look up a reference on the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace to search for the
 *     reference.
 * @param {string} id The ID to use to look up the variable, or null.
 * @return {Blockly.BoundVariableValueReference} The sought after reference or
 *     null.
 */
Blockly.BoundVariables.getReferenceById = function(workspace, id) {
  var referenceDB = workspace.getReferenceDB();
  return referenceDB[id] || null;
};

/**
 * Clear the database of variables on the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace whose variable database
 *     to be cleared.
 */
Blockly.BoundVariables.clearWorkspaceVariableDB = function(workspace) {
  function clearVariableDB(db) {
    var ids = Object.keys(db);
    for (var i = 0, id; id = ids[i]; i++) {
      var variable = db[id];
      if (!variable.inWorkspaceDB) {
        throw 'Invalid status.';
      }
      variable.inWorkspaceDB = false;
      delete db[id];
    }
  }
  var referenceDB = workspace.getReferenceDB();
  var valueDB = workspace.getValueDB();
  clearVariableDB(referenceDB);
  clearVariableDB(valueDB);
};

/**
 * Return a list of variables visible in the scope of the given field.
 * @param {!Blockly.BoundVariableAbstract} variable
 * @return {!Array.<Blockly.BoundVariableValue>} List of variable values which
 *     is visible.
 */
Blockly.BoundVariables.getVisibleVariableValues = function(variable) {
  var field = variable.getContainerField();
  var block = variable.getSourceBlock();
  var targetBlock = block.outputConnection.targetBlock();
  if (!variable.isReference()) {
    throw 'Not support for a variable value.';
  }
  var values = [];
  if (targetBlock) {
    var targetConnection = block.outputConnection.targetConnection;
    var env = targetBlock.allVisibleVariables(targetConnection);
    var names = Object.keys(env);
    for (var i = 0, name; name = names[i]; i++) {
      var variable = env[name];
      values.push(variable);
    }
  }
  return values;
};

/**
 * Helper function for renaming the variable as the given name.
 * @param {Blockly.BoundVariableAbstract} variable The variable to rename.
 * @param {string} newName The new variable name.
 * @return {boolean} True if variable is renamed. Otherwise, false.
 */
Blockly.BoundVariables.renameVariableImpl_ = function(variable, newName) {
  if (!newName) {
    return false;
  }
  // Remove all whitespace.
  newName = newName.replace(/\s/g, '');
  // Check if a string follows the naming convention.
  if (newName.match(/^[a-z_]\w*$/) == null) {
    return false;
  }
  if (variable.isReference()) {
    if (newName === '_') {
      // Can not refer to wildcard.
      return false;
    }
    variable.setVariableName(newName);
  } else {
    if (newName === '_') {
      throw 'Not implemented yet.';
    }
    variable.setVariableName(newName);
  }
  return true;
};

/**
 * Rename the given variable. Open a user prompt dialog to get a new variable
 * name.
 * @param {!Blockly.BoundVariableAbstract} variable The variable to rename.
 */
Blockly.BoundVariables.renameVariable = function(variable) {
  var promptAndCheckWithAlert = function(defaultName) {
    var name = variable.getVariableName();
    var promptText =
        Blockly.Msg['RENAME_VARIABLE_TITLE'].replace('%1', name);
    Blockly.prompt(promptText, defaultName,
        function(newName) {
          if (!newName) {
            // NOP. User canceled prompt.
          } else {
            var changed = Blockly.BoundVariables.renameVariableImpl_(variable,
                newName);
            if (!changed) {
              // TODO: Define the message in the Blockly.Msg class.
              var msg = 'Invalid variable name!';
              Blockly.alert(msg, promptAndCheckWithAlert.bind(null, defaultName));
            }
          }
        });
  };
  promptAndCheckWithAlert('');
};
