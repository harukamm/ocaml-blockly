/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Object representing a workspace.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Workspace');

goog.require('Blockly.VariableMap');
goog.require('Blockly.WorkspaceComment');
goog.require('Blockly.WorkspaceTree');
goog.require('goog.array');
goog.require('goog.math');


/**
 * Class for a workspace.  This is a data structure that contains blocks.
 * There is no UI, and can be created headlessly.
 * @param {!Blockly.Options=} opt_options Dictionary of options.
 * @constructor
 */
Blockly.Workspace = function(opt_options) {
  /** @type {string} */
  this.id = Blockly.utils.genUid();
  /** @type {!Blockly.Options} */
  this.options = opt_options || {};
  /** @type {boolean} */
  this.RTL = !!this.options.RTL;
  /** @type {boolean} */
  this.horizontalLayout = !!this.options.horizontalLayout;
  /** @type {number} */
  this.toolboxPosition = this.options.toolboxPosition;

  /**
   * @type {!Array.<!Blockly.Block>}
   * @private
   */
  this.topBlocks_ = [];
  /**
   * @type {!Array.<!Blockly.WorkspaceComment>}
   * @private
   */
  this.topComments_ = [];
  /**
   * @type {!Object}
   * @private
   */
  this.commentDB_ = Object.create(null);
  /**
   * @type {!Object}
   * @private
   */
  this.valueDBList_ = Object.create(null);
  /**
   * @type {!Object}
   * @private
   */
  this.referenceDBList_ = Object.create(null);
  /**
   * @type {!Array.<!Function>}
   * @private
   */
  this.listeners_ = [];
  /**
   * @type {!Array.<!Blockly.Events.Abstract>}
   * @protected
   */
  this.undoStack_ = [];
  /**
   * @type {!Array.<!Blockly.Events.Abstract>}
   * @protected
   */
  this.redoStack_ = [];
  /**
   * @type {!Object}
   * @private
   */
  this.blockDB_ = Object.create(null);

  /**
   * A map from variable type to list of variable names.  The lists contain all
   * of the named variables in the workspace, including variables
   * that are not currently in use.
   * @type {!Blockly.VariableMap}
   * @private
   */
  this.variableMap_ = new Blockly.VariableMap(this);

  /**
   * Blocks in the flyout can refer to variables that don't exist in the main
   * workspace.  For instance, the "get item in list" block refers to an "item"
   * variable regardless of whether the variable has been created yet.
   * A FieldVariable must always refer to a Blockly.VariableModel.  We reconcile
   * these by tracking "potential" variables in the flyout.  These variables
   * become real when references to them are dragged into the main workspace.
   * @type {!Blockly.VariableMap}
   * @private
   */
  this.potentialVariableMap_ = null;

  this.initValueReferenceDBList();
  Blockly.WorkspaceTree.add(this);
};

/**
 * Returns `true` if the workspace is visible and `false` if it's headless.
 * @type {boolean}
 */
Blockly.Workspace.prototype.rendered = false;

/**
 * Returns `true` if the workspace is currently in the process of a bulk clear.
 * @type {boolean}
 * @package
 */
Blockly.Workspace.prototype.isClearing = false;

/**
 * Maximum number of undo events in stack. `0` turns off undo, `Infinity` sets it to unlimited.
 * @type {number}
 */
Blockly.Workspace.prototype.MAX_UNDO = 1024;

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Workspace.prototype.dispose = function() {
  this.listeners_.length = 0;
  this.clear();

  // Clear reference and value database.
  Blockly.BoundVariables.clearWorkspaceVariableDB(this);

  // Remove from workspace tree.
  Blockly.WorkspaceTree.remove(this);
};

/**
 * Angle away from the horizontal to sweep for blocks.  Order of execution is
 * generally top to bottom, but a small angle changes the scan to give a bit of
 * a left to right bias (reversed in RTL).  Units are in degrees.
 * See: http://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling.
 */
