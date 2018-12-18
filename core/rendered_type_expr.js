'use strict';

goog.provide('Blockly.RenderedTypeExpr');

goog.require('Blockly.TypeExpr');

/**
 * Utility methods to render a type expression on screen.
 * @constructor
 */

Blockly.RenderedTypeExpr.shape = {};

Blockly.RenderedTypeExpr.shape['original'] = {
  down: function(steps) {
    steps.push('v 5 c 0,10 -' + Blockly.BlockSvg.TAB_WIDTH +
      ',-8 -' + Blockly.BlockSvg.TAB_WIDTH + ',7.5 s ' +
      Blockly.BlockSvg.TAB_WIDTH + ',-2.5 ' +
      Blockly.BlockSvg.TAB_WIDTH + ',7.5');
  },

  up: function(steps) {
    steps.push('c 0,-10 -' + Blockly.BlockSvg.TAB_WIDTH + ',8 -' +
      Blockly.BlockSvg.TAB_WIDTH + ',-7.5 s ' + Blockly.BlockSvg.TAB_WIDTH +
      ',2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',-7.5');
  },

  height: function() {
    return Blockly.BlockSvg.TAB_HEIGHT;
  },

  offsetsY: function() {
    return [];
  }
};

Blockly.RenderedTypeExpr.shape['int'] = {
  down: function(steps) {
    steps.push('l 0,5 a 6,6,0,0,0,0,12 l 0,3');
  },

  up: function(steps) {
    steps.push('l 0,-3 a 6,6,0,0,1,0,-12 l 0,-5');
  },

  height: function() {
    return 20;
  },

  offsetsY: function() {
    return [];
  },
};

Blockly.RenderedTypeExpr.shape['float'] = {
  down: function(steps) {
    steps.push('l 0,5 -6,0 3,6 -3,6 6,0 0,3');
  },

  up: function(steps) {
    steps.push('l 0,-3 -6,0 3,-6 -3,-6 6,0 0,-5');
  },

  height: function() {
    return 20;
  },

  offsetsY: function() {
    return [];
  },
};

Blockly.RenderedTypeExpr.shape['bool'] = {
  down: function(steps) {
    steps.push('l 0,5 -8,7.5 8,7.5');
  },

  up: function(steps) {
    steps.push('l -8,-7.5 8,-7.5 0,-5');
  },

  height: function() {
    return 20;
  },

  offsetsY: function() {
    return [];
  },
};

Blockly.RenderedTypeExpr.shape['list'] = {
  down: function(steps) {
    Blockly.RenderedTypeExpr.renderTypeExpr(this.element_type, steps, 1);
    steps.push('l 0,3 -8,0 0,4, 8,0 0,3');
  },

  up: function(steps) {
    steps.push('l 0,-3 -8,0 0,-4, 8,0 0,-3');
    Blockly.RenderedTypeExpr.renderTypeExpr(this.element_type, steps, 2);
  },

  height: function() {
    return Blockly.RenderedTypeExpr.getTypeExprHeight(this.element_type) + 10;
  },

  offsetsY: function() {
    return [0];
  }
};

Blockly.RenderedTypeExpr.shape['pair'] = {
  down: function(steps) {
    steps.push('l 0,3 -12,0 0,3 12,0');
    Blockly.RenderedTypeExpr.renderTypeExpr(this.first_type, steps, 1);
    steps.push('l -5,3 5,3');
    Blockly.RenderedTypeExpr.renderTypeExpr(this.second_type, steps, 1);
    steps.push('l -12,0 0,3 12,0 0,3');
  },

  up: function(steps) {
    steps.push('l 0,-3 -12,0 0,-3 12,0');
    Blockly.RenderedTypeExpr.renderTypeExpr(this.second_type, steps, 2);
    steps.push('l -5,-3 5,-3');
    Blockly.RenderedTypeExpr.renderTypeExpr(this.first_type, steps, 2);
    steps.push('l -12,0 0,-3 12,0 0,-3');
  },

  height: function() {
    return Blockly.RenderedTypeExpr.getTypeExprHeight(this.first_type) +
        Blockly.RenderedTypeExpr.getTypeExprHeight(this.second_type) + 18;
  },

  offsetsY: function() {
    var height = Blockly.RenderedTypeExpr.getTypeExprHeight(this.first_type);
    return [6, height + 12];
  }
};

Blockly.RenderedTypeExpr.shape['fun'] = {
  down: function(steps) {
    steps.push('l 0,3 -12,0 0,3 12,0');
    Blockly.RenderedTypeExpr.renderTypeExpr(this.arg_type, steps, 1);
    steps.push('l 5,3 -5,3');
    Blockly.RenderedTypeExpr.renderTypeExpr(this.return_type, steps, 1);
    steps.push('l -12,0 0,3 12,0 0,3');
  },

  up: function(steps) {
    steps.push('l 0,-3 -12,0 0,-3 12,0');
    Blockly.RenderedTypeExpr.renderTypeExpr(this.return_type, steps, 2);
    steps.push('l 5,-3 -5,-3');
    Blockly.RenderedTypeExpr.renderTypeExpr(this.arg_type, steps, 2);
    steps.push('l -12,0 0,-3 12,0 0,-3');
  },

  height: function() {
    return Blockly.RenderedTypeExpr.getTypeExprHeight(this.arg_type) +
        Blockly.RenderedTypeExpr.getTypeExprHeight(this.return_type) + 18;
  },

  offsetsY: function() {
    var height = Blockly.RenderedTypeExpr.getTypeExprHeight(this.arg_type);
    return [6, height + 12];
  }
};

Blockly.RenderedTypeExpr.shape['construct'] =
    Object.assign({}, Blockly.RenderedTypeExpr.shape['original']);

Blockly.RenderedTypeExpr.shape['typeVar'] = {
  down: function(steps) {
    steps.push('l 0,5 -8,0 0,15 8,0 0,5');
  },

  up: function(steps) {
    steps.push('l 0,-5 -8,0 0,-15 8,0 0,-5');
  },

  height: function() {
    return 25;
  },

  offsetsY: function() {
    return [];
  },

  tvarHighlight: function() {
    return 'm 0,5 l -8,0 0,15 8,0';
  }
};

/**
 * Create a list of record to present highlights for the type expression.
 * @param {!Blockly.TypeExpr} type
 * @return {Array<{color: string, path: string}>}
 * @static
 */
Blockly.RenderedTypeExpr.typeVarHighlights = function(type) {
  var typeVarHighlights = [];
  Blockly.RenderedTypeExpr.typeVarHighlights_(type, 0, typeVarHighlights);
  return typeVarHighlights;
}

/**
 * Helper function to create a highlight for type variable
 * @param {!Blockly.TypeExpr} type
 * @param {number} y
 * @param {Array<{color: string, path: string}>} typeVarHighlights
 * @private
 * @static
 */
Blockly.RenderedTypeExpr.typeVarHighlights_ = function(type, y, typeVarHighlights) {
  var type = type.deref();
  var typeName = type.getTypeName();
  var shape = Blockly.RenderedTypeExpr.shape[typeName];
  var children = type.getChildren();
  if (type.isTypeVar()) {
    typeVarHighlights.push({
      color: type.color,
      path: "m 0," + y + " " + shape.tvarHighlight.call(type)
    });
  } else if (children.length != 0) {
    var name = type.getTypeName();
    var offsetsY = shape.offsetsY.call(type);
    for (var i = 0; i < children.length; i++) {
      Blockly.RenderedTypeExpr.typeVarHighlights_(children[i],
          y + offsetsY[i], typeVarHighlights);
    }
  }
}

/*
 * @param {!Blockly.TypeExpr} type
 */
Blockly.RenderedTypeExpr.getTypeExprHeight = function(type) {
  var type = type.deref();
  var typeName = type.getTypeName();
  var shape = Blockly.RenderedTypeExpr.shape[typeName];
  return shape.height.call(type);
}

/**
 * @param {!Blockly.TypeExpr} type
 * @param {!Array.<string>} steps Path of block outline.
 * @param {number} n Specify down, up or highlight (1, 2, or 3).
 */
Blockly.RenderedTypeExpr.renderTypeExpr = function(type, steps, n) {
  var type = type.deref();
  var typeName = type.getTypeName();
  var shape = Blockly.RenderedTypeExpr.shape[typeName]
  switch (n) {
    case 1:
      shape.down.call(type, steps);
      break;
    case 2:
      shape.up.call(type, steps);
      break;
    case 3:
      shape.down.call(type, steps);
      var height = shape.height.call(type, steps);
      var diff = Blockly.BlockSvg.MIN_BLOCK_Y - height;
      if (0 < diff) {
        steps.push('v ' + diff);
      }
      break;
    default:
      goog.asserts.assert(false);
  }
}

/**
 * @param {!Blockly.TypeExpr} type
 * @param {number} n Specify down, up, or highlight (1, 2, or 3).
 * @return {string}
 */
Blockly.RenderedTypeExpr.getPath = function(type, n) {
  var steps = [];
  Blockly.RenderedTypeExpr.renderTypeExpr(type, steps, n);
  return steps.join(' ');
}

/*
 * @param {!Blockly.TypeExpr} type
 */
Blockly.RenderedTypeExpr.getDownPath = function(type) {
  return Blockly.RenderedTypeExpr.getPath(type, 1);
}

/*
 * @param {!Blockly.TypeExpr} type
 */
Blockly.RenderedTypeExpr.getUpPath = function(type) {
  return Blockly.RenderedTypeExpr.getPath(type, 2);
}

/*
 * @param {!Blockly.TypeExpr} type
 */
Blockly.RenderedTypeExpr.getHighlightedPath = function(type) {
  return Blockly.RenderedTypeExpr.getPath(type, 3);
}

/**
 * @param {!Blockly.TypeExpr} type
 * @param {!goog.math.Coordinate} xy
 * @param {!Element} parent
 * @return {!Array.<!Element>}
 */
Blockly.RenderedTypeExpr.createHighlightedSvg = function(type, xy, parent) {
  /** @type {Array<{color: string, path: string}>} */
  var typeVarHighlights =
      Blockly.RenderedTypeExpr.typeVarHighlights(type);
  var svgList = [];
  for (var i = 0; i < typeVarHighlights.length; i++) {
    var highlight = typeVarHighlights[i];
    svgList.push(
      Blockly.utils.createSvgElement(
        'path', {
          'class': 'blocklyTypeVarPath',
          stroke: highlight.color,
          d: highlight.path,
          transform: 'translate(' + xy.x + ', ' + xy.y + ')'
        },
        parent));
  }
  return svgList;
};
