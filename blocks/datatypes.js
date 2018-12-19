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
    this.appendValueInput('CTR_INP0')
        .appendField('|')
        .appendField(variableField0, 'CTR0')
        .appendField('of')
        .setTypeExpr(new Blockly.TypeExpr.TYPE_CONSTRUCTOR())
        .setAlign(Blockly.ALIGN_RIGHT);
    this.appendValueInput('CTR_INP1')
        .appendField('|')
        .appendField(variableField1, 'CTR1')
        .appendField('of')
        .setTypeExpr(new Blockly.TypeExpr.TYPE_CONSTRUCTOR())
        .setAlign(Blockly.ALIGN_RIGHT);
    this.setOutput(false);

    this.constructId_ = ctrId;
    this.itemCount_ = 2;
    this.disableTransfer_ = true;
  },

  typeExprReplaced() {
    throw 'Not allowed to replace type expression for value construct.';
  },

  getTypeScheme(fieldName) {
    if (fieldName.startsWith('CTR')) {
      var numstr = fieldName.substring(3);
      var x = parseInt(numstr);
      if (!isNaN(x) && x < this.itemCount_) {
        var name = 'CTR' + x;
        var field = this.getField(name);
        var variable = field.getVariable();
        return Blockly.Scheme.monoType(variable.getTypeExpr());
      }
    }
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

Blockly.Blocks['int_type_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['TYPES_HUE']);
    this.appendDummyInput()
        .appendField('int');
    this.setOutput(true);
    var typeCtrType = new Blockly.TypeExpr.TYPE_CONSTRUCTOR();
    this.setOutputTypeExpr(typeCtrType);
  }
};

Blockly.Blocks['float_type_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['TYPES_HUE']);
    this.appendDummyInput()
        .appendField('float');
    this.setOutput(true);
    var typeCtrType = new Blockly.TypeExpr.TYPE_CONSTRUCTOR();
    this.setOutputTypeExpr(typeCtrType);
  }
};