Blockly.Workspace.SCAN_ANGLE = 3;

/**
 * Add a block to the list of top blocks.
 * @param {!Blockly.Block} block Block to add.
 */
Blockly.Workspace.prototype.addTopBlock = function(block) {
  this.topBlocks_.push(block);
};

/**
 * Remove a block from the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.Workspace.prototype.removeTopBlock = function(block) {
  if (!goog.array.remove(this.topBlocks_, block)) {
    throw 'Block not present in workspace\'s list of top-most blocks.';
  }
};

/**
 * Finds the top-level blocks and returns them.  Blocks are optionally sorted
 * by position; top to bottom (with slight LTR or RTL bias).
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!Blockly.Block>} The top-level block objects.
 */
Blockly.Workspace.prototype.getTopBlocks = function(ordered) {
  // Copy the topBlocks_ list.
  var blocks = [].concat(this.topBlocks_);
  if (ordered && blocks.length > 1) {
    var offset = Math.sin(goog.math.toRadians(Blockly.Workspace.SCAN_ANGLE));
    if (this.RTL) {
      offset *= -1;
    }
    blocks.sort(function(a, b) {
      var aXY = a.getRelativeToSurfaceXY();
      var bXY = b.getRelativeToSurfaceXY();
      return (aXY.y + offset * aXY.x) - (bXY.y + offset * bXY.x);
    });
  }
  return blocks;
};

/**
 * Add a comment to the list of top comments.
 * @param {!Blockly.WorkspaceComment} comment comment to add.
 * @package
 */
Blockly.Workspace.prototype.addTopComment = function(comment) {
  this.topComments_.push(comment);

  // Note: If the comment database starts to hold block comments, this may need
  // to move to a separate function.
  if (this.commentDB_[comment.id]) {
    console.warn('Overriding an existing comment on this workspace, with id "' +
        comment.id + '"');
  }
  this.commentDB_[comment.id] = comment;
};

/**
 * Remove a comment from the list of top comments.
 * @param {!Blockly.WorkspaceComment} comment comment to remove.
 * @package
 */
Blockly.Workspace.prototype.removeTopComment = function(comment) {
  if (!goog.array.remove(this.topComments_, comment)) {
    throw 'Comment not present in workspace\'s list of top-most comments.';
  }
  // Note: If the comment database starts to hold block comments, this may need
  // to move to a separate function.
  delete this.commentDB_[comment.id];
};

/**
 * Finds the top-level comments and returns them.  Comments are optionally sorted
 * by position; top to bottom (with slight LTR or RTL bias).
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!Blockly.WorkspaceComment>} The top-level comment objects.
 * @package
 */
Blockly.Workspace.prototype.getTopComments = function(ordered) {
  // Copy the topComments_ list.
  var comments = [].concat(this.topComments_);
  if (ordered && comments.length > 1) {
    var offset = Math.sin(goog.math.toRadians(Blockly.Workspace.SCAN_ANGLE));
    if (this.RTL) {
      offset *= -1;
    }
    comments.sort(function(a, b) {
      var aXY = a.getRelativeToSurfaceXY();
      var bXY = b.getRelativeToSurfaceXY();
      return (aXY.y + offset * aXY.x) - (bXY.y + offset * bXY.x);
    });
  }
  return comments;
};

/**
 * Finds the name of structure with the given id.
 * @param {number} label The type of variable.
 * @param {!string} id The string to identify structure declaration.
 * @return {string} The name of structure or null.
 */
Blockly.Workspace.prototype.getStructureName = function(label, id) {
  if (Blockly.BoundVariableAbstract.isVariableLabel(label)) {
    // Not a structure.
    return null;
  }
  if (Blockly.BoundVariableAbstract.isConstructorLabel(label)) {
    var blockType = 'defined_datatype_typed';
  } else if (Blockly.BoundVariableAbstract.isRecordLabel(label)) {
    var blockType = 'defined_recordtype_typed';
  } else {
    return null;
  }
  var topBlocks = this.getTopBlocks();
  for (var i = 0, topBlock; topBlock = topBlocks[i]; i++) {
    if (topBlock.type !== blockType) {
      continue;
    }
    if (topBlock.getStructureId() === id) {
      var field = topBlock.getField('DATANAME');
      var dataName = field.getText();
      return dataName;
    }
  }
  return null;
};

