/**
 * @fileoverview Typed blocks representing basic syntax.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

goog.require('Blockly.Blocks');
goog.require('Blockly');

Blockly.Blocks['logic_boolean_typed'] = {
  /**
   * Block for boolean data type: true and false.
   * @this Blockly.Block
   */
  init: function() {
    var BOOLEANS =
        [[Blockly.Msg.LOGIC_BOOLEAN_TRUE, 'TRUE'],
         [Blockly.Msg.LOGIC_BOOLEAN_FALSE, 'FALSE']];
    this.setHelpUrl(Blockly.Msg.LOGIC_BOOLEAN_HELPURL);
    this.setColour(210);
    this.setOutput(true, 'Boolean');
    // TODO(harukam): Define a function to create a type expression in the same
    // way as makeConnection_ in block.js and block_svg.js.
    this.setOutputTypeExpr(new Blockly.TypeExpr.BOOL());
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(BOOLEANS), 'BOOL');
    this.setTooltip(Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP);
  }
};

Blockly.Blocks['logic_operator_typed'] = {
  /**
   * Block for logical operator.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [['&&', 'AND'],
         ['||', 'OR']];
    this.setColour(210);
    this.setOutput(true, 'Boolean');
    this.setOutputTypeExpr(new Blockly.TypeExpr.BOOL());
    this.appendValueInput('A')
        .setTypeExpr(new Blockly.TypeExpr.BOOL());
    this.appendValueInput('B')
        .setTypeExpr(new Blockly.TypeExpr.BOOL())
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP_BOOL');
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP_BOOL');
      var TOOLTIPS = {
        'AND': 'Logical product operator.',
        'OR': 'Logical sum operator.'
      };
      return TOOLTIPS[mode];
    });
  },

  clearTypes: function() {
    this.callClearTypes('A');
    this.callClearTypes('B');
  },

  infer: function(ctx) {
    var expected_left = new Blockly.TypeExpr.BOOL();
    var left = this.callInfer('A', ctx);
    var right = this.callInfer('B', ctx);
    if (left)
      left.unify(expected_left);
    if (right)
      right.unify(expected_left);
    return expected_left;
  }
}

Blockly.Blocks['not_operator_typed'] = {
  /**
   * Block for "not" operator.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(210);
    this.setOutput(true, 'Boolean');
    this.setOutputTypeExpr(new Blockly.TypeExpr.BOOL());
    this.appendValueInput('A')
        .setTypeExpr(new Blockly.TypeExpr.BOOL())
        .appendField('not');
    this.setInputsInline(true);
    this.setTooltip('Logical negation operator.');
  },

  clearTypes: function() {
    this.callClearTypes('A');
  },

  infer: function(ctx) {
    var expected = new Blockly.TypeExpr.BOOL();
    var arg = this.callInfer('A', ctx);
    if (arg)
      arg.unify(expected);
    return expected;
  }
};

Blockly.Blocks['logic_compare_typed'] = {
  /**
   * Block for comparison operator.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS = Blockly.RTL ? [
          ['=', 'EQ'],
          ['\u2260', 'NEQ'],
          ['>', 'LT'],
          ['\u2265', 'LTE'],
          ['<', 'GT'],
          ['\u2264', 'GTE']
        ] : [
          ['=', 'EQ'],
          ['\u2260', 'NEQ'],
          ['<', 'LT'],
          ['\u2264', 'LTE'],
          ['>', 'GT'],
          ['\u2265', 'GTE']
        ];
    this.setHelpUrl(Blockly.Msg.LOGIC_COMPARE_HELPURL);
    this.setColour(210);
    this.setOutput(true, 'Boolean');
    this.setOutputTypeExpr(new Blockly.TypeExpr.BOOL());
    var A = Blockly.TypeExpr.generateTypeVar();
    this.appendValueInput('A')
        .setTypeExpr(A);
    this.appendValueInput('B')
        .setTypeExpr(A)
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var op = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'EQ': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_EQ,
        'NEQ': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_NEQ,
        'LT': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LT,
        'LTE': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LTE,
        'GT': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GT,
        'GTE': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GTE
      };
      return TOOLTIPS[op];
    });
  },

  clearTypes: function() {
    this.getInput('A').connection.typeExpr.clear();
    this.callClearTypes('A');
    this.callClearTypes('B');
  },

  infer: function(ctx) {
    var expected_left = this.getInput('A').connection.typeExpr;
    var left = this.callInfer('A', ctx);
    var right = this.callInfer('B', ctx);
    if (left)
      left.unify(expected_left);
    if (right)
      right.unify(expected_left);
    return new Blockly.TypeExpr.BOOL();
  }
};

Blockly.Blocks['logic_ternary_typed'] = {
  /**
   * Block for ternary operator.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.LOGIC_TERNARY_HELPURL);
    this.setColour(210);
    var A = Blockly.TypeExpr.generateTypeVar();
    this.appendValueInput('IF')
        .setTypeExpr(new Blockly.TypeExpr.BOOL())
        .appendField('if')
    this.appendValueInput('THEN')
        .setTypeExpr(A)
        .appendField('then')
    this.appendValueInput('ELSE')
        .setTypeExpr(A)
        .appendField('else');
    this.setOutput(true);
    this.setOutputTypeExpr(A);
    this.setTooltip(Blockly.Msg.LOGIC_TERNARY_TOOLTIP);
  },

  clearTypes: function() {
    this.outputConnection.typeExpr.clear();
    this.callClearTypes('IF');
    this.callClearTypes('THEN');
    this.callClearTypes('ELSE');
  },

  infer: function(ctx) {
    var cond_expected = new Blockly.TypeExpr.BOOL();
    var cond_type = this.callInfer('IF', ctx);
    if (cond_type)
      cond_type.unify(cond_expected);
    var expected = this.outputConnection.typeExpr;
    var then_type = this.callInfer('THEN', ctx);
    var else_type = this.callInfer('ELSE', ctx);
    if (then_type)
      then_type.unify(expected);
    if (else_type)
      else_type.unify(expected);
    return expected;
  }
};

Blockly.Blocks['max_int_typed'] = {
  init: function() {
    var INTS =
        [['max_int', 'MAX_INT'],
         ['min_int', 'MIN_INT']];
    this.setColour(230);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(INTS), 'INT');
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr.INT());
    this.setTooltip('special int value.');
  }
}

Blockly.Blocks['infinity_typed'] = {
  init: function() {
    var FLOATS =
        [['infinity', 'INFINITY'],
         ['neg_infinity', 'NEG_INFINITY'],
         ['nan', 'NAN']];
    this.setColour(100);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(FLOATS), 'FLOAT');
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr.FLOAT());
    this.setTooltip('special float value.')
  }
};

Blockly.Blocks['int_typed'] = {
  /**
   * Block for numeric value.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
    this.setColour(230);
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('0',
        Blockly.FieldTextInput.intValidator), 'INT');
    this.setOutput(true, 'Int');
    this.setOutputTypeExpr(new Blockly.TypeExpr.INT());
    this.setTooltip(Blockly.Msg.MATH_NUMBER_TOOLTIP);
  }
};

Blockly.Blocks['int_arithmetic_typed'] = {
  /**
   * Block for basic arithmetic operator.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.MATH_ADDITION_SYMBOL, 'ADD_INT'],
         [Blockly.Msg.MATH_SUBTRACTION_SYMBOL, 'MINUS_INT'],
         [Blockly.Msg.MATH_MULTIPLICATION_SYMBOL, 'MULTIPLY_INT'],
         [Blockly.Msg.MATH_DIVISION_SYMBOL, 'DIVIDE_INT']];
    this.setHelpUrl(Blockly.Msg.MATH_ARITHMETIC_HELPURL);
    this.setColour(230);
    this.setOutput(true, 'Int');
    this.setOutputTypeExpr(new Blockly.TypeExpr.INT());
    this.appendValueInput('A')
        .setTypeExpr(new Blockly.TypeExpr.INT())
    this.appendValueInput('B')
        .setTypeExpr(new Blockly.TypeExpr.INT())
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP_INT');
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP_INT');
      var TOOLTIPS = {
        'ADD_INT': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_ADD,
        'MINUS_INT': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MINUS,
        'MULTIPLY_INT': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MULTIPLY,
        'DIVIDE_INT': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_DIVIDE
      };
      return TOOLTIPS[mode];
    });
  },

  clearTypes: function() {
    this.callClearTypes('A');
    this.callClearTypes('B');
  },

  infer: function(ctx) {
    var expected_left = new Blockly.TypeExpr.INT();
    var left = this.callInfer('A', ctx);
    var right = this.callInfer('B', ctx);
    if (left)
      left.unify(expected_left);
    if (right)
      right.unify(expected_left);
    return expected_left;
  }
};

Blockly.Blocks['float_typed'] = {
  /**
   * Block for numeric value.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
    this.setColour(100);
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('0.',
        Blockly.FieldTextInput.floatValidator), 'Float');
    this.setOutput(true, 'Float');
    this.setOutputTypeExpr(new Blockly.TypeExpr.FLOAT());
    this.setTooltip(Blockly.Msg.MATH_NUMBER_TOOLTIP);
  }
};

Blockly.Blocks['float_arithmetic_typed'] = {
  /**
   * Block for basic arithmetic operator.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [['+.', 'ADD_FLOAT'],
         ['-.', 'MINUS_FLOAT'],
         ['*.', 'MULTIPLY_FLOAT'],
         ['/.', 'DIVIDE_FLOAT']];
    this.setHelpUrl(Blockly.Msg.MATH_ARITHMETIC_HELPURL);
    this.setColour(100);
    this.setOutput(true, 'Float');
    this.setOutputTypeExpr(new Blockly.TypeExpr.FLOAT());
    this.appendValueInput('A')
        .setTypeExpr(new Blockly.TypeExpr.FLOAT())
    this.appendValueInput('B')
        .setTypeExpr(new Blockly.TypeExpr.FLOAT())
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP_FLOAT');
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP_FLOAT');
      var TOOLTIPS = {
        'ADD_FLOAT': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_ADD,
        'MINUS_FLOAT': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MINUS,
        'MULTIPLY_FLOAT': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MULTIPLY,
        'DIVIDE_FLOAT': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_DIVIDE,
      };
      return TOOLTIPS[mode];
    });
  },

  clearTypes: function() {
    this.callClearTypes('A');
    this.callClearTypes('B');
  },

  infer: function(ctx) {
    var expected_left = new Blockly.TypeExpr.FLOAT();
    var left = this.callInfer('A', ctx);
    var right = this.callInfer('B', ctx);
    if (left)
      left.unify(expected_left);
    if (right)
      right.unify(expected_left);
    return expected_left;
  }
};

Blockly.Blocks['string_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['STRING_HUE']);
    this.appendDummyInput()
        .appendField('"')
        .appendField(new Blockly.FieldTextInput('foo'), 'STRING')
        .appendField('"');
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr.STRING());
  }
};

Blockly.Blocks['concat_string_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['STRING_HUE']);
    this.appendValueInput('A')
        .setTypeExpr(new Blockly.TypeExpr.STRING());
    this.appendValueInput('B')
        .setTypeExpr(new Blockly.TypeExpr.STRING())
        .appendField('^');
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr.STRING());
    this.setInputsInline(true);
  },

  clearTypes: function() {
    this.callClearTypes('A');
    this.callClearTypes('B');
  },

  infer: function(ctx) {
    var expected_left = new Blockly.TypeExpr.STRING();
    var left = this.callInfer('A', ctx);
    var right = this.callInfer('B', ctx);
    if (left)
      left.unify(expected_left);
    if (right)
      right.unify(expected_left);
    return expected_left;
  }
};

Blockly.Blocks['string_of_int_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['STRING_HUE']);
    this.appendValueInput('PARAM')
        .setTypeExpr(new Blockly.TypeExpr.INT())
        .appendField('string_of_int');
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr.STRING());
    this.setInputsInline(true);
  },

  clearTypes: function() {
    this.callClearTypes('PARAM');
  },

  infer: function(ctx) {
    var expected_param = new Blockly.TypeExpr.INT();
    var param = this.callInfer('PARAM', ctx);
    if (param)
      param.unify(expected_param);
    return new Blockly.TypeExpr.STRING();
  }
};

Blockly.Blocks['lists_create_with_typed'] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    var element_type = Blockly.TypeExpr.generateTypeVar();
    this.appendDummyInput('LPAREN')
        .appendField('[');
    this.appendValueInput('ADD0')
        .setTypeExpr(element_type);
    this.appendValueInput('ADD1')
        .setTypeExpr(element_type)
        .appendField(';');
    this.appendValueInput('ADD2')
        .setTypeExpr(element_type)
        .appendField(';');
    this.appendDummyInput('RPAREN')
        .appendField(']');
    this.setOutput(true, 'Array');
    this.setOutputTypeExpr(new Blockly.TypeExpr.LIST(element_type));
    this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
    this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_TOOLTIP);
    this.itemCount_ = 3;
    // https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks
    this.setInputsInline(true);
  },
  /**
   * Create XML to represent list inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.removeInput('LPAREN');
    for (var x = 0; x < this.itemCount_; x++) {
      this.removeInput('ADD' + x);
    }
    this.removeInput('RPAREN');
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    this.appendDummyInput('LPAREN')
        .appendField('[');
    var element_type = this.outputConnection.typeExpr.element_type;
    for (var x = 0; x < this.itemCount_; x++) {
      var input = this.appendValueInput('ADD' + x)
                      .setTypeExpr(element_type);
      if (x != 0) {
        input.appendField(';');
      }
    }
    this.appendDummyInput('RPAREN')
        .appendField(']');
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock =
        workspace.newBlock('lists_create_with_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.itemCount_; x++) {
      var itemBlock = workspace.newBlock('lists_create_with_item');
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
    // Disconnect all input blocks and remove all inputs.
    this.removeInput('RPAREN');
    for (; 0 < this.itemCount_; this.itemCount_--) {
      var index = this.itemCount_ - 1;
      this.removeInput('ADD' + index);
    }
    // Rebuild the block's inputs.
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var element_type = this.outputConnection.typeExpr.element_type;
    while (itemBlock) {
      var input = this.appendValueInput('ADD' + this.itemCount_)
                      .setTypeExpr(element_type);
      if (this.itemCount_ != 0) {
        input.appendField(';');
      }
      // Reconnect any child blocks.
      this.itemCount_++;
      // The length of items should be updated in advance of connecting two
      // blocks. This is because type inference, which depends on the length
      // of items, occurs when connecting two blocks.
      if (itemBlock.valueConnection_) {
        input.connection.connect(itemBlock.valueConnection_);
      }
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    this.appendDummyInput('RPAREN')
        .appendField(']');
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 0;
    while (itemBlock) {
      var input = this.getInput('ADD' + x);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      x++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  },

  clearTypes: function() {
    this.outputConnection.typeExpr.element_type.clear();
    for (var x = 0; x < this.itemCount_; x++)
      this.callClearTypes('ADD' + x);
  },

  infer: function(ctx) {
    var expected = this.outputConnection.typeExpr;
    for (var x = 0; x < this.itemCount_; x++) {
      var type = this.callInfer('ADD' + x, ctx);
      if (type)
        type.unify(expected.element_type);
    }
    return expected;
  }
};

Blockly.Blocks['list_empty_typed'] = {
  init: function() {
    this.setColour(260);
    var element_type = Blockly.TypeExpr.generateTypeVar();
    var listType = new Blockly.TypeExpr.LIST(element_type);
    this.appendDummyInput()
        .appendField('[ ]');
    this.setOutput(true);
    this.setOutputTypeExpr(listType);
    this.setInputsInline(true);
  },

  clearTypes: function() {
    this.outputConnection.typeExpr.element_type.clear();
  }
};

Blockly.Blocks['list_cons_typed'] = {
  init: function() {
    this.setColour(260);
    var element_type = Blockly.TypeExpr.generateTypeVar();
    var listType = new Blockly.TypeExpr.LIST(element_type);
    this.appendValueInput('FIRST')
        .setTypeExpr(element_type);
    this.appendValueInput('CONS')
        .setTypeExpr(listType)
        .appendField('::');
    this.setOutput(true);
    this.setOutputTypeExpr(listType);
    this.setInputsInline(true);
  },

  clearTypes: function() {
    this.outputConnection.typeExpr.element_type.clear();
    this.callClearTypes('FIRST');
    this.callClearTypes('CONS');
  },

  infer: function(ctx) {
    var expected = this.outputConnection.typeExpr;
    var expectedElementType = expected.element_type;
    var listType = this.callInfer('CONS', ctx);
    var elementType = this.callInfer('FIRST', ctx);
    if (listType) {
      expected.unify(listType);
    }
    if (elementType) {
      expectedElementType.unify(elementType);
    }
    return expected;
  }
};

/**
 * Pairs
 */
Blockly.Blocks['pair_create_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['PAIRS_HUE']);
    var A = Blockly.TypeExpr.generateTypeVar();
    var B = Blockly.TypeExpr.generateTypeVar();
    this.appendValueInput('FIRST')
        .setTypeExpr(A)
        .appendField('(');
    this.appendValueInput('SECOND')
        .setTypeExpr(B)
        .appendField(',');
    this.appendDummyInput()
        .appendField(')');
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr.PAIR(A, B));
    this.setInputsInline(true);
  },

  clearTypes: function() {
    this.outputConnection.typeExpr.first_type.clear();
    this.outputConnection.typeExpr.second_type.clear();
    this.callClearTypes('FIRST');
    this.callClearTypes('SECOND');
  },

  infer: function(ctx) {
    var expected = this.outputConnection.typeExpr;
    var first = this.callInfer('FIRST', ctx);
    var second = this.callInfer('SECOND', ctx);
    if (first)
      first.unify(expected.first_type);
    if (second)
      second.unify(expected.second_type);
    return expected;
  }
};

