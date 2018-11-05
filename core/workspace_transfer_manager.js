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
  var mutator = this.topBlock_.mutator;
  var mutatorWorkspace = mutator ? mutator.workspace_ : null;
  if (mutatorWorkspace && this.pointedWorkspace_.isMutator) {
    // It's not allowed to transfer blocks to a workspace of blocks' mutator
    // and its child workspaces.
    if (Blockly.WorkspaceTree.isChildOf(
        this.pointedWorkspace_, mutatorWorkspace)) {
      return false;
    }
  }
  return true;
};

/**
 * Returns the block newly created in the pointed workspace. Throws an error if
 * the block would not transfer.
 * This should be called at the end of a drag.
 * @return {Block.Block} The block positioned in the same location with the
 *     current block.
 * @package
 */
Blockly.WorkspaceTransferManager.prototype.placeNewBlock = function() {
  if (!this.wouldTransfer()) {
    throw 'The block would not transfer workspace.';
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.setGroup(true);
    // Fire a create event for the new workspace.
    var event = new Blockly.Events.Create(this.topBlock_);
    event.workspaceId = this.pointedWorkspace_.id;
    Blockly.Events.fire(event);
  }
  var xml = Blockly.Xml.blockToDom(this.topBlock_);
  var block = Blockly.Xml.domToBlock(xml, this.pointedWorkspace_);
  // TODO: Position the new block correctly.
  return block;
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
