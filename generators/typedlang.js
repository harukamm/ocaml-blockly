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
 * @fileoverview Helper functions for generating TypedLang for blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.TypedLang');

goog.require('Blockly.Generator');


/**
 * TypedLang code generator.
 * @type {!Blockly.Generator}
 */
Blockly.TypedLang = new Blockly.Generator('TypedLang');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.TypedLang.addReservedWords(
    // http://caml.inria.fr/pub/docs/manual-ocaml/lex.html#sec84
    'and,as,assert,asr,begin,class,constraint,do,done,downto,else,end,' +
    'exception,external,false,for,fun,function,functor,if,in,include,' +
    'inherit,initializer,land,lazy,let,lor,lsl,lsr,lxor,match,method,' +
    'mod,module,mutable,new,nonrec,object,of,open,or,private,rec,sig,' +
    'struct,then,to,true,try,type,val,virtual,when,while,with');

/**
 * Order of operation ENUMs.
 * See precedence section of parser.mly in the OCaml distribution.
 */
Blockly.TypedLang.ORDER_ATOMIC = 0;           // 0 "" ...
Blockly.TypedLang.ORDER_FUNCTION_CALL = 2;    // f x
Blockly.TypedLang.ORDER_POWER = 4;            // ** (INFIXOP4)
Blockly.TypedLang.ORDER_MULTIPLICATION = 5.1; // * (INFIXOP3)
Blockly.TypedLang.ORDER_DIVISION = 5.2;       // / (INFIXOP3)
Blockly.TypedLang.ORDER_MOD = 5.3;            // mod (INFIXOP3)
Blockly.TypedLang.ORDER_SUBTRACTION = 6.1;    // - (INFIXOP2)
Blockly.TypedLang.ORDER_ADDITION = 6.2;       // + (INFIXOP2)
Blockly.TypedLang.ORDER_CONS = 7;             // ::
Blockly.TypedLang.ORDER_CONCAT_STRING = 8;    // ^ (INFIXOP1)
Blockly.TypedLang.ORDER_RELATIONAL = 9;       // < <= > >= = <> (INFIXOP0)
Blockly.TypedLang.ORDER_LOGICAL_AND = 13;     // &&
Blockly.TypedLang.ORDER_LOGICAL_OR = 14;      // ||
Blockly.TypedLang.ORDER_ARROW = 15;           // ->
Blockly.TypedLang.ORDER_COMMA = 16;           // ,
Blockly.TypedLang.ORDER_ELSE = 17;            // else
Blockly.TypedLang.ORDER_THEN = 18;            // then
Blockly.TypedLang.ORDER_WITH = 19;            // with
Blockly.TypedLang.ORDER_SEMI = 20;            // ;
Blockly.TypedLang.ORDER_IN = 21;              // in
Blockly.TypedLang.ORDER_EXPR = 50;            // any expression
Blockly.TypedLang.ORDER_NONE = 99;            // (...)

/**
 * List of outer-inner pairings that do NOT require parentheses.
 * @type {!Array.<!Array.<number>>}
 */
Blockly.TypedLang.ORDER_OVERRIDES = [
  // a * (b * c) -> a * b * c
  [Blockly.TypedLang.ORDER_MULTIPLICATION, Blockly.TypedLang.ORDER_MULTIPLICATION],
  // a + (b + c) -> a + b + c
  [Blockly.TypedLang.ORDER_ADDITION, Blockly.TypedLang.ORDER_ADDITION],
  // a && (b && c) -> a && b && c
  [Blockly.TypedLang.ORDER_LOGICAL_AND, Blockly.TypedLang.ORDER_LOGICAL_AND],
  // a || (b || c) -> a || b || c
  [Blockly.TypedLang.ORDER_LOGICAL_OR, Blockly.TypedLang.ORDER_LOGICAL_OR],
  // a ^ (b ^ c) -> a ^ b ^ c
  [Blockly.TypedLang.ORDER_CONCAT_STRING, Blockly.TypedLang.ORDER_CONCAT_STRING],
  // a :: (b :: c) -> a :: b :: c
  [Blockly.TypedLang.ORDER_CONS, Blockly.TypedLang.ORDER_CONS]
];

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.TypedLang.init = function(workspace) {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.TypedLang.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.TypedLang.functionNames_ = Object.create(null);

  if (!Blockly.TypedLang.variableDB_) {
    Blockly.TypedLang.variableDB_ =
        new Blockly.Names(Blockly.TypedLang.RESERVED_WORDS_);
  } else {
    Blockly.TypedLang.variableDB_.reset();
  }

  Blockly.TypedLang.variableDB_.setVariableMap(workspace.getVariableMap());

  var defvars = [];
  // Add developer variables (not created or named by the user).
  var devVarList = Blockly.Variables.allDeveloperVariables(workspace);
  for (var i = 0; i < devVarList.length; i++) {
    defvars.push(Blockly.TypedLang.variableDB_.getName(devVarList[i],
        Blockly.Names.DEVELOPER_VARIABLE_TYPE));
  }

  // Add user variables, but only ones that are being used.
  var variables = Blockly.Variables.allUsedVarModels(workspace);
  for (var i = 0; i < variables.length; i++) {
    defvars.push(Blockly.TypedLang.variableDB_.getName(variables[i].getId(),
        Blockly.Variables.NAME_TYPE));
  }

  // Declare all of the variables.
  if (defvars.length) {
    Blockly.TypedLang.definitions_['variables'] =
        'var ' + defvars.join(', ') + ';';
  }
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.TypedLang.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var definitions = [];
  for (var name in Blockly.TypedLang.definitions_) {
    definitions.push(Blockly.TypedLang.definitions_[name]);
  }
  // Clean up temporary data.
  delete Blockly.TypedLang.definitions_;
  delete Blockly.TypedLang.functionNames_;
  Blockly.TypedLang.variableDB_.reset();
  return definitions.join('\n\n') + '\n\n\n' + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.TypedLang.scrubNakedValue = function(line) {
  return 'let _ = ' + line + '\n';
};

/**
 * Encode a string as a properly escaped TypedLang string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} TypedLang string.
 * @private
 */
Blockly.TypedLang.quote_ = function(string) {
  // Can't use goog.string.quote since Google's style guide recommends
  // JS string literals use single quotes.
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/'/g, '\\\'');
  return '\'' + string + '\'';
};

