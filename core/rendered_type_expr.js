'use strict';

goog.provide('Blockly.RenderedTypeExpr');
// 
goog.require('Blockly.BlockSvg');
// 
// goog.require('goog.userAgent');

// Sorin
Blockly.RenderedTypeExpr.typeVarShapes_ = {
  // jagged
  // int : 
  // { down: 'l -8,0 0,20 8,0',
  //   up: 'l 0,-2 -6,0 -3,-2 3,-2 -3,-2 3,-2 -3,-2 3,-2 -3,-2 3,-2 6,0 0,-2'
  // },

  list : { 
    down: function (self, steps, updown) {
      Blockly.RenderedTypeExpr.renderTypeExpr(self.element_type, steps, updown);
      steps.push('l 0,3 -8,0 0,4, 8,0 0,3');
    },
    up: function (self, steps, updown) {
      steps.push('l 0,-3 -8,0 0,-4, 8,0 0,-3');
      Blockly.RenderedTypeExpr.renderTypeExpr(self.element_type, steps, updown);
    },
    height: function(self) {
      return Blockly.RenderedTypeExpr.getTypeExprHeight(self.element_type) + 10;
    },
    offsetsY: function(self) {
      return [0];
    }
  },

  pair : {
    down: function (self, steps, updown) {
      steps.push('l 0,3 -12,0 0,3 12,0');
      Blockly.RenderedTypeExpr.renderTypeExpr(self.first_type, steps, updown);
      steps.push('l -5,3 5,3');
      Blockly.RenderedTypeExpr.renderTypeExpr(self.second_type, steps, updown);
      steps.push('l -12,0 0,3 12,0 0,3');
    },
    up: function (self, steps, updown) {
      steps.push('l 0,-3 -12,0 0,-3 12,0');
      Blockly.RenderedTypeExpr.renderTypeExpr(self.second_type, steps, updown);
      steps.push('l -5,-3 5,-3');
      Blockly.RenderedTypeExpr.renderTypeExpr(self.first_type, steps, updown);
      steps.push('l -12,0 0,-3 12,0 0,-3');
    },
    height: function(self) {
      return Blockly.RenderedTypeExpr.getTypeExprHeight(self.first_type) + 
             Blockly.RenderedTypeExpr.getTypeExprHeight(self.second_type) + 
             18;
    },
    offsetsY: function(self) {
      return [6, Blockly.RenderedTypeExpr.getTypeExprHeight(self.first_type) + 12];
    }
  },

  sum : {
    down: function (self, steps, updown) {
      steps.push('l 0,3 -12,0 0,3 12,0');
      Blockly.RenderedTypeExpr.renderTypeExpr(self.left_type, steps, updown);
      steps.push('l 0,1 -5,0 0,4 5,0, 0,1');
      Blockly.RenderedTypeExpr.renderTypeExpr(self.right_type, steps, updown);
      steps.push('l -12,0 0,3 12,0 0,3');
    },
    up: function (self, steps, updown) {
      steps.push('l 0,-3 -12,0 0,-3 12,0');
      Blockly.RenderedTypeExpr.renderTypeExpr(self.right_type, steps, updown);
      steps.push('l 0,-1 -5,0 0,-4 5,0, 0,-1');
      Blockly.RenderedTypeExpr.renderTypeExpr(self.left_type, steps, updown);
      steps.push('l -12,0 0,-3 12,0 0,-3');
    },
    height: function(self) {
      return Blockly.RenderedTypeExpr.getTypeExprHeight(self.left_type) + 
             Blockly.RenderedTypeExpr.getTypeExprHeight(self.right_type) + 
             18;
    },
    offsetsY: function(self) {
      return [6, Blockly.RenderedTypeExpr.getTypeExprHeight(self.left_type) + 12];
    }
  },

  fun : {
    down: function (self, steps, updown) {
      steps.push('l 0,3 -12,0 0,3 12,0');
      Blockly.RenderedTypeExpr.renderTypeExpr(self.arg_type, steps, updown);
      steps.push('l 5,3 -5,3');
      Blockly.RenderedTypeExpr.renderTypeExpr(self.return_type, steps, updown);
      steps.push('l -12,0 0,3 12,0 0,3');
    },
    up: function (self, steps, updown) {
      steps.push('l 0,-3 -12,0 0,-3 12,0');
      Blockly.RenderedTypeExpr.renderTypeExpr(self.return_type, steps, updown);
      steps.push('l 5,-3 -5,-3');
      Blockly.RenderedTypeExpr.renderTypeExpr(self.arg_type, steps, updown);
      steps.push('l -12,0 0,-3 12,0 0,-3');
    },
    height: function(self) {
      return Blockly.RenderedTypeExpr.getTypeExprHeight(self.arg_type) + 
             Blockly.RenderedTypeExpr.getTypeExprHeight(self.return_type) + 
             18;
    },
    offsetsY: function(self) {
      return [6, Blockly.RenderedTypeExpr.getTypeExprHeight(self.arg_type) + 12];
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
 * Create a list of record to present highlights for the given type expression.
 * @param {Blockly.TypeExpr} typeExpr
 * @return {Array<{color: string, path: string}>}
 */
Blockly.RenderedTypeExpr.typeVarHighlights = function(typeExpr) {
  var typeVarHighlights = [];
  Blockly.RenderedTypeExpr.typeVarHighlights_(typeExpr, 0, typeVarHighlights);
  return typeVarHighlights;
}

/**
 * Helper function to create a highlight for type variable
 * @param {Blockly.TypeExpr} typeExpr
 * @param {number} y
 * @param {Array<{color: string, path: string}>} typeVarHightlights
 */
Blockly.RenderedTypeExpr.typeVarHighlights_ = function(typeExpr, y, typeVarHighlights) {
  if (typeExpr) {
    var type = typeExpr.deepDeref();
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
        Blockly.RenderedTypeExpr.typeVarHighlights_(children[i],
                                            y + offsetsY[i],
                                            typeVarHighlights);
      }
    }
  }
}

Blockly.RenderedTypeExpr.getTypeName = function(typeExpr) {
  if (typeExpr) {
    return typeExpr.deref().getTypeName();
  } else {
    return "original";
  }
}

Blockly.RenderedTypeExpr.getTypeExprHeight = function(typeExpr) {
  var typeName = Blockly.RenderedTypeExpr.getTypeName(typeExpr);
  var data = Blockly.RenderedTypeExpr.typeVarShapes_[typeName].height;
  if (typeof(data) === 'number') {
    return data;
  } else {
    return data(typeExpr.deepDeref());
  }
}

Blockly.RenderedTypeExpr.renderTypeExpr = function(typeExpr, steps, updown) {
  var typeName = Blockly.RenderedTypeExpr.getTypeName(typeExpr);
  var data = Blockly.RenderedTypeExpr.typeVarShapes_[typeName][updown];
  if (typeof(data) === 'string') {
    steps.push(data);
  } else {
    data(typeExpr.deepDeref(), steps, updown);
  }
}

Blockly.RenderedTypeExpr.renderUpTypeExpr = function(typeExpr, steps) {
  Blockly.RenderedTypeExpr.renderTypeExpr(typeExpr, steps, "up");
}

Blockly.RenderedTypeExpr.renderDownTypeExpr = function(typeExpr, steps) {
  Blockly.RenderedTypeExpr.renderTypeExpr(typeExpr, steps, "down");
}

Blockly.RenderedTypeExpr.getPath = function(connection, updown) {
  var steps = [];
  Blockly.RenderedTypeExpr.renderTypeExpr(connection.typeExpr, steps, updown);
  return steps.join(' ');
}

Blockly.RenderedTypeExpr.getUpPath = function(connection) {
  return Blockly.RenderedTypeExpr.getPath(connection, "up");
}

Blockly.RenderedTypeExpr.getDownPath = function(connection) {
  return Blockly.RenderedTypeExpr.getPath(connection, "down");
}

