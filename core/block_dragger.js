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
 * @fileoverview Methods for dragging a block visually.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.BlockDragger');

goog.require('Blockly.BlockAnimations');
goog.require('Blockly.DiagnosisManager');
goog.require('Blockly.DraggedConnectionManager');
goog.require('Blockly.WorkspaceTransferManager');
goog.require('Blockly.Events.BlockMove');

goog.require('goog.math.Coordinate');
goog.require('goog.asserts');


/**
 * Class for a block dragger.  It moves blocks around the workspace when they
 * are being dragged by a mouse or touch.
 * @param {!Blockly.BlockSvg} block The block to drag.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to drag on.
 * @constructor
 */
Blockly.BlockDragger = function(block, workspace) {
  /**
   * The top block in the stack that is being dragged.
   * @type {!Blockly.BlockSvg}
   * @private
   */
  this.draggingBlock_ = block;

  /**
   * The workspace on which the block is being dragged.
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * The main workspace of the dragging block's workspace.
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.mainWorkspace_ = this.draggingBlock_.workspace.getMainWorkspace();

  /**
   * Object that keeps track of which workspace the dragged block would
   * transfer to.
   * @type {Blockly.WorkspaceTransferManager}
   * @private
   */
  this.workspaceTransferManager_ = null;
  if (this.draggingBlock_.isTransferable()) {
    this.workspaceTransferManager_ = new Blockly.WorkspaceTransferManager(
        this.draggingBlock_);
  }

  /**
   * Object that collect reasons why the dragged block can not connect to the
   * closest connection and so on.
   * @type {Blockly.DiagnosisManager}
   * @private
   */
  this.diagnosisManager_ = null;
  if (Blockly.Block.isTypedBlock(this.draggingBlock_)) {
    this.diagnosisManager_ = new Blockly.DiagnosisManager();
  }

  /**
   * Object that keeps track of connections on dragged blocks.
   * @type {!Blockly.DraggedConnectionManager}
   * @private
   */
  this.draggedConnectionManager_ = new Blockly.DraggedConnectionManager(
      this.draggingBlock_);

  /**
   * Which delete area the mouse pointer is over, if any.
   * One of {@link Blockly.DELETE_AREA_TRASH},
   * {@link Blockly.DELETE_AREA_TOOLBOX}, or {@link Blockly.DELETE_AREA_NONE}.
   * @type {?number}
   * @private
   */
  this.deleteArea_ = null;

  /**
   * Whether the block would be deleted if dropped immediately.
   * @type {boolean}
   * @private
   */
  this.wouldDeleteBlock_ = false;

  /**
   * Whether the block's variables would correctly be resolved and allowed to
   * be dropped immediately. If false and the block is dropped right now,
   * dragging will be cancelled.
   * @type {boolean}
   * @private
   */
  this.wouldDropAllowed_ = true;

  /**
   * Whether the block is dragged from a flyout.
   * @type {boolean}
   * @private
   */
  this.isDraggingFromFlyout_ = false;

  /**
   * The target connection of the block before start of dragging. Null if the
   * dragging block is not connected to any block.
   * @type {Blockly.Connection}
   * @private
   */
  this.startTargetConnection_ = null;

  /**
   * The location of the top left corner of the dragging block just before the
   * the drag in workspace coordinates.
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.startXY_ = this.draggingBlock_.getRelativeToSurfaceXY();

  /**
   * The location of the top left corner of the dragging block at the beginning
   * of the drag in coordinates of workspace whose drag surface is being used.
   * The value is same with startXY_ unless the dragging block is transferable
   * between workspace.
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.dragStartXY_ = this.getDragStartXY();

  /**
   * The block's offset coordinate relative to the original location.
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.blockOffsetXY_ = new goog.math.Coordinate(0, 0);

  /**
   * A list of all of the icons (comment, warning, and mutator) that are
   * on this block and its descendants.  Moving an icon moves the bubble that
   * extends from it if that bubble is open.
   * @type {Array.<!Object>}
   * @private
   */
  this.dragIconData_ = Blockly.BlockDragger.initIconData_(block);
};

/**
 * Return the coordinates of the top-left corner of the dragging block
 * relative to workspace of surface.
 * @return {!goog.math.Coordinate} Object with .x and .y properties in
 *     coordinates of workspace whose surface is being used.
 */
