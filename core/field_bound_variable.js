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
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldBoundVariable = function() {
  // The FieldDropdown constructor would call setValue, which might create a
  // variable.  Just do the relevant parts of the constructor.
  this.menuGenerator_ = Blockly.FieldBoundVariable.dropdownCreate;
  this.size_ = new goog.math.Size(0, Blockly.BlockSvg.MIN_BLOCK_Y);

  /**
   * The reference of this field's variable. Would be initialized in init().
   * @type {Blockly.TypedVariableValueReference}
   */
  this.reference_ = null;
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

  if (!this.reference_) {
    this.reference_ = new Blockly.TypedVariableValueReference(this.sourceBlock_);
  }
  this.updateText_();
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
 * Sets the variable this reference refers to.
 * @param {!Blockly.TypedVariableValueReference}
 */
Blockly.FieldBoundVariable.prototype.setBoundValue = function(value) {
  if (this.reference_) {
    this.reference_.setBoundValue(value);
  }
};

/**
 * Returns the variable this reference refers to.
 * @return {Blockly.TypedVariableValue}
 */
Blockly.FieldBoundVariable.prototype.getBoundValue = function() {
  return this.reference_ ? this.reference_.getBoundValue() : null;
};

/**
 * Get the reference's ID.
 * @return {string} Current variable's ID.
 * @override
 */
Blockly.FieldBoundVariable.prototype.getValue = function() {
  return null
  return this.reference_ ? this.reference_.getId() : null;
};

/**
 * Get the text from this field, which is the selected variable's name.
 * @return {string} The selected variable's name, or the empty string if no
 *     variable is selected.
 */
Blockly.FieldBoundVariable.prototype.getText = function() {
  if (!this.reference_) {
    throw 'The value is not initialized.';
  }
  return this.reference_.getDisplayName();
};

/**
 * Update the text in this field.
 * @private
 */
Blockly.FieldBoundVariable.prototype.updateText_ = function() {
  this.setText(this.getText());
};

/**
 * Set the reference ID.
 * @param {string} id New variable ID, which must reference an existing
 *     variable.
 * @override
 */
Blockly.FieldBoundVariable.prototype.setValue = function(id) {
  var workspace = this.sourceBlock_.workspace;
  var reference = Blockly.BoundVariables.getReferenceById(workspace, id);

  if (!reference) {
    throw 'Reference of ID ' + id + ' doesn\'t exist.';
  }
  // TODO: Type check.
  this.reference_ = reference;
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
