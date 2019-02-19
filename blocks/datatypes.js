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

    this.appendDummyInput()
        .appendField('type ')
        .appendField(new Blockly.FieldTextInput('data', validator), 'DATANAME')
        .appendField('=');

    this.constructId_ = Blockly.utils.genUid();
    this.itemCount_ = 0;
    this.appendCtorInput();
    this.appendCtorInput();

    this.setOutput(false);
    this.setMutator(new Blockly.Mutator(['constructor_variant_item']));
    this.setWorkbench(new Blockly.TypeWorkbench());

    this.disableTransfer_ = true;
  },

  typeExprReplaced() {
    throw 'Not allowed to replace type expression for value construct.';
  },

  getCtorId: function() {
    return this.constructId_;
  },

  getTypeCtorDef: function(fieldName) {
    if (!fieldName.startsWith('CTR')) {
      return undefined;
    }
    var n = parseInt(fieldName.substring(3));
    if (isNaN(n) || this.itemCount_ <= n) {
      return undefined;
    }
    var inputName = 'CTR_INP' + n;
    var block = this.getInputTargetBlock(inputName);
    if (!block) {
      return null;
    }
    var typeCtor = block.getTypeCtor();
    return typeCtor;
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

  appendCtorInput: function() {
    var ctrType = new Blockly.TypeExpr.CONSTRUCT(this.constructId_);
    var variableField =
        Blockly.FieldBoundVariable.newValueConstructor(ctrType);
    var index = this.itemCount_++;
    this.appendValueInput('CTR_INP' + index)
        .appendField('|')
        .appendField(variableField, 'CTR' + index)
        .appendField('of')
        .setTypeExpr(new Blockly.TypeExpr.TYPE_CONSTRUCTOR())
        .setAlign(Blockly.ALIGN_RIGHT);
  },

  /**
   * Create XML to represent constructor inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the constructor inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    while (0 < this.itemCount_) {
      var index = this.itemCount_ - 1;
      this.removeInput('CTR_INP' + index);
      this.itemCount_--;
    }

    var newItemCount = parseInt(xmlElement.getAttribute('items')) || 2;
    for (var i = 0; i < newItemCount; i++) {
      this.appendCtorInput();
    }
    goog.asserts.assert(this.itemCount_ == newItemCount);
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock =
        workspace.newBlock('constructor_variant_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.itemCount_; x++) {
      var itemBlock = workspace.newBlock('constructor_variant_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    var itemCount = containerBlock.getItemCount();
    while (itemCount < this.itemCount_) {
      var index = this.itemCount_ - 1;
      this.removeInput('CTR_INP' + index);
      this.itemCount_--;
    }
    while (this.itemCount_ < itemCount) {
      this.appendCtorInput();
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
    goog.asserts.assert(def === null || def === 'int' ||
        def === 'float', 'Unknown type ctor.');

    var input = this.getInput('PARAM');

    if (def === 'int' && !input) {
      this.appendValueInput('PARAM')
          .setTypeExpr(new Blockly.TypeExpr.INT())
    } else if (def === 'float' && !input) {
      this.appendValueInput('PARAM')
          .setTypeExpr(new Blockly.TypeExpr.FLOAT())
    } else if (def === null && input) {
      // Definition is cleared by user.
      var targetBlock = input.connection.targetBlock();
      this.removeInput('PARAM');
      input = null;
      if (targetBlock) {
        var unresolvedRefs = targetBlock.getUnboundVariables();
        for (var i = 0, ref; ref = unresolvedRefs[i]; i++) {
          ref.getSourceBlock().dispose();
        }
      }
    }
    if (input) {
      var expected = input.connection.typeExpr;
      var paramType = this.callInfer('PARAM', ctx);
      if (paramType) {
        expected.unify(paramType);
      }
    }
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
