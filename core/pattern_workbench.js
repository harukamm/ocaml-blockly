'use strict';

goog.provide('Blockly.PatternWorkbench');

goog.require('Blockly.Workbench');

/**
 * Class for a dialog which provides an area for user to work on pattern
 * blocks for a match block.
 * @extends {Blockly.Workbench}
 * @constructor
 */
Blockly.PatternWorkbench = function() {
  Blockly.PatternWorkbench.superClass_.constructor.call(this, null);
};
goog.inherits(Blockly.PatternWorkbench, Blockly.Workbench);

/**
 * Set the connection whose context this workbench should be bound to.
 * @param {!Blockly.Connetion} connection The connection where this workbench's
 *     context is bound.
 * @param {!Blockly.Input} input The input that connection is attached to.
 * @override
 */
Blockly.PatternWorkbench.prototype.setContextConnection = function(connection,
    input) {
  // NOP. Pattern workbench is attached to the block instead of an input/connection.
};

/**
 * Finds variable environment which can be referred to inside this workbench.
 * @param {boolean=} opt_includeImplicit False to exclude implicit context
 *     existing in the workspace of the block, and collects only context that
 *     are bound to the block and its ancestors. Defaults to true.
 * @return {!Object} The map to variable value keyed by its name.
 * @override
 */
Blockly.PatternWorkbench.prototype.getContext = function(opt_includeImplicit) {
  return {};
};

/**
 * Finds variables environment bound only to the workbench's block, and able to
 * be referred to by blocks inside this workbench workspace.
 * @return {!Object} The map to variable value keyed by its name.
 * @override
 */
Blockly.PatternWorkbench.prototype.getBlockContext = function() {
  return {};
};

/**
 * Creates blocks to show in workbench's flyout on the given workspace.
 * @param {!Blockly.Workspace} flyoutWorkspace The workspace to create blocks.
 * @return {!Array.<!Blockly.Block>} List of blocks to show in a flyout.
 */
Blockly.PatternWorkbench.prototype.blocksForFlyout = function(flyoutWorkspace) {
  var blocks = [];
  blocks.push(flyoutWorkspace.newBlock('empty_construct_pattern_typed'));
  blocks.push(flyoutWorkspace.newBlock('cons_construct_pattern_typed'));
  for (var i = 0, block; block = blocks[i]; i++) {
    if (goog.isFunction(block.initSvg)) {
      block.initSvg();
    }
  }
  return blocks;
};
