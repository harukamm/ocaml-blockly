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
 * @fileoverview Generating TypedLang for variable blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.TypedLang.variables');

goog.require('Blockly.TypedLang');


Blockly.TypedLang['variables_get_typed'] = function(block) {
  // Variable getter.
  var code = Blockly.TypedLang.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['variables_set_typed'] = function(block) {
  // Variable setter.
  var argument0 = Blockly.TypedLang.valueToCode(block, 'VALUE',
      Blockly.TypedLang.ORDER_ASSIGNMENT) || '0';
  var varName = Blockly.TypedLang.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return varName + ' = ' + argument0 + ';\n';
};
