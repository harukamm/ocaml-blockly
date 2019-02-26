/**
 * @fileoverview blocks related datatype for typed Blockly.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

goog.require('Blockly.Blocks');
goog.require('Blockly');

Blockly.Blocks['defined_recordtype_typed'] = {
  // Declare record types.
  init: function() {
    this.setColour('#008b8b');

    this.recordId_ = Blockly.utils.genUid();
    var record_type = new Blockly.TypeExpr.RECORD(this.recordId_);
    var typename_field = Blockly.FieldBoundVariable.newValueRecord(record_type);

    this.appendDummyInput()
        .appendField('type ')
        .appendField(typename_field, 'DATANAME')
        .appendField('= {');

    this.itemCount_ = 0;
    this.appendRecordFieldInput();
    this.appendRecordFieldInput();
    this.appendDummyInput('RBRACE')
        .appendField('}')
        .setAlign(Blockly.ALIGN_RIGHT);
    this.setInputsInline(false);

    this.setOutput(false);
    this.setMutator(new Blockly.Mutator(['constructor_variant_item']));
    this.setWorkbench(new Blockly.TypeWorkbench());

    this.disableTransfer_ = true;
  },

  typeExprReplaced() {
    throw 'Not allowed to replace type expression for record.';
  },

  getStructureId: function() {
    return this.recordId_;
  },

  getRecordDef: function(fieldName) {
    goog.asserts.fail('Not implemented yet.');
  },

  getTypeScheme: function(fieldName) {
    if (fieldName === 'DATANAME') {
      return new Blockly.TypeExpr.RECORD(this.recordId_);
    }
    return null;
  },

  appendRecordFieldInput: function() {
    var field = this.getField('DATANAME');
    var variableField =
        Blockly.FieldBoundVariable.newValueRecordField(null);
    field.setChildValue(variableField);
    var index = this.itemCount_++;
    this.appendValueInput('FIELD_INP' + index)
        .appendField(variableField, 'FIELD' + index)
        .appendField(':')
        .setTypeExpr(new Blockly.TypeExpr.TYPE_CONSTRUCTOR())
        .setAlign(Blockly.ALIGN_RIGHT);
  },

  resizeRecordFieldInputs: function(expectedCount) {
    while (expectedCount < this.itemCount_) {
      var index = this.itemCount_ - 1;
      // Decrement the size of items first. The function this.removeInput()
      // might disconnect some blocks from this block, and disconnecting blocks
      // triggers type inference, which causes a null pointer exception. To
      // avoid the type inference for the removed input, update the size of
      // items first.
      this.itemCount_--;
      this.removeInput('FIELD_INP' + index);
    }
    if (this.itemCount_ < expectedCount) {
      this.removeInput('RBRACE');
      while (this.itemCount_ < expectedCount) {
        this.appendRecordFieldInput();
      }
      this.appendDummyInput('RBRACE')
          .appendField('}')
          .setAlign(Blockly.ALIGN_RIGHT);
    }
  },

  /**
   * Create XML to represent record field inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the record field inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var newItemCount = parseInt(xmlElement.getAttribute('items')) || 2;
    this.resizeRecordFieldInputs(newItemCount);
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
    this.resizeRecordFieldInputs(itemCount);
  }
};

Blockly.Blocks['create_record_typed'] = {
  init: function() {
    this.setColour('#008b8b');
    var recordType = new Blockly.TypeExpr.RECORD(null);
    var variableField =
        Blockly.FieldBoundVariable.newReferenceRecord(recordType);
    this.appendDummyInput()
        .appendField(variableField, 'RECORD')
        .appendField('{');
    this.appendDummyInput('RBRACE')
        .appendField('}');
    this.setOutput(true);
    this.setOutputTypeExpr(recordType);
    this.setInputsInline(true);

    this.fieldCount_ = 0;
  },

  appendFieldInput: function(index) {
    var storedRendered = this.rendered;
    this.rendered = false;
    var field = Blockly.FieldBoundVariable.newReferenceRecordField(null);
    var input = this.appendValueInput('FIELD_INP' + index);
    if (index != 0) {
      input.appendField(';');
    }
    input.appendField(field, 'FIELD' + index)
    input.appendField('=');
    this.rendered = storedRendered;
    this.fieldCount_++;
  },

  updateStructure: function() {
    var reference = this.getField('RECORD').getVariable();
    var value = reference.getBoundValue();
    var children = value ? value.getChildren() : [];
    while (children.length < this.fieldCount_) {
      var index = --this.fieldCount_;
      this.removeInput('FIELD_INP' + index);
    }
    for (var i = 0; i < children.length; i++) {
      if (this.fieldCount_ <= i) {
        this.appendFieldInput(i);
      }
      var field = this.getField('FIELD' + i);
      field.setVariableName(children[i].getVariableName());
      field.setBoundValue(children[i]);
    }
    if (goog.array.last(this.inputList).name != 'RBRACE') {
      this.removeInput('RBRACE');
      this.appendDummyInput('RBRACE')
          .appendField('}');
    }
    if (goog.isFunction(this.initSvg)) {
      this.initSvg();
    }
  },

  infer: function() {
    this.updateStructure();
  }
};

Blockly.Blocks['defined_datatype_typed'] = {
  // Declare constructor types.
  init: function() {
    this.setColour(160);
    var validator = Blockly.BoundVariables.variableNameValidator.bind(null,
        Blockly.BoundVariableAbstract.VARIABLE);

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

  getStructureId: function() {
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

  getTypeScheme: function(fieldName) {
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

  resizeCtorInputs: function(expectedCount) {
    while (expectedCount < this.itemCount_) {
      var index = this.itemCount_ - 1;
      // Decrement the size of items first. The function this.removeInput()
      // might disconnect some blocks from this block, and disconnecting blocks
      // triggers type inference, which causes a null pointer exception. To
      // avoid the type inference for the removed input, update the size of
      // items first.
      this.itemCount_--;
      this.removeInput('CTR_INP' + index);
    }
    while (this.itemCount_ < expectedCount) {
      this.appendCtorInput();
    }
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
    var newItemCount = parseInt(xmlElement.getAttribute('items')) || 2;
    this.resizeCtorInputs(newItemCount);
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
    this.resizeCtorInputs(itemCount);
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

  removeInputSafely_: function(input) {
    if (!input || this.inputList.indexOf(input) == -1) {
      return;
    }
    var targetBlock = input.connection ?
        input.connection.targetBlock() : null;
    this.removeInput(input.name);
    if (targetBlock) {
      var unresolvedRefs = targetBlock.getUnboundVariables();
      for (var i = 0, ref; ref = unresolvedRefs[i]; i++) {
        ref.getSourceBlock().dispose();
      }
    }
  },

  updateAndGetParameterInputs_: function() {
    // TODO(harukam): Move the following code to the bound-varaible class.
    var value = this.getField('CONSTRUCTOR').getBoundValue();
    if (!value) {
      return [];
    }
    var valueBlock = value.getSourceBlock();
    var fieldName = value.getMainFieldName();
    var def = valueBlock.getTypeCtorDef(fieldName);
    goog.asserts.assert(def !== undefined, 'Unknown type ctor.');

    var lparenInput = this.getInput('LPAREN');
    var rparenInput = this.getInput('RPAREN');
    var paramSize = def == null ? 0 : (def.isPair() ? 2 : 1);
    var paramInputs = [];

    if (paramSize == 0) {
      this.removeInputSafely_(lparenInput);
      this.removeInputSafely_(rparenInput);
    }

    // Collect current parameter inputs. If there are more inputs than
    // paramSize expects, remove them.
    var copiedInputList = [].concat(this.inputList);
    for (var i = 0, input; input = copiedInputList[i]; i++) {
      var m = input.name && input.name.match(/PARAM(\d+)/);
      if (!m) {
        continue;
      }
      var index = parseInt(m[1]);
      var currentSize = index + 1;
      if (paramSize < currentSize) {
        this.removeInputSafely_(input);
        continue;
      }
      if (1 <= index) {
        var prevInput = paramInputs[index - 1];
        goog.asserts.assert(!!prevInput);
      }
      paramInputs.push(input);
    }

    if (0 < paramSize && !lparenInput) {
      goog.asserts.assert(paramInputs.length == 0);
      this.appendDummyInput('LPAREN')
          .appendField('(');
    }
    // Add additional parameter inputs.
    var currentSize = paramInputs.length;
    for (; currentSize < paramSize; currentSize++) {
      var index = currentSize;
      var input = this.appendValueInput('PARAM' + index);
      if (index != 0) {
        input.appendField(',');
      }
      paramInputs.push(input);
    }
    if (0 < paramSize && !rparenInput) {
      this.appendDummyInput('RPAREN')
          .appendField(')');
    }

    // Set type expression on the value paramInputs if necessary.
    if (def == null) {
      // NOP. There are no parameters.
    } else if (def.isInt()) {
      paramInputs[0].setTypeExpr(new Blockly.TypeExpr.INT(), true);
    } else if (def.isFloat()) {
      paramInputs[0].setTypeExpr(new Blockly.TypeExpr.FLOAT(), true);
    } else if (def.isBool()) {
      paramInputs[0].setTypeExpr(new Blockly.TypeExpr.BOOL(), true);
    } else if (def.isString()) {
      paramInputs[0].setTypeExpr(new Blockly.TypeExpr.STRING(), true);	
    } else if (def.isPair()) {
      paramInputs[0].setTypeExpr(def.first_type, true);
      paramInputs[1].setTypeExpr(def.second_type, true);
    } else {
      goog.asserts.fail('Not supported type ctor: ' + def.toString());
    }
    return paramInputs;
  },

  updateStructure: function() {
    this.updateAndGetParameterInputs_();
  },

  infer: function(ctx) {
    var outType = this.outputConnection.typeExpr;
    var paramInputs = this.updateAndGetParameterInputs_();
    for (var i = 0, input; input = paramInputs[i]; i++) {
      if (!input) {
        continue;
      }
      var expected = input.connection.typeExpr;
      var paramType = this.callInfer(input.name, ctx);
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
    return new Blockly.TypeExpr.INT();
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
    return new Blockly.TypeExpr.FLOAT();
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

Blockly.Blocks['bool_type_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['TYPES_HUE']);
    this.appendDummyInput()
        .appendField('bool');
    this.setOutput(true);
    var typeCtrType = new Blockly.TypeExpr.TYPE_CONSTRUCTOR();
    this.setOutputTypeExpr(typeCtrType);
  },

  getTypeCtor: function() {
    return new Blockly.TypeExpr.BOOL();
  }
};

Blockly.Blocks['string_type_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['TYPES_HUE']);
    this.appendDummyInput()
        .appendField('string');
    this.setOutput(true);
    var typeCtrType = new Blockly.TypeExpr.TYPE_CONSTRUCTOR();
    this.setOutputTypeExpr(typeCtrType);
  },

  getTypeCtor: function() {
    return new Blockly.TypeExpr.STRING();
  }
};

Blockly.Blocks['pair_type_constructor_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['TYPES_HUE']);
    this.appendValueInput('LEFT')
        .setTypeExpr(new Blockly.TypeExpr.TYPE_CONSTRUCTOR());
    this.appendValueInput('RIGHT')
        .appendField('*')
        .setTypeExpr(new Blockly.TypeExpr.TYPE_CONSTRUCTOR());
    this.setOutput(true);
    this.setInputsInline(true);
    var typeCtrType = new Blockly.TypeExpr.TYPE_CONSTRUCTOR();
    this.setOutputTypeExpr(typeCtrType);
  },

  getTypeCtor: function() {
    var leftBlock = this.getInputTargetBlock('LEFT');
    var rightBlock = this.getInputTargetBlock('RIGHT');
    // TODO(harukam): Create new type expression to represent disabled
    // connections, and give it if leftBlock/rightBlock is null.
    var left = leftBlock ? leftBlock.getTypeCtor() : null;
    var right = rightBlock ? rightBlock.getTypeCtor() : null;
    return new Blockly.TypeExpr.PAIR(left, right);
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
        Blockly.BoundVariableAbstract.VARIABLE);
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

Blockly.Blocks['pair_pattern_typed'] = {
  init: function() {
    var validator = Blockly.BoundVariables.variableNameValidator.bind(null,
        Blockly.BoundVariableAbstract.VARIABLE);
    this.setColour(Blockly.Msg['PATTERN_HUE']);
    this.appendDummyInput()
        .appendField('(');
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('a', validator), 'LEFT')
        .appendField(',');
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('b', validator), 'RIGHT')
        .appendField(')');
    this.setOutput(true);

    var A = Blockly.TypeExpr.generateTypeVar();
    var B = Blockly.TypeExpr.generateTypeVar();
    var pairType = new Blockly.TypeExpr.PAIR(A, B);
    this.setOutputTypeExpr(new Blockly.TypeExpr.PATTERN(pairType));
    this.setInputsInline(true);
  },

  transformToValue: function(workspace) {
    var valueBlock = workspace.newBlock('pair_pattern_value_typed');
    var left = this.getField('LEFT');
    var right = this.getField('RIGHT');
    valueBlock.initSvg();
    valueBlock.render();
    valueBlock.typedValue['LEFT'].setVariableName(left.getText());
    valueBlock.typedValue['RIGHT'].setVariableName(right.getText());
    return valueBlock;
  },

  clearTypes: function() {
    var type = this.outputConnection.typeExpr.pattExpr;
    type.first_type.clear();
    type.second_type.clear();
  }
};

Blockly.Blocks['pair_pattern_value_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['PATTERN_HUE']);
    var A = Blockly.TypeExpr.generateTypeVar();
    var B = Blockly.TypeExpr.generateTypeVar();
    var leftVariable = Blockly.FieldBoundVariable.newValue(A, 'a');
    var rightVariable = Blockly.FieldBoundVariable.newValue(B, 'b');
    this.appendDummyInput()
        .appendField('(');
    this.appendDummyInput()
        .appendField(leftVariable, 'LEFT')
        .appendField(', ')
    this.appendDummyInput()
        .appendField(rightVariable, 'RIGHT')
        .appendField(')');
     this.setOutput(true);
    var pairType = new Blockly.TypeExpr.PAIR(A, B);
    this.setOutputTypeExpr(new Blockly.TypeExpr.PATTERN(pairType));
    this.setInputsInline(true);
  },

  getTypeScheme: function(fieldName) {
    if (fieldName !== 'LEFT' && fieldName !== 'RIGHT') {
      return null;
    }
    var type = this.typedValue[fieldName].getTypeExpr();
    return Blockly.Scheme.monoType(type);
  },

  updateUpperContext: function(map) {
    var parent = this.getParent();
    if (parent && parent.type !== 'match_typed') {
      return;
    }
    var leftValue = this.typedValue['LEFT'];
    var rightValue = this.typedValue['RIGHT'];
    map[leftValue.getVariableName()] = leftValue;
    map[rightValue.getVariableName()] = rightValue;
  },

  clearTypes: function() {
    var type = this.outputConnection.typeExpr.pattExpr;
    type.first_type.clear();
    type.second_type.clear();
  }
};
