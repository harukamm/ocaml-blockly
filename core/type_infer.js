/**
 * @fileoverview Object representing type scheme for typed blocks.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

goog.provide('Blockly.Scheme');

goog.require('goog.asserts');

/**
 * Object for type scheme.
 * @param {!Array.<!string>} names List of type variable names to be bound by
 *     the quantifier.
 * @param {!Blockly.TypeExpr} type
 * @constructor
 */
Blockly.Scheme = function(names, type) {
  this.names = names;
  this.type = type;
};

Blockly.Scheme.monoType = function(type) {
  return new Blockly.Scheme([], type);
};

Blockly.Scheme.create = function(env, type) {
  var ftvInEnv = [];
  for (var key in env) {
    var scheme = env[key];
    ftvInEnv = ftvInEnv.concat(scheme.freeTvars());
  }
  var boundVarNames = [];
  var ftvNamesInEnv = goog.array.map(ftvInEnv, function(x) {return x.name;});
  var ftvInType = type.getTvarList();
  for (var i = 0, tvar; tvar = ftvInType[i]; i++) {
    goog.asserts.assert(!tvar.val,
        'Includes a type which is not a type variable');
    var name = tvar.name;
    if (ftvNamesInEnv.indexOf(name) == -1 && boundVarNames.indexOf(name) == -1) {
      boundVarNames.push(name);
    }
  }
  return new Blockly.Scheme(boundVarNames, type);
};

Blockly.Scheme.prototype.freeTvars = function() {
  var tvars = this.type.getTvarList();
  var result = [];
  for (var i = 0, tvar; tvar = tvars[i]; i++) {
    if (this.names.indexOf(tvar.name) == -1) {
      goog.asserts.assert(!tvar.val,
          'Includes a type which is not a type variable');
      result.push(tvar);
    }
  }
  return result;
};

Blockly.Scheme.prototype.instantiate = function() {
  var tvars = this.type.getTvarList();
  var unvisited = [].concat(this.names);
  for (var i = 0, tvar; tvar = tvars[i]; i++) {
    var index = unvisited.indexOf(tvar.name);
    if (index != -1) {
      unvisited.splice(index, 1);
    }
  }
  goog.asserts.assert(unvisited.length == 0);

  return this.type.instantiate(this.names);
};

Blockly.Scheme.prototype.toString = function() {
  // ∀a1....an. t
  var result = '';
  var typeStr = this.type.toString();
  if (this.names.length != 0) {
    var result = '∀';
    for (var i = 0; i < this.names.length; i++) {
      result += ' ';
      result += this.names[i];
    }
    result += '. ';
  }
  result += typeStr;
  return result;
};