Blockly.BlockDragger.prototype.getDragStartXY = function() {
  if (!this.workspaceTransferManager_) {
    return this.startXY_;
  }
  // The dragging block will use the main workspace's surface.
  // Include the translation of the dragging block's workspace to the main
  // workspace.
  var xy = this.draggingBlock_.workspace.getRelativeToWorkspaceXY(
      this.mainWorkspace_);
  return goog.math.Coordinate.sum(this.startXY_, xy);
};

/**
 * Sever all links from this object.
 * @package
 */
Blockly.BlockDragger.prototype.dispose = function() {
  this.draggingBlock_ = null;
  this.workspace_ = null;
  this.startWorkspace_ = null;
  this.dragIconData_.length = 0;

  if (this.workspaceTransferManager_) {
    this.workspaceTransferManager_.dispose();
    this.workspaceTransferManager_ = null;
  }
  if (this.diagnosisManager_) {
    this.diagnosisManager_.dispose();
    this.diagnosisManager_ = null;
  }
  if (this.draggedConnectionManager_) {
    this.draggedConnectionManager_.dispose();
    this.draggedConnectionManager_ = null;
  }
};

/**
 * Make a list of all of the icons (comment, warning, and mutator) that are
 * on this block and its descendants.  Moving an icon moves the bubble that
 * extends from it if that bubble is open.
 * @param {!Blockly.BlockSvg} block The root block that is being dragged.
 * @return {!Array.<!Object>} The list of all icons and their locations.
 * @private
 */
Blockly.BlockDragger.initIconData_ = function(block) {
  // Build a list of icons that need to be moved and where they started.
  var dragIconData = [];
  var descendants = block.getDescendants(false);
  for (var i = 0, descendant; descendant = descendants[i]; i++) {
    var icons = descendant.getIcons();
    for (var j = 0; j < icons.length; j++) {
      var data = {
        // goog.math.Coordinate with x and y properties (workspace coordinates).
        location: icons[j].getIconLocation(),
        // Blockly.Icon
        icon: icons[j]
      };
      dragIconData.push(data);
    }
  }
  return dragIconData;
};

/**
 * Start dragging a block.  This includes moving it to the drag surface.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @param {boolean} healStack whether or not to heal the stack after disconnecting
 * @param {boolean} fromFlyout Whether the block is dragged from a flyout. If
 *     true and the block drag should be canceled, the block will be deleted.
 * @package
 */
Blockly.BlockDragger.prototype.startBlockDrag = function(currentDragDeltaXY,
    healStack, fromFlyout) {
  if (!Blockly.Events.getGroup()) {
    Blockly.Events.setGroup(true);
  }

  this.workspace_.setResizesEnabled(false);
  Blockly.BlockAnimations.disconnectUiStop();

  this.isDraggingFromFlyout_ = fromFlyout === true;

  if (this.draggingBlock_.getParent() ||
      (healStack && this.draggingBlock_.nextConnection &&
      this.draggingBlock_.nextConnection.targetBlock())) {
    this.storeStartTargetConnection_();

    var oldHeight = this.draggingBlock_.height;
    this.draggingBlock_.unplug(healStack);
    this.setBlockOffsetXY_(oldHeight, this.draggingBlock_.height);

    if (this.draggingBlock_.isInMutator) {
      // If the block exists in a mutator, the mutator position may change by
      // disconnecting blocks. Update the start position.
      var oldXY = this.dragStartXY_;
      var newXY = this.getDragStartXY();

      // Move the block based on updates of the mutator workspace's position.
      this.blockOffsetXY_.x += oldXY.x - newXY.x;
      this.blockOffsetXY_.y += oldXY.y - newXY.y;

      this.dragStartXY_ = newXY;
    }
    var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
    delta = goog.math.Coordinate.sum(delta, this.blockOffsetXY_);
    var newLoc = goog.math.Coordinate.sum(this.dragStartXY_, delta);

    this.draggingBlock_.translate(newLoc.x, newLoc.y);
    Blockly.BlockAnimations.disconnectUiEffect(this.draggingBlock_);
  }
  this.draggingBlock_.setDragging(true);
  // For future consideration: we may be able to put moveToDragSurface inside
  // the block dragger, which would also let the block not track the block drag
  // surface.
  this.draggingBlock_.moveToDragSurface_();

  this.setToolboxCursorStyle_(true);
};

/**
 * Execute a step of block dragging, based on the given event.  Update the
 * display accordingly.
 * @param {!Event} e The most recent move event.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 */