Blockly.Workspace.prototype.getCtorDataName = function(id) {
  return this.getStructureName(Blockly.BoundVariableAbstract.CONSTRUCTOR, id);
};

/**
 * Initialize the database for bound variables.
 */
Blockly.Workspace.prototype.initValueReferenceDBList = function() {
  var labels = Blockly.BoundVariableAbstract._LABEL_LIST;
  for (var i = 0, label; label = labels[i]; i++) {
    this.valueDBList_[label] = Object.create(null);
    this.referenceDBList_[label] = Object.create(null);
  }
};

/**
 * Returns the list of values on the workspace. The callers of this function
 * change the content of the list.
 * @param {!number} label An enum indicating which type of value.
 * @return {!Object} The value DB of the workspace.
 */
Blockly.Workspace.prototype.getValueDB = function(label) {
  if (!(label in this.valueDBList_)) {
    throw 'The specified database does not exist.';
  }
  return this.valueDBList_[label];
};

/**
 * Returns the list of references on the workspace. The callers of this
 * function can change the content of the list.
 * @param {!number} label An enum indicating which type of reference.
 * @return {!Object} The reference DB of the workspace.
 */
Blockly.Workspace.prototype.getReferenceDB = function(label) {
  if (!(label in this.referenceDBList_)) {
    throw 'The specified database does not exist.';
  }
  return this.referenceDBList_[label];
};

/**
 * Gets variable environments the workspace implicitly holds.
 * @return {!Object} Map to variable value keyed by name.
 */
Blockly.Workspace.prototype.getImplicitContext = function() {
  if (this.isFlyout) {
    return {};
  }
  var workspace = this;
  var env = {};
  var mutators = [];
  while (workspace && workspace.isMutator) {
    mutators.push(workspace.ownerMutator_);
    workspace = workspace.options.parentWorkspace;
  }
  // Merge variable contexts from the top parent to child.
  for (var i = mutators.length - 1; 0 <= i; i--) {
    var mutator = mutators[i];
    if (goog.isFunction(mutator.getContext)) {
      Object.assign(env, mutator.getContext(false));
    }
  }
  return env;
};

/**
 * Find all blocks in workspace.  Blocks are optionally sorted
 * by position; top to bottom (with slight LTR or RTL bias).
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.Workspace.prototype.getAllBlocks = function(ordered) {
  if (ordered) {
    // Slow, but ordered.
    var topBlocks = this.getTopBlocks(true);
    var blocks = [];
    for (var i = 0; i < topBlocks.length; i++) {
      blocks.push.apply(blocks, topBlocks[i].getDescendants(true));
    }
  } else {
    // Fast, but in no particular order.
    var blocks = this.getTopBlocks(false);
    for (var i = 0; i < blocks.length; i++) {
      blocks.push.apply(blocks, blocks[i].getChildren(false));
    }
  }
  return blocks;
};

/**
 * Dispose of all blocks and comments in workspace.
 */
Blockly.Workspace.prototype.clear = function() {
  this.isClearing = true;
  try {
    var existingGroup = Blockly.Events.getGroup();
    if (!existingGroup) {
      Blockly.Events.setGroup(true);
    }
    while (this.topBlocks_.length) {
      this.topBlocks_[0].dispose();
    }
    while (this.topComments_.length) {
      this.topComments_[this.topComments_.length - 1].dispose();
    }
    if (!existingGroup) {
      Blockly.Events.setGroup(false);
    }
    this.variableMap_.clear();
    if (this.potentialVariableMap_) {
      this.potentialVariableMap_.clear();
    }
  } finally {
    this.isClearing = false;
  }
};

