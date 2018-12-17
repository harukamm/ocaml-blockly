/**
 * @fileoverview Vertical flyout for workbench.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

goog.provide('Blockly.WorkbenchVerticalFlyout');

goog.require('Blockly.VerticalFlyout');
goog.require('goog.asserts');


/**
 * Class for a flyout.
 * @param {!Object} workspaceOptions Dictionary of options for the workspace.
 * @param {!Blockly.Workbench} workbench The workbench which contains this
 *     flyout.
 * @extends {Blockly.VerticalFlyout}
 * @constructor
 */
Blockly.WorkbenchVerticalFlyout = function(workspaceOptions, workbench) {
  Blockly.WorkbenchVerticalFlyout.superClass_.constructor.call(
      this, workspaceOptions);

  /** @type {!Blockly.Workbench} */
  this.ownerMutator_ = workbench;
};
goog.inherits(Blockly.WorkbenchVerticalFlyout, Blockly.VerticalFlyout);

/**
 * Initializes the flyout.
 * @param {!Blockly.Workspace} targetWorkspace The workspace in which to create
 *     new blocks.
 * @override
 */
Blockly.WorkbenchVerticalFlyout.prototype.init = function(targetWorkspace) {
  goog.asserts.assert(targetWorkspace.isMutator);
  goog.asserts.assert(targetWorkspace.ownerMutator_ == this.ownerMutator_);

  Blockly.WorkbenchVerticalFlyout.superClass_.init.call(this, targetWorkspace);
};

/**
 * Copy a block from the flyout to the workspace and position it correctly.
 * @param {!Blockly.Block} oldBlock The flyout block to copy.
 * @return {!Blockly.Block} The new block in the main workspace.
 * @override
 * @private
 */
Blockly.WorkbenchVerticalFlyout.prototype.placeNewBlock_ = function(oldBlock) {
  var block = Blockly.WorkbenchVerticalFlyout.superClass_.placeNewBlock_.call(
      this, oldBlock);
  // block.replaceTypeExprWith(oldBlock, false);
  // block.render(false);
  return block;
};
