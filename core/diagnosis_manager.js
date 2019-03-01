/**
 * @fileoverview Class managing errors during a block drag.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

goog.provide('Blockly.DiagnosisManager');
goog.provide('Blockly.ErrorCollector');
goog.provide('Blockly.ErrorItem');

goog.require('goog.asserts');

/**
 * Class to show a dialog to explain reasons why a dragged block is not allowed
 * to connect to the closest connection, why it's dropped in the current
 * position, or etc during a block drag.
 * @param {!Blockly.BlockSvg} block The top block in the stack being dragged.
 * @constructor
 */
Blockly.DiagnosisManager = function(block) {
  /** @type {!Blockly.BlockSvg} */
  this.topBlock_ = block;

  /** @type {number} */
  this.mainScale_ = this.topBlock_.workspace.getMainWorkspace().scale;

  /** @type {!Blockly.ErrorCollector_} */
  this.unboundCollector_ = new Blockly.ErrorCollector();

  /** @type {!Element} */
  this.dialog_ = null;

  /** @type {string} */
  this.lastMessage_ = null;

  /** @type {boolean} */
  this.visible_ = false;

  this.createDom_();
};

Blockly.DiagnosisManager.OFFSET_X = 20;

Blockly.DiagnosisManager.OFFSET_Y = 20;

Blockly.DiagnosisManager.WIDTH = 400;

/**
 * Create the div to show error message.
 */
Blockly.DiagnosisManager.prototype.createDom_ = function() {
  if (this.dialog_) {
    return;
  }
  this.dialog_ =
      goog.dom.createDom(goog.dom.TagName.DIV, 'blocklyDiagnosisDialog');
  this.dialog_.style.maxWidth = Blockly.DiagnosisManager.WIDTH + 'px';
  document.body.appendChild(this.dialog_);
};

/**
 * Update the error dialog during a block drag.
 * @param {!Event} e The most recent move event.
 * @param {Blockly.ConnectionDB.errorReason} closestError The reason why the
 *     closest connection is incompatible with the dragged block. Null if it's
 *     compatible.
 */
Blockly.DiagnosisManager.prototype.update = function(e, closestError) {
  var message = null;
  if (closestError) {
    var collector = /** @type {!Blockly.ErrorCollector_} */(closestError.error);
    message = collector.toMessage();
  } else if (!this.unboundCollector_.isEmpty()) {
    message = this.unboundCollector_.toMessage();
  }

  this.updateErrorDialog_(e, message);
  this.unboundCollector_.clear();
  this.lastMessage_ = message;
};

/**
 * Update message on the error dialog or hide the dialog.
 * @param {!Event} e The most recent move event.
 * @param {string} Message to be shown in a dialog. Null to hide the dialog.
 */
Blockly.DiagnosisManager.prototype.updateErrorDialog_ = function(e, message) {
  var newVisible = !!message;
  if (!newVisible) {
    if (this.visible_) {
      this.dialog_.style.display = 'none';
      this.visible_ = false;
    }
    return;
  }

  if (!this.visible_) {
    this.dialog_.style.display = 'block';
    this.visible_ = true;
  }

  var anchorY = e.pageY;
  var offsetY = Math.max(this.topBlock_.height, Blockly.DiagnosisManager.OFFSET_Y);
  anchorY += offsetY * this.mainScale_;
  var anchorX = e.pageX;
  anchorX += Blockly.DiagnosisManager.OFFSET_X * this.mainScale_;
  this.dialog_.style.top = anchorY + 'px';
  this.dialog_.style.left = anchorX + 'px';

  if (this.lastMessage_ !== message) {
    this.dialog_.textContent = message;
  }
};

/**
 * Returns object to collect unbound errors. It may be updated by caller.
 * @return {!Blockly.ErrorCollector}
 */
Blockly.DiagnosisManager.prototype.getUnboundCollector = function() {
  return this.unboundCollector_;
};

/**
 * Dispose of the manager.
 */
Blockly.DiagnosisManager.prototype.dispose = function() {
  this.topBlock_ = null;
  if (this.dialog_) {
    goog.dom.removeNode(this.dialog_);
  }
};

/**
 * Class to collect errors.
 * @constructor
 */
Blockly.ErrorCollector = function() {
  /** @type {!Array.<!Blockly.ErrorItem>} */
  this.errors_ = [];
  /** @type {number} */
  this.state_ = Blockly.ErrorCollector.STATE_NONE;
};

Blockly.ErrorCollector.STATE_NONE = 1;
Blockly.ErrorCollector.STATE_CONNECTED_BLOCK = 2;

/**
 * Set the collector's state specifying which objects are currently examined.
 * @param {number} state An enum to specify an collector's state.
 */
Blockly.ErrorCollector.prototype.setState = function(state) {
  switch (state) {
    case Blockly.ErrorCollector.STATE_CONNECTED_BLOCK:
      goog.asserts.assert(this.state_ == Blockly.ErrorCollector.STATE_NONE,
        'The collector\'s state is already given.');
    case Blockly.ErrorCollector.STATE_NONE:
      break;
    default:
      goog.asserts.fail('Unknown state for an error collector.');
  }
  this.state_ = state;
};

