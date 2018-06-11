'use strict';

goog.provide('Blockly.RenderedTypeExpr');

/**
 * Class for a type expression of blocks that may be rendered on screen.
 * @extends {Blockly.TypeExpr}
 * @constructor
 */
Blockly.RenderedTypeExpr = function(prototypeName, args) {
  goog.asserts.assertString(prototypeName, 'type-expr type must be given');
  var ctor = Blockly.TypeExpr[prototypeName];
  goog.asserts.assertObject(ctor,
      'Error: Unknown type-expr type "%s".', prototypeName);
  goog.mixin(this, ctor.prototype);
  ctor.apply(this, args);
};

Blockly.RenderedTypeExpr.INT = function() {
  Blockly.RenderedTypeExpr.INT.superClass_.constructor.call(this, 'INT');
};
goog.inherits(Blockly.RenderedTypeExpr.INT, Blockly.RenderedTypeExpr);

Blockly.RenderedTypeExpr.FLOAT = function() {
  Blockly.RenderedTypeExpr.FLOAT.superClass_.constructor.call(this, 'FLOAT');
};
goog.inherits(Blockly.RenderedTypeExpr.FLOAT, Blockly.RenderedTypeExpr);

Blockly.RenderedTypeExpr.BOOL = function() {
  Blockly.RenderedTypeExpr.BOOL.superClass_.constructor.call(this, 'BOOL');
};
goog.inherits(Blockly.RenderedTypeExpr.BOOL, Blockly.RenderedTypeExpr);

Blockly.RenderedTypeExpr.LIST = function() {
  Blockly.RenderedTypeExpr.LIST.superClass_.constructor.call(this, 'LIST',
      arguments);
};
goog.inherits(Blockly.RenderedTypeExpr.LIST, Blockly.RenderedTypeExpr);

Blockly.RenderedTypeExpr.PAIR = function() {
  Blockly.RenderedTypeExpr.PAIR.superClass_.constructor.call(this, 'PAIR',
      arguments);
};
goog.inherits(Blockly.RenderedTypeExpr.PAIR, Blockly.RenderedTypeExpr);

Blockly.RenderedTypeExpr.SUM = function() {
  Blockly.RenderedTypeExpr.SUM.superClass_.constructor.call(this, 'SUM',
      arguments);
};
goog.inherits(Blockly.RenderedTypeExpr.SUM, Blockly.RenderedTypeExpr);

Blockly.RenderedTypeExpr.FUN = function() {
  Blockly.RenderedTypeExpr.FUN.superClass_.constructor.call(this, 'FUN',
      arguments);
};
goog.inherits(Blockly.RenderedTypeExpr.FUN, Blockly.RenderedTypeExpr);

Blockly.RenderedTypeExpr.TVAR = function() {
  Blockly.RenderedTypeExpr.TVAR.superClass_.constructor.call(this, 'TVAR',
      arguments);
};
goog.inherits(Blockly.RenderedTypeExpr.TVAR, Blockly.RenderedTypeExpr);

