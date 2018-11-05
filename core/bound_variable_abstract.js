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
 * @constructor
 */
Blockly.BoundVariableAbstract = function(block) {
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
   * A unique id for the variable.
   * @type {string}
   * @private
   */
  this.id_ = Blockly.utils.genUid();
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
 * @return {!string} The ID for the variable.
 */
Blockly.BoundVariableAbstract.prototype.getId = function() {
  return this.id_;
};

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
 * Dispose of this variable.
 */
Blockly.BoundVariableAbstract.prototype.dispose = function() {
  this.sourceBlock_ = null;
  this.workspace_ = null;
};
