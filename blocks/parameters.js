/**
 * @fileoverview Mutator blocks to handle parameters, and inputs.
 * Used by typed blocks.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

goog.require('Blockly.Blocks');
goog.require('Blockly');

Blockly.Blocks['item_template'] = {
  init: function(str) {
    this.setColour(Blockly.Msg['LISTS_HUE']);
    this.appendDummyInput()
        .appendField(str);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.contextMenu = false;
  }
};

Blockly.Blocks['container_template'] = {
  init: function(str) {
    this.setColour(Blockly.Msg['LISTS_HUE']);
    this.appendDummyInput()
        .appendField(str);
    this.appendStatementInput('STACK');
    this.contextMenu = false;
  },

  /**
   * Returns how many blocks exist in this container.
   * @return {number} Number of blocks this container holds.
   */
  getItemCount: function() {
    var itemBlock = this.getInputTargetBlock('STACK');
    var itemCount = 0;
    while (itemBlock) {
      itemCount++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    return itemCount;
  },

  /**
   * Append the block at the tail of statement connection.
   * @param {!Blockly.Block} block The block to be connected to this block.
   */
  append: function(block) {
    var connection = this.getInput('STACK').connection;
    connection.connect(block.previousConnection);
  }
};

Blockly.Blocks['parameters_arg_item'] =
  Object.assign({}, Blockly.Blocks['item_template']);
Blockly.Blocks['parameters_arg_item'].init = function() {
  Blockly.Blocks['item_template'].init.call(this, 'parameter');
};

Blockly.Blocks['parameters_arg_container'] =
  Object.assign({}, Blockly.Blocks['container_template']);
Blockly.Blocks['parameters_arg_container'].init = function() {
  Blockly.Blocks['container_template'].init.call(this, 'parameters');
};

Blockly.Blocks['constructor_variant_item'] =
  Object.assign({}, Blockly.Blocks['item_template']);
Blockly.Blocks['constructor_variant_item'].init = function() {
  Blockly.Blocks['item_template'].init.call(this, 'constructor');
};

Blockly.Blocks['constructor_variant_container'] =
  Object.assign({}, Blockly.Blocks['container_template']);
Blockly.Blocks['constructor_variant_container'].init = function() {
  Blockly.Blocks['container_template'].init.call(this, 'variant');
};

Blockly.Blocks['match_pattern_item'] =
  Object.assign({}, Blockly.Blocks['item_template']);
Blockly.Blocks['match_pattern_item'].init = function() {
  Blockly.Blocks['item_template'].init.call(this, 'pattern');
};

Blockly.Blocks['match_pattern_container'] =
  Object.assign({}, Blockly.Blocks['container_template']);
Blockly.Blocks['match_pattern_container'].init = function() {
  Blockly.Blocks['container_template'].init.call(this, 'match');
};
