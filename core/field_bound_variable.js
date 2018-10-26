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

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.string');


/**
 * Class for a variable's dropdown field with variable binding.
 * @param {?string} varname The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.
 * @param {Array.<string>=} opt_variableTypes A list of the types of variables
 *     to include in the dropdown.
 * @param {string=} opt_defaultType The type of variable to create if this
 *     field's value is not explicitly set.  Defaults to ''.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldBoundVariable = function(varname) {
  // The FieldDropdown constructor would call setValue, which might create a
  // variable.  Just do the relevant parts of the constructor.
  this.menuGenerator_ = Blockly.FieldBoundVariable.dropdownCreate;
  this.size_ = new goog.math.Size(0, Blockly.BlockSvg.MIN_BLOCK_Y);
  this.setValidator(opt_validator);
  this.defaultVariableName = (varname || '');

  this.value_ = null;
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
};

/**
 * Dispose of this field.
 * @public
 */
Blockly.FieldBoundVariable.prototype.dispose = function() {
  Blockly.FieldBoundVariable.superClass_.dispose.call(this);
  this.workspace_ = null;
  this.variableMap_ = null;
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
 * Get the variable's ID.
 * @return {string} Current variable's ID.
 */
Blockly.FieldBoundVariable.prototype.getValue = function() {
  throw 'Not implemented yet.';
};

/**
 * Get the text from this field, which is the selected variable's name.
 * @return {string} The selected variable's name, or the empty string if no
 *     variable is selected.
 */
Blockly.FieldBoundVariable.prototype.getText = function() {
  throw 'Not implemented yet.';
};

/**
 * Get the variable model for the selected variable.
 * Not guaranteed to be in the variable map on the workspace (e.g. if accessed
 * after the variable has been deleted).
 * @return {?Blockly.VariableModel} the selected variable, or null if none was
 *     selected.
 * @package
 */
Blockly.FieldBoundVariable.prototype.getVariable = function() {
  return this.variable_;
};

/**
 * Set the variable ID.
 * @param {string} id New variable ID, which must reference an existing
 *     variable.
 */
Blockly.FieldBoundVariable.prototype.setValue = function(id) {
  throw 'Not implemented yet.';
};

/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @return {!Array.<string>} Array of variable names.
 * @this {Blockly.FieldBoundVariable}
 */
Blockly.FieldBoundVariable.dropdownCreate = function() {
  throw 'Not implemented yet.';
};

/**
 * Handle the selection of an item in the variable dropdown menu.
 * Special case the 'Rename variable...' and 'Delete variable...' options.
 * In the rename case, prompt the user for a new name.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
 */
Blockly.FieldBoundVariable.prototype.onItemSelected = function(menu, menuItem) {
  throw 'Not implemented yet.';
};

/**
 * Overrides referencesVariables(), indicating this field refers to a variable.
 * @return {boolean} True.
 * @package
 * @override
 */
Blockly.FieldBoundVariable.prototype.referencesVariables = function() {
  // The function is required to return whether this field refers to a variable
  // representation of Blockly.VariableModel class. This field uses another
  // representation, so return false here.
  return false;
};

Blockly.Field.register('field_bound_variable', Blockly.FieldBoundVariable);
