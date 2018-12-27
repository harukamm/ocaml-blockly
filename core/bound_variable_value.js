/**
 * @fileoverview The class representing a variable declared in block.
 * This class is expected to be used in a typedVersion workspace.
 */
'use strict';

goog.provide('Blockly.BoundVariableValue');

goog.require('Blockly.BoundVariableAbstract');
goog.require('goog.string');


/**
 * Class for a variable declared in the block.
 * @param {!Blockly.Block} block The block the variable is declared in.
 * @param {!string} fieldName The name of the field that contains this
 *     variable.
 * @param {!Blockly.TypeExpr} typeExpr The type expression of the variable.
 * @param {!string} variableName The default name of this variable value.
 * @param {!number} label Enum representing which type of value,
 *     Blockly.BoundVariableAbstract.VALUE_VARIABLE or
 *     Blockly.BoundVariableAbstract.VALUE_CONSTRUCTOR.
 * @constructor
 */
Blockly.BoundVariableValue = function(block, fieldName, typeExpr,
     variableName, label) {
  /**
   * The variable name for this value.
   * @type {string}
   */
  this.variableName_ = variableName;

  /**
   * A list of references that refer to this value.
   * @type {!Array.<Blockly.BoundVariableValueReference>}
   * @private
   */
  this.referenceList_ = [];

  /**
   * Whether this variable value is scheduled to be deleted. If true, will be
   * deleted when there is no references to this value.
   * @type {boolean}
   * @private
   */
  this.deleteLater_ = false;

  Blockly.BoundVariableValue.superClass_.constructor.call(this, block,
      fieldName, typeExpr, label);

  Blockly.BoundVariables.addValue(this.workspace_, this);

  // TODO: Register an event for the variable creation.
  // Blockly.Events.fire(new Blockly.Events.VarCreate(this));
};
goog.inherits(Blockly.BoundVariableValue, Blockly.BoundVariableAbstract);

/**
 * Bind references' type expression with this value's type expression.
 * @override
 */
Blockly.BoundVariableValue.prototype.unifyTypeExpr = function() {
  for (var i = 0, reference; reference = this.referenceList_[i]; i++) {
    reference.unifyTypeExpr();
  }
};

/**
 * Get the variable name for this variable.
 * @return {!string} This variable's name.
 * @override
 */
Blockly.BoundVariableValue.prototype.getVariableName = function() {
  return this.variableName_;
};

/**
 * Set the variable name for this variable.
 * @param {!string} newName The new name for this variable.
 * @override
 */
Blockly.BoundVariableValue.prototype.setVariableName = function(newName) {
  if (this.variableName_ !== newName) {
    var newName = Blockly.BoundVariables.variableNameValidator(this.label,
        newName);
    goog.asserts.assert(newName, 'The given name is illegal.');

    this.variableName_ = newName;
    for (var i = 0, reference; reference = this.referenceList_[i]; i++) {
      reference.setVariableName(newName);
    }
    // Rerender the block.
    this.getContainerField().updateText();
  }
};

/**
 * Returns a list of variables which refer to the same value, or are referred
 * to by them.  Includes this variable in the list.
 * @return {Array.<!Blockly.BoundVariableAbstract>} A list of variables.
 * @override
 */
Blockly.BoundVariableValue.prototype.getAllBoundVariables = function() {
  return [this].concat(this.referenceList_);
};

/**
 * Dispose of this value.
 * @param {boolean=} opt_removeReference True if force to remove reference
 *     blocks which refer to this variable. If variable represents constructor,
 *     defaults to true.
 * @override
 */
Blockly.BoundVariableValue.prototype.dispose = function(opt_removeReference) {
  var forceToRemove = this.isConstructor() ?
      opt_removeReference !== false: opt_removeReference === true;

  if (forceToRemove) {
    var referenceList = [].concat(this.referenceList_);
    for (var i = 0, ref; ref = referenceList[i]; i++) {
      var refBlock = ref.getSourceBlock();
      refBlock.dispose();
    }
    goog.asserts.assert(this.referenceList_.length == 0);
  }

  if (this.referenceList_.length == 0) {
    Blockly.BoundVariables.removeValue(this.workspace_, this);
    delete this.sourceBlock_.typedValue[this.fieldName_];
    Blockly.BoundVariableValue.superClass_.dispose.call(this);
  } else {
    // Currently can not be destroyed because this variable value has
    // references. Delete this when the number of references drops to zero.
    this.deleteLater_ = true;
  }
};

