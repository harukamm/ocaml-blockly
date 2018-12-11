/**
 * @fileoverview Variable input field supporting variable binding.
 * If there are the following two blocks:
 *   Block1: let [x] = [x] in [x]
 *   Block2: let [x] = [x] in [x]
 *   where [x] is a bound-variable field which has 'x' as a variable name.
 * When user rename a variable name in either the first or third field of
 * Block1, the other field will also be updated because of variable binding,
 * but there is no change in the second field and Block2's fields.
 * On the other hand, Blockly.FieldVariable doesn't support variable binding.
 * If [x] is a field of Blockly.FieldVariable class, other fields will be
 * changed when user rename any one of [x] fields.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

goog.provide('Blockly.FieldBoundVariable');

goog.require('Blockly.BoundVariables');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.string');


/**
 * Class for a variable's dropdown field with variable binding.
 * @param {boolean} isValue Whether the field is for a variable value.
 *     Otherwise, for a variable reference.
 * @param {!typeExpr} typeExpr The type expression of this variable.
 * @param {string} varName The default name for the variable.  If null, the
 *     generated name will be used.
 * @param {string} scopeName The default name for the input as the value's
 *     scope. Ignored if the field is for a variable reference.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldBoundVariable = function(isValue, typeExpr, varName, scopeName) {
  // The FieldDropdown constructor would call setValue, which might create a
  // variable.  Just do the relevant parts of the constructor.
  this.menuGenerator_ = Blockly.FieldBoundVariable.dropdownCreate;
  this.size_ = new goog.math.Size(0, Blockly.BlockSvg.MIN_BLOCK_Y);
  this.defaultTypeExpr_ = typeExpr;

  this.defaultVariableName_ = varName;

  /**
   * Whether this field is for a variable value. If true, this field works as
   * a variable value. Otherwise, as a variable references. Variable references
   * can refer to one of variable values.
   * Could not be changed later.
   * @type {boolean}
   */
  this.forValue_ = isValue;

  /**
   * The default name of the input inside which this variable is visible.
   * Always null if this field is for a variable reference.
   * @type {string}
   */
  this.defaultScopeInputName_ = isValue ? scopeName : null;

  /**
   * The value of this field's variable if this.forValue_ is true, otherwise
   * the reference of that.
   * Would be initialized in init() or setValue().
   * @type {Blockly.BoundVariableAbstract}
   */
  this.variable_ = null;
};
goog.inherits(Blockly.FieldBoundVariable, Blockly.FieldDropdown);

/**
 * Construct a FieldBoundVariable from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options.
 * @returns {!Blockly.FieldBoundVariable} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldBoundVariable.fromJson = function(options) {
  throw 'Not implemented yet.';
};

/**
 * The name of widget for highlights for binding variables.
 * @type {!string}
 * @private
 */
Blockly.FieldBoundVariable.WIDGET_TYPE_VARIABLES_ = 'vhighlights';

/**
 * Obtain a newly created bound-variable field of value type.
 * @param {!Blockly.TypeExpr} valueTypeExpr The type for the value.
 * @param {string} scopeInputName The name of input on which the variable value
 *     is visible.
 * @param {string} opt_varName The default name for the variable.  If null, the
 *     generated name will be used.
 * @return {!Blockly.FieldBoundVariable} The created field.
 */
Blockly.FieldBoundVariable.newValue = function(valueTypeExpr,
    scopeInputName, opt_varName) {
  return new Blockly.FieldBoundVariable(true, valueTypeExpr, opt_varName,
      scopeInputName);
};

/**
 * Obtain a newly created bound-variable field of reference type.
 * @param {!Blockly.TypeExpr} referenceTypeExpr The type for the reference.
 * @param {string} opt_varName The default name for the variable.  If null, the
 *     generated name will be used.
 * @return {!Blockly.FieldBoundVariable} The created field.
 */
Blockly.FieldBoundVariable.newReference = function(referenceTypeExpr,
    opt_varName) {
  return new Blockly.FieldBoundVariable(false, referenceTypeExpr, opt_varName);
};

/**
 * Attach this field to a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.FieldBoundVariable.prototype.setSourceBlock = function(block) {
  goog.asserts.assert(goog.isFunction(block.typeExprReplaced),
      'The function typeExprReplaced is expected to be defined on the ' +
      'block which contains bound-variable fields.');

  Blockly.FieldBoundVariable.superClass_.setSourceBlock.call(this, block);
};

/**
 * Initialize the string for the default variable name to this variable. If
 * this.defaultVariableName_ is null, store the generated name to that field.
 * Otherwise, if it contains white spaces at start or end, trim them.
 */
