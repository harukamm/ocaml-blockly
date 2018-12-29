/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Class that controls updates to connections during drags.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.DraggedConnectionManager');

goog.require('Blockly.BlockAnimations');
goog.require('Blockly.ConnectionDB.errorReason');
goog.require('Blockly.RenderedConnection');

goog.require('goog.math.Coordinate');


/**
 * Class that controls updates to connections during drags.  It is primarily
 * responsible for finding the closest eligible connection and highlighting or
 * unhiglighting it as needed during a drag.
 * @param {!Blockly.BlockSvg} block The top block in the stack being dragged.
 * @constructor
 */
Blockly.DraggedConnectionManager = function(block) {
  Blockly.selected = block;

  /**
   * The top block in the stack being dragged.
   * @type {!Blockly.Block}
   * @private
   */
  this.topBlock_ = block;

  /**
   * The workspace on which these connections are being dragged.
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = block.workspace;

  /**
   * The connections on the dragging blocks that are available to connect to
   * other blocks.  This includes all open connections on the top block, as well
   * as the last connection on the block stack.
   * @type {!Array.<!Blockly.RenderedConnection>}
   * @private
   */
  this.availableConnections_ = this.initAvailableConnections_();

  /**
   * The connection that this block would connect to if released immediately.
   * Updated on every mouse move.
   * @type {Blockly.RenderedConnection}
   * @private
   */
  this.closestConnection_ = null;

  /**
   * The connection that would connect to this.closestConnection_ if this block
   * were released immediately.
   * Updated on every mouse move.
   * @type {Blockly.RenderedConnection}
   * @private
   */
  this.localConnection_ = null;

  /**
   * The distance between this.closestConnection_ and this.localConnection_,
   * in workspace units.
   * Updated on every mouse move.
   * @type {number}
   * @private
   */
  this.radiusConnection_ = 0;

  /**
   * The reason why the closest connection is incompatible.
   * @type {Blockly.ConnectionDB.errorReason}
   * @private
   */
  this.closestError_ = null;

  /**
   * Whether the block would be deleted if it were dropped immediately.
   * Updated on every mouse move.
   * @type {boolean}
   * @private
   */
  this.wouldDeleteBlock_ = false;
};

/**
 * Sever all links from this object.
 * @package
 */
Blockly.DraggedConnectionManager.prototype.dispose = function() {
  this.topBlock_ = null;
  this.workspace_ = null;
  this.availableConnections_.length = 0;
  this.closestConnection_ = null;
  this.localConnection_ = null;
};

/**
 * Return whether the block would be deleted if dropped immediately, based on
 * information from the most recent move event.
 * @return {boolean} true if the block would be deleted if dropped immediately.
 * @package
 */
Blockly.DraggedConnectionManager.prototype.wouldDeleteBlock = function() {
  return this.wouldDeleteBlock_;
};

/**
 * Return the closest connection based on the most recent move event.
 * @return {Blockly.Connection} The closest connection or null.
 */
Blockly.DraggedConnectionManager.prototype.closestConnection = function() {
  return this.closestConnection_ || null;
};

/**
 * Return the connection that would connect to the closest connection.
 * @return {Blockly.Connection} The connection.
 */
Blockly.DraggedConnectionManager.prototype.localConnection = function() {
  return this.localConnection_ || null;
};

/**
 * Return the error based on the most recent move event if any compatible
 * connection near to the dragged block is not found.
 * @return {Blockly.ConnectionDB.errorReason}
 */
Blockly.DraggedConnectionManager.prototype.closestError = function() {
  if (this.closestConnection_ || !this.closestError_) {
    return null;
  }
  return this.closestError_;
};

/**
 * Return whether the block would be connected if dropped immediately, based on
 * information from the most recent move event.
 * @return {boolean} true if the block would be connected if dropped immediately.
 * @package
 */
Blockly.DraggedConnectionManager.prototype.wouldConnectBlock = function() {
  if (!this.closestConnection_) {
    return false;
  }
  // The dragged block cannot connect with block on the different workspace
  // *immediately*. The dragged one should transfer to the workspace before that.
  var currentWorkspace = this.topBlock_.workspace;
  var targetWorkspace = this.closestConnection_.getSourceBlock().workspace;
  return currentWorkspace == targetWorkspace;
};

/**
 * Connect to the closest connection and render the results.
 * This should be called at the end of a drag.
 * @package
 */
Blockly.DraggedConnectionManager.prototype.applyConnections = function() {
  if (this.closestConnection_) {
    // Connect two blocks together.
    this.localConnection_.connect(this.closestConnection_);
    if (this.topBlock_.rendered) {
      // Trigger a connection animation.
      // Determine which connection is inferior (lower in the source stack).
      var inferiorConnection = this.localConnection_.isSuperior() ?
          this.closestConnection_ : this.localConnection_;
      Blockly.BlockAnimations.connectionUiEffect(
          inferiorConnection.getSourceBlock());
      // Bring the just-edited stack to the front.
      var rootBlock = this.topBlock_.getRootBlock();
      rootBlock.bringToFront();
    }
    this.removeHighlighting_();
  }
};

