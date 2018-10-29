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

goog.require('Blockly.Workspace');
goog.require('goog.string');


/**
 * Adds a value to the list of values.
 * @param {!Blockly.Workspace} workspace The workspace to add the value to.
 * @param {!Blockly.TypedVariableValue}
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
 * @param {!Blockly.TypedVariableValue}
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
 * @return {Blockly.TypedVariableValue} The sought after value or null.
 */
Blockly.BoundVariables.getValueById = function(workspace, id) {
  var valueDB = workspace.getValueDB();
  return valueDB[id] || null;
};