Blockly.BlockDragger.prototype.dragBlock = function(e, currentDragDeltaXY) {
  var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
  delta = goog.math.Coordinate.sum(delta, this.blockOffsetXY_);
  var newLoc = goog.math.Coordinate.sum(this.dragStartXY_, delta);

  this.draggingBlock_.moveDuringDrag(newLoc);
  this.dragIcons_(delta);

  var targetWorkspace;
  if (this.workspaceTransferManager_) {
    this.workspaceTransferManager_.update(e);
    this.deleteArea_ = this.workspaceTransferManager_.isDeleteArea();
    if (!this.workspaceTransferManager_.isFlyoutPointed()) {
      // Enable the block to connect to blocks in the pointed workspace.
      targetWorkspace = this.workspaceTransferManager_.getPointedWorkspace();
    }
  } else {
    this.deleteArea_ = this.workspace_.isDeleteArea(e);
  }
  this.draggedConnectionManager_.update(delta, this.deleteArea_,
      targetWorkspace);

  this.updateReferenceStateDuringBlockDrag_(targetWorkspace);
  this.updateCursorDuringBlockDrag_();
};

/**
 * Finish a block drag and put the block back on the workspace.
 * @param {!Event} e The mouseup/touchend event.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 */
Blockly.BlockDragger.prototype.endBlockDrag = function(e, currentDragDeltaXY) {
  // Make sure internal state is fresh.
  this.dragBlock(e, currentDragDeltaXY);
  this.dragIconData_ = [];

  Blockly.BlockAnimations.disconnectUiStop();

  if (this.wouldDropAllowed_ || this.wouldDeleteBlock_) {
    var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
    delta = goog.math.Coordinate.sum(delta, this.blockOffsetXY_);
    var newLoc = goog.math.Coordinate.sum(this.startXY_, delta);
  } else {
    var newLoc = this.startXY_;
  }
  this.draggingBlock_.moveOffDragSurface_(newLoc);

  var deleted = this.maybeDeleteBlock_();
  if (!deleted) {
    // These are expensive and don't need to be done if we're deleting.
    this.draggingBlock_.setInvalidStyle(false);

    if (this.wouldDropAllowed_) {
      this.draggingBlock_.moveConnections_(delta.x, delta.y);
      this.draggingBlock_.setDragging(false);
      this.fireMoveEvent_();
      this.transferAndConnect_();
      this.draggingBlock_.scheduleSnapAndBump();
    } else {
      this.draggingBlock_.setDragging(false);
      this.restoreStartTargetConnection_();
      this.cancelFiredEvents_();
      this.draggingBlock_.render();
    }
  }
  this.workspace_.setResizesEnabled(true);

  this.setToolboxCursorStyle_(false);
  Blockly.Events.setGroup(false);
};

/**
 * Fire a move event at the end of a block drag.
 * @private
 */
Blockly.BlockDragger.prototype.fireMoveEvent_ = function() {
  if (Blockly.Events.isEnabled()) {
    var event = new Blockly.Events.BlockMove(this.draggingBlock_);
    event.oldCoordinate = this.startXY_;
    event.recordNew();
    Blockly.Events.fire(event);
  }
};

/**
 * Let the dragged block transfer to another workspace if it's needed, and
 * connect to the closest connection.
 * @private
 */
Blockly.BlockDragger.prototype.transferAndConnect_ = function() {
  var execTransferring = false;
  if (this.workspaceTransferManager_ &&
      this.workspaceTransferManager_.wouldTransfer()) {
    var manager = this.draggedConnectionManager_;
    var local = manager.localConnection();
    var closest = manager.closestConnection();
    var replaceCallback = function(newBlock) {
        this.draggedConnectionManager_.replaceBlock(newBlock);
        this.draggingBlock_ = newBlock;
    }
    this.workspaceTransferManager_.placeNewBlock(
        local, closest, replaceCallback.bind(this));
    execTransferring = true;
  }
  if (this.draggedConnectionManager_.wouldConnectBlock()) {
    // Applying connections rerenders type changed blocks on related
    // workspaces.
    this.draggedConnectionManager_.applyConnections();
  } else if (execTransferring) {
    // If block is transferred to another workspace, type-exprs on the new
    // blocks are updated because of type replacement. Descendants blocks
    // should be re-rendered.
    // e.g.) let a = <> in a + <>
    this.draggingBlock_.renderAll();
  } else {
    this.draggingBlock_.render();
  }
};

