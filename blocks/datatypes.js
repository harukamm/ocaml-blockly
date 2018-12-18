/**
 * @fileoverview blocks related datatype for typed Blockly.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

goog.provide('Blockly.Blocks.DataType');

goog.require('Blockly.Blocks');
goog.require('Blockly');

Blockly.Blocks['defined_datatype_typed'] = {
  // Declare constructor types.
  init: function() {
    this.setColour(160);
    var ctrId = Blockly.utils.genUid();
    var ctrType0 = new Blockly.TypeExpr.CONSTRUCT(ctrId);
    var ctrType1 = new Blockly.TypeExpr.CONSTRUCT(ctrId);
    var variableField0 =
        Blockly.FieldBoundVariable.newValueConstructor(ctrType0);
    var variableField1 =
        Blockly.FieldBoundVariable.newValueConstructor(ctrType1);
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

    this.constructId_ = ctrId;
    this.itemCount_ = 2;
  }
};

Blockly.Blocks['create_construct_typed'] = {
  init: function() {
    this.setColour(160);
    var ctrType = new Blockly.TypeExpr.CONSTRUCT(null);
    var variableField =
        Blockly.FieldBoundVariable.newReferenceConstructor(ctrType);
    this.appendDummyInput()
        .appendField(variableField, 'CONSTRUCTOR');
    this.setOutput(true);
    this.setOutputTypeExpr(ctrType);
  }
};