/* Begin functions that are just pass-throughs to the variable map. */
/**
 * Rename a variable by updating its name in the variable map. Identify the
 * variable to rename with the given ID.
 * @param {string} id ID of the variable to rename.
 * @param {string} newName New variable name.
 */
Blockly.Workspace.prototype.renameVariableById = function(id, newName) {
  this.variableMap_.renameVariableById(id, newName);
};

/**
 * Create a variable with a given name, optional type, and optional ID.
 * @param {!string} name The name of the variable. This must be unique across
 *     variables and procedures.
 * @param {string=} opt_type The type of the variable like 'int' or 'string'.
 *     Does not need to be unique. Field_variable can filter variables based on
 *     their type. This will default to '' which is a specific type.
 * @param {string=} opt_id The unique ID of the variable. This will default to
 *     a UUID.
 * @return {?Blockly.VariableModel} The newly created variable.
 */
Blockly.Workspace.prototype.createVariable = function(name, opt_type, opt_id) {
  return this.variableMap_.createVariable(name, opt_type, opt_id);
};

/**
 * Find all the uses of the given variable, which is identified by ID.
 * @param {string} id ID of the variable to find.
 * @return {!Array.<!Blockly.Block>} Array of block usages.
 */
Blockly.Workspace.prototype.getVariableUsesById = function(id) {
  return this.variableMap_.getVariableUsesById(id);
};

/**
 * Delete a variables by the passed in ID and all of its uses from this
 * workspace. May prompt the user for confirmation.
 * @param {string} id ID of variable to delete.
 */
Blockly.Workspace.prototype.deleteVariableById = function(id) {
  this.variableMap_.deleteVariableById(id);
};

/**
 * Deletes a variable and all of its uses from this workspace without asking the
 * user for confirmation.
 * @param {!Blockly.VariableModel} variable Variable to delete.
 * @param {!Array.<!Blockly.Block>} uses An array of uses of the variable.
 * @private
 */
Blockly.Workspace.prototype.deleteVariableInternal_ = function(variable, uses) {
  this.variableMap_.deleteVariableInternal_(variable, uses);
};

/**
 * Check whether a variable exists with the given name.  The check is
 * case-insensitive.
 * @param {string} _name The name to check for.
 * @return {number} The index of the name in the variable list, or -1 if it is
 *     not present.
 * @deprecated April 2017
 */

Blockly.Workspace.prototype.variableIndexOf = function(_name) {
  console.warn(
      'Deprecated call to Blockly.Workspace.prototype.variableIndexOf');
  return -1;
};

/**
 * Find the variable by the given name and return it. Return null if it is not
 *     found.
 * @param {!string} name The name to check for.
 * @param {string=} opt_type The type of the variable.  If not provided it
 *     defaults to the empty string, which is a specific type.
 * @return {?Blockly.VariableModel} the variable with the given name.
 */
// TODO (#1199): Possibly delete this function.
Blockly.Workspace.prototype.getVariable = function(name, opt_type) {
  return this.variableMap_.getVariable(name, opt_type);
};

/**
 * Find the variable by the given ID and return it. Return null if it is not
 *     found.
 * @param {!string} id The ID to check for.
 * @return {?Blockly.VariableModel} The variable with the given ID.
 */
Blockly.Workspace.prototype.getVariableById = function(id) {
  return this.variableMap_.getVariableById(id);
};

/**
 * Find the variable with the specified type. If type is null, return list of
 *     variables with empty string type.
 * @param {?string} type Type of the variables to find.
 * @return {Array.<Blockly.VariableModel>} The sought after variables of the
 *     passed in type. An empty array if none are found.
 */
Blockly.Workspace.prototype.getVariablesOfType = function(type) {
  return this.variableMap_.getVariablesOfType(type);
};

/**
 * Return all variable types.
 * @return {!Array.<string>} List of variable types.
 * @package
 */
