/**
 * @fileoverview The class representing a variable declared in block.
 * This class is expected to be used in a typedVersion workspace.
 */
'use strict';

goog.provide('Blockly.TypedVariableValue');

goog.require('goog.string');


/**
 * Class for a variable declared in the block.
 * @param {!Blockly.Block} block The block the variable is declared in.
 * @param {!Blockly.TypeExpr} typeExpr The type expression of the variable.
 * @param {!string} fieldName The name of the variable field.
 * @param {!string} scopeInputName The name of the input where the variable can
 *     be referred to.
 * @constructor
 */
Blockly.TypedVariableValue = function(block, typeExpr, fieldName, scopeInputName) {
  /**
   * The block the variable is declared in.
   * @type {!Blockly.Block}
   */
  this.sourceBlock_ = block;

  /**
   * @type {!Blockly.TypeExpr} The type expression of the variable.
   */
  this.typeExpr = typeExpr;

  /**
   * The name of the variable field which belongs to the block.
   * @type {!string}
   */
  this.fieldName = fieldName;

  /**
   * The name of input which this variable can be used. (e.g. Suppose that the
   * source block is 'let X = I1 in I2' where I1 and I2 is value inputs.
   * this.inputName must be the name of input I2 because the variable X can be
   * used only inside I2.
   * @type {string}
   */
  this.scopeInputName = scopeInputName;

  /**
   * A unique id for the variable.
   * @type {string}
   * @private
   */
  this.id_ = Blockly.utils.genUid();

  // TODO: Register an event for the variable creation.
  // Blockly.Events.fire(new Blockly.Events.VarCreate(this));
};

/**
 * Get the source block for this varialbe.
 * @return {!Blockly.Block} The source block
 */
Blockly.TypedVariableValue.prototype.getSourceBlock = function() {
  return this.sourceBlock_;
};

/**
 * Get the variable name for this variable.
 * @return {!string} This variable's name.
 */
Blockly.TypedVariableValue.prototype.getName = function() {
  return this.sourceBlock_.getField(this.fieldName).getText();
};

/**
 * @return {!string} The ID for the variable.
 */
Blockly.TypedVariableValue.prototype.getId = function() {
  return this.id_;
};

