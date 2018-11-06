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
 * @param {string} opt_varName The default name for the variable.  If null, the
 *     fixed name will be used.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldBoundVariable = function(isValue, opt_varName) {
  // The FieldDropdown constructor would call setValue, which might create a
  // variable.  Just do the relevant parts of the constructor.
  this.menuGenerator_ = Blockly.FieldBoundVariable.dropdownCreate;
  this.size_ = new goog.math.Size(0, Blockly.BlockSvg.MIN_BLOCK_Y);
  this.defaultVariableName_ = opt_varName || 'hoge';

  /**
   * Whether this field is for a variable value. If true, this field works as
   * a variable value. Otherwise, as a variable references. Variable references
   * can refer to one of variable values.
   * Could not be changed later.
   * @type {boolean}
   */
  this.forValue_ = isValue;

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
 * Obtain a newly created bound-variable field of value type.
 * @param {!Blockly.TypeExpr} valueTypeExpr The type for the value.
 * @param {string} scopeInputName The name of input on which the variable value
 *     is visible.
 * @param {string} opt_varName The default name for the variable.  If null, the
 *     fixed name will be used.
 * @return {!Blockly.FieldBoundVariable} The created field.
 */
Blockly.FieldBoundVariable.newValue = function(valueTypeExpr,
    scopeInputName, opt_varName) {
  var field = new Blockly.FieldBoundVariable(true, opt_varName);
  // Add to properties, which is needed in initModel().
  field.valueTypeExpr_ = valueTypeExpr;
  field.scopeInputName_ = scopeInputName;
  return field;
};

/**
 * Obtain a newly created bound-variable field of reference type.
 * @param {!Blockly.TypeExpr} valueTypeExpr The type for the value.
 * @param {string} scopeInputName The name of input on which the variable value
 *     is visible.
 * @param {string} opt_varName The default name for the variable.  If null, the
 *     fixed name will be used.
 * @return {!Blockly.FieldBoundVariable} The created field.
 */
Blockly.FieldBoundVariable.newReference = function(opt_varName) {
  return new Blockly.FieldBoundVariable(false, opt_varName);
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

  this.initModel();
  this.updateText();
};

/**
 * Initialize this field's variable if has not already been
 * initialized.
 */
Blockly.FieldBoundVariable.prototype.initModel = function() {
  if (!this.variable_) {
    if (this.forValue_) {
      this.variable_ = Blockly.BoundVariables.createValue(
          this.sourceBlock_, this.name, this.valueTypeExpr_,
          this.scopeInputName_, this.defaultVariableName_);
    } else {
      this.variable_ = Blockly.BoundVariables.createReference(
          this.sourceBlock_, this.name, this.defaultVariableName_);
    }
  }
};

/**
 * Dispose of this field.
 * @public
 */
Blockly.FieldBoundVariable.prototype.dispose = function() {
  Blockly.FieldBoundVariable.superClass_.dispose.call(this);
  if (this.variable_) {
    this.variable_.dispose();
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
