/**
 * @fileoverview The class handling a reference to variable declared in blocks.
 * This class is expected to be used in a typedVersion workspace.
 */
'use strict';

goog.provide('Blockly.BoundVariableValueReference');

goog.require('Blockly.BoundVariableAbstract');
goog.require('goog.string');


/**
 * Class for a reference to variable defined in block.
 * @param {!Blockly.Block} block This reference's block.
 * @param {!string} fieldName The name of the field that contains this
 *     variable.
 * @param {!Blockly.TypeExpr} typeExpr The type expression of the variable.
 * @param {!string} varName The default name of this reference.
 * @param {!number} label An enum representing which type of reference.
 * @constructor
 */
Blockly.BoundVariableValueReference = function(block, fieldName, typeExpr,
    varName, label) {
  /**
   * The variable this reference refers to, or null if it's not been resolved
   * yet.
   * @type {Blockly.BoundVariableValue}
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

  Blockly.BoundVariableValueReference.superClass_.constructor.call(this,
      block, fieldName, typeExpr, label);

  Blockly.BoundVariables.addReference(this.workspace_, this);
};
goog.inherits(Blockly.BoundVariableValueReference, Blockly.BoundVariableAbstract);

/**
 * Gets the variable name for this reference. Returns that of the value if the
 * value has been resolved.
 * @return {string} The display name.
 * @override
 */
Blockly.BoundVariableValueReference.prototype.getVariableName = function() {
  return this.value_ ? this.value_.getVariableName() : this.temporayDisplayName_;
};

/**
 * Set the variable name for this variable.
 * @param {!string} newName The new name for this variable.
 * @override
 */
Blockly.BoundVariableValueReference.prototype.setVariableName = function(newName) {
  if (this.value_ && this.value_.getVariableName() !== newName) {
    this.value_.setVariableName(newName);
  }
  // Update the text only if the new name is different from the displayed one.
  if (this.temporayDisplayName_ !== newName) {
    var newName = Blockly.BoundVariables.variableNameValidator(this.label,
        newName);
    goog.asserts.assert(newName, 'The given name is illegal.');

    // Save the new displayed name.
    this.temporayDisplayName_ = newName;
    this.referenceChange_();
  }
};

/**
 * Returns a list of variables which refer to the same value, or are referred
 * to by them.  Includes this variable in the list.
 * @return {Array.<!Blockly.BoundVariableAbstract>} A list of variables.
 * @override
 */
Blockly.BoundVariableValueReference.prototype.getAllBoundVariables = function() {
  if (this.value_) {
    return this.value_.getAllBoundVariables();
  } else {
    return [this];
  }
};

/**
 * Gets whether this reference is cyclic. A reference is cyclic if it refers to
 * a value existing in the same block subtree.
 * @param {Blockly.Block=} opt_block The root of block subtree. If provided,
 *     detect if the reference is cyclic on the given block or its nested
 *     blocks. Defaults to the root block of the reference's block.
 * @return {boolean} True if cyclic.
 */
Blockly.BoundVariableValueReference.prototype.isCyclicReference = function(
    opt_block) {
  if (this.value_) {
    var rootBlock = opt_block ? opt_block : this.sourceBlock_.getRootBlock();
    var valueBlock = this.value_.getSourceBlock();
    while (valueBlock) {
      if (valueBlock == rootBlock) {
        return true;
      }
      valueBlock = valueBlock.getParent();
    }
  }
  return false;
};

/**
 * Gets the value this reference refers to.
 * @return {!Blockly.BoundVariableValue} The bound value, or null.
 */
Blockly.BoundVariableValueReference.prototype.getBoundValue = function() {
  return this.value_;
};

/**
 * Sets the value to refer to. Throw an exception if the bound value is already
 * resolved.
 * @param {!Blockly.BoundVariableValue} value The variable to refer to.
 */
Blockly.BoundVariableValueReference.prototype.setBoundValue = function(value) {
  if (this.value_) {
    if (this.value_ == value) {
      return;
    } else {
      throw 'The bound value has already been resolved.';
    }
  }
  if (value.getVariableName() !== this.temporayDisplayName_) {
    throw 'Names are not identical.';
  }
  this.value_ = value;
  value.storeReference(this);
  var valueTypeExpr = this.value_.getTypeExpr();
  if (!valueTypeExpr) {
    throw 'The type expression of a new value to refer to must be provided.';
  }
  this.unifyTypeExpr();

  this.referenceChange_();
};

/**
 * Remove the reference to the current value.
 */
Blockly.BoundVariableValueReference.prototype.removeBoundValue = function() {
  if (this.value_) {
    this.value_.removeReference(this);
    var valueTypeExpr = this.value_.getTypeExpr();
    if (valueTypeExpr && this.typeExpr_) {
      valueTypeExpr.disconnect(this.typeExpr_);
    }
    this.value_ = null;
  }
};

/**
 * Bind the type expression with the value's type expression.
 * @override
 */
Blockly.BoundVariableValueReference.prototype.unifyTypeExpr = function() {
  var valueType = this.value_ && this.value_.getTypeExpr();
  if (valueType) {
    var scheme = this.value_.getTypeScheme(this);
    if (scheme) {
      scheme.unify(this.typeExpr_);
    }
    if (this.isConstructor()) {
      // Update parameter according to the definition of constructor.
      this.sourceBlock_.infer();
    }
  }
};

/**
 * Update the source block when this reference is changed.
 * @private
 */
Blockly.BoundVariableValueReference.prototype.referenceChange_ = function() {
  this.getMainField().updateText();
};

/**
 * Dispose of this reference.
 */
Blockly.BoundVariableValueReference.prototype.dispose = function() {
  Blockly.BoundVariables.removeReference(this.workspace_, this);
  Blockly.BoundVariableValueReference.superClass_.dispose.call(this);
  if (this.value_) {
    this.value_.removeReference(this);
    this.value_ = null;
  }
};