Blockly.FieldBoundVariable.prototype.initDefaultVariableName_ = function() {
  var original = this.defaultVariableName_;
  if (goog.isString(original)) {
    var cleaned = original.trim();
    if (Blockly.BoundVariables.isLegalName(cleaned)) {
      this.defaultVariableName_ = cleaned;
      return;
    }
  }
  this.defaultVariableName_ = Blockly.BoundVariables.generateUniqueName(
      this.sourceBlock_.workspace);
};

/**
 * Initialize everything needed to render this field.  This includes making sure
 * that the field's value is valid.
 * @public
 */
Blockly.FieldBoundVariable.prototype.init = function() {
  if (this.fieldGroup_) {
    // Dropdown has already been initialized once.
    return;
  }
  Blockly.FieldBoundVariable.superClass_.init.call(this);

  if (this.forValue_) {
    this.blockShapedPath_ = Blockly.utils.createSvgElement('path',
        {
          'class': 'blocklyFieldBoundValue',
          'd': '',
        }, null);
    this.fieldGroup_.insertBefore(this.blockShapedPath_, this.borderRect_);

    Blockly.utils.addClass(this.fieldGroup_, 'BlocklyFieldBoundValueInside');
  }

  var onMouseEnter = this.highlightVariables_.bind(this, true);
  this.mouseEnterWrapper_ =
      Blockly.bindEventWithChecks_(
          this.fieldGroup_, 'mouseenter', this, onMouseEnter, true, true);

  var onMouseLeave = this.highlightVariables_.bind(this, false);
  this.mouseLeaveWrapper_ =
      Blockly.bindEventWithChecks_(
          this.fieldGroup_, 'mouseleave', this, onMouseLeave, true, true);

  this.initModel();
  this.updateText();
};

/**
 * Initialize this field's variable if has not already been
 * initialized.
 */
Blockly.FieldBoundVariable.prototype.initModel = function() {
  if (!this.variable_) {
    this.initDefaultVariableName_();

    if (this.forValue_) {
      goog.asserts.assert(this.defaultScopeInputName_,
          'The name of input representing the value\'s scope is not ' +
          'initialized.');
      this.variable_ = Blockly.BoundVariables.createValue(
          this.sourceBlock_, this.name, this.defaultTypeExpr_,
          this.defaultScopeInputName_, this.defaultVariableName_);
    } else {
      this.variable_ = Blockly.BoundVariables.createReference(
          this.sourceBlock_, this.name, this.defaultTypeExpr_,
          this.defaultVariableName_);
    }
  }
};

/**
 * Dispose of this field.
 * @public
 */
Blockly.FieldBoundVariable.prototype.dispose = function() {
  goog.dom.removeNode(this.blockShapedPath_);
  this.blockShapedPath_ = null;
  Blockly.FieldBoundVariable.superClass_.dispose.call(this);
  if (this.variable_) {
    this.variable_.dispose();
  }
  if (this.mouseEnterWrapper_) {
    Blockly.unbindEvent_(this.mouseEnterWrapper_);
    this.mouseEnterWrapper_ = null;
  }
  if (this.mouseLeaveWrapper_) {
    Blockly.unbindEvent_(this.mouseLeaveWrapper_);
    this.mouseLeaveWrapper_ = null;
  }
  this.variable_ = null;
};

/**
 * Attach this field to a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.FieldBoundVariable.prototype.setSourceBlock = function(block) {
  goog.asserts.assert(!block.isShadow(),
      'Variable fields are not allowed to exist on shadow blocks.');
  Blockly.FieldBoundVariable.superClass_.setSourceBlock.call(this, block);
};

/**
 * Returns whether this field's variable is a variable value.
 * @return {boolean} True if this field's variable is a variable value
 *     Otherwise, a variable reference.
 */
Blockly.FieldBoundVariable.prototype.isForValue = function() {
  return this.forValue_;
};

/**
 * Sets the value this reference refers to.  Throws an error if this field
 * is for a variable value.
 * @param {!Blockly.BoundVariableValue}
 */
Blockly.FieldBoundVariable.prototype.setBoundValue = function(value) {
  if (this.forValue_) {
    throw 'Can\'t set a bound value to a variable value.';
  }
  if (this.variable_) {
    this.variable_.setBoundValue(value);
  }
};

/**
 * Returns the value this reference refers to.  Throws an error is this
 * field is for a variable value.
 * @return {Blockly.BoundVariableValue}
 */
Blockly.FieldBoundVariable.prototype.getBoundValue = function() {
  if (this.forValue_) {
    throw 'Can\'t get a bound value from a variable value.';
  }
  return this.variable_ ? this.variable_.getBoundValue() : null;
};