/**
 * Update highlighted connections based on the most recent move location.
 * @param {!goog.math.Coordinate} dxy Position relative to drag start,
 *     in workspace units.
 * @param {?number} deleteArea One of {@link Blockly.DELETE_AREA_TRASH},
 *     {@link Blockly.DELETE_AREA_TOOLBOX}, or {@link Blockly.DELETE_AREA_NONE}.
 * @param {Blockly.WorkspaceSvg=} opt_targetWorkspace Workspace to search for
 *     the closest connection.
 * @package
 */
Blockly.DraggedConnectionManager.prototype.update = function(dxy, deleteArea,
    opt_targetWorkspace) {
  var oldClosestConnection = this.closestConnection_;
  var closestConnectionChanged = this.updateClosest_(dxy, opt_targetWorkspace);

  if (closestConnectionChanged && oldClosestConnection) {
    oldClosestConnection.unhighlight();
  }

  // Prefer connecting over dropping into the trash can, but prefer dragging to
  // the toolbox over connecting to other blocks.
  var wouldConnect = !!this.closestConnection_ &&
      deleteArea != Blockly.DELETE_AREA_TOOLBOX;
  var wouldDelete = !!deleteArea && !this.topBlock_.getParent() &&
      this.topBlock_.isDeletable();
  this.wouldDeleteBlock_ = wouldDelete && !wouldConnect;

  // Get rid of highlighting so we don't sent mixed messages.
  if (wouldDelete && this.closestConnection_) {
    this.closestConnection_.unhighlight();
    this.closestConnection_ = null;
  }

  if (!this.wouldDeleteBlock_ && closestConnectionChanged &&
      this.closestConnection_) {
    this.addHighlighting_();
  }
};

/**
 * Replace the block begin dragged with another block. Suppose that the new
 * blocks are in the exactly same position with the current block.
 * @param {!Block.Block} newBlock The new block being dragged.
 */
Blockly.DraggedConnectionManager.prototype.replaceBlock = function(newBlock) {
  var oldBlock = this.topBlock_;
  if (oldBlock == newBlock) {
    return;
  }
  if (oldBlock.type !== newBlock.type && !oldBlock.isPairPattern(newBlock)) {
    throw 'Can not replace the dragged block with a block of another type.';
  }
  // Find a connection in the new block equivalent to the current
  // this.localConnection_ in the old block.
  if (this.localConnection_) {
    var newConnection = newBlock.getEquivalentConnection(
        this.localConnection_);
    if (!newConnection) {
      throw 'Equivalent connection is not found.';
    }
    this.localConnection_ = newConnection;
  }
  this.topBlock_ = newBlock;
  this.workspace_ = this.topBlock_.workspace;
  this.availableConnections_ = this.initAvailableConnections_();
};

/**
 * Remove highlighting from the currently highlighted connection, if it exists.
 * @private
 */
Blockly.DraggedConnectionManager.prototype.removeHighlighting_ = function() {
  if (this.closestConnection_) {
    this.closestConnection_.unhighlight();
  }
};

/**
 * Add highlighting to the closest connection, if it exists.
 * @private
 */
Blockly.DraggedConnectionManager.prototype.addHighlighting_ = function() {
  if (this.closestConnection_) {
    this.closestConnection_.highlight();
  }
};

/**
 * Populate the list of available connections on this block stack.
 * @return {!Array.<!Blockly.RenderedConnection>} a list of available
 *     connections.
 * @private
 */
Blockly.DraggedConnectionManager.prototype.initAvailableConnections_ = function() {
  var available = this.topBlock_.getConnections_(false);
  // Also check the last connection on this stack
  var lastOnStack = this.topBlock_.lastConnectionInStack();
  if (lastOnStack && lastOnStack != this.topBlock_.nextConnection) {
    available.push(lastOnStack);
  }
  return available;
};

/**
 * Find the new closest connection, and update internal state in response.
 * @param {!goog.math.Coordinate} dxy Position relative to the drag start,
 *     in workspace units.
 * @param {Blockly.WorkspaceSvg=} opt_targetWorkspace Workspace to search for
 *     the closest connection.
 * @return {boolean} Whether the closest connection has changed.
 * @private
 */
Blockly.DraggedConnectionManager.prototype.updateClosest_ = function(dxy,
    opt_targetWorkspace) {
  var oldClosestConnection = this.closestConnection_;

  this.closestConnection_ = null;
  this.localConnection_ = null;
  this.radiusConnection_ = Blockly.SNAP_RADIUS;

  this.closestError_ = null;
  var errorRadius = Blockly.SNAP_RADIUS;

  for (var i = 0; i < this.availableConnections_.length; i++) {
    var myConnection = this.availableConnections_[i];
    var neighbour = myConnection.closest(this.radiusConnection_, dxy,
        opt_targetWorkspace, errorRadius);
    if (neighbour.connection) {
      this.closestConnection_ = neighbour.connection;
      this.localConnection_ = myConnection;
      this.radiusConnection_ = neighbour.radius;
    }
    if (neighbour.reason) {
      this.closestError_ = neighbour.reason;
      errorRadius = this.closestError_.radius;
    }
  }
  return oldClosestConnection != this.closestConnection_;
};