/**
 * Store the target connection of the block before start of dragging.
 */
Blockly.BlockDragger.prototype.storeStartTargetConnection_ = function() {
  var connection = null;
  if (this.draggingBlock_.outputConnection) {
    connection = this.draggingBlock_.outputConnection;
  } else if (this.draggingBlock_.previousConnection) {
    connection = this.draggingBlock_.previousConnection;
  }

  if (connection && connection.isConnected()) {
    this.startTargetConnection_ = connection.targetConnection;
  }
};

/**
 * Restore the target connection which the block has been connected to before
 * start of a block drag.
 */
Blockly.BlockDragger.prototype.restoreStartTargetConnection_ = function() {
  if (!this.startTargetConnection_) {
    return;
  }
  var connection = null;
  if (this.draggingBlock_.outputConnection) {
    connection = this.draggingBlock_.outputConnection;
    if (connection.isConnected()) {
      throw 'The ouput connection is already connected.';
    }
  } else if (this.draggingBlock_.previousConnection) {
    connection = this.draggingBlock_.previousConnection;
  }

  if (connection) {
    Blockly.Events.disable();
    try {
      connection.connect(this.startTargetConnection_);
    } finally {
      Blockly.Events.enable();
    }
  }
};

/**
 * Cancel all events of the current group at the end of a block drag.
 */
Blockly.BlockDragger.prototype.cancelFiredEvents_ = function() {
  if (this.wouldDropAllowed_) {
    return;
  }
  // One of the following events might have been fired.
  // 1. Block create event if the block is dragged from a flyout.
  // 2. Move event if the block is disconnected from some blocks at the start
  //    start of drag.
  var group = Blockly.Events.getGroup();
  this.draggingBlock_.workspace.removeLatestEvents(group);
};

/**
 * Shut the trash can and, if necessary, delete the dragging block.
 * Should be called at the end of a block drag.
 * @return {boolean} whether the block was deleted.
 * @private
 */
Blockly.BlockDragger.prototype.maybeDeleteBlock_ = function() {
  var trashcan = this.workspace_.trashcan;

  if (this.wouldDeleteBlock_) {
    if (trashcan) {
      setTimeout(trashcan.close.bind(trashcan), 100);
    }
    var toCancelDrag = !this.wouldDropAllowed_;
    if (toCancelDrag) {
      Blockly.Events.disable();
    }
    try {
      // Fire a move event, so we know where to go back to for an undo.
      this.fireMoveEvent_();
      this.draggingBlock_.dispose(false, true);
    } finally {
      if (toCancelDrag) {
        Blockly.Events.enable();
      }
    }
  } else if (trashcan) {
    // Make sure the trash can is closed.
    trashcan.close();
  }
  return this.wouldDeleteBlock_;
};

/**
 * Update the style of block depending on whether variables inside the dragging
 * block can be resolved in the context of the pointed workspace.
 * @param {Blockly.Workspace} targetWorkspace The workspace where the dragging
 *     block would transfer if it's dropped immediately.
 */
Blockly.BlockDragger.prototype.updateReferenceStateDuringBlockDrag_ =
    function(targetWorkspace) {
  var resolved = true;
  var wouldBeOrphan = !this.draggedConnectionManager_.wouldDeleteBlock() &&
      !this.draggedConnectionManager_.closestConnection();
  if (wouldBeOrphan && targetWorkspace) {
    // If the dragging block has found the closest connection, it means that
    // all of references on the block are bound in their context by connecting
    // with it. Otherwise check if they can be bound in the workspace's context.
    if (!this.draggingBlock_.resolveReference(null, false, targetWorkspace)) {
      resolved = false;
    }
    // Pattern block can not be an orphan.
    if (this.draggingBlock_.isPattern()) {
      resolved = false;
    }
  }

  if (this.wouldDropAllowed_ !== resolved) {
    this.wouldDropAllowed_ = resolved;
    this.draggingBlock_.setInvalidStyle(!resolved);
  }
};

/**
 * Update the cursor (and possibly the trash can lid) to reflect whether the
 * dragging block would be deleted if released immediately.
 * @private
 */
