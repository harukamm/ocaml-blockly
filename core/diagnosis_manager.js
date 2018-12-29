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
 * Class to manage reasons why a dragged block is not allowed to connect to
 * the closest connection, why it's dropped in the current position, or etc
 * during a block drag.
 * @constructor
 */
Blockly.DiagnosisManager = function() {
};

/**
 * Dispose of the manager.
 */
Blockly.DiagnosisManager.prototype.dispose = function() {
};

/**
 * Class to collect errors.
 * @constructor
 */
Blockly.ErrorCollector = function() {
  /** @type {!Array.<!Blockly.ErrorItem>} */
  this.errors_ = [];
};

/**
 * Returns whether the collector doesn't hold any error.
 */
Blockly.ErrorCollector.prototype.isEmpty = function() {
  return this.errors_.length == 0;
};

/**
 * @param {!Blockly.ErrorItem} item
 * @private
 */
Blockly.ErrorCollector.prototype.addItem_ = function(item) {
  this.errors_.push(item);
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
 * @constructor
 */
Blockly.ErrorItem = function(label, errorElement, errorTarget) {
  this.label = label;
  this.errorElement = errorElement;
  this.errorTarget = errorTarget;
};

Blockly.ErrorItem.UNBOUND_VARIABLE = 1;
