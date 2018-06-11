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

Blockly.RenderedTypeExpr.typeVarShapes_ = {
  list : { 
    down: function (self, steps, updown) {
      self.element_type.renderTypeExpr(steps, updown);
      steps.push('l 0,3 -8,0 0,4, 8,0 0,3');
    },
    up: function (self, steps, updown) {
      steps.push('l 0,-3 -8,0 0,-4, 8,0 0,-3');
      self.element_type.renderTypeExpr(steps, updown);
    },
    height: function(self) {
      return self.element_type.getTypeExprHeight() + 10;
    },
    offsetsY: function(self) {
      return [0];
    }
  },

  pair : {
    down: function (self, steps, updown) {
      steps.push('l 0,3 -12,0 0,3 12,0');
      self.first_type.renderTypeExpr(steps, updown);
      steps.push('l -5,3 5,3');
      self.second_type.renderTypeExpr(steps, updown);
      steps.push('l -12,0 0,3 12,0 0,3');
    },
    up: function (self, steps, updown) {
      steps.push('l 0,-3 -12,0 0,-3 12,0');
      self.second_type.renderTypeExpr(steps, updown);
      steps.push('l -5,-3 5,-3');
      self.first_type.renderTypeExpr(steps, updown);
      steps.push('l -12,0 0,-3 12,0 0,-3');
    },
    height: function(self) {
      return self.first_type.getTypeExprHeight() +
             self.second_type.getTypeExprHeight() +
             18;
    },
    offsetsY: function(self) {
      return [6, self.first_type.getTypeExprHeight() + 12];
    }
  },

  sum : {
    down: function (self, steps, updown) {
      steps.push('l 0,3 -12,0 0,3 12,0');
      self.left_type.renderTypeExpr(steps, updown);
      steps.push('l 0,1 -5,0 0,4 5,0, 0,1');
      self.right_type.renderTypeExpr(steps, updown);
      steps.push('l -12,0 0,3 12,0 0,3');
    },
    up: function (self, steps, updown) {
      steps.push('l 0,-3 -12,0 0,-3 12,0');
      self.right_type.renderTypeExpr(steps, updown);
      steps.push('l 0,-1 -5,0 0,-4 5,0, 0,-1');
      self.left_type.renderTypeExpr(steps, updown);
      steps.push('l -12,0 0,-3 12,0 0,-3');
    },
    height: function(self) {
      return self.left_type.getTypeExprHeight() +
             self.right_type.getTypeExprHeight() +
             18;
    },
    offsetsY: function(self) {
      return [6, self.left_type.getTypeExprHeight() + 12];
    }
  },

  fun : {
    down: function (self, steps, updown) {
      steps.push('l 0,3 -12,0 0,3 12,0');
      self.arg_type.renderTypeExpr(steps, updown);
      steps.push('l 5,3 -5,3');
      self.return_type.renderTypeExpr(steps, updown);
      steps.push('l -12,0 0,3 12,0 0,3');
    },
    up: function (self, steps, updown) {
      steps.push('l 0,-3 -12,0 0,-3 12,0');
      self.return_type.renderTypeExpr(steps, updown);
      steps.push('l 5,-3 -5,-3');
      self.arg_type.renderTypeExpr(steps, updown);
      steps.push('l -12,0 0,-3 12,0 0,-3');
    },
    height: function(self) {
      return self.arg_type.getTypeExprHeight() +
             self.return_type.getTypeExprHeight() +
             18;
    },
    offsetsY: function(self) {
      return [6, self.arg_type.getTypeExprHeight() + 12];
    }
  },

  int : { 
    down: 'l 0,5 a 6,6,0,0,0,0,12 l 0,3',
    up: 'l 0,-3 a 6,6,0,0,1,0,-12 l 0,-5',
    height: 20
  },

  float : {
    down: 'l 0,5 -6,0 3,6 -3,6 6,0 0,3',
    up: 'l 0,-3 -6,0 3,-6 -3,-6 6,0 0,-5',
    height: 20
  },

  bool : {
    down: 'l 0,5 -8,7.5 8,7.5',
    up: 'l -8,-7.5 8,-7.5 0,-5',
    height: 20
  },

  typeVar : { 
    down: 'l 0,5 -8,0 0,15 8,0 0,5',
    up: 'l 0,-5 -8,0 0,-15 8,0 0,-5',
    highlight: 'm 0,5 l -8,0 0,15 8,0',
    height: 25
  },

  original : {
    down: 
    'v 5 c 0,10 -' + Blockly.BlockSvg.TAB_WIDTH +
    ',-8 -' + Blockly.BlockSvg.TAB_WIDTH + ',7.5 s ' +
    Blockly.BlockSvg.TAB_WIDTH + ',-2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',7.5',

    up: 
    'c 0,-10 -' + Blockly.BlockSvg.TAB_WIDTH + ',8 -' +
    Blockly.BlockSvg.TAB_WIDTH + ',-7.5 s ' + Blockly.BlockSvg.TAB_WIDTH +
    ',2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',-7.5',

    height: Blockly.BlockSvg.TAB_HEIGHT
  }
}

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
      path: "m 0," + y + " " + Blockly.RenderedTypeExpr.typeVarShapes_["typeVar"]["highlight"]
    });
  } else if (children.length != 0) {
    var name = type.getTypeName();
    var offsetsY = Blockly.RenderedTypeExpr.typeVarShapes_[name].offsetsY(type);
    for (var i = 0; i < children.length; i++) {
      children[i].typeVarHighlights_(y + offsetsY[i], typeVarHighlights);
    }
  }
}

Blockly.RenderedTypeExpr.prototype.getTypeExprHeight = function() {
  var type = this.deref();
  var typeName = type.getTypeName();
  var data = Blockly.RenderedTypeExpr.typeVarShapes_[typeName].height;
  if (typeof(data) === 'number') {
    return data;
  } else {
    return data(type);
  }
}

Blockly.RenderedTypeExpr.prototype.renderTypeExpr = function(steps, updown) {
  var type = this.deref();
  var typeName = type.getTypeName();
  var data = Blockly.RenderedTypeExpr.typeVarShapes_[typeName][updown];
  if (typeof(data) === 'string') {
    steps.push(data);
  } else {
    data(type, steps, updown);
  }
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

