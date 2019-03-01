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
 * @return {!Blockly.Block.VariableContext} The variable context.
 * @override
 */
Blockly.PatternWorkbench.prototype.getContext = function(opt_includeImplicit) {
  return new Blockly.Block.VariableContext();
};

/**
 * Finds variables environment bound only to the workbench's block, and able to
 * be referred to by blocks inside this workbench workspace.
 * @return {!Blockly.Block.VariableContext} The variable context.
 * @override
 */
Blockly.PatternWorkbench.prototype.getBlockContext = function() {
  return new Blockly.Block.VariableContext();
};

/**
 * Returns whether the block is allowed to enter into this workbench.
 * @param {!Blockly.Block} block The block.
 * @param {Blockly.ErrorCollector=} opt_collector If provided, the reason why
 *     the block can not enter will be stored.
 * @return {boolean} True if this block can enter into this workbench.
 * @override
 */
Blockly.PatternWorkbench.prototype.acceptBlock = function(block,
    opt_collector) {
  var typeExpr = block.outputConnection && block.outputConnection.typeExpr;
  if (!!typeExpr && typeExpr.isPattern()) {
    return true;
  }
  if (opt_collector) {
    opt_collector.addPatternWorkbenchRefuseBlock();
  }
  return false;
};

/**
 * Creates blocks to show in workbench's flyout on the given workspace.
 * @param {!Blockly.Workspace} flyoutWorkspace The workspace to create blocks.
 * @return {!Array.<!Blockly.Block>} List of blocks to show in a flyout.
 * @override
 * @private
 */
Blockly.PatternWorkbench.prototype.blocksForFlyout_ = function(flyoutWorkspace) {
  return [];
};

/**
 * Updates the shown blocks in the workbench flyout.
 * @override
 */
Blockly.PatternWorkbench.prototype.updateFlyoutTree = function() {
  if (!this.workspace_ || !this.workspace_.flyout_) {
    return;
  }
  var contentsMap = {
    'list': ['empty_construct_pattern_typed',
        'cons_construct_pattern_typed'],
    'pair': ['pair_pattern_typed']
  };
  var keys = Object.keys(contentsMap);
  var children = [];
  for (var i = 0, name; name = keys[i]; i++) {
    var label = goog.dom.createDom('label');
    label.setAttribute('text', name);
    label.setAttribute('gap', '5');
    children.push(label);

    var blockNames = contentsMap[name];
    for (var j = 0, blockName; blockName = blockNames[j]; j++) {
      var blockXml = goog.dom.createDom('block', {'type': blockName});
      blockXml.setAttribute('gap', '5');
      children.push(blockXml);
    }
  }
  this.workspace_.flyout_.show(children);
  this.updateScreen_();
};
