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
 * Draw the workbench icon.
 * @param {!Element} group The icon group.
 * @private
 */
Blockly.PatternWorkbench.prototype.drawIcon_ = function(group) {
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
  // Gear teeth.
  Blockly.utils.createSvgElement('path',
      {
        'class': 'blocklyWorkbenchIconSymbol',
        'd': 'm 5,2 l -3,11 m 6,-11 l 4,11 m 0,-11 a 2,2 0 1,0 0.01,0'
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
  var contentsMap = this.getContentsMap_();
  var keys = Object.keys(contentsMap);
  var children = [];
  for (var i = 0, name; name = keys[i]; i++) {
    var label = goog.dom.createDom('label');
    label.setAttribute('text', name);
    label.setAttribute('gap', '5');
    children.push(label);

    var blockXmlList = contentsMap[name];
    for (var j = 0, blockXml; blockXml = blockXmlList[j]; j++) {
      blockXml.setAttribute('gap', '5');
      children.push(blockXml);
    }
  }
  this.workspace_.flyout_.show(children);
  this.updateScreen_();
};

/**
 * Get a map that maps from block's name to a list of pattern block XML.
 * @return {Object.<string,!Array.<!Element>>} Object mapping category name
 *     to block XML list.
 */
Blockly.PatternWorkbench.prototype.getContentsMap_ = function() {
  var map = {
    'list': ['empty_construct_pattern_typed',
        'cons_construct_pattern_typed'],
    'pair': ['pair_pattern_typed']
  };
  var keys = Object.keys(map);
  var contentsMap = {};
  var children = [];
  for (var i = 0, name; name = keys[i]; i++) {
    var blockXmlList = [];
    var blockNames = map[name];
    for (var j = 0, blockName; blockName = blockNames[j]; j++) {
      var blockXml = goog.dom.createDom('block', {'type': blockName});
      blockXmlList.push(blockXml);
    }
    contentsMap[name] = blockXmlList;
  }
  var parentConnection = this.block_.outputConnection ?
      this.block_.outputConnection.targetConnection : null;
  var parentBlock = parentConnection &&
      parentConnection.getSourceBlock();
  if (!parentBlock || !parentConnection) {
    return contentsMap;
  }
  var ctx = parentBlock.allVisibleVariables(parentConnection);
  var recordValues = ctx.getVariablesWithLabel(
      Blockly.BoundVariableAbstract.RECORD);
  if (recordValues.length != 0) {
    var blockXmlList = [];
    for (var i = 0, val; val = recordValues[i]; i++) {
      var blockXml = goog.dom.createDom('block',
          {'type': 'record_pattern_typed'});
      var field = goog.dom.createDom('field', {}, val.getVariableName());
      var typeName = Blockly.BoundVariableAbstract.labelToName(val.label);
      field.setAttribute('name', 'RECORD');
      field.setAttribute('isvalue', 'false');
      field.setAttribute('variable-type', typeName);

      var valueDom = goog.dom.createDom('refer-to');
      valueDom.setAttribute('id', val.getId());
      valueDom.setAttribute('workspace-id', val.getWorkspace().id);
      field.appendChild(valueDom);

      blockXml.appendChild(field);
      blockXmlList.push(blockXml);
    }
    contentsMap['record'] = blockXmlList;
  }
  return contentsMap;
};
