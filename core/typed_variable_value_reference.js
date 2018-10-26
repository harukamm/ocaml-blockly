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
   * Temporary display name while this reference is not resolved. Otherwise the
   * variable's name is used as display name instead. These two names are
   * required to be identical just when the reference is resolved.
   * @type {string}
   */
  this.temporayDisplayName_ = 'hoge';

  /**
   * This reference's block.
   * @type {!Blockly.Block}
   */
  this.block_ = block;
};

/**
 * Gets the display name for this reference.
 */
Blockly.TypedVariableValueReference.prototype.getDisplayName = function() {
  return this.value_ ? this.value_.getName() : this.temporayDisplayName_;
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
  if (this.value_.getName() !== this.temporayDisplayName_) {
    throw 'Names are not identical.';
  }
  this.value_ = value;
  value.storeReference(this);

  this.block_.referenceChanged();
};

/**
 * Dispose of this reference.
 */
Blockly.TypedVariableValueReference.prototype.dispose = function() {
  this.block_.valueReference = null;
  this.block_ = null;
  this.value_ = null;
};
