/**
 * @fileoverview Mutator blocks to handle parameters, and inputs.
 * Used by typed blocks.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

goog.provide('Blockly.Parameters');

goog.require('Blockly.Blocks');
goog.require('Blockly');

Blockly.Blocks['args_create_with_item'] = {
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
    this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_ITEM_TOOLTIP']);
    this.contextMenu = false;
  }
};

Blockly.Blocks['args_create_with_container'] = {
  /**
   * Mutator block for arguments container.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Msg['LISTS_HUE']);
    this.appendDummyInput()
        .appendField('args');
    this.appendStatementInput('STACK');
    this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_CONTAINER_TOOLTIP']);
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
