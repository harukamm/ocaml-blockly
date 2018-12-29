/**
 * @fileoverview blocks related datatype for typed Blockly.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

goog.require('Blockly.Blocks');
goog.require('Blockly');

Blockly.Blocks['defined_datatype_typed'] = {
  // Declare constructor types.
  init: function() {
    this.setColour(160);
    var validator = Blockly.BoundVariables.variableNameValidator.bind(null,
        Blockly.BoundVariableAbstract.VALUE_VARIABLE);
    var ctrId = Blockly.utils.genUid();
    var ctrType0 = new Blockly.TypeExpr.CONSTRUCT(ctrId);
    var ctrType1 = new Blockly.TypeExpr.CONSTRUCT(ctrId);
    var variableField0 =
        Blockly.FieldBoundVariable.newValueConstructor(ctrType0);
    var variableField1 =
        Blockly.FieldBoundVariable.newValueConstructor(ctrType1);
    this.appendDummyInput()
        .appendField('type ')
        .appendField(new Blockly.FieldTextInput('data', validator), 'DATANAME')
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
    /** @type {!Object<!string, string|null>} */
    this.lastTypeCtor_ = {'CTR0': null, 'CTR1': null};
  },

  typeExprReplaced() {
    throw 'Not allowed to replace type expression for value construct.';
  },

  getTypeCtorDef: function(fieldName) {
    return fieldName in this.lastTypeCtor_ ?
        this.lastTypeCtor_[fieldName] : null;
  },

  getTypeScheme(fieldName) {
    if (fieldName.startsWith('CTR')) {
      var numstr = fieldName.substring(3);
      var x = parseInt(numstr);
      if (!isNaN(x) && x < this.itemCount_) {
        return new Blockly.TypeExpr.CONSTRUCT(this.constructId_);
      }
    }
    return null;
  },

  infer: function(ctx) {
    for (var x = 0; x < this.itemCount_; x++) {
      var inputName = 'CTR_INP' + x;
      var block = this.getInputTargetBlock(inputName);
      if (!block) {
        this.lastTypeCtor_['CTR' + x] = null;
        continue;
      }
      var outType = block.outputConnection &&
          block.outputConnection.typeExpr;
      goog.asserts.assert(!!outType);
      outType.unify(new Blockly.TypeExpr.TYPE_CONSTRUCTOR);

      var typeCtor = block.getTypeCtor();
      this.lastTypeCtor_['CTR' + x] = typeCtor;
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
    this.definition_ = null;
    this.setInputsInline(true);
  },

  infer: function(ctx) {
    var outType = this.outputConnection.typeExpr;
    var value = this.getField('CONSTRUCTOR').getBoundValue();
    if (!value) {
      return outType;
    }
    // TODO(harukam): Move the following code to the bound-varaible class.
    var valueBlock = value.getSourceBlock();
    var fieldName = value.getContainerFieldName();
    var def = valueBlock.getTypeCtorDef(fieldName);

    var input = this.getInput('PARAM');

    if (input && this.definition_ === def) {
      var expected = input.connection.typeExpr;
      var paramType = this.callInfer('PARAM', ctx);
      if (paramType) {
        expected.unify(paramType);
      }
      return outType;
    }

    if (!input) {
      if (def === 'int') {
        this.appendValueInput('PARAM')
            .setTypeExpr(new Blockly.TypeExpr.INT())
      } else if (def === 'float') {
        this.appendValueInput('PARAM')
            .setTypeExpr(new Blockly.TypeExpr.FLOAT())
      } else if (def === null) {
        // Do nothing. there is no arguments.
      } else {
        goog.asserts.assert(false, 'Unknown type ctor.');
      }
    }
    if (input && !def) {
      // Definition is cleared by user.
      var targetBlock = input.connection.targetBlock();
      this.removeInput('PARAM');
      if (targetBlock) {
        throw 'Pass error collector instead of array to collect undefined ' +
            'variables.';
        // TODO(harukam): Fix.
        var unresolvedRefs = [];
        targetBlock.resolveReference(null, false, null, unresolvedRefs);

        for (var i = 0, ref; ref = unresolvedRefs[i]; i++) {
          ref.getSourceBlock().dispose();
        }
      }
    }
    this.definition_ = def;
    return outType;
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
  },

  getTypeCtor: function() {
    // Note: Currently nested type constructor is not supported, so simply
    // using string to represent it.
    return 'int';
  },

  canBeUnplugged: function() {
    var parent = this.getParent();
    if (!parent) {
      return true;
    }
    // TODO(harukam): Ask the parent, which must be define-datatypes block,
    // whether changing definition of datatype is fine or not.
    return true;
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
  },

  getTypeCtor: function() {
    return 'float';
  },

  canBeUnplugged: function() {
    var parent = this.getParent();
    if (!parent) {
      return true;
    }
    // TODO(harukam): Ask the parent, which must be define-datatypes block,
    // whether changing definition of datatype is fine or not.
    return true;
  }
};

