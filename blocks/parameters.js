/**
 * @fileoverview Mutator blocks to handle parameters, and inputs.
 * Used by typed blocks.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

goog.require('Blockly.Blocks');
goog.require('Blockly');

Blockly.Blocks['parameters_arg_item'] = {
  /**
   * Mutator block for adding arguments.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Msg['LISTS_HUE']);
    this.appendDummyInput()
        .appendField('x');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.contextMenu = false;
  }
};

Blockly.Blocks['parameters_arg_container'] = {
  /**
   * Mutator block for arguments container.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Msg['LISTS_HUE']);
    this.appendDummyInput()
        .appendField('args');
    this.appendStatementInput('STACK');
    this.contextMenu = false;
  },

  /**
   * Returns how many argument blocks exist in this container.
   * @return {number} Number of argument blocks this container holds.
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