Blockly.BlockDragger.prototype.updateCursorDuringBlockDrag_ = function() {
  this.wouldDeleteBlock_ = this.draggedConnectionManager_.wouldDeleteBlock();

  if (!this.wouldDropAllowed_ && this.isDraggingFromFlyout_) {
    // If the block is dragged from a flyout and it is currently in an invalid
    // state, it would be deleted.
    this.wouldDeleteBlock_ = true;
  }

  var trashcan = this.workspace_.trashcan;
  if (this.wouldDeleteBlock_) {
    this.draggingBlock_.setDeleteStyle(true);
    if (this.deleteArea_ == Blockly.DELETE_AREA_TRASH && trashcan) {
      trashcan.setOpen_(true);
    }
  } else {
    this.draggingBlock_.setDeleteStyle(false);
    if (trashcan) {
      trashcan.setOpen_(false);
    }
  }
};

/**
 * Toggle the cursor effect over toolboxes which affect the dragging block by
 * adding or removing a class.
 * @param {boolean} enable True if the cursor effect should be enabled, false
 *   otherwise.
 */
Blockly.BlockDragger.prototype.setToolboxCursorStyle_ = function(enable) {
  var workspaceList;
  if (this.workspaceTransferManager_) {
    // No only toolbox of this workspace but also that of other related
    // workspace affect the block.
    workspaceList = Blockly.WorkspaceTree.getFamily(this.workspace_);
  } else {
    // Only toolbox of this workspace affect the block.
    workspaceList = [this.workspace_];
  }
  for (var i = 0, ws; ws = workspaceList[i]; i++) {
    var toolbox = ws.getToolbox();
    if (toolbox) {
      var style = this.draggingBlock_.isDeletable() ? 'blocklyToolboxDelete' :
          'blocklyToolboxGrab';
      if (enable) {
        toolbox.addStyle(style);
      } else {
        toolbox.removeStyle(style);
      }
    }
  }
};

/**
 * Calculate the block's offset coordinate relative to its original location
 * in order to move the block to under the mouse pointer.
 * When a block is unplugged, it may become shorter in height and the mouse
 * pointer can be outside the block. For such cases, this function moves the
 * block to under the mouse pointer.
 * @param {number} oldHeight The previous block's height before it's unplugged.
 * @param {number} newHeight The current block's height.
 */
Blockly.BlockDragger.prototype.setBlockOffsetXY_ = function(oldHeight,
    newHeight) {
  var relativeY = this.draggingBlock_.getCursorYRelativeToBlock();
  if (!isNaN(relativeY)) {
    var mainScale = this.mainWorkspace_.scale;
    oldHeight *= mainScale;
    newHeight *= mainScale;
    this.heightDiff_ = oldHeight - newHeight;
    if (newHeight < relativeY && relativeY < oldHeight) {
      var newRelativeY = newHeight * 2 / 3;
      var diffXY = new goog.math.Coordinate(0, relativeY - newRelativeY);
      this.blockOffsetXY_ = this.pixelsToWorkspaceUnits_(diffXY);
    }
  }
};

/**
 * Convert a coordinate object from pixels to workspace units, including a
 * correction for mutator workspaces.
 * This function does not consider differing origins.  It simply scales the
 * input's x and y values.
 * @param {!goog.math.Coordinate} pixelCoord A coordinate with x and y values
 *     in css pixel units.
 * @return {!goog.math.Coordinate} The input coordinate divided by the workspace
 *     scale.
 * @private
 */
Blockly.BlockDragger.prototype.pixelsToWorkspaceUnits_ = function(pixelCoord) {
  var result = new goog.math.Coordinate(pixelCoord.x / this.workspace_.scale,
      pixelCoord.y / this.workspace_.scale);
  if (this.workspace_.isMutator) {
    // If we're in a mutator, its scale is always 1, purely because of some
    // oddities in our rendering optimizations.  The actual scale is the same as
    // the scale on the parent workspace.
    // Fix that for dragging.
    var mainScale = this.mainWorkspace_.scale;
    // Note: Some mutators could be nested inside. Use the scale on the main
    // workspace instead of the parent.
    result = result.scale(1 / mainScale);
  }
  return result;
};

/**
 * Move all of the icons connected to this drag.
 * @param {!goog.math.Coordinate} dxy How far to move the icons from their
 *     original positions, in workspace units.
 * @private
 */
Blockly.BlockDragger.prototype.dragIcons_ = function(dxy) {
  // Moving icons moves their associated bubbles.
  for (var i = 0; i < this.dragIconData_.length; i++) {
    var data = this.dragIconData_[i];
    data.icon.setIconLocation(goog.math.Coordinate.sum(data.location, dxy));
  }
};
