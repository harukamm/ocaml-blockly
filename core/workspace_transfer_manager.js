/**
 * @fileoverview Class that controls updates to workspace transfer during
 * drags.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

goog.provide('Blockly.WorkspaceTransferManager');

goog.require('goog.asserts');
goog.require('goog.math.Coordinate');


/**
 * Class that controls updates to workspace transfer during drags.  It is
 * primarily responsible for finding the eligible workspace to transfer during
 * a drag.
 * @param {!Blockly.BlockSvg} block The top block in the stack being dragged.
 * @constructor
 */
Blockly.WorkspaceTransferManager = function(block) {
  /**
   * The top block in the stack being dragged.
   * Does not change during a drag.
   * @type {!Blockly.Block}
   * @private
   */
  this.topBlock_ = block;

  /**
   * The workspace on which the block are being dragged.
   * Does not change during a drag.
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = block.workspace;

  /**
   * The main workspace of the block's workspace.
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.mainWorkspace_ = this.workspace_.getMainWorkspace();

  /**
   * The workspaces that the block are able to transfer to.
   * Does not change during a drag.
   * @type {!Array.<!Blockly.WorkspaceSvg>}
   * @private
   */
  this.availableWorkspaces_ = this.initAvailableWorkspaces_();

  /**
   * The workspace that this block would transfer to if released immediately.
   * Updated on every mouse move.
   * @type {Blockly.WorkspaceSvg}
   * @private
   */
  this.pointedWorkspace_ = null;

  /**
   * Type of a delete area where the block is pointed at.  It's updated on
   * every mouse move.
   * One of {@link Blockly.DELETE_AREA_TOOLBOX}, or
   * {@link Blockly.DELETE_AREA_NONE}.
   * @type {?number}
   * @private
   */
  this.deleteArea_ = null;

  this.checkTransferable_();
};

/**
 * Sever all links from this object.
 * @package
 */
Blockly.WorkspaceTransferManager.prototype.dispose = function() {
  this.topBlock_ = null;
  this.workspace_ = null;
  this.mainWorkspace_ = null;
  this.availableWorkspaces_.length = 0;
  this.pointedWorkspace_ = null;
};

/**
 * Returns the workspace pointed at by the dragged block based on the most
 * recent move event.
 * @return {Blockly.Workspace} The pointed workspace.
 */
Blockly.WorkspaceTransferManager.prototype.getPointedWorkspace = function() {
  return this.pointedWorkspace_;
};

/**
 * Returns whether the pointed workspace is in a flyout.
 * @return {boolean} true if the pointed workspace is not null and it's in a
 *     flyout, false otherwise.
 */
Blockly.WorkspaceTransferManager.prototype.isFlyoutPointed = function() {
  return !!this.pointedWorkspace_ && this.pointedWorkspace_.isFlyout;
};

/**
 * Checks whether the block are able to transfer workspace and throws an
 * exception if it is not.
 * @private
 */
Blockly.WorkspaceTransferManager.prototype.checkTransferable_ = function() {
  goog.asserts.assert(this.topBlock_.isTransferable());
};

/**
 * Is the most recent mouse event over a delete area?
 * @return {?number} Null if not over a delete area, or an enum representing
 *     which delete area the event is over.
 */
Blockly.WorkspaceTransferManager.prototype.isDeleteArea = function() {
  return this.deleteArea_;
};

/**
 * Return whether the block would transfer to another workspace if dropped
 * immediately, based on information from the most recent move event.
 * @return {boolean} true if the block would transfer if dropped immediately.
 * @package
 */
Blockly.WorkspaceTransferManager.prototype.wouldTransfer = function() {
  if (!this.pointedWorkspace_ || this.isFlyoutPointed() ||
      this.pointedWorkspace_ == this.workspace_) {
    return false;
  }
  // Only root blocks are allowed to start to transfer.
  if (this.topBlock_.getParent()) {
    return false;
  }
  // TODO(harukam): The following check must be done for each nested blocks
  // inside this.topBlock_, not only the block itself.
  var mutator = this.topBlock_.mutator;
  var mutatorWorkspace = mutator ? mutator.getWorkspace() : null;
  if (mutatorWorkspace && this.pointedWorkspace_.isMutator) {
    // It's not allowed to transfer blocks to a workspace of blocks' mutator
    // and its child workspaces.
    if (Blockly.WorkspaceTree.isDescendant(this.pointedWorkspace_,
        mutatorWorkspace)) {
      return false;
    }
  }
  return true;
};