Blockly.Blocks['empty_construct_pattern_typed'] = {
  init: function() {
    var A = Blockly.TypeExpr.generateTypeVar();
    var list = new Blockly.TypeExpr.LIST(A);
    this.setColour(Blockly.Msg['PATTERN_HUE']);
    this.appendDummyInput()
        .appendField('[ ]');
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr.PATTERN(list));
    this.setInputsInline(true);
  },

  transformToValue: function(workspace) {
    var valueBlock = workspace.newBlock('empty_construct_pattern_typed');
    valueBlock.initSvg();
    valueBlock.render();
    return valueBlock;
  },

  clearTypes: function() {
    var type = this.outputConnection.typeExpr.pattExpr;
    type.element_type.clear();
  }
};

Blockly.Blocks['cons_construct_pattern_typed'] = {
  init: function() {
    var A = Blockly.TypeExpr.generateTypeVar();
    var list = new Blockly.TypeExpr.LIST(A);
    var validator = Blockly.BoundVariables.variableNameValidator.bind(null,
        Blockly.BoundVariableAbstract.VALUE_VARIABLE);
    this.setColour(Blockly.Msg['PATTERN_HUE']);
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('x', validator), 'FIRST')
        .appendField('::')
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('xs', validator), 'CONS');
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr.PATTERN(list));
    this.setInputsInline(true);
  },

  transformToValue: function(workspace) {
    var valueBlock = workspace.newBlock(
        'cons_construct_pattern_value_typed');
    var first = this.getField('FIRST');
    var cons = this.getField('CONS');
    valueBlock.initSvg();
    valueBlock.render();
    valueBlock.typedValue['FIRST'].setVariableName(first.getText());
    valueBlock.typedValue['CONS'].setVariableName(cons.getText());
    return valueBlock;
  },

  clearTypes: function() {
    var type = this.outputConnection.typeExpr.pattExpr;
    type.element_type.clear();
  }
};

Blockly.Blocks['cons_construct_pattern_value_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['PATTERN_HUE']);
    var A = Blockly.TypeExpr.generateTypeVar();
    var list = new Blockly.TypeExpr.LIST(A);
    var firstVariable = Blockly.FieldBoundVariable.newValue(A, 'x');
    var consVariable = Blockly.FieldBoundVariable.newValue(list, 'xs');

    this.appendDummyInput()
        .appendField(firstVariable, 'FIRST')
        .appendField(':: ')
    this.appendDummyInput()
        .appendField(consVariable, 'CONS');
     this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr.PATTERN(list));
    this.setInputsInline(true);
  },

  getTypeScheme: function(fieldName) {
    if (fieldName !== 'FIRST' && fieldName !== 'CONS') {
      return null;
    }
    if (fieldName === 'FIRST') {
      var type = this.typedValue['FIRST'].getTypeExpr();
    } else {
      var type = this.typedValue['CONS'].getTypeExpr();
    }
    return Blockly.Scheme.monoType(type);
  },

  updateUpperContext: function(map) {
    var parent = this.getParent();
    if (parent && parent.type !== 'match_typed') {
      return;
    }
    var fstName = this.typedValue['FIRST'].getVariableName();
    var consName = this.typedValue['CONS'].getVariableName();
    map[fstName] = this.typedValue['FIRST'];
    map[consName] = this.typedValue['CONS'];
  },

  clearTypes: function() {
    var type = this.outputConnection.typeExpr.pattExpr;
    type.element_type.clear();
  }
};
