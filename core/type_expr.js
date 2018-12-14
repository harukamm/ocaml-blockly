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
Blockly.TypeExpr.INT_ = 100;

/**
 * @type {number}
 * @private
 */
Blockly.TypeExpr.FLOAT_ = 105;

/**
 * @type {number}
 * @private
 */
Blockly.TypeExpr.BOOL_ = 110;

/**
 * @type {number}
 * @private
 */
Blockly.TypeExpr.LIST_ = 115;

/**
 * @type {number}
 * @private
 */
Blockly.TypeExpr.PAIR_ = 120;

/**
 * @type {number}
 * @private
 */
Blockly.TypeExpr.FUN_ = 130;

/**
 * @type {number}
 * @private
 */
Blockly.TypeExpr.TVAR_ = 135;

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
    case Blockly.TypeExpr.INT_:
      return 'int';
    case Blockly.TypeExpr.FLOAT_:
      return 'float';
    case Blockly.TypeExpr.BOOL_:
      return 'bool';
    case Blockly.TypeExpr.LIST_:
      return 'list';
    case Blockly.TypeExpr.PAIR_:
      return 'pair';
    case Blockly.TypeExpr.FUN_:
      return 'fun';
    case Blockly.TypeExpr.TVAR_:
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
 * Replace one of children type which this type directly has with another
 * type.
 * @param {!Blockly.Block} oldChild The child type to be replaced.
 * @param {!Blockly.Block} newChild The child type to be inserted instead of
 *     oldChild.
 */
Blockly.TypeExpr.prototype.replaceChild = function(oldChild, newChild) {
  goog.asserts.assert(false, 'Has no child.');
};

/**
 * Clear a type resolution.
 */
Blockly.TypeExpr.prototype.clear = function() {
  return;
};

/**
 * Deeply clone the object
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.prototype.clone = function() {
  goog.asserts.assert(false, 'Not implemented.');
}

/**
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.prototype.deref = function() {
  var t = this;
  while (t.label == Blockly.TypeExpr.TVAR_ && t.val != null)
    t = t.val;
  return t;
}

/**
 * Returns the object which is dereferenced recursively.
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.prototype.deepDeref = function() {
  return this;
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
  return t.label == Blockly.TypeExpr.TVAR_;
}

/**
 * @extends {Blockly.TypeExpr}
 * @constructor
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.INT = function() {
  Blockly.TypeExpr.call(this, Blockly.TypeExpr.INT_);
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
 * Deeply clone the object
 * @override
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.INT.prototype.clone = function() {
  return new Blockly.TypeExpr.INT();
}

/**
 * @extends {Blockly.TypeExpr}
 * @constructor
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.FLOAT = function() {
  Blockly.TypeExpr.call(this, Blockly.TypeExpr.FLOAT_);
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
 * Deeply clone the object
 * @override
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.FLOAT.prototype.clone = function() {
  return new Blockly.TypeExpr.FLOAT();
}

/**
 * @extends {Blockly.TypeExpr}
 * @constructor
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.BOOL = function() {
  Blockly.TypeExpr.call(this, Blockly.TypeExpr.BOOL_);
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
 * Deeply clone the object
 * @override
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.BOOL.prototype.clone = function() {
  return new Blockly.TypeExpr.BOOL();
}

/**
 * @extends {Blockly.TypeExpr}
 * @constructor
 * @param {Blockly.TypeExpr} element_type
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.LIST = function(element_type) {
  /** @type {Blockly.TypeExpr} */
  this.element_type = element_type;
  Blockly.TypeExpr.call(this, Blockly.TypeExpr.LIST_);
}
goog.inherits(Blockly.TypeExpr.LIST, Blockly.TypeExpr);

/**
 * @override
 * @param {boolean=} opt_deref
 * @return {string}
 */
Blockly.TypeExpr.LIST.prototype.toString = function(opt_deref) {
  return "LIST[" + this.element_type.toString(opt_deref) + "]";
}

/**
 * @override
 * @return {Array<Type>}
 */
Blockly.TypeExpr.LIST.prototype.getChildren = function() {
  return [this.element_type];
}

/**
 * Replace one of children type which this type directly has with another
 * type.
 * @param {!Blockly.Block} oldChild The child type to be replaced.
 * @param {!Blockly.Block} newChild The child type to be inserted instead of
 *     oldChild.
 */
