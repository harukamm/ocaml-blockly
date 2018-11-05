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
 * @param {!Blockly.TypeExpr} valueTypeExpr The type for the value.
 * @param {string} fieldName The name of the variable field.
 * @param {string} scopeInputName The name of input on which the variable value
 *     is visible.
 * @param {!string} variableName The default name of this variable value.
 */
Blockly.BoundVariables.createValue = function(block, valueTypeExpr, fieldName,
      scopeInputName, variableName) {
  // The value would be added to the reference DB of block's workspace in
  // the constructor.
  return new Blockly.BoundVariableValue(block, valueTypeExpr, fieldName,
      scopeInputName, variableName);
};

/**
 * Adds a value to the list of values.
 * @param {!Blockly.Workspace} workspace The workspace to add the value to.
 * @param {!Blockly.BoundVariableValue}
 */
Blockly.BoundVariables.addValue = function(workspace, value) {
  var id = value.getId();
  var valueDB = workspace.getValueDB();

  if (valueDB[id]) {
    throw 'The value already exists in DB.';
  }
  valueDB[id] = value;
};

/**
 * Remove a value from the list of values.
 * @param {!Blockly.Workspace} workspace The workspace to remove the value
 *     from.
 * @param {!Blockly.BoundVariableValue}
 */
Blockly.BoundVariables.removeValue = function(workspace, value) {
  var id = value.getId();
  var valueDB = workspace.getValueDB();

  if (!valueDB[id]) {
    throw 'The value doesn\'t exist in DB.';
  }
  delete valueDB[id];
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
 * @param {!string} name The default variable name.
 */
Blockly.BoundVariables.createReference = function(block, name) {
  // The reference would be added to the reference DB of block's workspace in
  // the constructor.
  return new Blockly.BoundVariableValueReference(block, name);
};

/**
 * Look up the reference on the workspace of the given block, or create a
 * variable reference on the block.
 * @param {!Block.Block} block The block to search for the reference.
 * @param {!string} name The default variable name.
 * @param {string} opt_id The ID to use to look up.
 */
Blockly.BoundVariables.getOrCreateReference = function(block, name, opt_id) {
  var variable = Blockly.BoundVariables.getReferenceById(block.workspace,
      opt_id);
  if (!variable) {
    variable = Blockly.BoundVariables.createReference(block, name);
  }
  return variable;
};

/**
 * Add the reference to the given workspace.
 * @param {!Blockly.Workspace} workspce The workspace to add the reference to.
 * @param {!Blockly.BoundVariableValueReference} The reference to add.
 */
Blockly.BoundVariables.addReference = function(workspace, reference) {
  var id = reference.getId();
  var referenceDB = workspace.getReferenceDB();

  if (referenceDB[id]) {
    throw 'The reference ID already exists in the DB.';
  }
  referenceDB[id] = reference;
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

  if (!referenceDB[id]) {
    throw 'The reference doesn\'t exist in DB.';
  }
  delete referenceDB[id];
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
