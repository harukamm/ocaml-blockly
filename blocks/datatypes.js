/**
 * @fileoverview blocks related datatype for typed Blockly.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

goog.provide('Blockly.Blocks.DataType');

goog.require('Blockly.Blocks');
goog.require('Blockly');

Blockly.Blocks['defined_datatype_typed'] = {
  init: function() {
    this.setColour(160);
    var variableField0 = Blockly.FieldBoundVariable.newValue(A, 'NONE');
    var variableField1 = Blockly.FieldBoundVariable.newValue(B, 'NONE');
    this.appendDummyInput()
        .appendField('type ')
        .appendField(new Blockly.FieldTextInput('data'), 'NAME')
        .appendField('=');
    this.appendValueInput('VARIANT_INP0')
        .appendField('|')
        .appendField(variableField0, 'VARIANT0')
        .appendField('of')
        .setAlign(Blockly.ALIGN_RIGHT);
    this.appendValueInput('VARIANT_INP1')
        .appendField('|')
        .appendField(variableField1, 'VARIANT1')
        .appendField('of')
        .setAlign(Blockly.ALIGN_RIGHT)
    this.setOutput(false);
    this.itemCount_ = 2;
  }
};