Blockly.TypeExpr.LIST.prototype.replaceChild = function(oldChild, newChild) {
  goog.asserts.assert(this.element_type == oldChild,
      'The specidied child is not found.');
  this.element_type = newChild;
};

/**
 * Deeply clone the object
 * @override
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.LIST.prototype.clone = function() {
  return new Blockly.TypeExpr.LIST(this.element_type.clone());
}

/**
 * Returns the object which is dereferenced recursively.
 * @override
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.LIST.prototype.deepDeref = function() {
  return new Blockly.TypeExpr.LIST(this.element_type.deepDeref());
}

/**
 * @extends {Blockly.TypeExpr}
 * @constructor
 * @param {Blockly.TypeExpr} first_type
 * @param {Blockly.TypeExpr} second_type
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.PAIR = function(first_type, second_type) {
  /** @type {Blockly.TypeExpr} */
  this.first_type = first_type;
  /** @type {Blockly.TypeExpr} */
  this.second_type = second_type;
  Blockly.TypeExpr.call(this, Blockly.TypeExpr.PAIR_);
}
goog.inherits(Blockly.TypeExpr.PAIR, Blockly.TypeExpr);

/**
 * @override
 * @param {boolean=} opt_deref
 * @return {string}
 */
Blockly.TypeExpr.PAIR.prototype.toString = function(opt_deref) {
  return "PAIR[" + this.first_type.toString(opt_deref) + " * " +
      this.second_type.toString(opt_deref) + "]";
}

/**
 * @override
 * @return {Array<Type>}
 */
Blockly.TypeExpr.PAIR.prototype.getChildren = function() {
  return [this.first_type, this.second_type];
}

/**
 * Replace one of children type which this type directly has with another
 * type.
 * @param {!Blockly.Block} oldChild The child type to be replaced.
 * @param {!Blockly.Block} newChild The child type to be inserted instead of
 *     oldChild.
 */
Blockly.TypeExpr.PAIR.prototype.replaceChild = function(oldChild, newChild) {
  if (oldChild == this.first_type) {
    this.first_type = newChild;
  } else if (oldChild == this.second_type) {
    this.second_type = newChild;
  } else {
    goog.asserts.assert(false, 'The specidied child is not found.');
  }
};

/**
 * Deeply clone the object
 * @override
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.PAIR.prototype.clone = function() {
  return new Blockly.TypeExpr.PAIR(this.first_type.clone(),
      this.second_type.clone());
}

/**
 * Returns the object which is dereferenced recursively.
 * @override
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.PAIR.prototype.deepDeref = function() {
  return new Blockly.TypeExpr.PAIR(this.first_type.deepDeref(),
      this.second_type.deepDeref());
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
  Blockly.TypeExpr.call(this, Blockly.TypeExpr.FUN_);
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
 * Deeply clone the object
 * @override
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.FUN.prototype.clone = function() {
  return new Blockly.TypeExpr.FUN(this.arg_type.clone(),
      this.return_type.clone());
}

/**
 * @override
 * @return {Array<Type>}
 */
Blockly.TypeExpr.FUN.prototype.getChildren = function() {
  return [this.arg_type, this.return_type];
}

/**
 * Replace one of children type which this type directly has with another
 * type.
 * @param {!Blockly.Block} oldChild The child type to be replaced.
 * @param {!Blockly.Block} newChild The child type to be inserted instead of
 *     oldChild.
 */
Blockly.TypeExpr.FUN.prototype.replaceChild = function(oldChild, newChild) {
  if (oldChild == this.arg_type) {
    this.arg_type = newChild;
  } else if (oldChild == this.return_type) {
    this.return_type = newChild;
  } else {
    goog.asserts.assert(false, 'The specidied child is not found.');
  }
};

/**
 * Returns the object which is dereferenced recursively.
 * @override
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.FUN.prototype.deepDeref = function() {
  return new Blockly.TypeExpr.FUN(this.arg_type.deepDeref(),
      this.return_type.deepDeref());
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
  Blockly.TypeExpr.call(this, Blockly.TypeExpr.TVAR_);
}
goog.inherits(Blockly.TypeExpr.TVAR, Blockly.TypeExpr);

/**
 * @override
 * @param {boolean=} opt_deref
 * @return {string}
 */