Blockly.Blocks['pair_first_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['PAIRS_HUE']);
    var A = Blockly.TypeExpr.generateTypeVar();
    var B = Blockly.TypeExpr.generateTypeVar();
    var pair_t = new Blockly.TypeExpr.PAIR(A, B);
    this.appendValueInput('FIRST')
        .setTypeExpr(pair_t)
        .appendField('fst (');
    this.appendDummyInput()
        .appendField(')');
    this.setOutput(true);
    this.setOutputTypeExpr(A);
    this.setInputsInline(true);
    this.setTooltip('Get the first and second elements of a pair.');
  },

  clearTypes: function() {
    this.outputConnection.typeExpr.clear();
    this.callClearTypes('FIRST');
  },

  infer: function(ctx) {
    var expected = this.outputConnection.typeExpr;
    var expected_arg = this.getInput('FIRST').connection.typeExpr;
    var arg = this.callInfer('FIRST', ctx);
    if (arg) {
      arg.unify(expected_arg);
    }
    return expected;
  }
};

Blockly.Blocks['pair_second_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['PAIRS_HUE']);
    var A = Blockly.TypeExpr.generateTypeVar();
    var B = Blockly.TypeExpr.generateTypeVar();
    var pair_t = new Blockly.TypeExpr.PAIR(A, B);
    this.appendValueInput('SECOND')
        .setTypeExpr(pair_t)
        .appendField('snd (');
    this.appendDummyInput()
        .appendField(')');
    this.setOutput(true);
    this.setOutputTypeExpr(B);
    this.setInputsInline(true);
    this.setTooltip('Get the second and second elements of a pair.');
  },

  clearTypes: function() {
    this.outputConnection.typeExpr.clear();
    this.callClearTypes('SECOND');
  },

  infer: function(ctx) {
    var expected = this.outputConnection.typeExpr;
    var expected_arg = this.getInput('SECOND').connection.typeExpr;
    var arg = this.callInfer('SECOND', ctx);
    if (arg) {
      arg.unify(expected_arg);
    }
    return expected;
  }
};