Blockly.RenderedTypeExpr.prototype.shape = {
  down: function(steps, updown) {
    steps.push('v 5 c 0,10 -' + Blockly.BlockSvg.TAB_WIDTH +
      ',-8 -' + Blockly.BlockSvg.TAB_WIDTH + ',7.5 s ' +
      Blockly.BlockSvg.TAB_WIDTH + ',-2.5 ' +
      Blockly.BlockSvg.TAB_WIDTH + ',7.5');
  },

  up: function(stesp, updown) {
    steps.push('c 0,-10 -' + Blockly.BlockSvg.TAB_WIDTH + ',8 -' +
      Blockly.BlockSvg.TAB_WIDTH + ',-7.5 s ' + Blockly.BlockSvg.TAB_WIDTH +
      ',2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',-7.5');
  },

  height: function() {
    return Blockly.BlockSvg.TAB_HEIGHT;
  },

  offsetY: function() {
    return [];
  }
};

Blockly.RenderedTypeExpr.LIST.prototype.shape = {
  down: function(steps, updown) {
    this.element_type.renderTypeExpr(steps, updown);
    steps.push('l 0,3 -8,0 0,4, 8,0 0,3');
  },

  up: function(steps, updown) {
    steps.push('l 0,-3 -8,0 0,-4, 8,0 0,-3');
    this.element_type.renderTypeExpr(steps, updown);
  },

  height: function() {
    return this.element_type.getTypeExprHeight() + 10;
  },

  offsetsY: function() {
    return [0];
  }
};

Blockly.RenderedTypeExpr.PAIR.prototype.shape = {
  down: function(steps, updown) {
    steps.push('l 0,3 -12,0 0,3 12,0');
    this.first_type.renderTypeExpr(steps, updown);
    steps.push('l -5,3 5,3');
    this.second_type.renderTypeExpr(steps, updown);
    steps.push('l -12,0 0,3 12,0 0,3');
  },

  up: function(steps, updown) {
    steps.push('l 0,-3 -12,0 0,-3 12,0');
    this.second_type.renderTypeExpr(steps, updown);
    steps.push('l -5,-3 5,-3');
    this.first_type.renderTypeExpr(steps, updown);
    steps.push('l -12,0 0,-3 12,0 0,-3');
  },

  height: function() {
    return this.first_type.getTypeExprHeight() +
        this.second_type.getTypeExprHeight() + 18;
  },

  offsetsY: function() {
    return [6, this.first_type.getTypeExprHeight() + 12];
  }
};

Blockly.RenderedTypeExpr.SUM.prototype.shape = {
  down: function(steps, updown) {
    steps.push('l 0,3 -12,0 0,3 12,0');
    this.left_type.renderTypeExpr(steps, updown);
    steps.push('l 0,1 -5,0 0,4 5,0, 0,1');
    this.right_type.renderTypeExpr(steps, updown);
    steps.push('l -12,0 0,3 12,0 0,3');
  },

  up: function(steps, updown) {
    steps.push('l 0,-3 -12,0 0,-3 12,0');
    this.right_type.renderTypeExpr(steps, updown);
    steps.push('l 0,-1 -5,0 0,-4 5,0, 0,-1');
    this.left_type.renderTypeExpr(steps, updown);
    steps.push('l -12,0 0,-3 12,0 0,-3');
  },

  height: function() {
    return this.left_type.getTypeExprHeight() +
        this.right_type.getTypeExprHeight() + 18;
  },

  offsetsY: function() {
    return [6, this.left_type.getTypeExprHeight() + 12];
  }
};

Blockly.RenderedTypeExpr.FUN.prototype.shape = {
  down: function(steps, updown) {
    steps.push('l 0,3 -12,0 0,3 12,0');
    this.arg_type.renderTypeExpr(steps, updown);
    steps.push('l 5,3 -5,3');
    this.return_type.renderTypeExpr(steps, updown);
    steps.push('l -12,0 0,3 12,0 0,3');
  },

  up: function(steps, updown) {
    steps.push('l 0,-3 -12,0 0,-3 12,0');
    this.return_type.renderTypeExpr(steps, updown);
    steps.push('l 5,-3 -5,-3');
    this.arg_type.renderTypeExpr(steps, updown);
    steps.push('l -12,0 0,-3 12,0 0,-3');
  },

  height: function() {
    return this.arg_type.getTypeExprHeight() +
        this.return_type.getTypeExprHeight() + 18;
  },

  offsetsY: function() {
    return [6, this.arg_type.getTypeExprHeight() + 12];
  }
};

Blockly.RenderedTypeExpr.INT.prototype.shape = {
  down: function(steps, updown) {
    steps.push('l 0,5 a 6,6,0,0,0,0,12 l 0,3');
  },

  up: function(steps, updown) {
    steps.push('l 0,-3 a 6,6,0,0,1,0,-12 l 0,-5');
  },

  height: function() {
    return 20;
  },

  offsetsY: function() {
    return [];
  },
};

Blockly.RenderedTypeExpr.FLOAT.prototype.shape = {
  down: function(steps, updown) {
    steps.push('l 0,5 -6,0 3,6 -3,6 6,0 0,3');
  },

  up: function(steps, updown) {
    steps.push('l 0,-3 -6,0 3,-6 -3,-6 6,0 0,-5');
  },

  height: function() {
    return 20;
  },

  offsetsY: function() {
    return [];
  },
};

Blockly.RenderedTypeExpr.BOOL.prototype.shape = {
  down: function(steps, updown) {
    steps.push('l 0,5 -8,7.5 8,7.5');
  },

  up: function(steps, updown) {
    steps.push('l -8,-7.5 8,-7.5 0,-5');
  },

  height: function() {
    return 20;
  },

  offsetsY: function() {
    return [];
  },
};

Blockly.RenderedTypeExpr.TVAR.prototype.shape = {
  down: function(steps, updown) {
    steps.push('l 0,5 -8,0 0,15 8,0 0,5');
  },

  up: function(steps, updown) {
    steps.push('l 0,-5 -8,0 0,-15 8,0 0,-5');
  },

  height: function() {
    return 25;
  },

  offsetsY: function() {
    return [];
  },

  highlight: function() {
    return 'm 0,5 l -8,0 0,15 8,0';
  }
};

/**
 * @static
 * @return {Blockly.RenderedTypeExpr}
 */
Blockly.RenderedTypeExpr.generateTypeVar = function() {
  var name = Blockly.TypeExpr.generateTypeVarName_();
  return new Blockly.RenderedTypeExpr.TVAR(name, null);
}

/**
 * Create a list of record to present highlights for the type expression.
 * @return {Array<{color: string, path: string}>}
 */
Blockly.RenderedTypeExpr.prototype.typeVarHighlights = function() {
  var typeVarHighlights = [];
  this.typeVarHighlights_(0, typeVarHighlights);
  return typeVarHighlights;
}

/**
 * Helper function to create a highlight for type variable
 * @param {number} y
 * @param {Array<{color: string, path: string}>} typeVarHightlights
 */
Blockly.RenderedTypeExpr.prototype.typeVarHighlights_ = function(y, typeVarHighlights) {
  var type = this.deref();
  var children = type.getChildren();
  if (type.isTypeVar()) {
    typeVarHighlights.push({
      color: type.color,
      path: "m 0," + y + " " + type.shape.highlight.call(type)
    });
  } else if (children.length != 0) {
    var name = type.getTypeName();
    var offsetsY = type.shape.offsetsY.call(type);
    for (var i = 0; i < children.length; i++) {
      children[i].typeVarHighlights_(y + offsetsY[i], typeVarHighlights);
    }
  }
}

Blockly.RenderedTypeExpr.prototype.getTypeExprHeight = function() {
  var type = this.deref();
  var typeName = type.getTypeName();
  return type.shape.height.call(type);
}

/**
 * @param {!Array.<string>} steps Path of block outline.
 * @param {string} updown 'up' or 'down' that indicates which to render.
 */
Blockly.RenderedTypeExpr.prototype.renderTypeExpr = function(steps, updown) {
  var type = this.deref();
  var typeName = type.getTypeName();
  goog.asserts.assert(updown == 'up' || updown == 'down');
  type.shape[updown].call(type, steps, updown);
}

Blockly.RenderedTypeExpr.prototype.renderUpTypeExpr = function(steps) {
  this.renderTypeExpr(steps, "up");
}

Blockly.RenderedTypeExpr.prototype.renderDownTypeExpr = function(steps) {
  this.renderTypeExpr(steps, "down");
}

Blockly.RenderedTypeExpr.prototype.getPath = function(updown) {
  var steps = [];
  this.renderTypeExpr(steps, updown);
  return steps.join(' ');
}

Blockly.RenderedTypeExpr.prototype.getUpPath = function() {
  return this.getPath("up");
}

Blockly.RenderedTypeExpr.prototype.getDownPath = function() {
  return this.getPath("down");
}

