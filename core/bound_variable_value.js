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
 * @param {!string} scopeInputName The name of the input where the variable can
 *     be referred to.
 * @param {!string} variableName The default name of this variable value.
 * @constructor
 */
Blockly.BoundVariableValue = function(block, fieldName, typeExpr,
    scopeInputName, variableName) {
  /**
   * The name of input which this variable can be used. (e.g. Suppose that the
   * source block is 'let X = I1 in I2' where I1 and I2 is value inputs.
   * this.inputName must be the name of input I2 because the variable X can be
   * used only inside I2.
   * @type {string}
   */
  this.scopeInputName_ = scopeInputName;

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

  /**
   * Whether the variable has been added to the variable map of any block.
   * @type {boolean}
   */
  this.inBlockDB = false;

  Blockly.BoundVariableValue.superClass_.constructor.call(this, block,
      fieldName, typeExpr);

  Blockly.BoundVariables.addValue(this.workspace_, this);

  // TODO: Register an event for the variable creation.
  // Blockly.Events.fire(new Blockly.Events.VarCreate(this));
};
goog.inherits(Blockly.BoundVariableValue, Blockly.BoundVariableAbstract);

/**
 * Wether this variable is a reference to a variable value.
 * @return {boolean} True if this variable is a reference.
 * @override
 */
Blockly.BoundVariableValue.prototype.isReference = function() {
  return false;
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
    this.variableName_ = newName;
    for (var i = 0, reference; reference = this.referenceList_[i]; i++) {
      reference.setVariableName(newName);
    }
    // Rerender the block.
    this.getContainerField().updateText();
  }
};

/**
 * Dispose of this value.
 * @override
 */
Blockly.BoundVariableValue.prototype.dispose = function() {
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
 * Return a number of the references that refers to this value.
 * @return {number} The number of references.
 */
Blockly.BoundVariableValue.prototype.referenceCount = function() {
  return this.referenceList_.length;
};

/**
 * Return the name of input on which this variable can be referred to. The
 * input must be exist in this variable's block.
 * @return {!string} The name of input.
 */
Blockly.BoundVariableValue.prototype.getScopeInputName = function() {
  return this.scopeInputName_;
};

/**
 * Store the reference to a list of references.
 * @param {!Blockly.BoundVariableValueReference} reference The reference to
 *     store a list of references.
 */
Blockly.BoundVariableValue.prototype.storeReference = function(reference) {
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
 * Copy the components of this variable to another variable.
 * @param {!Blockly.BoundVariableValue} variable The variable to copy this
 *     variable's properties to.
 */
Blockly.BoundVariableValue.prototype.copyTo = function(variable) {
  var targetBlock = variable.getSourceBlock();
  if (this.sourceBlock_.type !== targetBlock.type ||
      this.fieldName_ !== variable.getContainerFieldName() ||
      this.scopeInputName_ != variable.getScopeInputName()) {
    throw 'Can\'t copy to a variable of the different type';
  }

  variable.setVariableName(this.variableName_);
  this.typeExpr_.unify(variable.getTypeExpr());

  var referencesToMove = [];
  for (var i = 0, reference; reference = this.referenceList_[i]; i++) {
    var referenceBlock = reference.getSourceBlock();
    if (referenceBlock.isTransferring()) {
      // The reference's block is scheduled to be disposed of, so we don't
      // have to do anything.
    } else {
      referencesToMove.push(reference);
    }
  }

  if (referencesToMove.length != 0) {
    if (!this.sourceBlock_.isTransferring()) {
      throw 'Can\'t clone a value which has references unless its original ' +
          'block is currelty transferring.';
    }
    // The transferring block is scheduled to be disposed of when it has
    // finished transferring, so move some of references.
    for (var i = 0, reference; reference = referencesToMove[i]; i++) {
      reference.removeBoundValue();
      reference.setBoundValue(variable);
    }
  }
};