Blockly.ErrorCollector.prototype.clearState = function() {
  this.setState(Blockly.ErrorCollector.STATE_NONE);
};
Blockly.ErrorCollector.prototype.setStateConnectedBlock = function() {
  this.setState(Blockly.ErrorCollector.STATE_CONNECTED_BLOCK);
};

/**
 * Converts the given collector's state to the corresponding state for an
 * error item.
 * @param {number} state An enum for a collector's state.
 * @return {number} An enum representing the corresponding error state.
 * @static
 */
Blockly.ErrorCollector.convertToErrorState = function(state) {
  switch (state) {
    case Blockly.ErrorCollector.STATE_NONE:
      return Blockly.ErrorItem.STATE_NONE;
    case Blockly.ErrorCollector.STATE_CONNECTED_BLOCK:
      return Blockly.ErrorItem.STATE_CONNECTED_BLOCK;
      break;
    default:
      goog.asserts.fail('Unknown state for an error collector.');
  }
};

/**
 * Creates error message from collected errors.
 * @return {!string} Error message.
 */
Blockly.ErrorCollector.prototype.toMessage = function() {
  if (this.errors_.length == 0) {
    return '';
  }
  var firstError = this.errors_[0];
  return firstError.toMessage();
};

/**
 * Returns whether the collector doesn't hold any error.
 */
Blockly.ErrorCollector.prototype.isEmpty = function() {
  return this.errors_.length == 0;
};

/**
 * Clear collected errors.
 */
Blockly.ErrorCollector.prototype.clear = function() {
  this.errors_.length = 0;
};

/**
 * @param {!Blockly.ErrorItem} item
 * @private
 */
Blockly.ErrorCollector.prototype.addItem_ = function(item) {
  var errorState = Blockly.ErrorCollector.convertToErrorState(this.state_);
  item.setErrorState(errorState);
  this.errors_.push(item);
};

/**
 * Gets a list of variables from collected errors.
 * @return {!Array.<!Blockly.BoundVariableValueReference>}
 */
Blockly.ErrorCollector.prototype.getUnboundVariables = function() {
  var unresolved = [];
  for (var i = 0, err; err = this.errors_[i]; i++) {
    if (err.label == Blockly.ErrorItem.UNBOUND_VARIABLE) {
      var reference = err.errorElement;
      unresolved.push(reference);
    }
  }
  return unresolved;
};

/**
 * @param {!Blockly.BoundVariableValueReference} reference The variable found
 *     to be unbound.
 * @param {Blockly.BoundVariableValue} wrongValue The wrong variable value in
 *     the reference's context. If null, the reference is just undefined in the
 *     context.
 */
Blockly.ErrorCollector.prototype.addUnboundVariable = function(reference,
    wrongValue) {
  var item = new Blockly.ErrorItem(Blockly.ErrorItem.UNBOUND_VARIABLE,
      reference, wrongValue);
  this.addItem_(item);
};

/**
 * @param {!Blockly.TypeExpr.Error} err The caused error object.
 */
Blockly.ErrorCollector.prototype.addTypeError = function(typeError) {
  var item = new Blockly.ErrorItem(Blockly.ErrorItem.TYPE_ERROR, typeError);
  this.addItem_(item);
};

/**
 * Represents error for orphan pattern block.
 */
Blockly.ErrorCollector.prototype.addOrphanPatternError = function() {
  var item = new Blockly.ErrorItem(Blockly.ErrorItem.ORPHAN_PATTERN);
  this.addItem_(item);
};

/**
 * Represents error for orphan type-constructor block.
 */
Blockly.ErrorCollector.prototype.addOrphanTypeConstructorError = function() {
  var item = new Blockly.ErrorItem(Blockly.ErrorItem.ORPHAN_TYPE_CTOR);
  this.addItem_(item);
};

/**
 * Represents an error where a block can not enter into a pattern workbench.
 */
Blockly.ErrorCollector.prototype.addPatternWorkbenchRefuseBlock = function() {
  var item = new Blockly.ErrorItem(
      Blockly.ErrorItem.WORKBENCH_REFUSE_BLOCK, 'pattern');
  this.addItem_(item);
};

/**
 * Represents an error where a block can not enter into a type workbench.
 */
Blockly.ErrorCollector.prototype.addTypeWorkbenchRefuseBlock = function() {
  var item = new Blockly.ErrorItem(
      Blockly.ErrorItem.WORKBENCH_REFUSE_BLOCK, 'type constructor');
  this.addItem_(item);
};

/**
 * @constructor
 */
Blockly.ErrorItem = function(label, errorElement, errorTarget) {
  this.label = label;
  this.errorElement = errorElement;
  this.errorTarget = errorTarget;

  this.state_ = Blockly.ErrorItem.STATE_NONE;
};

