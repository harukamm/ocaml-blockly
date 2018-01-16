/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating TypedLang for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.TypedLang.procedures');

goog.require('Blockly.TypedLang');


Blockly.TypedLang['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = Blockly.TypedLang.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.TypedLang.statementToCode(block, 'STACK');
  if (Blockly.TypedLang.STATEMENT_PREFIX) {
    var id = block.id.replace(/\$/g, '$$$$');  // Issue 251.
    branch = Blockly.TypedLang.prefixLines(
        Blockly.TypedLang.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + id + '\''), Blockly.TypedLang.INDENT) + branch;
  }
  if (Blockly.TypedLang.INFINITE_LOOP_TRAP) {
    branch = Blockly.TypedLang.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.TypedLang.valueToCode(block, 'RETURN',
      Blockly.TypedLang.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = Blockly.TypedLang.INDENT + 'return ' + returnValue + ';\n';
  }
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.TypedLang.variableDB_.getName(block.arguments_[i],
        Blockly.Variables.NAME_TYPE);
  }
  var code = 'function ' + funcName + '(' + args.join(', ') + ') {\n' +
      branch + returnValue + '}';
  code = Blockly.TypedLang.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.TypedLang.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.TypedLang['procedures_defnoreturn'] =
    Blockly.TypedLang['procedures_defreturn'];

Blockly.TypedLang['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.TypedLang.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.TypedLang.valueToCode(block, 'ARG' + i,
        Blockly.TypedLang.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.TypedLang.ORDER_FUNCTION_CALL];
};

Blockly.TypedLang['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.TypedLang.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.TypedLang.valueToCode(block, 'ARG' + i,
        Blockly.TypedLang.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ');\n';
  return code;
};

Blockly.TypedLang['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.TypedLang.valueToCode(block, 'CONDITION',
      Blockly.TypedLang.ORDER_NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (block.hasReturnValue_) {
    var value = Blockly.TypedLang.valueToCode(block, 'VALUE',
        Blockly.TypedLang.ORDER_NONE) || 'null';
    code += Blockly.TypedLang.INDENT + 'return ' + value + ';\n';
  } else {
    code += Blockly.TypedLang.INDENT + 'return;\n';
  }
  code += '}\n';
  return code;
};