Blockly.Workspace.prototype.getVariableTypes = function() {
  return this.variableMap_.getVariableTypes();
};

/**
 * Return all variables of all types.
 * @return {!Array.<Blockly.VariableModel>} List of variable models.
 */
Blockly.Workspace.prototype.getAllVariables = function() {
  return this.variableMap_.getAllVariables();
};

/* End functions that are just pass-throughs to the variable map. */

/**
 * Returns the horizontal offset of the workspace.
 * Intended for LTR/RTL compatibility in XML.
 * Not relevant for a headless workspace.
 * @return {number} Width.
 */
Blockly.Workspace.prototype.getWidth = function() {
  return 0;
};

/**
 * Obtain a newly created block.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
 * @return {!Blockly.Block} The created block.
 */
Blockly.Workspace.prototype.newBlock = function(prototypeName, opt_id) {
  return new Blockly.Block(this, prototypeName, opt_id);
};

/**
 * The number of blocks that may be added to the workspace before reaching
 *     the maxBlocks.
 * @return {number} Number of blocks left.
 */
Blockly.Workspace.prototype.remainingCapacity = function() {
  if (isNaN(this.options.maxBlocks)) {
    return Infinity;
  }
  return this.options.maxBlocks - this.getAllBlocks().length;
};

/**
 * Undo or redo the previous action.
 * @param {boolean} redo False if undo, true if redo.
 */
Blockly.Workspace.prototype.undo = function(redo) {
  var inputStack = redo ? this.redoStack_ : this.undoStack_;
  var outputStack = redo ? this.undoStack_ : this.redoStack_;
  var inputEvent = inputStack.pop();
  if (!inputEvent) {
    return;
  }
  var events = [inputEvent];
  // Do another undo/redo if the next one is of the same group.
  while (inputStack.length && inputEvent.group &&
      inputEvent.group == inputStack[inputStack.length - 1].group) {
    events.push(inputStack.pop());
  }
  // Push these popped events on the opposite stack.
  for (var i = 0, event; event = events[i]; i++) {
    outputStack.push(event);
  }
  events = Blockly.Events.filter(events, redo);
  Blockly.Events.recordUndo = false;
  try {
    for (var i = 0, event; event = events[i]; i++) {
      event.run(redo);
    }
  } finally {
    Blockly.Events.recordUndo = true;
  }
};

/**
 * Clear the undo/redo stacks.
 */
Blockly.Workspace.prototype.clearUndo = function() {
  this.undoStack_.length = 0;
  this.redoStack_.length = 0;
  // Stop any events already in the firing queue from being undoable.
  Blockly.Events.clearPendingUndo();
};

/**
 * When something in this workspace changes, call a function.
 * @param {!Function} func Function to call.
 * @return {!Function} Function that can be passed to
 *     removeChangeListener.
 */
Blockly.Workspace.prototype.addChangeListener = function(func) {
  this.listeners_.push(func);
  return func;
};

/**
 * Stop listening for this workspace's changes.
 * @param {Function} func Function to stop calling.
 */
Blockly.Workspace.prototype.removeChangeListener = function(func) {
  goog.array.remove(this.listeners_, func);
};

/**
 * Fire a change event.
 * @param {!Blockly.Events.Abstract} event Event to fire.
 */
Blockly.Workspace.prototype.fireChangeListener = function(event) {
  if (event.recordUndo) {
    this.undoStack_.push(event);
    this.redoStack_.length = 0;
    if (this.undoStack_.length > this.MAX_UNDO) {
      this.undoStack_.unshift();
    }
  }
  for (var i = 0, func; func = this.listeners_[i]; i++) {
    func(event);
  }
};

/**
 * Remove events of the given group from top of undo stack.
 * @param {!string}
 */