/**
 * Returns a type scheme for this variable value.
 * @param {!Blockly.BoundVariableValueReference} reference The reference which
 *     requires a type scheme. The source block might provide a different type
 *     scheme depending on which reference is applied.
 * @return {Blockly.Scheme} The type scheme for this value.
 */
Blockly.BoundVariableValue.prototype.getTypeScheme = function(reference) {
  return this.sourceBlock_.getTypeScheme(this.fieldName_, reference);
};

/**
 * Return a number of the references that refers to this value.
 * @return {number} The number of references.
 */
Blockly.BoundVariableValue.prototype.referenceCount = function() {
  return this.referenceList_.length;
};

/**
 * Store the reference to a list of references.
 * @param {!Blockly.BoundVariableValueReference} reference The reference to
 *     store a list of references.
 */
Blockly.BoundVariableValue.prototype.storeReference = function(reference) {
  goog.asserts.assert(Blockly.BoundVariableAbstract.isPair(this, reference));

  if (this.referenceList_.indexOf(reference) != -1) {
    throw 'Duplicated references.';
  }
  if (this.deleteLater_) {
    throw 'Can not add a reference any more, this value is being deleted.';
  }
  this.referenceList_.push(reference);
};

/**
 * Remove the reference from a list of references.
 * @param {!Blockly.BoundVariableValueReference} reference The reference to
 *     remove from a list of references.
 */
Blockly.BoundVariableValue.prototype.removeReference = function(reference) {
  goog.asserts.assert(Blockly.BoundVariableAbstract.isPair(this, reference));

  var removalIndex = this.referenceList_.indexOf(reference);
  if (removalIndex == -1) {
    throw 'Unable to find the reference.';
  }
  this.referenceList_.splice(removalIndex, 1);

  // Delete this value if it's scheduled to do so and there is no references.
  if (this.deleteLater_ && !this.referenceList_.length) {
    this.dispose();
  }
};

/**
 * Remove the references which refer to this variable and this variable's
 * block is connected to their blocks directly or indirectly.
 */
Blockly.BoundVariableValue.prototype.clearCyclicReference = function() {
  var thisRootBlock = this.sourceBlock_.getRootBlock();
  for (var i = 0, reference; reference = this.referenceList_[i]; i++) {
    var block = reference.getSourceBlock();
    var rootBlock = block.getRootBlock();
    if (thisRootBlock == rootBlock) {
      // Don't need to remove the reference from this.referenceList_ here
      // because this.removeReference() would be called by the reference.
      reference.removeBoundValue();
    }
  }
};

/**
 * Copy the components of this variable to another variable.
 * @param {!Blockly.BoundVariableValue} variable The variable to copy this
 *     variable's properties to.
 */
Blockly.BoundVariableValue.prototype.copyTo = function(variable) {
  var targetBlock = variable.getSourceBlock();
  if (this.sourceBlock_.type !== targetBlock.type ||
      this.fieldName_ !== variable.getContainerFieldName()) {
    throw 'Can\'t copy to a variable of the different type';
  }

  variable.setVariableName(this.variableName_);

  if (this.isConstructor() && this.referenceCount() != 0) {
    throw 'Not implemented';
  }
  if (!this.sourceBlock_.isTransferring()) {
    return;
  }
  // The transferring block is scheduled to be disposed of when it has finished
  // transferring, so move some of references.

  // Copy the list of references. this.referenceList_ could be changed during
  // the following loop.
  var referenceList = [].concat(this.referenceList_);
  for (var i = 0, reference; reference = referenceList[i]; i++) {
    var referenceBlock = reference.getSourceBlock();
    if (referenceBlock.isTransferring()) {
      // The reference's block is also scheduled to be disposed of, so we don't
      // have to do anything.
    } else {
      reference.removeBoundValue();
      reference.setBoundValue(variable);
    }
  }
};
