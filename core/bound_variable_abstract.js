/**
 * @fileoverview Variable representation with variable binding.
 * This is an abstract class for Blockly.BoundVariableValue and
 * Blockly.BoundVariableReference.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

goog.provide('Blockly.BoundVariableAbstract');

goog.require('goog.string');


/**
 * Class for a variable to implement variable binding.
 * @param {!Blockly.Block} block The block of this variable.
 * @param {!string} fieldName The name of the field that contains this
 *     variable.
 * @param {!Blockly.TypeExpr} typeExpr The type expression of this
 *     variable.
 * @constructor
 */
Blockly.BoundVariableAbstract = function(block, fieldName, typeExpr) {
  /**
   * The block the variable is declared in.
   * @type {!Blockly.Block}
   */
  this.sourceBlock_ = block;

  /**
   * The workspace of this variable's block.
   * @type {!Blockly.Workspace}
   */
  this.workspace_ = this.sourceBlock_.workspace;

  /**
   * The name of this variable's name.
   * @type {string}
   */
  this.fieldName_ = fieldName;

  /**
   * The type expression of this variable.
   * @type {Blockly.TypeExpr}
   */
  this.typeExpr_ = typeExpr;

  /**
   * A unique id for the variable.
   * @type {string}
   * @private
   */
  this.id_ = Blockly.utils.genUid();

  /**
   * Whether the variable has been added to the variable database of the
   * workspace.
   * @type {boolean}
   */
  this.inWorkspaceDB = false;
};

/**
 * Get the source block for this varialbe.
 * @return {!Blockly.Block} The source block
 */
Blockly.BoundVariableAbstract.prototype.getSourceBlock = function() {
  return this.sourceBlock_;
};

/**
 * Get the workspace of this variable's source block.
 * @return {!Blockly.Workspace} The source block's workspace, or null.
 */
Blockly.BoundVariableAbstract.prototype.getWorkspace = function() {
  return this.workspace_;
};

/**
 * Returns the name of field which contains this variable.
 * @return {!string} The name of this variable's field.
 */
Blockly.BoundVariableAbstract.prototype.getContainerFieldName = function() {
  return this.fieldName_;
};

/**
 * Returns a field which contains this variable.
 * @return {!Blockly.FieldBoundVariable} This variable's field.
 */
Blockly.BoundVariableAbstract.prototype.getContainerField = function() {
  return this.sourceBlock_.getField(this.fieldName_);
};

/**
 * Returns the type expression of this variable.
 * @return {!Blockly.TypeExpr} The type expression of this variable.
 */
Blockly.BoundVariableAbstract.prototype.getTypeExpr = function() {
  return this.typeExpr_;
};

/**
 * Store the given type expression in this variable.
 * @param {!Blockly.TypeExpr} typeExpr The type expression to be stored in this
 *     variable.
 */
Blockly.BoundVariableAbstract.prototype.setTypeExpr = function(typeExpr) {
  this.typeExpr_ = typeExpr;
};

/**
 * @return {!string} The ID for the variable.
 */
Blockly.BoundVariableAbstract.prototype.getId = function() {
  return this.id_;
};

/**
 * Wether this variable is a reference to a variable value.
 * @return {boolean} True if this variable is a reference.
 */
Blockly.BoundVariableAbstract.prototype.isReference = undefined;

/**
 * Get the variable name for this variable.
 * @return {!string} This variable's name.
 */
Blockly.BoundVariableAbstract.prototype.getVariableName = undefined;

/**
 * Set the variable name for this variable.
 * @param {!string} newName The new name for this variable.
 */
Blockly.BoundVariableAbstract.prototype.setVariableName = undefined;

/**
 * Returns a list of variables which refer to the same value, or are referred
 * to by them.  Includes this variable in the list.
 * @return {Array.<!Blockly.BoundVariableAbstract>} A list of variables.
 */
Blockly.BoundVariableAbstract.prototype.getAllBoundVariables = function() {
  return [this];
};

/**
 * Dispose of this variable.
 */
Blockly.BoundVariableAbstract.prototype.dispose = function() {
  this.sourceBlock_ = null;
  this.workspace_ = null;
  this.typeExpr_ = null;
};

/**
 * A custom compare function for the BoundVariableAbstract objects.
 * @param {Blockly.VariableModel} var1 First variable to compare.
 * @param {Blockly.VariableModel} var2 Second variable to compare.
 * @return {number} -1 if name of var1 is less than name of var2, 0 if equal,
 *     and 1 if greater.
 * @package
 */
Blockly.BoundVariableAbstract.compareByName = function(var1, var2) {
  return goog.string.caseInsensitiveCompare(var1.getVariableName(),
      var2.getVariableName());
};
