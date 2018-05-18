'use strict';

goog.provide('Blockly.TypeExpr');

goog.require('goog.asserts');
goog.require('goog.dom');

/**
 * @constructor
 * @param {number} label
 */
Blockly.TypeExpr = function(label) {
  this.label = label;
}

/**
 * @type {number}
 * @private
 */
Blockly.TypeExpr.prototype.INT_ = 100;

/**
 * @type {number}
 * @private
 */
Blockly.TypeExpr.prototype.FLOAT_ = 105;

/**
 * @type {number}
 * @private
 */
Blockly.TypeExpr.prototype.BOOL_ = 110;

/**
 * @type {number}
 * @private
 */
Blockly.TypeExpr.prototype.LIST_ = 115;

/**
 * @type {number}
 * @private
 */
Blockly.TypeExpr.prototype.PAIR_ = 120;

/**
 * @type {number}
 * @private
 */
Blockly.TypeExpr.prototype.SUM_ = 125;

/**
 * @type {number}
 * @private
 */
Blockly.TypeExpr.prototype.FUN_ = 130;

/**
 * @type {number}
 * @private
 */
Blockly.TypeExpr.prototype.TVAR_ = 135;

/**
 * Convert the type instance into plan text.
 * @param {boolean=} opt_deref
 * @return {string}
 */
Blockly.TypeExpr.prototype.toString = function(opt_deref) {
  goog.asserts.assert(false, 'Not implemented.');
}

/**
 * Return the object's type name.
 * @return {string}
 */
Blockly.TypeExpr.prototype.getTypeName = function() {
  switch (this.label) {
    case Blockly.TypeExpr.prototype.INT_:
      return 'int';
    case Blockly.TypeExpr.prototype.FLOAT_:
      return 'float';
    case Blockly.TypeExpr.prototype.BOOL_:
      return 'bool';
    case Blockly.TypeExpr.prototype.LIST_:
      return 'list';
    case Blockly.TypeExpr.prototype.PAIR_:
      return 'pair';
    case Blockly.TypeExpr.prototype.SUM_:
      return 'sum';
    case Blockly.TypeExpr.prototype.FUN_:
      return 'fun';
    case Blockly.TypeExpr.prototype.TVAR_:
      return 'typeVar';
    default:
      goog.asserts.assert(false, 'Not implemented.');
  }
}

/**
 * Return a collection of the object's child types.
 * @return {Array<Type>}
 */
Blockly.TypeExpr.prototype.getChildren = function() {
  return [];
}

 /**
 * @static
 * @return {string}
 */
Blockly.TypeExpr.generateColor = function() {
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
Blockly.TypeExpr.prototype.isTypeVar = function() {
  var t = this.deref();
  return t.label == Blockly.TypeExpr.prototype.TVAR_;
}

/**
 * @extends {Blockly.TypeExpr}
 * @constructor
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.INT = function() {
  Blockly.TypeExpr.call(this, Blockly.TypeExpr.prototype.INT_);
}
goog.inherits(Blockly.TypeExpr.INT, Blockly.TypeExpr);

/**
 * @override
 * @param {boolean=} opt_deref
 * @return {string}
 */
Blockly.TypeExpr.INT.prototype.toString = function(opt_deref) {
  return "INT";
}

/**
 * @extends {Blockly.TypeExpr}
 * @constructor
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.FLOAT = function() {
  Blockly.TypeExpr.call(this, Blockly.TypeExpr.prototype.FLOAT_);
}
goog.inherits(Blockly.TypeExpr.FLOAT, Blockly.TypeExpr);

/**
 * @override
 * @param {boolean=} opt_deref
 * @return {string}
 */
Blockly.TypeExpr.FLOAT.prototype.toString = function(opt_deref) {
  return "FLOAT";
}

/**
 * @extends {Blockly.TypeExpr}
 * @constructor
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.BOOL = function() {
  Blockly.TypeExpr.call(this, Blockly.TypeExpr.prototype.BOOL_);
}
goog.inherits(Blockly.TypeExpr.BOOL, Blockly.TypeExpr);

/**
 * @override
 * @param {boolean=} opt_deref
 * @return {string}
 */
Blockly.TypeExpr.BOOL.prototype.toString = function(opt_deref) {
  return "BOOL";
}

/**
 * @extends {Blockly.TypeExpr}
 * @constructor
 * @param {Type} element_type
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.LIST = function(element_type) {
  /** @type {Type} */
  this.element_type = element_type;
  Blockly.TypeExpr.call(this, Blockly.TypeExpr.prototype.LIST_);
}
goog.inherits(Blockly.TypeExpr.LIST, Blockly.TypeExpr);