Blockly.Blocks['function_app_typed'] = {
  init: function() {
    this.setColour('#c97586');
    var A = Blockly.TypeExpr.generateTypeVar();
    this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
    this.appendDummyInput()
        .appendField(Blockly.FieldBoundVariable.newReference(A), 'VAR')

    this.paramCount_ = 0;
    this.setInputsInline(true);
    this.setOutput(true);
    this.setOutputTypeExpr(A);
  },

  /**
   * Update the type expressions of bound-variable fields on this block.
   * Would be called if the block's type expressions are replaced with other
   * ones, and a type expression this field's variable refers to is no longer
   * up-to-date.
   * @param {Blockly.Block} block The source block to replace this block with.
   *     Could be used to additionally replace the type expression of fields.
   */
  typeExprReplaced: function(block) {
    var variable = this.typedReference['VAR'];
    var typeOwner = block ? block.typedReference['VAR'] : null;

    if (typeOwner) {
      variable.setTypeExpr(typeOwner.getTypeExpr());
    } else {
      variable.setTypeExpr(null);
    }
  },

  updateStructure: function() {
    var variable = this.typedReference['VAR'];
    var type = variable.getTypeExpr();
    var types = Blockly.TypeExpr.functionToArray(type);
    //goog.asserts.assert(2 <= types.length, 'Function type is expected.');

    if (2 <= types.length) {
      var returnType = types.pop();
      var argTypes = types;
    } else {
      var returnType = type;
      var argTypes = [];
    }

    while (argTypes.length < this.paramCount_) {
      var index = this.paramCount_ - 1;
      this.removeInput('PARAM' + index);
      this.paramCount_--;
    }
    for (var i = 0; i < argTypes.length; i++) {
      var inputName = 'PARAM' + i;
      if (this.paramCount_ <= i) {
        var rendered = this.rendered;
        this.rendered = false;
        var input = this.appendValueInput(inputName);
        this.rendered = rendered;
        this.paramCount_++;
      } else {
        var input = this.getInput(inputName);
      }
      input.setTypeExpr(types[i], true);
    }
    this.setOutputTypeExpr(returnType, true);
  },

  /**
   * Create XML to represent application inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('params', this.paramCount_);
    return container;
  },
  /**
   * Parse XML to restore the application inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var newParamCount = parseInt(xmlElement.getAttribute('params'), 0);
    // Update parameter inputs depending on the type of the reference value.
    this.updateStructure();
    if (this.paramCount_ == newParamCount) {
      return;
    }
    // The type of the reference value might not be determined yet. For such
    // cases (e.g., [let f x y = <> in f <[0]> <[0]>]), append dummy parameter
    // inputs.
    for (var i = 0; i < newParamCount; i++) {
      var inputName = 'PARAM' + i;
      var rendered = this.rendered;
      this.rendered = false;
      var input = this.appendValueInput(inputName);
      input.setTypeExpr(Blockly.TypeExpr.generateTypeVar());
      this.rendered = rendered;
      this.paramCount_++;
    }
    this.setOutputTypeExpr(Blockly.TypeExpr.generateTypeVar(), true);
  },

  clearTypes: function() {
    this.typedReference['VAR'].getTypeExpr().clear();
    for (var i = 0; i < this.paramCount_; i++) {
      this.callClearTypes('PARAM' + i);
      var input = this.getInput('PARAM' + i);
      input.connection.typeExpr.clear();
    }
    this.outputConnection.typeExpr.clear();
  },

  infer: function(ctx) {
    var variable = this.typedReference['VAR'];
    var varName = variable.getVariableName();
    var schemeInEnv = ctx.getTypeInEnv(varName);
    if (schemeInEnv) {
      // Fix: let rec c = ... c
      schemeInEnv.unify(variable.getTypeExpr());
      this.updateStructure();
    } else if (ctx.canUnifyOrphan()) {
      variable.unifyTypeExpr();
      this.updateStructure();
    }

    for (var i = 0; i < this.paramCount_; i++) {
      var paramType = this.callInfer('PARAM' + i, ctx);
      var input = this.getInput('PARAM' + i);
      var expectedParamType = input.connection.typeExpr;
      if (paramType) {
        expectedParamType.unify(paramType);
      }
    }
    return this.outputConnection.typeExpr;
  }
},

Blockly.Blocks['lambda_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['HIGHER_ORDER_HUE']);
    var A = Blockly.TypeExpr.generateTypeVar();
    var B = Blockly.TypeExpr.generateTypeVar();
    var variable_field = Blockly.FieldBoundVariable.newValue(A);
    this.appendDummyInput()
        .appendField('fun ')
        .appendField(variable_field, 'VAR');
    this.appendValueInput('RETURN')
        .setTypeExpr(B)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('->')
        .setWorkbench(new Blockly.Workbench());
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr.FUN(A, B));
  },

  /**
   * Update the type expressions of bound-variable fields on this block.
   * Would be called if the block's type expressions are replaced with other
   * ones, and a type expression this field's variable refers to is no longer
   * up-to-date.
   * @param {Blockly.Block} block The source block to replace this block with.
   *     Could be used to additionally replace the type expression of fields.
   */
  typeExprReplaced: function(block) {
    var outputType = this.outputConnection.typeExpr;
    var argType = outputType ? outputType.arg_type : null;
    var variable = this.typedValue['VAR'];
    variable.setTypeExpr(argType);
  },

  /**
   * Return all variables of which is declared in this block, and can be used
   * later the given connection's input.
   * @param {!Blockly.Connection} connection Connection to specify a scope.
   * @return {Object} Object mapping variable name to its variable
   *     representations.
   */
  getVisibleVariables: function(conn) {
    var returnInput = this.getInput('RETURN');
    var map = {};
    if (returnInput.connection == conn) {
      var variable = this.typedValue['VAR'];
      var name = variable.getVariableName();
      map[name] = variable;
    }
    return map;
  },

  getTypeScheme: function(fieldName) {
    var scheme = null;
    if (fieldName === 'VAR') {
      var variable = this.typedValue['VAR'];
      var outType = this.outputConnection.typeExpr;
      goog.asserts.assert(outType.arg_type == variable.getTypeExpr());
      scheme = Blockly.Scheme.monoType(outType.arg_type);
    }
    return scheme;
  },

  clearTypes: function() {
    var variable = this.typedValue['VAR'];
    goog.asserts.assert(this.outputConnection.typeExpr.arg_type ==
        variable.getTypeExpr());
    variable.getTypeExpr().clear();
    this.outputConnection.typeExpr.return_type.clear();
    this.callClearTypes('RETURN');
  },

  infer: function(ctx) {
    var variable = this.typedValue['VAR'];
    var var_name = variable.getVariableName();
    var expected = this.outputConnection.typeExpr;
    var ctx2 = ctx.copy();
    ctx2.addTypeToEnv(var_name, Blockly.Scheme.monoType(expected.arg_type));
    var return_type = this.callInfer('RETURN', ctx2);
    if (return_type)
      return_type.unify(expected.return_type);
    return expected;
  }
}

