/**
 * @fileoverview The class handling a reference to variable declared in blocks.
 * This class is expected to be used in a typedVersion workspace.
 */
'use strict';

goog.provide('Blockly.TypedVariableValueReference');

goog.require('Blockly.TypedVariableValue');
goog.require('goog.string');


/**
 * Class for a reference to variable defined in block.
 * @param {!Blockly.TypedVariableValue} variable The variable this reference
 *     refers to.
 * @constructor
 */
Blockly.TypedVariableValueReference = function(variable) {
  /**
   * The variable this reference refers to.
   * @type {!Blockly.TypedVariableValue}
   */
  this.variable = variable;
};