/**
 * @override
 * @param {boolean=} opt_deref
 * @return {string}
 */
Blockly.TypeExpr.LIST.prototype.toString = function(opt_deref) {
  return "LIST[" + this.element_type.toString() + "]";
}

/**
 * @override
 * @return {Array<Type>}
 */
Blockly.TypeExpr.LIST.prototype.getChildren = function() {
  return [this.element_type];
}

/**
 * @extends {Blockly.TypeExpr}
 * @constructor
 * @param {Type} first_type
 * @param {Type} second_type
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.PAIR = function(first_type, second_type) {
  /** @type {Type} */
  this.first_type = first_type;
  /** @type {Type} */
  this.second_type = second_type;
  Blockly.TypeExpr.call(this, Blockly.TypeExpr.prototype.PAIR_);
}
goog.inherits(Blockly.TypeExpr.PAIR, Blockly.TypeExpr);

/**
 * @override
 * @param {boolean=} opt_deref
 * @return {string}
 */
Blockly.TypeExpr.PAIR.prototype.toString = function(opt_deref) {
  return "PAIR[" + this.first_type.toString() + " * " +
      this.second_type.toString() + "]";
}

/**
 * @override
 * @return {Array<Type>}
 */
Blockly.TypeExpr.PAIR.prototype.getChildren = function() {
  return [this.first_type, this.second_type];
}

/**
 * @extends {Blockly.TypeExpr}
 * @constructor
 * @param {Type} left_type
 * @param {Type} right_type
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.SUM = function(left_type, right_type) {
  /** @type {Type} */
  this.left_type = left_type;
  /** @type {Type} */
  this.right_type = right_type;
  Blockly.TypeExpr.call(this, Blockly.TypeExpr.prototype.SUM_);
}
goog.inherits(Blockly.TypeExpr.SUM, Blockly.TypeExpr);

/**
 * @override
 * @param {boolean=} opt_deref
 * @return {string}
 */
Blockly.TypeExpr.SUM.prototype.toString = function(opt_deref) {
  return "SUM[" + this.left_type.toString() + " * " +
      this.right_type.toString() + "]";
}

/**
 * @override
 * @return {Array<Type>}
 */
Blockly.TypeExpr.SUM.prototype.getChildren = function() {
  return [this.left_type, this.right_type];
}

/**
 * @extends {Blockly.TypeExpr}
 * @constructor
 * @param {Blockly.TypeExpr} arg_type
 * @param {Blockly.TypeExpr} return_type
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.FUN = function(arg_type, return_type) {
  /** @type {Blockly.TypeExpr} */
  this.arg_type = arg_type;
  /** @type {Blockly.TypeExpr} */
  this.return_type = return_type;
  Blockly.TypeExpr.call(this, Blockly.TypeExpr.prototype.FUN_);
}
goog.inherits(Blockly.TypeExpr.FUN, Blockly.TypeExpr);

/**
 * @override
 * @param {boolean=} opt_deref
 * @return {string}
 */
Blockly.TypeExpr.FUN.prototype.toString = function(opt_deref) {
  return "FUN((" + this.arg_type.toString(opt_deref) + ") -> (" +
      this.return_type.toString(opt_deref) + "))";
}