/**
 * Common tasks for generating TypedLang from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The TypedLang code created for this block.
 * @return {string} TypedLang code with comments and subsequent blocks added.
 * @private
 */
Blockly.TypedLang.scrub_ = function(block, code) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    comment = Blockly.utils.wrap(comment, Blockly.TypedLang.COMMENT_WRAP - 3);
    if (comment) {
      commentCode += '\n' +
                     Blockly.TypedLang.prefixLines(comment, '   ')
                            .replace(/^  /gm, '(* ')
                            .replace(/$/gm, ' *)') +
                     '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.TypedLang.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.TypedLang.prefixLines(comment, '   ')
                                  .replace(/^  /, '(*')
                                  .replace(/\n$/, ' *)\n');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.TypedLang.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

/**
 * Gets a property and adjusts the value while taking into account indexing.
 * @param {!Blockly.Block} block The block.
 * @param {string} atId The property ID of the element to get.
 * @param {number=} opt_delta Value to add.
 * @param {boolean=} opt_negate Whether to negate the value.
 * @param {number=} opt_order The highest order acting on this value.
 * @return {string|number}
 */
Blockly.TypedLang.getAdjusted = function(block, atId, opt_delta, opt_negate,
    opt_order) {
  var delta = opt_delta || 0;
  var order = opt_order || Blockly.TypedLang.ORDER_NONE;
  if (block.workspace.options.oneBasedIndex) {
    delta--;
  }
  var defaultAtIndex = block.workspace.options.oneBasedIndex ? '1' : '0';
  if (delta > 0) {
    var at = Blockly.TypedLang.valueToCode(block, atId,
        Blockly.TypedLang.ORDER_ADDITION) || defaultAtIndex;
  } else if (delta < 0) {
    var at = Blockly.TypedLang.valueToCode(block, atId,
        Blockly.TypedLang.ORDER_SUBTRACTION) || defaultAtIndex;
  } else if (opt_negate) {
    var at = Blockly.TypedLang.valueToCode(block, atId,
        Blockly.TypedLang.ORDER_UNARY_NEGATION) || defaultAtIndex;
  } else {
    var at = Blockly.TypedLang.valueToCode(block, atId, order) ||
        defaultAtIndex;
  }

  if (Blockly.isNumber(at)) {
    // If the index is a naked number, adjust it right now.
    at = parseFloat(at) + delta;
    if (opt_negate) {
      at = -at;
    }
  } else {
    // If the index is dynamic, adjust it in code.
    if (delta > 0) {
      at = at + ' + ' + delta;
      var innerOrder = Blockly.TypedLang.ORDER_ADDITION;
    } else if (delta < 0) {
      at = at + ' - ' + -delta;
      var innerOrder = Blockly.TypedLang.ORDER_SUBTRACTION;
    }
    if (opt_negate) {
      if (delta) {
        at = '-(' + at + ')';
      } else {
        at = '-' + at;
      }
      var innerOrder = Blockly.TypedLang.ORDER_UNARY_NEGATION;
    }
    innerOrder = Math.floor(innerOrder);
    order = Math.floor(order);
    if (innerOrder && order >= innerOrder) {
      at = '(' + at + ')';
    }
  }
  return at;
};