Blockly.Blocks['lambda_app_typed'] = {
  init: function() {
    this.setColour(Blockly.Msg['HIGHER_ORDER_HUE']);
    var A = Blockly.TypeExpr.generateTypeVar();
    var B = Blockly.TypeExpr.generateTypeVar();
    this.appendValueInput('FUN')
        .setTypeExpr(new Blockly.TypeExpr.FUN(A, B))
    this.appendValueInput('ARG')
        .setTypeExpr(A)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(' ');
    this.setInputsInline(true);
    this.setOutput(true);
    this.setOutputTypeExpr(B);
    this.setInputsInline(true);
  },

  clearTypes: function() {
    this.getInput('FUN').connection.typeExpr.arg_type.clear();
    this.getInput('FUN').connection.typeExpr.return_type.clear();
    this.callClearTypes('FUN');
    this.callClearTypes('ARG');
  },

  infer: function(ctx) {
    var expected = this.outputConnection.typeExpr;
    var fun_expected = this.getInput('FUN').connection.typeExpr;
    var fun_type = this.callInfer('FUN', ctx);
    var arg_type = this.callInfer('ARG', ctx);
    if (fun_type)
      fun_type.unify(fun_expected);
    if (arg_type)
      arg_type.unify(fun_expected.arg_type);
    return expected;
  }
}

