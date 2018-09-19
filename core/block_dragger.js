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
goog.require('Blockly.DraggedConnectionManager');
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
  if (!this.draggingBlock_.isTransferable()) {
    return this.startXY_;
  }
  // The dragging block will use the main workspace's surface.
  // Include the translation of the dragging block's workspace to the main
  // workspace.
  var mainWorkspace = this.draggingBlock_.workspace.getMainWorkspace();
  var xy = this.draggingBlock_.workspace.getRelativeToWorkspaceXY(
      mainWorkspace);
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
 * @package
 */
Blockly.BlockDragger.prototype.startBlockDrag = function(currentDragDeltaXY, healStack) {
  if (!Blockly.Events.getGroup()) {
    Blockly.Events.setGroup(true);
  }

  this.workspace_.setResizesEnabled(false);
  Blockly.BlockAnimations.disconnectUiStop();

  if (this.draggingBlock_.getParent() ||
      (healStack && this.draggingBlock_.nextConnection &&
      this.draggingBlock_.nextConnection.targetBlock())) {
    this.draggingBlock_.unplug(healStack);
    var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
    var newLoc = goog.math.Coordinate.sum(this.dragStartXY_, delta);

    this.draggingBlock_.translate(newLoc.x, newLoc.y);
    Blockly.BlockAnimations.disconnectUiEffect(this.draggingBlock_);
  }
  this.draggingBlock_.setDragging(true);
  // For future consideration: we may be able to put moveToDragSurface inside
  // the block dragger, which would also let the block not track the block drag
  // surface.
  this.draggingBlock_.moveToDragSurface_();

  var toolbox = this.workspace_.getToolbox();
  if (toolbox) {
    var style = this.draggingBlock_.isDeletable() ? 'blocklyToolboxDelete' :
        'blocklyToolboxGrab';
    toolbox.addStyle(style);
  }
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
  var newLoc = goog.math.Coordinate.sum(this.dragStartXY_, delta);

  this.draggingBlock_.moveDuringDrag(newLoc);
  this.dragIcons_(delta);

  this.deleteArea_ = this.workspace_.isDeleteArea(e);
  if (this.deleteArea_ == Blockly.DELETE_AREA_TOOLBOX &&
      this.draggingBlock_.workspace.isMutator &&
      this.draggingBlock_.isTransferable()) {
    // When transferable blocks are dragged beyond the shown flyout, they may
    // transfer another workspace. Don't delete them.
    if (!this.workspace_.isFlyoutArea(e)) {
      this.deleteArea_ = false;
    }
    // TODO: Blocks dragged inside any shown flyout should be deleted even if
    // blocks are transferable.
  }
  this.draggedConnectionManager_.update(delta, this.deleteArea_);

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

  var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
  var newLoc = goog.math.Coordinate.sum(this.startXY_, delta);
  this.draggingBlock_.moveOffDragSurface_(newLoc);

  var deleted = this.maybeDeleteBlock_();
  if (!deleted) {
    // These are expensive and don't need to be done if we're deleting.
    this.draggingBlock_.moveConnections_(delta.x, delta.y);
    this.draggingBlock_.setDragging(false);
    this.fireMoveEvent_();
    this.transferWorkspace(e);
    if (this.draggedConnectionManager_.wouldConnectBlock()) {
      // Applying connections also rerenders the relevant blocks.
      this.draggedConnectionManager_.applyConnections();
    } else {
      this.draggingBlock_.render();
    }
    this.draggingBlock_.scheduleSnapAndBump();
  }
  this.workspace_.setResizesEnabled(true);

  var toolbox = this.workspace_.getToolbox();
  if (toolbox) {
    var style = this.draggingBlock_.isDeletable() ? 'blocklyToolboxDelete' :
        'blocklyToolboxGrab';
    toolbox.removeStyle(style);
  }
  Blockly.Events.setGroup(false);
};

/**
 * Let the dragging block transfer to the workspace where the mouse event
 * happens inside. If the event occurs outside the all workspaces, the block
 * will be transferred to the top-most workspace (the main workspace).
 * @param {!Event} e The mouseup/touchend event.
 */
Blockly.BlockDragger.prototype.transferWorkspace = function(e) {
  if (!this.draggingBlock_.isTransferable()) {
    return;
  }
  var newWorkspace = this.workspace_.detectWorkspace(e);
  if (newWorkspace == this.workspace_) {
    // Does nothing f the mouse event occurs over this workspace.
    return;
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.setGroup(true);
    // Fire a create event for the new workspace.
    var event = new Blockly.Events.Create(this.draggingBlock_);
    event.workspaceId = newWorkspace.id;
    Blockly.Events.fire(event);
  }
  this.draggingBlock_.transferWorkspace(newWorkspace);
};

/**
 * Fire a move event at the end of a block drag.
 * @private
 */
Blockly.BlockDragger.prototype.fireMoveEvent_ = function() {
  var event = new Blockly.Events.BlockMove(this.draggingBlock_);
  event.oldCoordinate = this.startXY_;
  event.recordNew();
  Blockly.Events.fire(event);
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
    // Fire a move event, so we know where to go back to for an undo.
    this.fireMoveEvent_();
    this.draggingBlock_.dispose(false, true);
  } else if (trashcan) {
    // Make sure the trash can is closed.
    trashcan.close();
  }
  return this.wouldDeleteBlock_;
};

/**
 * Update the cursor (and possibly the trash can lid) to reflect whether the
 * dragging block would be deleted if released immediately.
 * @private
 */
Blockly.BlockDragger.prototype.updateCursorDuringBlockDrag_ = function() {
  this.wouldDeleteBlock_ = this.draggedConnectionManager_.wouldDeleteBlock();
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
    var mainScale = this.workspace_.options.parentWorkspace.scale;
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
