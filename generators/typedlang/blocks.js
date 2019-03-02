/**
 * @fileoverview Generating TypedLang for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.TypedLang.blocks');

goog.require('Blockly.TypedLang');

Blockly.TypedLang['logic_boolean_typed'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['not_operator_typed'] = function(block) {
  // Boolean operator "not".
  var argument = Blockly.TypedLang.valueToCode(block, 'A',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = '(not ' + argument + ')';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['logic_operator_typed'] = function(block) {
  // Boolean operators && and ||.
  var OPERATORS = {
    'AND': ' && ',
    'OR': ' || '
  };
  var operator = OPERATORS[block.getFieldValue('OP_BOOL')];
  var argument0 = Blockly.TypedLang.valueToCode(block, 'A',
      Blockly.TypedLang.ORDER_ATOMIC);
  var argument1 = Blockly.TypedLang.valueToCode(block, 'B',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = '(' + argument0 + operator + argument1 + ')';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['logic_compare_typed'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '=',
    'NEQ': '<>',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var argument0 = Blockly.TypedLang.valueToCode(block, 'A',
      Blockly.TypedLang.ORDER_ATOMIC);
  var argument1 = Blockly.TypedLang.valueToCode(block, 'B',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = '(' + argument0 + ' ' + operator + ' ' + argument1 + ')';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['logic_ternary_typed'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.TypedLang.valueToCode(block, 'IF',
      Blockly.TypedLang.ORDER_ATOMIC);
  var value_then = Blockly.TypedLang.valueToCode(block, 'THEN',
      Blockly.TypedLang.ORDER_ATOMIC);
  var value_else = Blockly.TypedLang.valueToCode(block, 'ELSE',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = 'if ' + value_if + ' then ' + value_then + ' else ' +
      value_else;
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['int_typed'] = function(block) {
  // int value.
  var code = parseInt(block.getFieldValue('INT'));
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['max_int_typed'] = function(block) {
  // max_int or min_int.
  var code = block.getFieldValue('INT') === 'MAX_INT' ? 'max_int' : 'min_int';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
}

Blockly.TypedLang['int_arithmetic_typed'] = function(block) {
  // Basic arithmetic operators
  var OPERATORS = {
    'ADD_INT': [' + ', Blockly.TypedLang.ORDER_ADDITION],
    'MINUS_INT': [' - ', Blockly.TypedLang.ORDER_SUBTRACTION],
    'MULTIPLY_INT': [' * ', Blockly.TypedLang.ORDER_MULTIPLICATION],
    'DIVIDE_INT': [' / ', Blockly.TypedLang.ORDER_DIVISION]
  };
  var tuple = OPERATORS[block.getFieldValue('OP_INT')];
  var operator = tuple[0];
  var order = Blockly.TypedLang.ORDER_ATOMIC;
  var argument0 = Blockly.TypedLang.valueToCode(block, 'A', order);
  var argument1 = Blockly.TypedLang.valueToCode(block, 'B', order);
  var code = '(' + argument0 + operator + argument1 + ')';
  return [code, order];
};

Blockly.TypedLang['float_typed'] = function(block) {
  // float value.
  var code = block.getFieldValue('Float');
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['infinity_typed'] = function(block) {
  // infinity, neg_infinity or nan.
  var fieldValue = block.getFieldValue('FLOAT');
  var code = fieldValue === 'INFINITY' ? 'infinity'
      : fieldValue === 'NEG_INFINITY' ? 'neg_infinity'
      : 'nan';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
}

Blockly.TypedLang['float_arithmetic_typed'] = function(block) {
  // Basic arithmetic operators
  var OPERATORS = {
    'ADD_FLOAT': [' +. ', Blockly.TypedLang.ORDER_ADDITION],
    'MINUS_FLOAT': [' -. ', Blockly.TypedLang.ORDER_SUBTRACTION],
    'MULTIPLY_FLOAT': [' *. ', Blockly.TypedLang.ORDER_MULTIPLICATION],
    'DIVIDE_FLOAT': [' /. ', Blockly.TypedLang.ORDER_DIVISION]
  };
  var tuple = OPERATORS[block.getFieldValue('OP_FLOAT')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.TypedLang.valueToCode(block, 'A', order);
  var argument1 = Blockly.TypedLang.valueToCode(block, 'B', order);
  var code;
  code = '(' + argument0 + operator + argument1 + ')';
  return [code, order];
};

Blockly.TypedLang['string_typed'] = function(block) {
  var value = block.getFieldValue('STRING');
  var literal = JSON.stringify(value);
  return [literal, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['concat_string_typed'] = function(block) {
  var left = Blockly.TypedLang.valueToCode(block, 'A',
      Blockly.TypedLang.ORDER_ATOMIC);
  var right = Blockly.TypedLang.valueToCode(block, 'B',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = '(' + left + ') ^ (' + right + ')';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['string_of_int_typed'] = function(block) {
  var param = Blockly.TypedLang.valueToCode(block, 'PARAM',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = 'string_of_int (' + param + ')';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['lists_create_with_typed'] = function(block) {
  // Create a list with any number of elements of any type.
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.TypedLang.valueToCode(block, 'ADD' + i,
        Blockly.TypedLang.ORDER_ATOMIC);
  }
  var code = '[' + elements.join('; ') + ']';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['list_empty_typed'] = function(block) {
  return ['[]', Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['list_cons_typed'] = function(block) {
  var first = Blockly.TypedLang.valueToCode(block, 'FIRST',
      Blockly.TypedLang.ORDER_ATOMIC);
  var rest = Blockly.TypedLang.valueToCode(block, 'CONS',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = '(' + first + ') :: ' + rest;
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['pair_create_typed'] = function(block) {
  var fst = Blockly.TypedLang.valueToCode(block, 'FIRST',
      Blockly.TypedLang.ORDER_ATOMIC);
  var snd = Blockly.TypedLang.valueToCode(block, 'SECOND',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = '(' + fst + ', ' + snd + ')';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['pair_first_typed'] = function(block) {
  var arg = Blockly.TypedLang.valueToCode(block, 'FIRST',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = 'fst (' + arg + ')';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['pair_second_typed'] = function(block) {
  var arg = Blockly.TypedLang.valueToCode(block, 'SECOND',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = 'snd (' + arg + ')';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['function_app_typed'] = function(block) {
  var code = block.getField('VAR').getVariableName();
  var params = [];
  for (var i = 0; i < block.paramCount_; i++) {
    var p = Blockly.TypedLang.valueToCode(block, 'PARAM' + i,
        Blockly.TypedLang.ORDER_ATOMIC);
    params.push('(' + p + ')');
  }
  code += params.length == 0 ? '' : ' ' + params.join(' ');
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['lambda_typed'] = function(block) {
  var varname = block.typedValue['VAR'].getVariableName();
  var body = Blockly.TypedLang.valueToCode(block, 'RETURN',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = 'fun ' + varname + ' -> ' + body;
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['lambda_app_typed'] = function(block) {
  var left = Blockly.TypedLang.valueToCode(block, 'FUN',
      Blockly.TypedLang.ORDER_ATOMIC);
  var right = Blockly.TypedLang.valueToCode(block, 'ARG',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = '(' + left + ' ' + right + ')';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['match_typed'] = function(block) {
  if (block.itemCount_ == 0) {
    return ['', Blockly.TypedLang.ORDER_ATOMIC];
  }
  var input = Blockly.TypedLang.valueToCode(block, 'INPUT',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = 'match ' + input + ' with';
  for (var i = 0; i < block.itemCount_; i++) {
    var pattern = Blockly.TypedLang.valueToCode(block, 'PATTERN' + i,
        Blockly.TypedLang.ORDER_ATOMIC);
    var output = Blockly.TypedLang.valueToCode(block, 'OUTPUT' + i,
        Blockly.TypedLang.ORDER_ATOMIC);
    code += '\n  | ' + pattern + ' -> ' + output;
  }
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['variables_get_typed'] = function(block) {
  var varname = block.typedReference['VAR'].getVariableName();
  return [varname, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['let_typed'] = function(block) {
  var args = [];
  for (var i = 0; i < block.argumentCount_; i++) {
    var argn = 'ARG' + i;
    var val = block.typedValue[argn];
    args.push(val.getVariableName());
  }
  var varname = block.typedValue['VAR'].getVariableName();
  var arg = args.length == 0 ? '' : ' ' + args.join(' ');
  var exp1 = Blockly.TypedLang.valueToCode(block, 'EXP1',
      Blockly.TypedLang.ORDER_ATOMIC);

  var code = 'let ';
  if (block.isRecursive()) code += 'rec ';
  code += varname + arg + ' = ' + exp1;

  if (block.getIsStatement()) {
    code += ';;\n';
    return code;
  }
  var exp2 = Blockly.TypedLang.valueToCode(block, 'EXP2',
      Blockly.TypedLang.ORDER_ATOMIC);
  code += ' in ' + exp2;
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['letrec_typed'] = function(block) {
  return Blockly.TypedLang['let_typed'].call(this, block);
};

Blockly.TypedLang['letstatement_typed'] = function(block) {
  return Blockly.TypedLang['let_typed'].call(this, block);
};

Blockly.TypedLang['dummy_statement_typed'] = function(block) {
  var code = Blockly.TypedLang.valueToCode(block, 'VALUE',
      Blockly.TypedLang.ORDER_ATOMIC);
  return code;
};

Blockly.TypedLang['defined_recordtype_typed'] = function(block) {
  if (block.itemCount_ == 0) {
    return '';
  }
  var field = block.getField('DATANAME');
  var dataName = field.getVariableName();
  var code = 'type ' + dataName + ' = {';
  for (var i = 0; i < block.itemCount_; i++) {
    var recordField = block.getField('FIELD' + i);
    code += recordField.getVariableName();
    code += ': ';
    var typeCtor = Blockly.TypedLang.valueToCode(block, 'FIELD_INP' + i,
        Blockly.TypedLang.ORDER_ATOMIC);
    code += typeCtor;
    if (i != block.itemCount_ - 1) {
      code += '; ';
    }
  }
  return code;
};

Blockly.TypedLang['create_record_typed'] = function(block) {
  if (block.fieldCount_) {
    return '';
  }
  var code = '{';
  for (var i = 0; i < block.fieldCount_; i++) {
    var recordField = block.getField('FIELD' + i);
    code += recordField.getVariableName();
    code += '=';
    code += Blockly.TypedLang.valueToCode(block, 'FIELD_INP' + i,
        Blockly.TypedLang.ORDER_ATOMIC);
    if (i != block.fieldCount_ - 1) {
      code += '; ';
    }
  }
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['defined_datatype_typed'] = function(block) {
  if (block.itemCount_ == 0) {
    // The constructor definition is empty.
    return '';
  }
  var field = block.getField('DATANAME');
  var dataName = field.getText();
  var code = 'type ' + dataName + ' =';
  for (var i = 0; i < block.itemCount_; i++) {
    var typeCtor = Blockly.TypedLang.valueToCode(block, 'CTR_INP' + i,
        Blockly.TypedLang.ORDER_ATOMIC);
    var ctorField = block.getField('CTR' + i);
    code += '\n  | ' + ctorField.getVariableName();
    if (typeCtor) {
      code += ' of ' + typeCtor;
    }
  }
  return code;
};

Blockly.TypedLang['create_construct_typed'] = function(block) {
  var field = block.getField('CONSTRUCTOR');
  var code = field.getVariableName();
  var param = Blockly.TypedLang.valueToCode(block, 'PARAM',
      Blockly.TypedLang.ORDER_ATOMIC);
  if (block.definition_) {
    code += ' ' + param;
  } else {
    code += ' ?';
  }
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['int_type_typed'] = function(block) {
  return ['int', Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['float_type_typed'] = function(block) {
  return ['float', Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['bool_type_typed'] = function(block) {
  return ['bool', Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['string_type_typed'] = function(block) {
  return ['string', Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['pair_type_constructor_typed'] = function(block, names) {
  var names = goog.isArray(names) ? names : ['LEFT', 'RIGHT'];
  var tuples = '';
  for (var i = 0, name; name = names[i]; i++) {
    var item = Blockly.TypedLang.valueToCode(block, name,
        Blockly.TypedLang.ORDER_ATOMIC);
    if (!item) {
      item = '?';
    }
    tuples += item;
    if (i != names.length - 1) {
      tuples += ' * ';
    }
  }
  var parentBlock = block.getParent();
  var isTopLevel = !!parentBlock &&
      parentBlock.type === 'defined_detatype_typed';
  var code = '';
  if (!isTopLevel) {
    code += '(';
  }
  code += tuples;
  if (!isTopLevel) {
    code += ')';
  }
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['triple_type_constructor_typed'] = function(block) {
  return Blockly.TypedLang['pair_type_constructor_typed'].call(null, block,
      ['ITEM0', 'ITEM1', 'ITEM2']);
};

Blockly.TypedLang['empty_construct_pattern_typed'] = function(block) {
  return ['[]', Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['cons_construct_pattern_typed'] = function(block) {
  var first = block.getField('FIRST');
  var cons = block.getField('CONS');
  return [first.getText() + '::' + cons.getText(),
      Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['cons_construct_pattern_value_typed'] = function(block) {
  var first = block.typedValue['FIRST'].getVariableName();
  var cons = block.typedValue['CONS'].getVariableName();
  return [first + '::' + cons,
      Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['pair_pattern_typed'] = function(block) {
  var left = block.getField('LEFT');
  var right = block.getField('RIGHT');
  return ['(' + left.getText() + ',' + right.getText() + ')',
      Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['pair_pattern_value_typed'] = function(block) {
  var left = block.typedValue['LEFT'].getVariableName();
  var right = block.typedValue['RIGHT'].getVariableName();
  return ['(' + left + ',' + right + ')', Blockly.TypedLang.ORDER_ATOMIC];
};