Blockly.Blocks['match_typed'] = {
  init: function() {
    this.setColour(290);

    var A = Blockly.TypeExpr.generateTypeVar();
    var B = Blockly.TypeExpr.generateTypeVar();
    this.appendDummyInput()
        .appendField('match');
    this.appendValueInput('INPUT')
        .setTypeExpr(A);
    this.appendDummyInput()
        .appendField('with')
        .setAlign(Blockly.ALIGN_RIGHT);
    this.setOutput(true);
    this.setOutputTypeExpr(B);

    this.itemCount_ = 0;
    this.appendPatternInput();

    this.setInputsInline(false);
    this.setMutator(new Blockly.Mutator(['match_pattern_item']));
    this.setWorkbench(new Blockly.PatternWorkbench());
  },

  getVisibleVariables: function(conn) {
    if (!conn) {
      return {};
    }
    var target = null;
    for (var i = 0; i < this.itemCount_; i++) {
      var outputConn = this.getInput('OUTPUT' + i).connection;
      if (outputConn == conn) {
        target = this.getInputTargetBlock('PATTERN' + i);
        break;
      }
    }
    if (!target) {
      return;
    }
    var map = {};
    if (goog.isFunction(target.updateUpperContext)) {
      target.updateUpperContext(map);
    }
    return map;
  },

  appendPatternInput: function() {
    var inputType = this.getInput('INPUT').connection.typeExpr;
    var index = this.itemCount_++;
    this.appendValueInput('PATTERN' + index)
        .setTypeExpr(new Blockly.TypeExpr.PATTERN(inputType));
    var input = this.appendValueInput('OUTPUT' + index)
        .setTypeExpr(this.outputConnection.typeExpr)
        .appendField('->')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setWorkbench(new Blockly.Workbench());
    return input;
  },

  resizePatternInput: function(expectedCount) {
    // Stop rendering to avoid rendering objects which are already destroyed.
    var storedRendered = this.rendered;
    this.rendered = false;
    while (expectedCount < this.itemCount_) {
      var index = this.itemCount_ - 1;
      var outputInput = this.getInput('OUTPUT' + index);
      var workbench = outputInput.connection.contextWorkbench;
      workbench && workbench.dispose();
      // Decrement the size of items first. The function this.removeInput()
      // might disconnect some blocks from this block, and disconnecting blocks
      // triggers type inference, which causes a null pointer exception. To
      // avoid the type inference for the removed input, update the size of
      // items first.
      this.itemCount_--;
      this.removeInput('PATTERN' + index);
      this.removeInput('OUTPUT' + index);
    }
    this.rendered = storedRendered;
    while (this.itemCount_ < expectedCount) {
      this.appendPatternInput();
    }
  },

  /**
   * Create XML to represent pattern inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the pattern inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var newItemCount = parseInt(xmlElement.getAttribute('items')) || 2;
    this.resizePatternInput(newItemCount);
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock =
        workspace.newBlock('match_pattern_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.itemCount_; x++) {
      var itemBlock = workspace.newBlock('match_pattern_item');
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
    this.resizePatternInput(itemCount);
  },

  /**
   * Would this block be changed based on the mutator blocks?
   * @this Blockly.Block
   */
  wouldChange: function(containerBlock) {
    return containerBlock.getItemCount() != this.itemCount_;
  },

  isAutoMatchAvailable: function(name) {
    var inputType = this.getInput('INPUT').connection.typeExpr;
    switch (name) {
      case 'list':
        var A = Blockly.TypeExpr.generateTypeVar();
        return inputType.ableToUnify(new Blockly.TypeExpr.LIST(A));
      case 'pair':
        var A = Blockly.TypeExpr.generateTypeVar();
        var B = Blockly.TypeExpr.generateTypeVar();
        return inputType.ableToUnify(new Blockly.TypeExpr.PAIR(A, B));
      default:
        return false;
    }
  },

  applyAutoMatch: function(name) {
    var patternValueNames;
    switch (name) {
      case 'list':
        patternValueNames = ['empty_construct_pattern_typed',
            'cons_construct_pattern_value_typed'];
        break;
      case 'pair':
        patternValueNames = ['pair_pattern_value_typed'];
        break;
      default:
        goog.asserts.fail('Unknown auto match operator.');
    }
    this.mutator.setVisible(false);
    this.resizePatternInput(patternValueNames.length);
    // Initialize icons SVG.
    this.initSvg();
    for (var i = 0, name; name = patternValueNames[i]; i++) {
      var patternConn = this.getInput('PATTERN' + i).connection;
      var valueBlock = this.workspace.newBlock(name);
      valueBlock.initSvg();
      valueBlock.render();
      patternConn.connect(valueBlock.outputConnection);
    }
  },

  customContextMenu: function(options) {
    if (this.isInFlyout) {
      return;
    }
    var patternAlreadyConnected = false;
    for (var i = 0; i < this.itemCount_; i++) {
      if (this.getInputTargetBlock('PATTERN' + i)) {
        patternAlreadyConnected = true;
      }
    }
    var autoMatchNames = ['list', 'pair'];
    for (var i = 0, name; name = autoMatchNames[i]; i++) {
      var isEnabled =
          patternAlreadyConnected ? false : this.isAutoMatchAvailable(name);
      var option = {enabled: isEnabled, text: 'Auto match ' + name};
      if (isEnabled) {
        option.callback = this.applyAutoMatch.bind(this, name);
      }
      options.push(option);
    }
  },

  clearTypes: function() {
    this.outputConnection.typeExpr.clear();
    this.getInput('INPUT').connection.typeExpr.clear();
    this.callClearTypes('INPUT');
    for (var i = 0; i < this.itemCount_; i++) {
      this.callClearTypes('PATTERN' + i);
      this.callClearTypes('OUTPUT' + i);
    }
  },

  infer: function(ctx) {
    var inputExpected = this.getInput('INPUT').connection.typeExpr;
    var inputType = this.callInfer('INPUT', ctx);
    if (inputType)
      inputExpected.unify(inputType);

    var expected = this.outputConnection.typeExpr;
    for (var i = 0; i < this.itemCount_; i++) {
      var patternType = this.callInfer('PATTERN' + i, ctx);
      var outputType = this.callInfer('OUTPUT' + i, ctx);
      var expectedPatternType = this.getInput('PATTERN' + i).connection.typeExpr;
      var expectedOutputType = this.getInput('OUTPUT' + i).connection.typeExpr;
      goog.asserts.assert(expected === expectedOutputType);

      if (patternType)
        expectedPatternType.unify(patternType);
      if (outputType)
        expectedOutputType.unify(outputType);
    }
    return expected;
  }
}

