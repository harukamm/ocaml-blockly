/**
 * @fileoverview Class managing errors during a block drag.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

goog.provide('Blockly.DiagnosisManager');
goog.provide('Blockly.ErrorCollector');

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
};
