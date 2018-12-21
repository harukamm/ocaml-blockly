'use strict';

goog.provide('Blockly.FlyoutMutator');

goog.require('Blockly.Bubble');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.Mutator');
goog.require('Blockly.WorkspaceSvg');
goog.require('goog.dom');


/**
 * Class for a mutator dialog whose main workspace is not visible.
 * @param {!Array.<string>} quarkNames List of names of sub-blocks for flyout.
 * @extends {Blockly.Mutator}
 * @constructor
 */
Blockly.FlyoutMutator = function(quarkNames) {
  Blockly.FlyoutMutator.superClass_.constructor.call(this, null);
  this.quarkNames_ = quarkNames;
};
goog.inherits(Blockly.FlyoutMutator, Blockly.Mutator);

/**
 * Initialize the workspace if it has not been created.
 * @override
 */
Blockly.FlyoutMutator.prototype.initWorkspace_ = function() {
  if (this.workspace_) {
    return;
  }
  if (this.quarkNames_.length) {
    var quarkXml = goog.dom.createDom('xml');
    for (var i = 0, quarkName; quarkName = this.quarkNames_[i]; i++) {
      quarkXml.appendChild(goog.dom.createDom('block', {'type': quarkName}));
    }
  } else {
    var quarkXml = null;
  }
  var workspaceOptions = {
    languageTree: quarkXml,
    parentWorkspace: this.block_.workspace,
    pathToMedia: this.block_.workspace.options.pathToMedia,
    RTL: this.block_.RTL,
    toolboxPosition: this.block_.RTL ? Blockly.TOOLBOX_AT_RIGHT :
        Blockly.TOOLBOX_AT_LEFT,
    horizontalLayout: false,
    typedVersion: true,
    getMetrics: this.getFlyoutMetrics_.bind(this),
    setMetrics: null
  };
  this.workspace_ = new Blockly.WorkspaceSvg(workspaceOptions);
  this.workspace_.isMutator = true;
  this.workspace_.ownerMutator_ = this;
};

/**
 * Callback function triggered when the bubble has resized.
 * Resize the workspace accordingly.
 * @override
 * @private
 */
Blockly.FlyoutMutator.prototype.resizeBubble_ = function() {
  var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
  var flyoutWorkspace = this.workspace_.flyout_ &&
      this.workspace_.flyout_.getWorkspace();
  if (!flyoutWorkspace) {
    return;
  }
  var workspaceSize = flyoutWorkspace.getCanvas().getBBox();
  var width;
  if (this.block_.RTL) {
    width = -workspaceSize.x;
  } else {
    width = workspaceSize.width + workspaceSize.x;
  }
  var height = workspaceSize.height + doubleBorderWidth * 3;
  width += doubleBorderWidth;
  // Only resize if the size difference is significant.  Eliminates shuddering.
  if (Math.abs(this.workspaceWidth_ - width) > doubleBorderWidth ||
      Math.abs(this.workspaceHeight_ - height) > doubleBorderWidth) {
    // Record some layout information for getFlyoutMetrics_.
    this.workspaceWidth_ = width;
    this.workspaceHeight_ = height;
    // Resize the bubble.
    this.bubble_.setBubbleSize(
        width + doubleBorderWidth, height + doubleBorderWidth);
    this.svgDialog_.setAttribute('width', this.workspaceWidth_);
    this.svgDialog_.setAttribute('height', this.workspaceHeight_);
  }

  if (this.block_.RTL) {
    // Scroll the workspace to always left-align.
    var translation = 'translate(' + this.workspaceWidth_ + ',0)';
    this.workspace_.getCanvas().setAttribute('transform', translation);
  }
  this.workspace_.resize();
};

/**
 * Show or hide the mutator bubble.
 * @param {boolean} visible True if the bubble should be visible.
 * @override
 */
Blockly.FlyoutMutator.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    // No change.
    return;
  }
  Blockly.Events.fire(
      new Blockly.Events.Ui(this.block_, 'mutatorOpen', !visible, visible));
  if (visible) {
    // Create the bubble.
    this.bubble_ = new Blockly.Bubble(
        /** @type {!Blockly.WorkspaceSvg} */ (this.block_.workspace),
        this.createEditor_(), this.block_.svgPath_, this.iconXY_, null, null);
    // Expose this mutator's block's ID on its top-level SVG group.
    this.bubble_.setSvgId(this.block_.id);
    var tree = this.workspace_.options.languageTree;
    if (tree) {
      this.workspace_.flyout_.init(this.workspace_);
      this.workspace_.flyout_.show(tree.childNodes);
    }
    this.flyoutWorkspace_ = this.workspace_.flyout_.getWorkspace();

    if (this.workspace_.flyout_) {
      var margin = this.workspace_.flyout_.CORNER_RADIUS * 2;
      var x = this.workspace_.flyout_.width_ + margin;
    } else {
      var margin = 16;
      var x = margin;
    }
    if (this.block_.RTL) {
      x = -x;
    }
    this.sourceListener_ =
        this.flyoutWorkspace_.addChangeListener(this.workspaceChanged_.bind(this));
    this.resizeBubble_();
    this.updateColour();
  } else {
    if (this.sourceListener_) {
      this.flyoutWorkspace_.removeChangeListener(this.sourceListener_);
      this.sourceListener_ = null;
    }
    // Dispose of the bubble.
    this.svgDialog_ = null;
    this.workspace_.dispose();
    this.workspace_ = null;
    this.bubble_.dispose();
    this.bubble_ = null;
    this.workspaceWidth_ = 0;
    this.workspaceHeight_ = 0;
  }
};

/**
 * @override
 */
Blockly.FlyoutMutator.prototype.workspaceChanged_ = function(e) {
  if (!this.flyoutWorkspace_.isDragging()) {
    this.resizeBubble_();
  }
};

/**
 * Reconnect an block to a mutated input.
 * @param {Blockly.Connection} connectionChild Connection on child block.
 * @param {!Blockly.Block} block Parent block.
 * @param {string} inputName Name of input on parent block.
 * @return {boolean} True iff a reconnection was made, false otherwise.
 * @override
 */
Blockly.FlyoutMutator.reconnect = function(connectionChild, block, inputName) {
  goog.asserts.assert(false, 'Not implemented');
};

/**
 * Get the parent workspace of a workspace that is inside a mutator, taking into
 * account whether it is a flyout.
 * @param {?Blockly.Workspace} workspace The workspace that is inside a mutator.
 * @return {?Blockly.Workspace} The mutator's parent workspace or null.
 * @override
 * @public
 */
Blockly.FlyoutMutator.findParentWs = function(workspace) {
  goog.asserts.assert(false, 'Not implemented');
};