Blockly.ErrorItem.UNBOUND_VARIABLE = 1;
Blockly.ErrorItem.TYPE_ERROR = 2;
Blockly.ErrorItem.ORPHAN_PATTERN = 5;
Blockly.ErrorItem.ORPHAN_TYPE_CTOR = 10;
Blockly.ErrorItem.WORKBENCH_REFUSE_BLOCK = 15;

Blockly.ErrorItem.STATE_NONE = 1;
Blockly.ErrorItem.STATE_CONNECTED_BLOCK = 5;

Blockly.ErrorItem.MESSAGE_PREFIX_CONNECTED_BLOCK =
  'Can\'t unplug the already-connected block because ';

/**
 * Set the error's state indicating a situation which this error has occurred.
 * @param {number} state An enum to specify an error's state.
 */
Blockly.ErrorItem.prototype.setErrorState = function(state) {
  switch (state) {
    case Blockly.ErrorItem.STATE_CONNECTED_BLOCK:
      goog.asserts.assert(this.state_ == Blockly.ErrorItem.STATE_NONE,
        'The error\'s state is already given.');
    case Blockly.ErrorItem.STATE_NONE:
      break;
    default:
      goog.asserts.fail('Unknown state for an error item.');
  }
  this.state_ = state;
};

/**
 * Returns error message.
 * @return {!string} Error message.
 */
Blockly.ErrorItem.prototype.toMessage = function() {
  if (this.label == Blockly.ErrorItem.UNBOUND_VARIABLE) {
    return this.toMessageUnboundVariable_();
  }
  if (this.label == Blockly.ErrorItem.TYPE_ERROR) {
    return this.errorElement.toMessage();
  }
  if (this.label == Blockly.ErrorItem.ORPHAN_PATTERN) {
    return this.toMessageOrphanPattern_();
  }
  if (this.label == Blockly.ErrorItem.ORPHAN_TYPE_CTOR) {
    return this.toMessageOrphanTypeCtor_();
  }
  if (this.label == Blockly.ErrorItem.WORKBENCH_REFUSE_BLOCK) {
    return this.toMessageWorkbenchRefuseBlock_();
  }
  goog.asserts.fail('Unknown label');
};

/**
 * Get the error message for this unbound-variable error.
 * @return {string} An error message for this unbound-variable error.
 * @private
 */
Blockly.ErrorItem.prototype.toMessageUnboundVariable_ = function() {
  var msg = '';
  var name = '`' + this.errorElement.getVariableName() + '\'';
  var labelName =
      Blockly.BoundVariableAbstract.labelToName(this.errorElement.label);

  if (this.state_ == Blockly.ErrorItem.STATE_CONNECTED_BLOCK) {
    msg = Blockly.ErrorItem.MESSAGE_PREFIX_CONNECTED_BLOCK;
    msg += 'the ' + labelName + ' ' + name + ' will be ';
  } else {
    var capitalFirst = labelName.charAt(0).toUpperCase() + labelName.slice(1);
    msg += capitalFirst + ' ' + name + ' is ';
  }

  if (this.errorTarget) {
    msg += 'bound to unexpected ' + labelName + '.';
  } else {
    msg += this.errorElement.isVariable() ? 'unbound' : 'undefined';
    msg += '.';
  }
  return msg;
};

/**
 * Get the error message for this orphan-pattern error.
 * @return {string} An error message for this orphan-pattern error.
 * @private
 */
Blockly.ErrorItem.prototype.toMessageOrphanPattern_ = function() {
  var msg = '';
  if (this.state_ == Blockly.ErrorItem.STATE_CONNECTED_BLOCK) {
    msg = Blockly.ErrorItem.MESSAGE_PREFIX_CONNECTED_BLOCK;
    msg += 'pattern ';
  } else {
    msg = 'Pattern ';
  }
  msg += 'block must be connected to match pattern.';
  return msg;
};

/**
 * Get the error message for this orphan-typector error.
 * @return {string} An error message for this orphan-typector error.
 * @private
 */
Blockly.ErrorItem.prototype.toMessageOrphanTypeCtor_ = function() {
  var msg = '';
  if (this.state_ == Blockly.ErrorItem.STATE_CONNECTED_BLOCK) {
    msg = Blockly.ErrorItem.MESSAGE_PREFIX_CONNECTED_BLOCK;
    msg += 'type constructor ';
  } else {
    msg = 'Type constructor ';
  }
  msg += 'block must be connected to datatype declaration.';
  return msg;
};

/**
 * Get the error message for this workbench-refuse-block error.
 * @return {string} An error message for this workbench-refuse-block error.
 * @private
 */
Blockly.ErrorItem.prototype.toMessageWorkbenchRefuseBlock_ = function() {
  goog.asserts.assert(this.state_ == Blockly.ErrorCollector.STATE_NONE,
      'This error should not happen unless the error state is none.');
  return 'Only ' + this.errorElement + ' blocks are allowed to enter into ' +
      'this area.';
};