/**
 * Typed variables
 */

Blockly.Blocks['variables_get_typed'] = {
  /**
   * Block for variable getter.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour('#c97586');
    var A = Blockly.TypeExpr.generateTypeVar();
    this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
    this.appendDummyInput()
        .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
        .appendField(Blockly.FieldBoundVariable.newReference(A), 'VAR')
        .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
    this.setOutput(true);
    this.setOutputTypeExpr(A);
    this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
  },

  /**
   * Update the type expressions of bound-variable fields on this block.
   * Would be called if the block's type expressions are replaced with other
   * ones, and a type expression this field's variable refers to is no longer
   * up-to-date.
   * @param {Blockly.Block} block The source block to replace this block with.
   *     Could be used to additionally replace the type expression of fields.
   */
  typeExprReplaced: function(block) {
    var A = this.outputConnection.typeExpr;
    var variable = this.typedReference['VAR'];
    variable.setTypeExpr(A);
  },

  clearTypes: function() {
    var variable = this.typedReference['VAR'];
    goog.asserts.assert(this.outputConnection.typeExpr ==
        variable.getTypeExpr());

    variable.getTypeExpr().clear();
  },

  infer: function(ctx) {
    var variable = this.typedReference['VAR'];
    var expected = this.outputConnection.typeExpr;
    var varName = variable.getVariableName();

    var schemeInEnv = ctx.getTypeInEnv(varName);
    var scheme;
    if (schemeInEnv) {
      // Fix: let rec c = <c> + c.
      // If this is recursive reference on the exp1, unifyTypeExpr() does not
      // work correctly because getTypeScheme() always return null.
      schemeInEnv.unify(variable.getTypeExpr());
      // TODO(harukam): Check the equality between a type scheme in existing
      // in the env and that of the binding value.
    } else if (ctx.canUnifyOrphan()) {
      variable.unifyTypeExpr();
    }
    goog.asserts.assert(expected == variable.getTypeExpr());
    return expected;
  }
};