/**
 * Get the variable of this field.
 * @return {Blockly.BoundVariableAbstract} The variable's reference or value.
 */
Blockly.FieldBoundVariable.prototype.getVariable = function() {
  return this.variable_;
};

/**
 * Get the ID of this field's variable.
 * @return {string} Current variable's ID.
 * @override
 */
Blockly.FieldBoundVariable.prototype.getValue = function() {
  return this.variable_ ? this.variable_.getId() : null;
};

/**
 * Get the variable name.
 * @return {!string} Get the name for this variable.
 */
Blockly.FieldBoundVariable.prototype.getVariableName = function() {
  if (!this.variable_) {
    throw 'The variable is not initalized.';
  }
  return this.variable_.getVariableName();
};

/**
 * Set the variable name of this variable.
 * @return {!string} newName The new name for this field's variable.
 */
Blockly.FieldBoundVariable.prototype.setVariableName = function(newName) {
  if (!this.variable_) {
    throw 'The variable is not initalized.';
  }
  this.variable_.setVariableName(newName);
};

/**
 * Set the text in this field.
 * @param {*} newText New text.
 * @override
 */
Blockly.FieldBoundVariable.prototype.setText = function(newText) {
  if (newText !== null) {
    var text = String(newText);
    if (this.variable_) {
      this.variable_.setVariableName(newText);
    } else {
      // Overwrite the default variable name in case of initializing this.variable_
      // later.
      this.defaultVariableName_ = text;
    }
    Blockly.FieldBoundVariable.superClass_.setText.call(this, text);
  }
};

/**
 * Update the text in this field with the variable name.
 */
Blockly.FieldBoundVariable.prototype.updateText = function() {
  if (this.variable_) {
    this.setText(this.getVariableName());
  }
};

/**
 * Set the ID of this field's variable.
 * @param {string} id New ID, which must refer to a existing variable.
 * @param {Blockly.Workspace=} opt_workspace The workspace to search for
 *     variable. If null, search the workspace of the source block.
 * @override
 */
Blockly.FieldBoundVariable.prototype.setValue = function(id, opt_workspace) {
  var workspace = opt_workspace ? opt_workspace : this.sourceBlock_.workspace;
  var variable;
  if (this.forValue_) {
    variable = Blockly.BoundVariables.getValueById(workspace, id);
    if (!variable) {
      throw 'Value of ID ' + id + ' doesn\'t exist.';
    }
  } else {
    variable = Blockly.BoundVariables.getReferenceById(workspace, id);
    if (!variable) {
      throw 'Reference of ID ' + id + ' doesn\'t exist.';
    }
  }
  // TODO: Type check.
  this.variable_ = variable;
  this.updateText();
};

/**
 * Draws the field with the correct width.
 * @override
 * @private
 */
Blockly.FieldBoundVariable.prototype.render_ = function() {
  if (!this.visible_) {
    this.size_.width = 0;
    return;
  }
  Blockly.FieldBoundVariable.superClass_.render_.call(this);

  if (!this.blockShapedPath_) {
    return;
  }
  if (!this.variable_ || !this.variable_.getTypeExpr()) {
    return;
  }

  var dropdownWidth = this.size_.width + Blockly.BlockSvg.SEP_SPACE_X;
  var blockShapeWidth = dropdownWidth + Blockly.BlockSvg.TAB_WIDTH +
      Blockly.BlockSvg.SEP_SPACE_X;

  var dropdownHeight = this.size_.height - 9;
  var pathObj = this.getBlockShapedPath_(blockShapeWidth);
  var blockShapeHeight = pathObj.height;
  this.blockShapedPath_.setAttribute('d', pathObj.path);

  this.blockShapedPath_.setAttribute('height', blockShapeHeight);
  this.blockShapedPath_.setAttribute('width', blockShapeWidth);

  // TODO(harukam): Support RTL.
  var left = (blockShapeWidth - dropdownWidth) / 2;
  this.textElement_.setAttribute('x', left);
  this.borderRect_.setAttribute('x', -Blockly.BlockSvg.SEP_SPACE_X / 2 + left);

  var top = (blockShapeHeight - dropdownHeight) / 2;
  this.blockShapedPath_.setAttribute('transform', 'translate(0, -' + top + ')');

  this.size_.width = blockShapeWidth - Blockly.BlockSvg.TAB_WIDTH;
  this.size_.height = blockShapeHeight;
};

/**
 * Generates SVG paths to draw the shape for the type expression of this
 * variable.
 * @param {number} width Width for the generated paths including horizontal
 *     puzzle tab.
 * @return {!{height: number, path: string}} Object with height and string
 *    for SVG path properties.
 */
