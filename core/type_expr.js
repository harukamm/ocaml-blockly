'use strict';

goog.provide('Blockly.TypeExpr');

goog.require('goog.asserts');
goog.require('goog.dom');

/**
 * @constructor
 * @param {number} label
 */
function TypeExpr(label) {
  this.label = label;
}

/**
 * @type {number}
 * @private
 */
TypeExpr.prototype.INT_ = 100;

/**
 * @type {number}
 * @private
 */
TypeExpr.prototype.BOOL_ = 101;

/**
 * @type {number}
 * @private
 */
TypeExpr.prototype.FUN_ = 102;

/**
 * @type {number}
 * @private
 */
TypeExpr.prototype.TVAR_ = 103;

/**
 * Convert the type instance into plan text.
 * @type {boolean=} opt_deref
 * @return {string}
 */
TypeExpr.prototype.toString = function(opt_deref) {
  goog.asserts.assert(false, 'Not implemented.');
}

/**
 * @static
 * @return {string}
 */
TypeExpr.generateColor = function() {
  var getRandomInt = function(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  var to2digitshexString = function(v) {
    var x = v.toString(16).slice(-2);
    return '0'.repeat(2 - x.length) + x;
  }
  var r = getRandomInt(1 << 8);
  var g = getRandomInt(1 << 8);
  var b = getRandomInt(1 << 8);
  return '#' + to2digitshexString(r) + to2digitshexString(g) +
      to2digitshexString(b);
}

/**
 * Returns whether the object is a type variable.
 * @return {boolean} True if the object is a type variable.
 */
TypeExpr.prototype.isTypeVar = function() {
  var t = this.deref();
  return t.label == TypeExpr.prototype.TVAR;
}

/**
 * @extends {TypeExpr}
 * @constructor
 * @return {TypeExpr}
 */
TypeExpr.INT = function() {
  TypeExpr.call(this, TypeExpr.prototype.INT);
}
goog.inherits(TypeExpr.INT, TypeExpr);

/**
 * @override
 * @param {boolean=} opt_deref
 * @return {string}
 */
TypeExpr.INT.prototype.toString = function(opt_deref) {
  return "INT";
}

/**
 * @extends {TypeExpr}
 * @constructor
 * @return {TypeExpr}
 */
TypeExpr.BOOL = function() {
  TypeExpr.call(this, TypeExpr.prototype.BOOL);
}
goog.inherits(TypeExpr.BOOL, TypeExpr);

/**
 * @override
 * @param {boolean=} opt_deref
 * @return {string}
 */
TypeExpr.BOOL.prototype.toString = function(opt_deref) {
  return "BOOL";
}

/**
 * @extends {TypeExpr}
 * @constructor
 * @param {TypeExpr} arg_type
 * @param {TypeExpr} return_type
 * @return {TypeExpr}
 */
TypeExpr.FUN = function(arg_type, return_type) {
  /** @type {TypeExpr} */
  this.arg_type = arg_type;
  /** @type {TypeExpr} */
  this.return_type = return_type;
  TypeExpr.call(this, TypeExpr.prototype.FUN);
}
goog.inherits(TypeExpr.FUN, TypeExpr);

/**
 * @override
 * @param {boolean=} opt_deref
 * @return {string}
 */
TypeExpr.FUN.prototype.toString = function(opt_deref) {
  return "FUN((" + this.arg_type.toString(opt_deref) + ") -> (" +
      this.return_type.toString(opt_deref) + "))";
}

/**
 * @extends {TypeExpr}
 * @constructor
 * @param {string} name
 * @param {TypeExpr} val
 * @param {string=} opt_color
 * @return {TypeExpr}
 */
TypeExpr.TVAR = function(name, val, opt_color) {
  /** @type {string} */
  this.name = name;
  /** @type {TypeExpr} */
  this.val = val;
  /** @type {Type} */
  this.type = type;
  /** @type {string} */
  this.color = opt_color ? opt_color : TypeExpr.generateColor();
  TypeExpr.call(this, TypeExpr.prototype.TVAR);
}
goog.inherits(TypeExpr.TVAR, TypeExpr);

/**
 * @override
 * @param {boolean=} opt_deref
 * @return {string}
 */
TypeExpr.TVAR.prototype.toString = function(opt_deref) {
  var inst = opt_deref ? this.deref() : this;
  if (inst.label == TypeExpr.prototype.TVAR) {
    var val_str = inst.val ? inst.val.toString(opt_deref) : "null";
    return "<" + inst.name + "=" + val_str + ">";
  } else {
    return "" + inst.toString(opt_deref);
  }
}

/**
 * @return {TypeExpr}
 */
TypeExpr.prototype.deref = function() {
  var t = this;
  while (t.label == TypeExpr.prototype.TVAR && t.val != null)
    t = t.val;
  return t;
}

TypeExpr.prototype.gen_counter = 1;

/**
 * @static
 * @param {number} n
 * @return {string}
 */
TypeExpr.ExcelColumn = function(n) {
  var r = "";
  var acode = "A".charCodeAt(0);
  while (0 < n) {
    n--;
    r += String.fromCharCode(acode + (n % 26));
    n /= 26;
    n = Math.floor(n);
  }
  var result = "";
  for (var i = r.length - 1; 0 <= i; i--)
    result += r[i];

  return result;
}

/**
 * @static
 * @return {TypeExpr}
 */
TypeExpr.Gen = function() {
  var name = TypeExpr.ExcelColumn(TypeExpr.prototype.gen_counter);
  TypeExpr.prototype.gen_counter++;
  return new TypeExpr.TVAR(name, null);
}

/**
 * @param {TypeExpr} other
 */
TypeExpr.prototype.unify = function(other) {
  var staq = [[this, other]];
  while (staq.length != 0) {
    var pair = staq.pop();
    var t1 = pair[0];
    var t2 = pair[1];
    if (t1.label == TypeExpr.prototype.TVAR || t2.label == TypeExpr.prototype.TVAR) {
      var tvar, othr;
      tvar = t1.label == TypeExpr.prototype.TVAR ? t1 : t2;
      othr = t1.label == TypeExpr.prototype.TVAR ? t2 : t1;
      if (othr.label == TypeExpr.prototype.TVAR && tvar.name == othr.name)
        continue;
      if (tvar.val != null) {
        staq.push([tvar.val, othr]);
      } else {
        goog.assert(!othr.occur(tvar.name), 'Unify error: variable occurrace');
        tvar.val = othr;
      }
    } else {
      goog.assert(t1.label == t2.label, 'Unify error: Cannot unify');
      if (t1.label == TypeExpr.prototype.FUN) {
        staq.push([t1.arg_type, t2.arg_type]);
        staq.push([t1.return_type, t2.return_type]);
      }
    }
  }
}

/**
 * @param {string} name
 * @return {boolean}
 */
TypeExpr.prototype.occur = function(name) {
  var staq = [this];
  while (staq.length != 0) {
    var t = staq.pop();
    switch (t.label) {
    case TypeExpr.prototype.INT:
    case TypeExpr.prototype.BOOL:
      break;
    case TypeExpr.prototype.FUN:
      staq.push(t.arg_type);
      staq.push(t.return_type);
      break;
    case TypeExpr.prototype.TVAR:
      if (t.name == name)
        return true;
      if (t.val)
        staq.push(t.val);
      break;
    default:
      goog.assert(false, 'This should not happen.');
    }
  }
  return false;
}
