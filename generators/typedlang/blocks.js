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
      Blockly.TypedLang.ORDER_FUNCTION_CALL) || '?';
  var code = 'not ' + argument;
  return [code, Blockly.TypedLang.ORDER_FUNCTION_CALL];
};

Blockly.TypedLang['logic_operator_typed'] = function(block) {
  // Boolean operators && and ||.
  var OPERATORS = {
    'AND': [' && ', Blockly.TypedLang.ORDER_LOGICAL_AND],
    'OR': [' || ', Blockly.TypedLang.ORDER_LOGICAL_OR]
  };
  var tuple = OPERATORS[block.getFieldValue('OP_BOOL')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.TypedLang.valueToCode(block, 'A', order) || '?';
  var argument1 = Blockly.TypedLang.valueToCode(block, 'B', order) || '?';
  var code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.TypedLang['logic_compare_typed'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': [' = ', Blockly.TypedLang.ORDER_RELATIONAL],
    'NEQ': [' <> ', Blockly.TypedLang.ORDER_RELATIONAL],
    'LT': [' < ', Blockly.TypedLang.ORDER_RELATIONAL],
    'LTE': [' <= ', Blockly.TypedLang.ORDER_RELATIONAL],
    'GT': [' > ', Blockly.TypedLang.ORDER_RELATIONAL],
    'GTE': [' >= ', Blockly.TypedLang.ORDER_RELATIONAL],
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.TypedLang.valueToCode(block, 'A', order) || '?';
  var argument1 = Blockly.TypedLang.valueToCode(block, 'B', order) || '?';
  var code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.TypedLang['logic_ternary_typed'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.TypedLang.valueToCode(block, 'IF',
      Blockly.TypedLang.ORDER_EXPR) || '?';
  var value_then = Blockly.TypedLang.valueToCode(block, 'THEN',
      Blockly.TypedLang.ORDER_THEN) || '?';
  var value_else = Blockly.TypedLang.valueToCode(block, 'ELSE',
      Blockly.TypedLang.ORDER_ELSE) || '?';
  var code = 'if ' + value_if + ' then ' + value_then + ' else ' +
      value_else;
  return [code, Blockly.TypedLang.ORDER_EXPR];
};

Blockly.TypedLang['int_typed'] = function(block) {
  // int value.
  var code = parseInt(block.getFieldValue('INT'));
  var order = code < 0 ? Blockly.TypedLang.ORDER_SUBTRACTION
            : Blockly.TypedLang.ORDER_ATOMIC;
  return [code, order];
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
  var order = tuple[1];
  var argument0 = Blockly.TypedLang.valueToCode(block, 'A', order) || '?';
  var argument1 = Blockly.TypedLang.valueToCode(block, 'B', order) || '?';
  var code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.TypedLang['int_abs_typed'] = function(block) {
  // int function "abs".
  var argument = Blockly.TypedLang.valueToCode(block, 'A',
      Blockly.TypedLang.ORDER_FUNCTION_CALL) || '?';
  var code = 'abs ' + argument;
  return [code, Blockly.TypedLang.ORDER_FUNCTION_CALL];
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
  var argument0 = Blockly.TypedLang.valueToCode(block, 'A', order) || '?';
  var argument1 = Blockly.TypedLang.valueToCode(block, 'B', order) || '?';
  var code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.TypedLang['string_typed'] = function(block) {
  var value = block.getFieldValue('STRING');
  var literal = JSON.stringify(value);
  return [literal, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['concat_string_typed'] = function(block) {
  var left = Blockly.TypedLang.valueToCode(block, 'A',
      Blockly.TypedLang.ORDER_CONCAT_STRING) || '?';
  var right = Blockly.TypedLang.valueToCode(block, 'B',
      Blockly.TypedLang.ORDER_CONCAT_STRING) || '?';
  var code = left + ' ^ ' + right;
  return [code, Blockly.TypedLang.ORDER_CONCAT_STRING];
};

Blockly.TypedLang['string_of_int_typed'] = function(block) {
  var param = Blockly.TypedLang.valueToCode(block, 'PARAM',
      Blockly.TypedLang.ORDER_FUNCTION_CALL) || '?';
  var code = 'string_of_int ' + param;
  return [code, Blockly.TypedLang.ORDER_FUNCTION_CALL];
};

Blockly.TypedLang['lists_create_with_typed'] = function(block) {
  // Create a list with any number of elements of any type.
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.TypedLang.valueToCode(block, 'ADD' + i,
        Blockly.TypedLang.ORDER_SEMI) || '?';
  }
  var code = '[' + elements.join('; ') + ']';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['list_empty_typed'] = function(block) {
  return ['[]', Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['list_cons_typed'] = function(block) {
  var first = Blockly.TypedLang.valueToCode(block, 'FIRST',
      Blockly.TypedLang.ORDER_CONS) || '?';
  var rest = Blockly.TypedLang.valueToCode(block, 'CONS',
      Blockly.TypedLang.ORDER_CONS) || '?';
  var code = first + ' :: ' + rest;
  return [code, Blockly.TypedLang.ORDER_CONS];
};

Blockly.TypedLang['pair_create_typed'] = function(block) {
  var fst = Blockly.TypedLang.valueToCode(block, 'FIRST',
      Blockly.TypedLang.ORDER_COMMA) || '?';
  var snd = Blockly.TypedLang.valueToCode(block, 'SECOND',
      Blockly.TypedLang.ORDER_COMMA) || '?';
  var code = '(' + fst + ', ' + snd + ')';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['pair_first_typed'] = function(block) {
  var arg = Blockly.TypedLang.valueToCode(block, 'FIRST',
      Blockly.TypedLang.ORDER_FUNCTION_CALL) || '?';
  var code = 'fst ' + arg;
  return [code, Blockly.TypedLang.ORDER_FUNCTION_CALL];
};

Blockly.TypedLang['pair_second_typed'] = function(block) {
  var arg = Blockly.TypedLang.valueToCode(block, 'SECOND',
      Blockly.TypedLang.ORDER_FUNCTION_CALL) || '?';
  var code = 'snd ' + arg;
  return [code, Blockly.TypedLang.ORDER_FUNCTION_CALL];
};

Blockly.TypedLang['function_app_typed'] = function(block) {
  var code = block.getField('VAR').getVariableName();
  var params = [];
  for (var i = 0; i < block.paramCount_; i++) {
    var p = Blockly.TypedLang.valueToCode(block, 'PARAM' + i,
        Blockly.TypedLang.ORDER_FUNCTION_CALL) || '?';
    params.push(p);
  }
  if (params.length == 0) {
    return [code, Blockly.TypedLang.ORDER_ATOMIC];
  }
  code += ' ' + params.join(' ');
  return [code, Blockly.TypedLang.ORDER_FUNCTION_CALL];
};

Blockly.TypedLang['lambda_typed'] = function(block) {
  var varname = block.typedValue['VAR'].getVariableName();
  var body = Blockly.TypedLang.valueToCode(block, 'RETURN',
      Blockly.TypedLang.ORDER_ARROW) || '?';
  var code = 'fun ' + varname + ' -> ' + body;
  return [code, Blockly.TypedLang.ORDER_EXPR];
};

Blockly.TypedLang['lambda_app_typed'] = function(block) {
  var left = Blockly.TypedLang.valueToCode(block, 'FUN',
      Blockly.TypedLang.ORDER_FUNCTION_CALL) || '?';
  var right = Blockly.TypedLang.valueToCode(block, 'ARG',
      Blockly.TypedLang.ORDER_FUNCTION_CALL) || '?';
  var code = left + ' ' + right;
  return [code, Blockly.TypedLang.ORDER_FUNCTION_CALL];
};

Blockly.TypedLang['match_typed'] = function(block) {
  if (block.itemCount_ == 0) {
    return ['', Blockly.TypedLang.ORDER_ATOMIC];
  }
  var input = Blockly.TypedLang.valueToCode(block, 'INPUT',
      Blockly.TypedLang.ORDER_EXPR) || '?';
  var code = 'match ' + input + ' with';
  for (var i = 0; i < block.itemCount_; i++) {
    var pattern = Blockly.TypedLang.valueToCode(block, 'PATTERN' + i,
        Blockly.TypedLang.ORDER_EXPR) || '?';
    var output = Blockly.TypedLang.valueToCode(block, 'OUTPUT' + i,
        Blockly.TypedLang.ORDER_EXPR) || '?';
    code += '\n  | ' + pattern + ' -> ' + output;
  }
  return [code, Blockly.TypedLang.ORDER_EXPR];
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
      Blockly.TypedLang.ORDER_NONE) || '?';
        // ORDER_NONE = no parenthesis needed for exp1

  var code = 'let ';
  if (block.isRecursive()) code += 'rec ';
  code += varname + arg + ' = ' + exp1;

  if (block.getIsStatement()) {
    code += '\n';
    return code;
  }
  var exp2 = Blockly.TypedLang.valueToCode(block, 'EXP2',
      Blockly.TypedLang.ORDER_IN) || '?';
  code += ' in ' + exp2;
  return [code, Blockly.TypedLang.ORDER_EXPR];
};

Blockly.TypedLang['letrec_typed'] = function(block) {
  return Blockly.TypedLang['let_typed'].call(this, block);
};

Blockly.TypedLang['letstatement_typed'] = function(block) {
  return Blockly.TypedLang['let_typed'].call(this, block);
};

Blockly.TypedLang['dummy_statement_typed'] = function(block) {
  var code = Blockly.TypedLang.valueToCode(block, 'VALUE',
      Blockly.TypedLang.ORDER_ATOMIC) || '?';
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
    code += ' : ';
    var typeCtor = Blockly.TypedLang.valueToCode(block, 'FIELD_INP' + i,
        Blockly.TypedLang.ORDER_SEMI) || '?';
    code += typeCtor;
    if (i != block.itemCount_ - 1) {
      code += '; ';
    }
  }
  code += '}\n';
  return code;
};

Blockly.TypedLang.recordTypeUtil_ = function(pairs) {
  if (pairs.length == 0) {
    return '';
  }
  var code = '{';
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var fieldName = pair[0];
    var fieldInput = pair[1];
    code += fieldName;
    code += ' = ';
    code += fieldInput;
    if (i != pairs.length - 1) {
      code += '; ';
    }
  }
  code += '}';
  return code;
};

Blockly.TypedLang['create_record_typed'] = function(block) {
  var pairs = [];
  for (var i = 0; i < block.fieldCount_; i++) {
    var recordField = block.getField('FIELD' + i);
    var fieldName = recordField.getVariableName();
    var fieldInput = Blockly.TypedLang.valueToCode(block, 'FIELD_INP' + i,
        Blockly.TypedLang.ORDER_SEMI) || '?';
    pairs.push([fieldName, fieldInput]);
  }
  return [Blockly.TypedLang.recordTypeUtil_(pairs),
      Blockly.TypedLang.ORDER_ATOMIC];
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
        Blockly.TypedLang.ORDER_SEMI) || '?';
    var ctorField = block.getField('CTR' + i);
    code += '\n  | ' + ctorField.getVariableName();
    if (typeCtor) {
      code += ' of ' + typeCtor;
    }
  }
  code += '\n';
  return code;
};

Blockly.TypedLang['create_construct_typed'] = function(block) {
  var params = [];
  for (var i = 0, input; input = block.inputList[i]; i++) {
    var m = input.name && input.name.match(/PARAM(\d+)/);
    if (!m) {
      continue;
    }
    var param = Blockly.TypedLang.valueToCode(block, input.name,
        Blockly.TypedLang.ORDER_ATOMIC) || '?';
    params.push(param);
  }
  var field = block.getField('CONSTRUCTOR');
  var code = field.getVariableName();
  if (params.length != 0) {
    code += ' (' + params.join(', ') + ')';
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

Blockly.TypedLang.tupleTypeUtil_ = function(block, names) {
  var tuples = '';
  for (var i = 0, name; name = names[i]; i++) {
    var item = Blockly.TypedLang.valueToCode(block, name,
        Blockly.TypedLang.ORDER_MULTIPLICATION) || '?';
    tuples += item;
    if (i != names.length - 1) {
      tuples += ' * ';
    }
  }
  var parentBlock = block.getParent();
  var isTopLevel = !!parentBlock &&
      (parentBlock.type === 'defined_datatype_typed' ||
       parentBlock.type === 'defined_recordtype_typed');
  var code = '';
  if (!isTopLevel) {
    code += '(';
  }
  code += tuples;
  if (!isTopLevel) {
    code += ')';
  }
  return code;
};

Blockly.TypedLang['pair_type_constructor_typed'] = function(block, names) {
  var code = Blockly.TypedLang.tupleTypeUtil_(block, ['LEFT', 'RIGHT']);
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['triple_type_constructor_typed'] = function(block) {
  var code = Blockly.TypedLang.tupleTypeUtil_(block,
      ['ITEM0', 'ITEM1', 'ITEM2']);
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['alist_type_constructor_typed'] = function(block) {
  var param = Blockly.TypedLang.valueToCode(block, 'ITEM',
      Blockly.TypedLang.ORDER_FUNCTION_CALL) || '?';
  return [param + ' list', Blockly.TypedLang.ORDER_FUNCTION_CALL];
};

Blockly.TypedLang['empty_construct_pattern_typed'] = function(block) {
  return ['[]', Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['cons_construct_pattern_typed'] = function(block) {
  var first = block.getField('FIRST');
  var cons = block.getField('CONS');
  return [first.getText() + ' :: ' + cons.getText(),
      Blockly.TypedLang.ORDER_CONS];
};

Blockly.TypedLang['cons_construct_pattern_value_typed'] = function(block) {
  var first = block.typedValue['FIRST'].getVariableName();
  var cons = block.typedValue['CONS'].getVariableName();
  return [first + ' :: ' + cons,
      Blockly.TypedLang.ORDER_CONS];
};

Blockly.TypedLang['pair_pattern_typed'] = function(block) {
  var left = block.getField('LEFT');
  var right = block.getField('RIGHT');
  return ['(' + left.getText() + ', ' + right.getText() + ')',
      Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['pair_pattern_value_typed'] = function(block) {
  var left = block.typedValue['LEFT'].getVariableName();
  var right = block.typedValue['RIGHT'].getVariableName();
  return ['(' + left + ', ' + right + ')', Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['record_pattern_typed'] = function(block) {
  var pairs = [];
  for (var i = 0; i < block.fieldCount_; i++) {
    var recordField = block.getField('FIELD' + i);
    var fieldName = recordField.getVariableName();
    var fieldInput = block.getField('TEXT' + i).getText();
    pairs.push([fieldName, fieldInput]);
  }
  return [Blockly.TypedLang.recordTypeUtil_(pairs),
      Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['record_pattern_value_typed'] = function(block) {
  var pairs = [];
  for (var i = 0; i < block.fieldCount_; i++) {
    var recordField = block.getField('FIELD' + i);
    var fieldName = recordField.getVariableName();
    var fieldInput = block.getField('TEXT' + i).getVariableName();
    pairs.push([fieldName, fieldInput]);
  }
  return [Blockly.TypedLang.recordTypeUtil_(pairs),
      Blockly.TypedLang.ORDER_ATOMIC];
};