/**
 * @extends {Blockly.TypeExpr}
 * @constructor
 * @param {string} name
 * @param {Blockly.TypeExpr} val
 * @param {string=} opt_color
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.TVAR = function(name, val, opt_color) {
  /** @type {string} */
  this.name = name;
  /** @type {Blockly.TypeExpr} */
  this.val = val;
  /** @type {string} */
  this.color = opt_color ? opt_color : Blockly.TypeExpr.generateColor();
  Blockly.TypeExpr.call(this, Blockly.TypeExpr.prototype.TVAR_);
}
goog.inherits(Blockly.TypeExpr.TVAR, Blockly.TypeExpr);

/**
 * @override
 * @param {boolean=} opt_deref
 * @return {string}
 */
Blockly.TypeExpr.TVAR.prototype.toString = function(opt_deref) {
  var inst = opt_deref ? this.deref() : this;
  if (inst.label == Blockly.TypeExpr.prototype.TVAR_) {
    var val_str = inst.val ? inst.val.toString(opt_deref) : "null";
    return "<" + inst.name + "=" + val_str + ">";
  } else {
    return "" + inst.toString(opt_deref);
  }
}

/**
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.prototype.deref = function() {
  var t = this;
  while (t.label == Blockly.TypeExpr.prototype.TVAR_ && t.val != null)
    t = t.val;
  return t;
}

Blockly.TypeExpr.prototype.gen_counter = 1;

/**
 * @static
 * @param {number} n
 * @return {string}
 */
Blockly.TypeExpr.ExcelColumn = function(n) {
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
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.generateTypeVar = function() {
  var name = Blockly.TypeExpr.ExcelColumn(
      Blockly.TypeExpr.prototype.gen_counter);
  Blockly.TypeExpr.prototype.gen_counter++;
  return new Blockly.TypeExpr.TVAR(name, null);
}

/**
 * @param {Blockly.TypeExpr} other
 */
Blockly.TypeExpr.prototype.unify = function(other) {
  var staq = [[this, other]];
  while (staq.length != 0) {
    var pair = staq.pop();
    var t1 = pair[0];
    var t2 = pair[1];
    if (t1.label == Blockly.TypeExpr.prototype.TVAR_ ||
        t2.label == Blockly.TypeExpr.prototype.TVAR_) {
      var tvar, othr;
      tvar = t1.label == Blockly.TypeExpr.prototype.TVAR_ ? t1 : t2;
      othr = t1.label == Blockly.TypeExpr.prototype.TVAR_ ? t2 : t1;
      if (othr.label == Blockly.TypeExpr.prototype.TVAR_ &&
          tvar.name == othr.name)
        continue;
      if (tvar.val != null) {
        staq.push([tvar.val, othr]);
      } else {
        goog.assert(!othr.occur(tvar.name), 'Unify error: variable occurrace');
        tvar.val = othr;
      }
    } else {
      goog.assert(t1.label == t2.label, 'Unify error: Cannot unify');
      if (t1.label == Blockly.TypeExpr.prototype.FUN_) {
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
Blockly.TypeExpr.prototype.occur = function(name) {
  var staq = [this];
  while (staq.length != 0) {
    var t = staq.pop();
    switch (t.label) {
    case Blockly.TypeExpr.prototype.INT_:
    case Blockly.TypeExpr.prototype.FLOAT_:
    case Blockly.TypeExpr.prototype.BOOL_:
      break;
    case Blockly.TypeExpr.prototype.LIST_:
      staq.push(t.element_type);
      break;
    case Blockly.TypeExpr.prototype.PAIR_:
      staq.push(t.first_type);
      staq.push(t.second_type);
      break;
    case Blockly.TypeExpr.prototype.FUN_:
      staq.push(t.arg_type);
      staq.push(t.return_type);
      break;
    case Blockly.TypeExpr.prototype.TVAR_:
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
