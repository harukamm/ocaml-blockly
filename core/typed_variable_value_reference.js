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
 * @param {!Blockly.Block} block This reference's block.
 * @param {!string} varName The default name of this reference.
 * @constructor
 */
Blockly.TypedVariableValueReference = function(block, varName) {
  /**
   * The variable this reference refers to, or null if it's not been resolved
   * yet.
   * @type {Blockly.TypedVariableValue}
   * @private
   */
  this.value_ = null;

  /**
   * Temporary display name while this reference is not resolved. Otherwise the
   * variable's name is used as display name instead. These two names are
   * required to be identical just when the reference is resolved.
   * @type {string}
   */
  this.temporayDisplayName_ = varName;

  /**
   * A unique id for the reference.
   * @type {string}
   * @private
   */
  this.id_ = Blockly.utils.genUid();

  /**
   * This reference's block.
   * @type {!Blockly.Block}
   */
  this.block_ = block;

  /**
   * The workspace of this reference's block;
   * @type {!Blockly.Workspace}
   */
  this.workspace_ = this.block_.workspace;

  Blockly.BoundVariables.addReference(this.workspace_, this);
};

/**
 * Gets the variable name for this reference. Returns that of the value if the
 * value has been resolved.
 * @return {string} The display name.
 */
Blockly.TypedVariableValueReference.prototype.getVariableName = function() {
  return this.value_ ? this.value_.getVariableName() : this.temporayDisplayName_;
};

/**
 * Set the variable name for this variable.
 * @param {!string} newName The new name for this variable.
 */
Blockly.TypedVariableValueReference.prototype.setVariableName = function(newName) {
  if (this.value_) {
    if (this.value_.getVariableName() !== newName) {
      this.value_.setVariableName(newName);
      // Rerender the block.
      this.block_.referenceChanged();
    }
  } else if (this.temporayDisplayName_ !== newName) {
    this.temporayDisplayName_ = newName;
    // Rerender the block.
    this.block_.referenceChanged();
  }
};

/**
 * Returns the ID for the reference
 * @return {!string} The ID for the reference.
 */
Blockly.TypedVariableValueReference.prototype.getId = function() {
  return this.id_;
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
  if (value.getVariableName() !== this.temporayDisplayName_) {
    throw 'Names are not identical.';
  }
  this.value_ = value;
  value.storeReference(this);

  this.block_.referenceChanged();
};

/**
 * Remove the reference to the current value.
 */
Blockly.TypedVariableValueReference.prototype.removeBoundValue = function() {
  if (this.value_) {
    this.value_.removeReference(this);
    this.value_ = null;
  }
};

/**
 * Dispose of this reference.
 */
Blockly.TypedVariableValueReference.prototype.dispose = function() {
  Blockly.BoundVariables.removeReference(this.workspace_, this);
  this.workspace_ = null;
  this.block_.valueReference = null;
  this.block_ = null;
  this.value_ = null;
};
