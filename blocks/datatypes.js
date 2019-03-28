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

    this.setTypedStatements(true);
    this.setMutator(new Blockly.Mutator(['record_field_item']));
    this.setWorkbench(new Blockly.TypeWorkbench());

    this.disableTransfer_ = true;
  },

  typeExprReplaced() {
    throw 'Not allowed to replace type expression for record.';
  },

  getStructureId: function() {
    return this.recordId_;
  },

  getStructureTypeDef: function(fieldName) {
    var inputName = fieldName.replace(/FIELD(\d+)/, 'FIELD_INP$1');
    return this.getTargetTypeCtor(inputName);
  },

  updateVariableEnv: function(conn, ctx) {
    if (conn && this.nextConnection == conn) {
      var variable = this.getField('DATANAME').getVariable();
      ctx.addStructureVariable(variable);
    }
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
    var index = this.itemCount_++;
    var input = this.appendValueInput('FIELD_INP' + index)
        .appendField(variableField, 'FIELD' + index)
        .appendField(':')
        .setTypeExpr(new Blockly.TypeExpr.TYPE_CONSTRUCTOR())
        .setAlign(Blockly.ALIGN_RIGHT);
    // Set a child value after appending its field to a block. Otherwise,
    // the child value's block would not be initialized.
    // To avoid this, call variableField.initModel() here or
    // store the child after appendField().
    field.setChildValue(variableField);
    return input;
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
    var value = this.getField('DATANAME').getVariable();
    value.updateReferenceStructure();
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
        workspace.newBlock('record_field_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.itemCount_; x++) {
      var itemBlock = workspace.newBlock('record_field_item');
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
  },

  wouldChange: function(containerBlock) {
    return containerBlock.getItemCount() != this.itemCount_;
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

  appendFieldInput: function(index, fieldValue) {
    var storedRendered = this.rendered;
    this.rendered = false;
    var field = Blockly.FieldBoundVariable.newReferenceRecordField(null,
        fieldValue.getVariableName());
    field.setBoundValue(fieldValue);

    var input = this.appendValueInput('FIELD_INP' + index);
    if (index != 0) {
      input.appendField(';');
    }
    input.appendField(field, 'FIELD' + index)
    input.appendField('=');
    field.initModel();
    this.rendered = storedRendered;
    this.fieldCount_++;
    return input;
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
        var input = this.appendFieldInput(i, children[i]);
      } else {
        var input = this.getInput('FIELD_INP' + i);
      }
      this.setChildInputTypeExpr_(input, children[i]);
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

  setChildInputTypeExpr_: function(input, fieldValue) {
    var def = fieldValue.getStructureTypeDef();
    if (def) {
      input.setTypeExpr(def, true);
    } else {
      input.setTypeExpr(new Blockly.TypeExpr.UNKNOWN(), true);
    }
  },

  infer: function() {
    this.updateStructure();
    return this.outputConnection.typeExpr;
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

    this.setTypedStatements(true);
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

  getStructureTypeDef: function(fieldName) {
    var inputName = fieldName.replace(/CTR(\d+)/, 'CTR_INP$1');
    return this.getTargetTypeCtor(inputName);
  },

  updateVariableEnv: function(conn, ctx) {
    if (!conn || this.nextConnection != conn) {
      return;
    }
    for (var i = 0; i < this.itemCount_; i++) {
      var field = this.getField('CTR' + i);
      var variable = field.getVariable();
      ctx.addVariable(variable);
    }
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
    var input = this.appendValueInput('CTR_INP' + index)
        .appendField('|')
        .appendField(variableField, 'CTR' + index)
        .setTypeExpr(new Blockly.TypeExpr.TYPE_CONSTRUCTOR())
        .setAlign(Blockly.ALIGN_RIGHT);
    return input;
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
  },

  wouldChange: function(containerBlock) {
    return containerBlock.getItemCount() != this.itemCount_;
  },

  infer: function(ctx) {
    for (var i = 0; i < this.inputList.length; i++) {
      var input = this.inputList[i];
      if (!input.name.match(/CTR_INP\d+/)) {
        continue;
      }
      var lastField = goog.array.last(input.fieldRow);
      var hasOf = lastField.name === 'OF';
      var hasTypeCtor = !!input.connection.targetBlock();
      if (hasTypeCtor) {
        if (!hasOf) input.appendField('of', 'OF');
      } else {
        if (hasOf) input.removeField('OF');
      }
    }
    this.callInfer(this.nextConnection, ctx);
    return null;
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

  updateAndGetParameterInputs_: function() {
    // TODO(harukam): Move the following code to the bound-varaible class.
    var value = this.getField('CONSTRUCTOR').getBoundValue();
    if (!value) {
      return [];
    }
    var def = value.getStructureTypeDef();
    goog.asserts.assert(def !== undefined, 'Unknown type ctor.');

    var lparenInput = this.getInput('LPAREN');
    var rparenInput = this.getInput('RPAREN');

    var paramSize = 0;
    if (def) {
      var typeChildrenSize = def.getChildren().length;
      paramSize = typeChildrenSize == 0 ? 1 : typeChildrenSize;
    }
    var paramInputs = [];

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
        this.removeInputSafely(input);
        continue;
      }
      if (1 <= index) {
        var prevInput = paramInputs[index - 1];
        goog.asserts.assert(!!prevInput);
      }
      paramInputs.push(input);
    }

    if (paramSize <= 0) {
      this.removeInputSafely(lparenInput);
      this.removeInputSafely(rparenInput);
      return [];
    }
    if (!lparenInput) {
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
    if (goog.array.last(this.inputList).name != 'RPAREN') {
      this.removeInputSafely(rparenInput);
      this.appendDummyInput('RPAREN')
          .appendField(')');
    }

    // Set type expression on the value paramInputs if necessary.
    switch (paramSize) {
      case 1:
        paramInputs[0].setTypeExpr(def, true);
        break;
      case 2:
        goog.asserts.assert(def.isPair());
        paramInputs[0].setTypeExpr(def.firstType(), true);
        paramInputs[1].setTypeExpr(def.secondType(), true);
        break;
      case 3:
        goog.asserts.assert(def.isTriple());
        paramInputs[0].setTypeExpr(def.firstType(), true);
        paramInputs[1].setTypeExpr(def.secondType(), true);
        paramInputs[2].setTypeExpr(def.thirdType(), true);
        break;
      default:
        goog.asserts.fail('Not supported more than 3 tuples');
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
    var left = leftBlock ?
        leftBlock.getTypeCtor() : new Blockly.TypeExpr.UNKNOWN();
    var right = rightBlock ?
        rightBlock.getTypeCtor() : new Blockly.TypeExpr.UNKNOWN();
    return new Blockly.TypeExpr.TUPLE(left, right);
  }
};

Blockly.Blocks['triple_type_constructor_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['TYPES_HUE']);
    this.appendValueInput('ITEM0')
        .setTypeExpr(new Blockly.TypeExpr.TYPE_CONSTRUCTOR());
    this.appendValueInput('ITEM1')
        .appendField('*')
        .setTypeExpr(new Blockly.TypeExpr.TYPE_CONSTRUCTOR());
    this.appendValueInput('ITEM2')
        .appendField('*')
        .setTypeExpr(new Blockly.TypeExpr.TYPE_CONSTRUCTOR());
    this.setOutput(true);
    this.setInputsInline(true);
    var typeCtrType = new Blockly.TypeExpr.TYPE_CONSTRUCTOR();
    this.setOutputTypeExpr(typeCtrType);
  },

  getTypeCtor: function() {
    var item0Block = this.getInputTargetBlock('ITEM0');
    var item1Block = this.getInputTargetBlock('ITEM1');
    var item2Block = this.getInputTargetBlock('ITEM2');
    var item0 = item0Block ?
        item0Block.getTypeCtor() : new Blockly.TypeExpr.UNKNOWN();
    var item1 = item1Block ?
        item1Block.getTypeCtor() : new Blockly.TypeExpr.UNKNOWN();
    var item2 = item2Block ?
        item2Block.getTypeCtor() : new Blockly.TypeExpr.UNKNOWN();
      return new Blockly.TypeExpr.TUPLE(item0, item1, item2);
  }
};

Blockly.Blocks['alist_type_constructor_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['TYPES_HUE']);
    this.appendValueInput('ITEM')
        .setTypeExpr(new Blockly.TypeExpr.TYPE_CONSTRUCTOR());
    this.appendDummyInput()
        .appendField(' list')
    this.setOutput(true);
    this.setInputsInline(true);
    var typeCtrType = new Blockly.TypeExpr.TYPE_CONSTRUCTOR();
    this.setOutputTypeExpr(typeCtrType);
  },

  getTypeCtor: function() {
    var itemBlock = this.getInputTargetBlock('ITEM');
    var item = itemBlock ?
        itemBlock.getTypeCtor() : new Blockly.TypeExpr.UNKNOWN();
    return new Blockly.TypeExpr.LIST(item);
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

  updateUpperContext: function(ctx) {
    var parent = this.getParent();
    if (parent && parent.type !== 'match_typed') {
      return;
    }
    ctx.addVariable(this.typedValue['FIRST']);
    ctx.addVariable(this.typedValue['CONS']);
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
    var pairType = new Blockly.TypeExpr.TUPLE(A, B);
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
    var pairType = new Blockly.TypeExpr.TUPLE(A, B);
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

  updateUpperContext: function(ctx) {
    var parent = this.getParent();
    if (parent && parent.type !== 'match_typed') {
      return;
    }
    var leftValue = this.typedValue['LEFT'];
    var rightValue = this.typedValue['RIGHT'];
    ctx.addVariable(leftValue);
    ctx.addVariable(rightValue);
  }
};

Blockly.Blocks['record_pattern_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['PATTERN_HUE']);
    var recordType = new Blockly.TypeExpr.RECORD(null);
    var variableField =
        Blockly.FieldBoundVariable.newReferenceRecord(recordType);
    this.appendDummyInput()
        .appendField(variableField, 'RECORD')
        .appendField('{');
    this.appendDummyInput('RBRACE')
        .appendField('}');
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr.PATTERN(recordType));
    this.setInputsInline(true);

    this.fieldCount_ = 0;
  },

  transformToValue: function(workspace) {
    var recordValue = this.getField('RECORD').getBoundValue();
    var recordName = recordValue.getVariableName();
    var patternValueBlock = workspace.newBlock('record_pattern_value_typed');
    var reference = patternValueBlock.getField('RECORD').getVariable();
    reference.setVariableName(recordName);
    reference.setBoundValue(recordValue);
    var children = recordValue.getChildren();
    for (var i = 0; i < children.length; i++) {
      var textField = this.getField('TEXT' + i);
      var value = patternValueBlock.getField('TEXT' + i).getVariable();
      value.setVariableName(textField.getText());
    }
    if (goog.isFunction(patternValueBlock.initSvg)) {
      patternValueBlock.initSvg();
      patternValueBlock.render();
    }
    return patternValueBlock;
  },

  appendFieldInput: function(index, fieldValue) {
    var input = this.appendDummyInput('FIELD_INP' + index);
    if (index != 0) {
      input.appendField(';');
    }
    var field = Blockly.FieldBoundVariable.newReferenceRecordField(null,
        fieldValue.getVariableName());
    field.setBoundValue(fieldValue);
    input.appendField(field, 'FIELD' + index)
    input.appendField('=');

    input.appendField(this.createFieldText_(), 'TEXT' + index);

    field.initModel();
    this.fieldCount_++;
    return input;
  },

  createFieldText_: function() {
    var validator = Blockly.BoundVariables.variableNameValidator.bind(null,
        Blockly.BoundVariableAbstract.VARIABLE);
    return new Blockly.FieldTextInput('a', validator);
  },

  updateStructure: Blockly.Blocks['create_record_typed'].updateStructure,

  setChildInputTypeExpr_: function(input, fieldValue) {
    // NOP.
  },

  infer: Blockly.Blocks['create_record_typed'].infer
};

Blockly.Blocks['record_pattern_value_typed'] = {
  init: Blockly.Blocks['record_pattern_typed'].init,

  getTypeScheme: function(fieldName) {
    var m = fieldName && fieldName.match(/^TEXT(\d+)$/);
    if (!m || this.fieldCount_ <= parseInt(m[1])) {
      return null;
    }
    var variable = this.typedValue[fieldName];
    return Blockly.Scheme.monoType(variable.getTypeExpr());
  },

  appendFieldInput: Blockly.Blocks['record_pattern_typed'].appendFieldInput,

  createFieldText_: function() {
    var A = Blockly.TypeExpr.generateTypeVar();
    var field = Blockly.FieldBoundVariable.newValue(A, 'a');
    field.initModel();
    return field;
  },

  updateStructure: Blockly.Blocks['record_pattern_typed'].updateStructure,

  setChildInputTypeExpr_: function(input, fieldValue) {
    var field = goog.array.find(input.fieldRow,
        function(field) {return field.name && field.name.startsWith('TEXT');});
    if (!field) {
      return;
    }
    var variable = field.getVariable();
    var typeExpr = variable.getTypeExpr();
    var def = fieldValue.getStructureTypeDef();
    variable.setTypeExpr(def ? def : new Blockly.TypeExpr.UNKNOWN(), true);
  },

  infer: Blockly.Blocks['record_pattern_typed'].infer
};