Blockly.TypeExpr.TVAR.prototype.toString = function(opt_deref) {
  var inst = opt_deref ? this.deref() : this;
  if (inst.label == Blockly.TypeExpr.TVAR_) {
    var val_str = inst.val ? inst.val.toString(opt_deref) : "null";
    return "<" + inst.name + "=" + val_str + ">";
  } else {
    return "" + inst.toString(opt_deref);
  }
}

/**
 * @override
 * @return {Array<Type>}
 */
Blockly.TypeExpr.TVAR.prototype.getChildren = function() {
  return this.val ? [this.val] : [];
}

/**
 * Deeply clone the object
 * @override
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.TVAR.prototype.clone = function() {
  return new Blockly.TypeExpr.TVAR(this.name,
      this.val ? this.val.clone() : null);
}

/**
 * Returns the object which is dereferenced recursively.
 * @override
 * @return {Blockly.TypeExpr}
 */
Blockly.TypeExpr.TVAR.prototype.deepDeref = function() {
  var t = this;
  while (t.val != null && Blockly.TypeExpr.TVAR_ == t.val.label)
    t = t.val;
  return t.val != null ? t.val.deepDeref() : t;
}

/**
 * Clear a type resolution.
 * @override
 */
Blockly.TypeExpr.TVAR.prototype.clear = function() {
  this.val = null;
  return;
};

Blockly.TypeExpr.gen_counter = 1;

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
 * @private
 * @return {string}
 */
Blockly.TypeExpr.generateTypeVarName_ = function() {
  var name = Blockly.TypeExpr.ExcelColumn(
      Blockly.TypeExpr.gen_counter);
  Blockly.TypeExpr.gen_counter++;
  return name;
}

Blockly.TypeExpr.generateTypeVar = function() {
  var name = Blockly.TypeExpr.generateTypeVarName_();
  return new Blockly.TypeExpr.TVAR(name, null);
};

/**
 * Collects a list of type variables existing inside this type expression.
 * @param {!Array.<!Blockly.TypeExpr>} The list of type variables.
 */
Blockly.TypeExpr.prototype.getTvarList = function() {
  var type = this.deepDeref();
  var tvars = [];
  var staq = [type];
  while (staq.length) {
    var t = staq.pop();

    if (t.label == Blockly.TypeExpr.TVAR_) {
      tvars.push(t);
      continue;
    }

    var children = t.getChildren();
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      staq.push(child);
    }
  }
  return tvars;
};

/**
 * Clone type expression and replace some of type variables with flesh ones.
 * @param {!Array.<!string>} targetNames List of type variable names to be
 *     replaced.
 * @return {!Blockly.TypeExpr} The cloned type expression with some flesh type
 *     variables.
 */
Blockly.TypeExpr.prototype.instantiate = function(targetNames) {
  var type = this.deepDeref();
  var cloned = type.clone();
  var map = {};
  var staq = [[type, cloned, null]];
  while (staq.length) {
    var pair = staq.pop();
    var t = pair[0];
    var u = pair[1];
    var parentTyp = pair[2];

    if (t.label != Blockly.TypeExpr.TVAR_) {
      var children1 = t.getChildren();
      var children2 = u.getChildren();
      for (var i = 0; i < children1.length; i++) {
        var child1 = children1[i];
        var child2 = children2[i];
        staq.push([child1, child2, u]);
      }
    } else {
      goog.asserts.assert(!t.val && !u.val,
          'Expects types are already dereferenced.');
      goog.asserts.assert(t.name === u.name);

      var index = targetNames.indexOf(t.name);
      if (index == -1) {
        // free type variable.
        var typeToInsert = t;
      } else {
        // Bound type variable.
        if (t.name in map) {
          var typeToInsert = map[t.name];
        } else {
          var typeToInsert = Blockly.TypeExpr.generateTypeVar();
          map[t.name] = typeToInsert;
        }
      }
      if (parentTyp) {
        parentTyp.replaceChild(u, typeToInsert);
      } else {
        return typeToInsert;
      }
    }
  }
  return cloned;
};

/**
 * @param {Blockly.TypeExpr} other
 */