Blockly.FieldBoundVariable.prototype.getBlockShapedPath_ = function(width) {
  var inlineSteps = [];
  var typeExpr = this.variable_ && this.variable_.getTypeExpr();

  if (typeExpr) {
    var height = typeExpr.getTypeExprHeight(typeExpr);
    inlineSteps.push('M 0,0');
    typeExpr.renderTypeExpr(inlineSteps, 1 /** Gets the down path. */);

    if (height < 23) {
      height = 23;
    }
    var rectWidth = width - Blockly.BlockSvg.TAB_WIDTH;
    inlineSteps.push('M 0,' + height);
    inlineSteps.push('l ' + rectWidth + ' 0 l 0 -' + height + ' l -' +
        rectWidth + ' 0');
  }
  return {height: height, path: inlineSteps.join(' ')};
};

/**
 * Return a sorted list of visible variable names for dropdown menus.
 * @return {!Array.<!Array>} Array of option tuples.
 * @this {Blockly.FieldBoundVariable}
 */
Blockly.FieldBoundVariable.dropdownCreate = function() {
  if (!this.variable_) {
    throw new Error('Tried to call dropdownCreate on a bound-variable field ' +
        'with no variable selected.');
  }
  var options = [];
  if (!this.isForValue()) {
    var valueList = Blockly.BoundVariables.getVisibleVariableValues(
        this.variable_);
    valueList.sort(Blockly.BoundVariableAbstract.compareByName);
    for (var i = 0; i < valueList.length; i++) {
      var value = valueList[i];
      options[i] = [value.getVariableName(), value.getId()];
    }
  }
  options.push([Blockly.Msg['RENAME_VARIABLE'], Blockly.RENAME_VARIABLE_ID]);
  // var name = this.getVariableName();
  // if (Blockly.Msg['DELETE_VARIABLE']) {
  //   options.push(
  //       [
  //         Blockly.Msg['DELETE_VARIABLE'].replace('%1', name),
  //         Blockly.DELETE_VARIABLE_ID
  //       ]
  //   );
  // }
  return options;
};

/**
 * Handle the selection of an item in the variable dropdown menu.
 * Special case the 'Rename variable...' and 'Delete variable...' options.
 * In the rename case, prompt the user for a new name.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
 */
Blockly.FieldBoundVariable.prototype.onItemSelected = function(menu, menuItem) {
  var id = menuItem.getValue();
  var workspace = this.sourceBlock_.workspace;
  if (id == Blockly.RENAME_VARIABLE_ID) {
    // Rename variable.
    Blockly.BoundVariables.renameVariable(this.variable_);
  } else if (id == Blockly.DELETE_VARIABLE_ID) {
    throw 'Not implemented yet.';
  }
};

/**
 * Highlights/unhighlights all the fields whose variables refer to this
 * variable, or are referred to by this variable. They includes this field at
 * least.
 * @param {boolean} on True if highlight the fields. Otherwise, unhighlight.
 */
Blockly.FieldBoundVariable.prototype.highlightVariables_ = function(on, e) {
  if (!this.variable_) {
    return;
  }
  if (this.sourceBlock_.workspace.isDragging()) {
    return;
  }
  var variables = this.variable_.getAllBoundVariables();
  var isOwner = Blockly.WidgetDiv.isOwner(this,
      Blockly.FieldBoundVariable.WIDGET_TYPE_VARIABLES_);

  if (on && !isOwner) {
    var callback = function(variables, on) {
      for (var i = 0, variable; variable = variables[i]; i++) {
        var field = variable.getContainerField();
        field.highlight(on);
      }
    };
    var showCallback = callback.bind(null, variables, true);
    var hideCallback = callback.bind(null, variables, false);
    Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, hideCallback,
        showCallback, Blockly.FieldBoundVariable.WIDGET_TYPE_VARIABLES_);
  } else if (!on && isOwner) {
    Blockly.WidgetDiv.hide();
  }
};

/**
 * Highlights/unhighlights this field.
 * @param {boolean} on True if highlight. Otherwise, unhighlight.
 */
Blockly.FieldBoundVariable.prototype.highlight = function(on) {
  if (on) {
    Blockly.utils.addClass(this.fieldGroup_, 'highlight');
  } else {
    Blockly.utils.removeClass(this.fieldGroup_, 'highlight');
  }
};

/**
 * Overrides referencesVariables(), indicating this field refers to a bound
 * variable.
 * @return {?number} Null if not refer to a variable, or an enum representing
 *     which type of variable this field refers to.
 * @package
 * @override
 */
Blockly.FieldBoundVariable.prototype.referencesVariables = function() {
  return Blockly.FIELD_VARIABLE_BINDING;
};

Blockly.Field.register('field_bound_variable', Blockly.FieldBoundVariable);
