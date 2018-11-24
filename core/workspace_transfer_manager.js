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
  return this.allowedToTransferTo_(this.pointedWorkspace_);
};

/**
 * Returns if the dragged block is allowed to transfer to the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace to check if the dragged
 *     block can transfer to.
 * @return {boolean} True if the block can transfer to the workspace.
 */
Blockly.WorkspaceTransferManager.prototype.allowedToTransferTo_ = function(
    workspace) {
  if (!workspace.options.typedVersion) {
    return false;
  }
  var parentBefore = Blockly.WorkspaceTree.parentBefore(workspace,
      this.workspace_);
  if (workspace.isMutator && parentBefore) {
    // It's not allowed to transfer blocks to a workspace of blocks' mutator
    // and its child workspaces.
    var mutators = this.topBlock_.getAllMutators();
    for (var i = 0, mutator; mutator = mutators[i]; i++) {
      var mutatorWorkspace = mutator ? mutator.getWorkspace() : null;
      if (mutatorWorkspace && mutatorWorkspace == parentBefore) {
        return false;
      }
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
  var oldBlock = this.topBlock_;

  // Starts to transfer the block's workspace, which means the block would be
  // deleted after transferring, and it would be replaced with a newly created
  // block.
  this.setStartTransferring_(oldBlock, localConnection,
      pendingTargetConnection);

  var newBlock;
  try {
    // TODO: Define a transfer event in Blockly.Events, and fire it.
    var xml = Blockly.Xml.blockToDom(oldBlock);
    newBlock = Blockly.Xml.domToBlock(xml, this.pointedWorkspace_);
    newBlock.replaceTypeExprWith(oldBlock);
  } finally {
    this.setStartTransferring_(null);
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
 * Store the block which starts to transfer to another workspace. Also record
 * two connections that would be connected to each other when the block has
 * transferred.
 * If the block is null, just clear a stored block and connections.
 * @param {Blockly.Block} block The block which starts to transfer to another
 *     workspace.
 * @param {Blockly.Connection=} opt_connection The connection that would
 *     connect to opt_pendingTargetConnection. If provided, it should belong
 *     to the block.
 * @param {Blockly.Connection=} opt_pendingTargetConnection The connection
 *     which is due to connect to the connection.
 */
Blockly.WorkspaceTransferManager.prototype.setStartTransferring_ = function(
    block, connection, pendingTargetConnection) {
  goog.asserts.assert(!connection || connection.getSourceBlock() == block);

  if (block) {
    var storedBlock = Blockly.transferring.block;
    goog.asserts.assert(!storedBlock || storedBlock == block,
        'Another blocks are currently transferring.');
    Blockly.transferring.block = block;
    Blockly.transferring.localConnection = connection ? connection : null;
    Blockly.transferring.pendingTargetConnection =
        pendingTargetConnection ? pendingTargetConnection : null;
  } else {
    Blockly.transferring.block = null;
    Blockly.transferring.localConnection = null;
    Blockly.transferring.pendingTargetConnection = null;
  }
};

/**
 * Update the pointed workspace based on the most recent move location.
 * @param {!Event} e The mouseup/touchend event.
 * @package
 */
Blockly.WorkspaceTransferManager.prototype.update = function(e) {
  var pointedWS =
      this.workspace_.detectWorkspace(e, this.availableWorkspaces_);
  this.pointedWorkspace_ = pointedWS ? pointedWS : this.mainWorkspace_;

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
    if (this.allowedToTransferTo_(ws)) {
      available.push(ws);
    }
  }
  return available;
};