Blockly.Workspace.prototype.removeLatestEvents = function(group) {
  var deleteIndex = this.undoStack_.length;
  for (var i = this.undoStack_.length - 1; 0 <= i; i--) {
    var event = this.undoStack_[i];
    if (!event.group || event.group !== group) {
      break;
    }
    deleteIndex--;
  }
  this.undoStack_.splice(deleteIndex);
};

/**
 * Find the block on this workspace with the specified ID.
 * @param {string} id ID of block to find.
 * @return {Blockly.Block} The sought after block or null if not found.
 */
Blockly.Workspace.prototype.getBlockById = function(id) {
  return this.blockDB_[id] || null;
};

/**
 * Find the comment on this workspace with the specified ID.
 * @param {string} id ID of comment to find.
 * @return {Blockly.WorkspaceComment} The sought after comment or null if not
 *     found.
 * @package
 */
Blockly.Workspace.prototype.getCommentById = function(id) {
  return this.commentDB_[id] || null;
};

/**
 * Checks whether all value and statement inputs in the workspace are filled
 * with blocks.
 * @param {boolean=} opt_shadowBlocksAreFilled An optional argument controlling
 *     whether shadow blocks are counted as filled. Defaults to true.
 * @return {boolean} True if all inputs are filled, false otherwise.
 */
Blockly.Workspace.prototype.allInputsFilled = function(opt_shadowBlocksAreFilled) {
  var blocks = this.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (!block.allInputsFilled(opt_shadowBlocksAreFilled)) {
      return false;
    }
  }
  return true;
};

/**
 * Return the variable map that contains "potential" variables.  These exist in
 * the flyout but not in the workspace.
 * @return {?Blockly.VariableMap} The potential variable map.
 * @package
 */
Blockly.Workspace.prototype.getPotentialVariableMap = function() {
  return this.potentialVariableMap_;
};

/**
 * Create and store the potential variable map for this workspace.
 * @package
 */
Blockly.Workspace.prototype.createPotentialVariableMap = function() {
  this.potentialVariableMap_ = new Blockly.VariableMap(this);
};

/**
 * Return the map of all variables on the workspace.
 * @return {?Blockly.VariableMap} The  variable map.
 */
Blockly.Workspace.prototype.getVariableMap = function() {
  return this.variableMap_;
};

/**
 * Return the top-most workspace in this workspace's tree.
 * @return {!Blockly.Workspace} The top-most workspace
 */
Blockly.Workspace.prototype.getMainWorkspace = function() {
  var mainWorkspace = this;
  while (mainWorkspace.options.parentWorkspace) {
    mainWorkspace = mainWorkspace.options.parentWorkspace;
  }
  return mainWorkspace;
};

/**
 * Update the current workspace options according to the given options.
 * @param {!Object} Workspace options to update. Throws an error if it contains
 *     a property which does not exist in the original options.
 */
Blockly.Workspace.prototype.updateOptions = function(options) {
  var props = Object.keys(options);
  for (var i = 0, prop; prop = props[i]; i++) {
    if (!(prop in this.options)) {
      throw 'Not support for adding a new option.';
    }
  }
  this.RTL = !!options.RTL;
  this.horizontalLayout = !!options.horizontalLayout;
  this.toolboxPosition = options.toolboxPosition;
};

/**
 * Find the workspace with the specified ID.
 * @param {string} id ID of workspace to find.
 * @return {Blockly.Workspace} The sought after workspace or null if not found.
 */
Blockly.Workspace.getById = function(id) {
  return Blockly.WorkspaceTree.findWorkspace(id);
};

// Export symbols that would otherwise be renamed by Closure compiler.
Blockly.Workspace.prototype['clear'] = Blockly.Workspace.prototype.clear;
Blockly.Workspace.prototype['clearUndo'] =
    Blockly.Workspace.prototype.clearUndo;
Blockly.Workspace.prototype['addChangeListener'] =
    Blockly.Workspace.prototype.addChangeListener;
Blockly.Workspace.prototype['removeChangeListener'] =
    Blockly.Workspace.prototype.removeChangeListener;
