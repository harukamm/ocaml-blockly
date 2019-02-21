'use strict';

goog.provide('Blockly.TypeWorkbench');

goog.require('Blockly.Workbench');

/**
 * Class for a dialog which provides an area for user to work on type
 * declaration blocks.
 * @extends {Blockly.Workbench}
 * @constructor
 */
Blockly.TypeWorkbench = function() {
  Blockly.TypeWorkbench.superClass_.constructor.call(this, null);
};
goog.inherits(Blockly.TypeWorkbench, Blockly.Workbench);

/**
 * Draw the workbench icon.
 * @param {!Element} group The icon group.
 * @private
 * @override
 */
Blockly.TypeWorkbench.prototype.drawIcon_ = function(group) {
  // Square with rounded corners.
  Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyWorkbenchIconShape',
        'rx': '4',
        'ry': '4',
        'height': '16',
        'width': '16'
      },
      group);
  // Path to draw "type".
  Blockly.utils.createSvgElement('path',
      {
        'class': 'blocklyWorkbenchIconSymbol',
        'd': 'm 2,2 h 6 m -5,0 v 6 l -1,1 m 0,-3 h 6 m -1,-4 v 7 m 3,-7 v 5 ' +
            'm 4,-5 v 7 l -1,-1 m 0,2 h -9 m -2,3 h 12 m -5.5,0 v -4'
      },
      group);
};

/**
 * Set the connection whose context this workbench should be bound to.
 * @param {!Blockly.Connetion} connection The connection where this workbench's
 *     context is bound.
 * @param {!Blockly.Input} input The input that connection is attached to.
 * @override
 */
Blockly.TypeWorkbench.prototype.setContextConnection = function(connection,
    input) {
  // NOP. Type workbench is attached to the block instead of an input/connection.
};

/**
 * Finds variable environment which can be referred to inside this workbench.
 * @param {boolean=} opt_includeImplicit False to exclude implicit context
 *     existing in the workspace of the block, and collects only context that
 *     are bound to the block and its ancestors. Defaults to true.
 * @return {!Object} The map to variable value keyed by its name.
 * @override
 */
Blockly.TypeWorkbench.prototype.getContext = function(opt_includeImplicit) {
  return {};
};

/**
 * Finds variables environment bound only to the workbench's block, and able to
 * be referred to by blocks inside this workbench workspace.
 * @return {!Object} The map to variable value keyed by its name.
 * @override
 */
Blockly.TypeWorkbench.prototype.getBlockContext = function() {
  return {};
};

/**
 * Returns whether the block is allowed to enter into this workbench.
 * @param {!Blockly.Block} block The block.
 * @param {Blockly.ErrorCollector=} opt_collector If provided, the reason why
 *     the block can not enter will be stored.
 * @return {boolean} True if this block can enter into this workbench.
 * @override
 */
Blockly.TypeWorkbench.prototype.acceptBlock = function(block, opt_collector) {
  var typeExpr = block.outputConnection && block.outputConnection.typeExpr;
  if (!!typeExpr && typeExpr.isTypeConstructor()) {
    return true;
  }
  if (opt_collector) {
    opt_collector.addTypeWorkbenchRefuseBlock();
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
Blockly.TypeWorkbench.prototype.blocksForFlyout_ = function(flyoutWorkspace) {
  var blocks = [];
  blocks.push(flyoutWorkspace.newBlock('int_type_typed'));
  blocks.push(flyoutWorkspace.newBlock('float_type_typed'));
  blocks.push(flyoutWorkspace.newBlock('bool_type_typed'));
  blocks.push(flyoutWorkspace.newBlock('string_type_typed'));
  blocks.push(flyoutWorkspace.newBlock('pair_type_constructor_typed'));
  for (var i = 0, block; block = blocks[i]; i++) {
    if (goog.isFunction(block.initSvg)) {
      block.initSvg();
    }
  }
  return blocks;
};