Blockly.TypeExpr.prototype.unify = function(other) {
  var staq = [[this, other]];
  while (staq.length != 0) {
    var pair = staq.pop();
    var t1 = pair[0];
    var t2 = pair[1];
    if (t1.label == Blockly.TypeExpr.TVAR_ ||
        t2.label == Blockly.TypeExpr.TVAR_) {
      var t1_is_tvar = t1.label == Blockly.TypeExpr.TVAR_;
      if (t1_is_tvar && t2.label == Blockly.TypeExpr.TVAR_)
        t1_is_tvar = t1.val != null;

      var tvar = t1_is_tvar ? t1 : t2;
      var othr = t1_is_tvar ? t2 : t1;
      if (othr.label == Blockly.TypeExpr.TVAR_ &&
          tvar.name == othr.name)
        continue;
      if (tvar.val != null) {
        staq.push([tvar.val, othr]);
      } else {
        goog.asserts.assert(!othr.occur(tvar.name),
            'Unify error: variable occurrace');
        tvar.val = othr;
      }
    } else {
      goog.asserts.assert(t1.label == t2.label, 'Unify error: Cannot unify');
      var children1 = t1.getChildren();
      var children2 = t2.getChildren();
      goog.asserts.assert(children1.length == children2.length,
          'Unify error: Not matched children length');
      for (var i = 0; i < children1.length; i++) {
        var child1 = children1[i];
        var child2 = children2[i];
        staq.push([child1, child2]);
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
    if (t.label == Blockly.TypeExpr.TVAR_ && t.name == name)
      return true;
    var children = t.getChildren();
    for (var i = 0; i < children.length; i++)
      staq.push(children[i]);
  }
  return false;
}

/**
 * Return whether it's possible to unify the object with the give one.
 * @param {Blockly.TypeExpr} other
 * @return {boolean}
 */
Blockly.TypeExpr.prototype.ableToUnify = function(other) {
  var t1 = this.clone();
  var t2 = other.clone();
  try {
    t1.unify(t2);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Disconnect this type expression from another one if they are type variables
 * and either one contains the other.
 * @param {!Blockly.TypeExpr} other
 */
Blockly.TypeExpr.prototype.disconnect = function(other) {
  function disconnectImpl(upstream, child) {
    if (child.label != Blockly.TypeExpr.TVAR_) {
      return;
    }
    var t = upstream;
    while (t) {
      if (t.label != Blockly.TypeExpr.TVAR_ || !t.val) {
        break;
      }
      t.val = t.val == child ? null : t.val;
      t = t.val;
    }
  }
  disconnectImpl(this, other);
  disconnectImpl(other, this);
};

Blockly.TypeExpr.prototype.flatten = function() {
  var t = this.deepDeref();
  if (t.label == Blockly.TypeExpr.INT_ ||
      t.label == Blockly.TypeExpr.FLOAT_ ||
      t.label == Blockly.TypeExpr.BOOL_ ||
      t.label == Blockly.TypeExpr.TVAR_) {
    return [t];
  }
  var children = t.getChildren();
  var desc = [];
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    desc = desc.concat(child.flatten());
  }
  return desc;
};

/**
 * Do the given two type expression represent to the same type without
 * dereferencing type variable reference?
 * @param {!Blockly.TypeExpr} typ1 First type expression
 * @param {!Blockly.TypeExpr} typ2 Second type expression
 * @return {boolean} True if type expressions are the same.
 */
Blockly.TypeExpr.equals = function(typ1, typ2) {
  if (typ1.label != typ2.label) {
    return false;
  }
  var label = typ1.label;
  // Check if the types are primitive ones.
  if (label == Blockly.TypeExpr.INT_ ||
      label == Blockly.TypeExpr.FLOAT_ ||
      label == Blockly.TypeExpr.BOOL_) {
    return true;
  }
  if (label == Blockly.TypeExpr.TVAR_) {
    return typ1.name == typ2.name;
  }
  var children1 = typ1.getChildren();
  var children2 = typ2.getChildren();
  for (var i = 0; i < children1.length; i++) {
    var t1 = children1[i];
    var t2 = children2[i];
    if (!Blockly.TypeExpr.equals(t1, t2)) {
      return false;
    }
  }
  return true;
};

/**
 * Creates type instances representing function.
 * @param {!Array.<!Blockly.TypeExpr>} types List of types in order to
 *     be nested inside the function type.
 * @return {!Blockly.TypeExpr.FUN} The created function type.
 */
Blockly.TypeExpr.createFunType = function(types) {
  goog.asserts.assert(2 <= types.length);
  var returnType = types[types.length - 1];
  var second = types[types.length - 2];
  var result = new Blockly.TypeExpr.FUN(second, returnType);
  for (var i = types.length - 3; 0 <= i; i--) {
    var type = types[i];
    result = new Blockly.TypeExpr.FUN(type, result);
  }
  return result;
};
