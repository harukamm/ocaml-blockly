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
 * @param {?Blockly.TypedVariableValue} value The variable this reference
 *     refers to.
 * @param {!Blockly.Block} block This reference's block.
 * @constructor
 */
Blockly.TypedVariableValueReference = function(value, block) {
  /**
   * The variable this reference refers to, or null if it's not been resolved
   * yet.
   * @type {Blockly.TypedVariableValue}
   * @private
   */
  this.value_ = value ? value : null;

  /**
   * This reference's block.
   * @type {!Blockly.Block}
   */
  this.block_ = block;
};

/**
 * Gets the value this reference refers to.
 * @return {!Blockly.TypedVariableValue} The bound value, or null.
 */
Blockly.TypedVariableValueReference.prototype.getBoundValue = function() {
  return this.value_;
};

/**
 * Sets the value to refer to. Throw an exception if the bound value is already
 * resolved.
 * @param {!Blockly.TypedVariableValue} value The variable to refer to.
 */
Blockly.TypedVariableValueReference.prototype.setBoundValue = function(value) {
  if (this.value_) {
    throw 'The bound value has already been resolved.';
  }
  this.value_ = value;
  this.block_.referenceChanged();
};