/**
 * Returns the block newly created in the pointed workspace, so that the old
 * block transfer its workspace. The old one will be disposed of because the
 * new block takes the place of it. Throws an error if the dragged block would
 * not transfer.
 * This should be called at the end of a drag.
 * @param {Blockly.Connection} localConnection The connection of the dragged
 *     block that is due to connect to pendingTargetConnection.
 * @param {Blockly.Connection} pendingTargetConnection The connection the
 *     block is determined to connect to. If null, localConnection is also
 *     null.
 * @param {Function=} opt_onReplace An optional function to be called before
 *     dispose of the old block.
 * @return {Block.Block} The block positioned in the same location with the
 *     current block.
 * @package
 */
Blockly.WorkspaceTransferManager.prototype.placeNewBlock = function(
    localConnection, pendingTargetConnection, opt_onReplace) {
  if (!this.wouldTransfer()) {
    throw 'The block would not transfer workspace.';
  }
  goog.asserts.assert(!Blockly.transferring, 'Another blocks are ' +
      'currently transferring.');

  var oldBlock = this.topBlock_;

  // Starts to transfer the block's workspace, which means the block would be
  // deleted after transferring, and it would be replaced with a newly created
  // block.
  Blockly.transferring = oldBlock;

  this.storePendingTarget_(oldBlock, localConnection, pendingTargetConnection);

  var newBlock;
  try {
    // TODO: Define a transfer event in Blockly.Events, and fire it.
    var xml = Blockly.Xml.blockToDom(oldBlock);
    newBlock = Blockly.Xml.domToBlock(xml, this.pointedWorkspace_);
    newBlock.replaceTypeExprWith(oldBlock);
  } finally {
    Blockly.transferring = null;
    // Never forget to clear the pending target connection if it's stored.
    this.storePendingTarget_(oldBlock, localConnection, null);
    this.storePendingTarget_(newBlock, localConnection, null);
  }

  // Aline this block according to the new surface.
  var localXY = oldBlock.getRelativeToSurfaceXY();
  var surfaceXY = this.workspace_.getRelativeToWorkspaceXY(this.pointedWorkspace_);
  var position = goog.math.Coordinate.sum(localXY, surfaceXY);
  newBlock.moveBy(position.x, position.y);

  if (goog.isFunction(opt_onReplace)) {
    opt_onReplace(newBlock);
  }
  oldBlock.dispose();

  // Expect that there is nothing for this manager to do because this function
  // is called at the end of a drag, but change the properties just in case.
  this.topBlock_ = newBlock;
  this.workspace_ = newBlock.workspace;
  this.mainWorkspace_ = this.workspace_.getMainWorkspace(this.workspace_);
  this.availableWorkspaces_.length = 0;
  this.pointedWorkspace_ = null;

  return newBlock;
};

/**
 * Helper function to store the waiting target connection to the given
 * block's connection if it's found necessary.
 * @param {!Blockly.Block} block The block which has a connection to store.
 * @param {Blockly.Connection} connection The connection whose equivalent
 *     connection on the given block to store. If null, does nothing.
 * @param {Blockly.Connection} pendingTargetConnection The connection which is
 *     waiting for connecting to the connection. If null, clear the stored
 *     pending connection.
 */
Blockly.WorkspaceTransferManager.prototype.storePendingTarget_ = function(
    block, connection, pendingTargetConnection) {
  if (!connection) {
    return;
  }
  var block = connection.getSourceBlock();
  var equivalent = block.getEquivalentConnection(connection);
  if (equivalent !== block.outputConnection) {
    return;
  }
  if (!pendingTargetConnection) {
    connection.storePendingTargetConnection(null);
  } else if (pendingTargetConnection.isSuperior()) {
    connection.storePendingTargetConnection(pendingTargetConnection);
  }
};

/**
 * Update the pointed workspace based on the most recent move location.
 * @param {!Event} e The mouseup/touchend event.
 * @package
 */
Blockly.WorkspaceTransferManager.prototype.update = function(e) {
  this.pointedWorkspace_ = this.workspace_.detectWorkspace(e);

  // Other delete areas of workspaces the block are able to transfer to also
  // affect the block.
  var isMainDeleteArea = this.mainWorkspace_.isDeleteArea(e);
  if (isMainDeleteArea) {
    // The block should be deleted if it's inside the deletion are of the main
    // workspace (toolbox/trashcan).
    this.deleteArea_ = isMainDeleteArea;
  } else {
    // The block is in the deletion are of toolbox if it has pointed at a
    // flyout.
    this.deleteArea_ = this.isFlyoutPointed() ?
        Blockly.DELETE_AREA_TOOLBOX : null;
  }
};

/**
 * Populate the list of available workspaces for the block to transfer to.
 * @return {!Array.<!Blockly.WorkspaceSvg>} a list of available workspaces.
 * @private
 */
Blockly.WorkspaceTransferManager.prototype.initAvailableWorkspaces_ = function() {
  var familyWs = Blockly.WorkspaceTree.getFamily(this.workspace_);
  var available = [];
  for (var i = 0, ws; ws = familyWs[i]; i++) {
    available.push(ws);
  }
  return available;
};