Blockly.Blocks['let_typed'] = {
  /**
   * Block for let expression.
   * @param {boolean} opt_recur True if declare recursive function.
   * @this Blockly.Block
   */
  init: function(opt_recur, opt_statement) {
    this.setHelpUrl(Blockly.Msg.VARIABLES_SET_HELPURL);
    this.setColour(330);
    var varType = Blockly.TypeExpr.generateTypeVar();
    var exp1Type = Blockly.TypeExpr.generateTypeVar();
    var exp2Type = Blockly.TypeExpr.generateTypeVar();
    var variable_field = Blockly.FieldBoundVariable.newValue(varType);
    this.appendDummyInput('VARIABLE')
        .appendField('let', 'LET_LABEL')
        .appendField(variable_field, 'VAR')
        .setAlign(Blockly.ALIGN_RIGHT);
    this.appendValueInput('EXP1')
        .setTypeExpr(exp1Type)
        .appendField('=')
        .setWorkbench(new Blockly.Workbench())
        .setAlign(Blockly.ALIGN_RIGHT);
    this.setMutator(new Blockly.Mutator(['parameters_arg_item']));
    this.setInputsInline(false);

    var defaultRecFlag = opt_recur === true;
    this.isRecursive_ = false;
    this.setRecursiveFlag(defaultRecFlag);
    this.setIsStatement(opt_statement === true);

    this.argumentCount_ = 0;
    exp1Type.unify(varType);

    /**
     * The object mapping name of variable field to the type scheme which was
     * created while the latest type inference were triggered on this block.
     * @type {!Object}
     */
    this.lastTypeScheme_ = {'VAR': Blockly.Scheme.monoType(varType)};
  },

  /**
   * Update the type expressions of bound-variable fields on this block.
   * Would be called if the block's type expressions are replaced with other
   * ones, and a type expression this field's variable refers to is no longer
   * up-to-date.
   * @param {Blockly.Block} block The source block to replace this block with.
   *     Could be used to additionally replace the type expression of fields.
   */
  typeExprReplaced: function(block) {
    var variable = this.typedValue['VAR'];
    var typeOwner = block ? block.typedValue['VAR'] : null;

    if (typeOwner) {
      variable.setTypeExpr(typeOwner.getTypeExpr());
    } else {
      variable.setTypeExpr(null);
    }
  },

  /**
   * Return all variables of which is declared in this block, and can be used
   * later the given connection's input.
   * @param {!Blockly.Connection} connection Connection to specify a scope.
   * @return {Object} Object mapping variable name to its variable
   *     representations.
   */
  getVisibleVariables: function(conn) {
    if (!conn) {
      return {};
    }
    var map = {};
    var isExp1 = this.getInput('EXP1').connection == conn;
    var isNext = !isExp1 && this.nextConnection == conn;
    var isExp2 = !isExp1 && !isNext &&
        this.getInput('EXP2').connection == conn;

    if (isNext || isExp2 || isExp1 && this.isRecursive_) {
      var variable = this.typedValue['VAR'];
      var name = variable.getVariableName();
      map[name] = variable;
    }
    if (isExp1) {
      for (var x = 0; x < this.argumentCount_; x++) {
        var variable = this.typedValue['ARG' + x];
        var name = variable.getVariableName();
        map[name] = variable;
      }
    }
    return map;
  },

  getTypeScheme: function(fieldName, opt_reference) {
    if (fieldName.startsWith('ARG')) {
      var numstr = fieldName.substring(3);
      var x = parseInt(numstr);
      if (!isNaN(x) && x < this.argumentCount_) {
        var argname = 'ARG' + x;
        var argv = this.typedValue[argname];
        return Blockly.Scheme.monoType(argv.getTypeExpr());
      }
    }
    if (fieldName !== 'VAR') {
      return null;
    }
    if ('REC_VAR' in this.lastTypeScheme_ && opt_reference) {
      var refs = this.getRecursiveReferences();
      if (refs.indexOf(opt_reference) != -1) {
        return this.lastTypeScheme_['REC_VAR'];
      }
    }
    return this.lastTypeScheme_['VAR'];
  },

  canToggleIsStatement: function() {
    if (this.isStatement_) {
      return !this.previousConnection.isConnected() &&
          !this.nextConnection.isConnected();
    }
    return !this.outputConnection.isConnected();
  },

  getIsStatement: function() {
    return this.isStatement_;
  },

  setIsStatement: function(newIsStatement) {
    if (this.isStatement_ == newIsStatement) {
      return;
    }
    var storedRendered = this.rendered;
    this.rendered = false;
    if (newIsStatement) {
      var exp2Input = this.getInput('EXP2');
      if (exp2Input) {
        var workbench = exp2Input.connection.contextWorkbench;
        workbench && workbench.dispose();
        this.removeInput('EXP2');
      }
      this.setOutput(false);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      // Append dummy type expression to statement connections so that they
      // can trigger types/variables check.
      this.previousConnection.setTypeExpr(Blockly.TypeExpr.generateTypeVar());
      this.nextConnection.setTypeExpr(Blockly.TypeExpr.generateTypeVar());
    } else {
      this.setPreviousStatement(false);
      this.setNextStatement(false);
      this.setOutput(true);
      var exp2Type = Blockly.TypeExpr.generateTypeVar();
      this.appendValueInput('EXP2')
          .setTypeExpr(exp2Type)
          .appendField('in')
          .setWorkbench(new Blockly.Workbench())
          .setAlign(Blockly.ALIGN_RIGHT);
      // Initialize SVG icon.
      this.initSvg && this.initSvg();
      this.setOutputTypeExpr(exp2Type);
    }
    this.rendered = storedRendered;
    if (this.rendered) {
      this.render();
    }
    this.isStatement_ = newIsStatement;
  },

  isRecursive: function() {
    return this.isRecursive_;
  },

  setRecursiveFlag: function(flag) {
    if (this.isRecursive_ != flag) {
      var input = this.getInput('VARIABLE');
      if (flag) {
        var recLabel = new Blockly.FieldLabel('rec');
        input.insertFieldAt(1, recLabel, 'REC_LABEL');
      } else {
        var refs = this.getRecursiveReferences();
        for (var i = 0, ref; ref = refs[i]; i++) {
          ref.getSourceBlock().dispose();
        }
        input.removeField('REC_LABEL');
      }
      this.isRecursive_ = flag;

      if (this.rendered) {
        this.render();
        this.updateWorkbenchFlyout();
      }
    }
  },

  getRecursiveReferences: function() {
    var variable = this.typedValue['VAR']
    var inputExp1 = this.getInput('EXP1');
    if (!inputExp1) {
      return [];
    }
    return Blockly.BoundVariables.findReferencesInside(variable, inputExp1.connection);
  },

  customContextMenu: function(options) {
    if (this.isInFlyout) {
      return;
    }
    var canBeToggled = true;
    // It's possible to set canBeToggled false if this.getRecursiveReferences()
    // returns non empty array.
    var option = {enabled: canBeToggled};
    if (this.isRecursive_) {
      option.text = 'Remove rec.';
    } else {
      option.text = 'Set rec.';
    }
    option.callback = this.setRecursiveFlag.bind(this, !this.isRecursive_);
    options.push(option);

    var option = {enabled: this.canToggleIsStatement()};
    if (this.isStatement_) {
      option.text = 'Add in';
    } else {
      option.text = 'Remove in';
    }
    option.callback = this.setIsStatement.bind(this, !this.isStatement_);
    options.push(option);
  },

  /**
   * Create XML to represent argument inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    for (var x = 0; x < this.argumentCount_; x++) {
      var itemDom = document.createElement('item');
      var variable = this.typedValue['ARG' + x];
      var textNode = document.createTextNode(variable.getVariableName());
      itemDom.appendChild(textNode);
      container.appendChild(itemDom);
    }
    return container;
  },
  /**
   * Parse XML to restore the argument inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var input = this.getInput('VARIABLE');
    var fields = [].concat(input.fieldRow);
    for (var i = 0, field; field = fields[i]; i++) {
      if (!field.name.startsWith('ARG')) {
        continue;
      }
      goog.array.remove(input.fieldRow, field);
      field.dispose(true);
    }
    var childNodes = xmlElement.childNodes;
    this.argumentCount_ = childNodes.length;
    for (var x = 0; x < this.argumentCount_; x++) {
      var text = childNodes[x].textContent;
      var A = Blockly.TypeExpr.generateTypeVar();
      var field = Blockly.FieldBoundVariable.newValue(A);

      input.appendField(field, 'ARG' + x);
      if (this.rendered) {
        field.init();
      } else {
        field.initModel();
      }
    }
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock =
        workspace.newBlock('parameters_arg_container');
    if (containerBlock.initSvg) {
      containerBlock.initSvg();
    }
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.argumentCount_; x++) {
      var itemBlock = workspace.newBlock('parameters_arg_item');
      if (itemBlock.initSvg) {
        itemBlock.initSvg();
      }
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
    var input = this.getInput('VARIABLE');
    var contextChanged = itemCount != this.argumentCount_;

    while (itemCount < this.argumentCount_) {
      var index = this.argumentCount_ - 1;
      var name = 'ARG' + index;
      var field = this.getField(name);
      field.dispose(true);
      goog.array.remove(input.fieldRow, field);
      this.argumentCount_--;
    }
    while (this.argumentCount_ < itemCount) {
      var A = Blockly.TypeExpr.generateTypeVar();
      var field = Blockly.FieldBoundVariable.newValue(A);
      input.appendField(field, 'ARG' + this.argumentCount_);
      if (this.rendered) {
        field.init();
      } else {
        field.initModel();
      }
      this.argumentCount_++;
    }
    if (contextChanged) {
      this.updateTypeInference(true);
      // Do not call the following functions. Newly created fields are not
      // initialized yet. They will be called by mutator instance after the
      // fields initialization.
      //   this.updateWorkbenchFlyout();
      //   this.workspace.renderTypeChangedWorkspaces();
    }
  },
  /**
   * Find if this block is currently able to be mutated by user.
   * @return {boolean} True if this block can accept an additional argument.
   * @this Blockly.Block
   */
  canBeMutated: function() {
    var typeExpr = this.typedValue['VAR'].getTypeExpr();
    var type = typeExpr.deref();
    if (type.isTypeVar()) {
      return true;
    }
  },
  /**
   * Would this block be changed based on the mutator blocks?
   * @this Blockly.Block
   */
  wouldChange: function(containerBlock) {
    return containerBlock.getItemCount() != this.argumentCount_;
  },

  clearTypes: function() {
    this.typedValue['VAR'].getTypeExpr().clear();
    var exp1Type = this.getInput('EXP1').connection.typeExpr;
    exp1Type.clear();
    this.callClearTypes('EXP1');
    if (this.isStatement_)  {
      this.callClearTypes(this.nextConnection);
    } else {
      this.getInput('EXP2').connection.typeExpr.clear();
      this.callClearTypes('EXP2');
    }
    for (var x = 0; x < this.argumentCount_; x++) {
      var variable = this.typedValue['ARG' + x];
      variable.getTypeExpr().clear();
    }
    delete this.lastTypeScheme_['VAR'];
    delete this.lastTypeScheme_['REC_VAR'];
  },

  infer: function(ctx) {
    var variable = this.typedValue['VAR'];
    var var_name = variable.getVariableName();
    var expected_exp1 = this.getInput('EXP1').connection.typeExpr;

    if (this.argumentCount_ == 0) {
      var exp1Type = this.getInput('EXP1').connection.typeExpr;
      var varType = this.typedValue['VAR'].getTypeExpr();
      exp1Type.unify(varType);
    } else {
      var funTypes = [];
      for (var x = 0; x < this.argumentCount_; x++) {
        var argVar = this.typedValue['ARG' + x];
        funTypes.push(argVar.getTypeExpr());
      }
      funTypes.push(expected_exp1);
      var funType = Blockly.TypeExpr.createFunType(funTypes);
      variable.getTypeExpr().unify(funType);
    }
    // Create the context for the EXP1 input.
    var ctx1 = ctx.copy();
    var monoScheme = Blockly.Scheme.monoType(variable.getTypeExpr());
    if (this.isRecursive_) {
      ctx1.addTypeToEnv(var_name, monoScheme);
    }
    for (var x = 0; x < this.argumentCount_; x++) {
      var argVar = this.typedValue['ARG' + x];
      var varName = argVar.getVariableName();
      var argScheme = Blockly.Scheme.monoType(argVar.getTypeExpr());
      ctx1.addTypeToEnv(varName, argScheme);
    }
    var exp1 = this.callInfer('EXP1', ctx1);

    if (exp1)
      exp1.unify(expected_exp1);

    var applyPolyType = variable.getTypeExpr().deref().isFunction();
    var schemeForExp2;
    var ctx2 = ctx.copy();
    if (applyPolyType) {
      if (this.isRecursive_) {
        // Prevent recursive reference blocks to be unified with poly-type.
        // All of recursive reference must be mono-type.
        this.lastTypeScheme_['REC_VAR'] = monoScheme;
      }
      schemeForExp2 = ctx.createPolyType(variable.getTypeExpr());
    } else {
      schemeForExp2 = monoScheme;
    }
    this.lastTypeScheme_['VAR'] = schemeForExp2;

    ctx2.addTypeToEnv(var_name, schemeForExp2);
    if (this.isStatement_) {
      this.callInfer(this.nextConnection, ctx2);
      return null;
    }

    var expected_exp2 = this.getInput('EXP2').connection.typeExpr;
    var exp2 = this.callInfer('EXP2', ctx2);
    if (exp2)
      exp2.unify(expected_exp2);

    return expected_exp2;
  }
};

Blockly.Blocks['letrec_typed'] =
  Object.assign({}, Blockly.Blocks['let_typed']);
Blockly.Blocks['letrec_typed'].init = function() {
  Blockly.Blocks['let_typed'].init.call(this, true);
};

Blockly.Blocks['letstatement_typed'] =
  Object.assign({}, Blockly.Blocks['let_typed']);
Blockly.Blocks['letstatement_typed'].init = function() {
  Blockly.Blocks['let_typed'].init.call(this, false, true);
};
