'use strict';

goog.provide('Blockly.Workbench');

goog.require('Blockly.Bubble');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.Icon');
goog.require('Blockly.WorkspaceSvg');
goog.require('goog.dom');


/**
 * Class for a dialog which provides an area for user to work on block
 * assembly.
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.Workbench = function() {
  Blockly.Workbench.superClass_.constructor.call(this, null);
};
goog.inherits(Blockly.Workbench, Blockly.Icon);

/**
 * Width of workspace.
 * @private
 */
Blockly.Workbench.prototype.workspaceWidth_ = 0;

/**
 * Height of workspace.
 * @private
 */
Blockly.Workbench.prototype.workspaceHeight_ = 0;

/**
 * Minimum width of workspace.
 * @private
 */
Blockly.Workbench.MINIMUM_WIDTH_ = 180;

/**
 * Minimum height of workspace.
 * @private
 */
Blockly.Workbench.MINIMUM_HEIGHT_ = 100;

/**
 * Whether the workbench dialog has been initialized.
 * @private
 */
Blockly.Workbench.prototype.initialized_ = false;

/**
 * Draw the mutator icon.
 * @param {!Element} group The icon group.
 * @private
 */
Blockly.Workbench.prototype.drawIcon_ = function(group) {
  // Square with rounded corners.
  Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyIconShape',
        'rx': '4',
        'ry': '4',
        'height': '16',
        'width': '16'
      },
      group);
  // Gear teeth.
  Blockly.utils.createSvgElement('path',
      {
        'class': 'blocklyIconSymbol',
        'd': 'm4.203,7.296 0,1.368 -0.92,0.677 -0.11,0.41 0.9,1.559 0.41,' +
             '0.11 1.043,-0.457 1.187,0.683 0.127,1.134 0.3,0.3 1.8,0 0.3,' +
             '-0.299 0.127,-1.138 1.185,-0.682 1.046,0.458 0.409,-0.11 0.9,' +
             '-1.559 -0.11,-0.41 -0.92,-0.677 0,-1.366 0.92,-0.677 0.11,' +
             '-0.41 -0.9,-1.559 -0.409,-0.109 -1.046,0.458 -1.185,-0.682 ' +
             '-0.127,-1.138 -0.3,-0.299 -1.8,0 -0.3,0.3 -0.126,1.135 -1.187,' +
             '0.682 -1.043,-0.457 -0.41,0.11 -0.899,1.559 0.108,0.409z'
      },
      group);
  // Axle hole.
  Blockly.utils.createSvgElement(
      'circle',
      {
        'class': 'blocklyIconShape',
        'r': '2.7',
        'cx': '8',
        'cy': '8'
      },
      group);
};

/**
 * Clicking on the icon toggles if the mutator bubble is visible.
 * Disable if block is uneditable.
 * @param {!Event} e Mouse click event.
 * @private
 * @override
 */
Blockly.Workbench.prototype.iconClick_ = function(e) {
  if (this.block_.isEditable()) {
    Blockly.Icon.prototype.iconClick_.call(this, e);
  }
};

/**
 * Create the editor for the mutator's bubble.
 * @return {!Element} The top-level node of the editor.
 * @private
 */
Blockly.Workbench.prototype.createEditor_ = function() {
  /* Create the editor.  Here's the markup that will be generated:
  <svg>
    [Workspace]
  </svg>
  */
  this.svgDialog_ = Blockly.utils.createSvgElement('svg',
      {'x': Blockly.Bubble.BORDER_WIDTH, 'y': Blockly.Bubble.BORDER_WIDTH},
      null);
  this.initWorkspace_();

  // Mutator flyouts go inside the mutator workspace's <g> rather than in
  // a top level svg. Instead of handling scale themselves, mutators
  // inherit scale from the parent workspace.
  // To fix this, scale needs to be applied at a different level in the dom.
  var flyoutSvg =  this.workspace_.addFlyout_('g',
      this.createFlyout_.bind(this));
  var background = this.workspace_.createDom('blocklyMutatorBackground');

  // Insert the flyout after the <rect> but before the block canvas so that
  // the flyout is underneath in z-order.  This makes blocks layering during
  // dragging work properly.
  background.insertBefore(flyoutSvg, this.workspace_.svgBlockCanvas_);
  this.svgDialog_.appendChild(background);

  return this.svgDialog_;
};

/**
 * Returns a newly created flyout for this workbench workspace.
 * @param {!Object} workspaceOptions Dictionary of options for the flyout
 *     workspace.
 */
Blockly.Workbench.prototype.createFlyout_ = function(flyoutWorkspaceOptions) {
  return new Blockly.WorkbenchVerticalFlyout(flyoutWorkspaceOptions, this);
};

/**
 * Initialize the icon and its components.
 */
Blockly.Workbench.prototype.init = function() {
  if (this.initialized_) {
    return;
  }
  goog.asserts.assert(goog.isFunction(this.block_.getWorkbenchContext));

  // Create the bubble.
  var anchorXY = this.iconXY_ ? this.iconXY_ : new goog.math.Coordinate(0, 0);
  this.bubble_ = new Blockly.Bubble(
      /** @type {!Blockly.WorkspaceSvg} */ (this.block_.workspace),
      this.createEditor_(), this.block_.svgPath_, anchorXY, null, null);
  // Expose this mutator's block's ID on its top-level SVG group.
  this.bubble_.setSvgId(this.block_.id);

  this.workspace_.flyout_.init(this.workspace_);

  this.initialized_ = true;
};

Blockly.Workbench.prototype.initWorkspace_ = function() {
  if (this.workspace_) {
    return;
  }
  var workspaceOptions = {
    languageTree: null,
      // TODO: Specify the tree. Workbench can accept blocks of any type.
    parentWorkspace: this.block_.workspace,
    pathToMedia: this.block_.workspace.options.pathToMedia,
    RTL: this.block_.RTL,
    toolboxPosition: this.block_.RTL ? Blockly.TOOLBOX_AT_RIGHT :
        Blockly.TOOLBOX_AT_LEFT,
    horizontalLayout: false,
    typedVersion: this.block_.workspace.options.typedVersion,
    getMetrics: this.getFlyoutMetrics_.bind(this),
    setMetrics: null
  };
  this.workspace_ = new Blockly.WorkspaceSvg(workspaceOptions);
  this.workspace_.isMutator = true;
  this.workspace_.ownerMutator_ = this;
};

/**
 * Add or remove the UI indicating if this icon may be clicked or not.
 */
Blockly.Workbench.prototype.updateEditable = function() {
  if (!this.block_.isInFlyout) {
    if (this.block_.isEditable()) {
      if (this.iconGroup_) {
        Blockly.utils.removeClass(
            /** @type {!Element} */ (this.iconGroup_),
            'blocklyIconGroupReadonly');
      }
    } else {
      // Close any mutator bubble.  Icon is not clickable.
      this.setVisible(false);
      if (this.iconGroup_) {
        Blockly.utils.addClass(
            /** @type {!Element} */ (this.iconGroup_),
            'blocklyIconGroupReadonly');
      }
    }
  }
  // Default behaviour for an icon.
  Blockly.Icon.prototype.updateEditable.call(this);
};

/**
 * Return the mutator's bubble.
 * @return {Blockly.Bubble} Bubble, or null.
 */
Blockly.Workbench.prototype.getBubble = function() {
  return this.bubble_ ? this.bubble_ : null;
};

/**
 * Return the mutator workspace.
 * @return {Blockly.Workspace} Workspace, or null.
 */
Blockly.Workbench.prototype.getWorkspace = function() {
  return this.workspace_;
};

/**
 * Callback function triggered when the bubble has resized.
 * Resize the workspace accordingly.
 * @private
 */
Blockly.Workbench.prototype.resizeBubble_ = function() {
  var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
  var workspaceSize = this.workspace_.getCanvas().getBBox();
  var width;
  if (this.block_.RTL) {
    width = -workspaceSize.x;
  } else {
    width = workspaceSize.width + workspaceSize.x;
  }
  var height = workspaceSize.height + workspaceSize.y +
      doubleBorderWidth * 3;
  if (this.workspace_.flyout_) {
    var flyoutMetrics = this.workspace_.flyout_.getMetrics_();
    width = Math.max(width, flyoutMetrics.contentWidth + 10);
    height = Math.max(height, flyoutMetrics.contentHeight + 20);
  }
  width += doubleBorderWidth * 3;
  // Minimum size of a workbench workspace.
  width = Math.max(width, Blockly.Workbench.MINIMUM_WIDTH_);
  height = Math.max(height, Blockly.Workbench.MINIMUM_HEIGHT_);
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
 */
Blockly.Workbench.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    // No change.
    return;
  }
  if (!this.initialized_) {
    this.init();
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.UiWithUndo(this.block_,
      'mutatorOpen', !visible, visible));
  }

  // Show or hide the bubble. It also shows/hides the mutator because the
  // bubble contains whole the mutator.
  this.bubble_.setVisible(visible);
  // Update the visibility of the workspace for its components.
  this.workspace_.setVisible(visible);

  if (visible) {
    var tree = this.getFlyoutLanguageTree_();
    this.workspace_.flyout_.show(tree.childNodes);

    this.bubble_.setAnchorLocation(this.iconXY_);
    this.resizeBubble_();
    this.changeListener_ = this.workspaceChanged_.bind(this);
    this.workspace_.addChangeListener(this.changeListener_);
    this.updateColour();
  } else {
    this.workspaceWidth_ = 0;
    this.workspaceHeight_ = 0;
    this.removeChangeListener();
  }
};

/**
 * Update the source block when the mutator's blocks are changed.
 * Bump down any block that's too high.
 * Fired whenever a change is made to the mutator's workspace.
 * @private
 */
Blockly.Workbench.prototype.workspaceChanged_ = function() {
  if (!this.workspace_.isDragging()) {
    var blocks = this.workspace_.getTopBlocks(false);
    var MARGIN = 20;
    for (var b = 0, block; block = blocks[b]; b++) {
      var blockXY = block.getRelativeToSurfaceXY();
      var blockHW = block.getHeightWidth();
      if (blockXY.y + blockHW.height < MARGIN) {
        // Bump any block that's above the top back inside.
        block.moveBy(0, MARGIN - blockHW.height - blockXY.y);
      }
    }
  }
  // Don't update the bubble until the drag has ended, to avoid moving blocks
  // under the cursor.
  if (!this.workspace_.isDragging()) {
    this.resizeBubble_();
  }
};

/**
 * Return an object with all the metrics required to size scrollbars for the
 * mutator flyout.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * @return {!Object} Contains size and position metrics of mutator dialog's
 *     workspace.
 * @private
 */
Blockly.Workbench.prototype.getFlyoutMetrics_ = function() {
  return {
    viewHeight: this.workspaceHeight_,
    viewWidth: this.workspaceWidth_,
    absoluteTop: 0,
    absoluteLeft: 0
  };
};

/**
 * Finds variable environment which can be referred to inside this workbench.
 * @return {!Object} The map to variable value keyed by its name.
 */
Blockly.Workbench.prototype.getContext = function() {
  if (!this.block_) {
    // This workbench is in the process of being deleted.
    return {};
  }
  return this.block_.getWorkbenchContext();
};

/**
 * Return a DOM tree of blocks to show in a flyout.
 * @return {Node} DOM tree of blocks.
 */
Blockly.Workbench.prototype.getFlyoutLanguageTree_ = function() {
  var xml = goog.dom.createDom('xml');
  var env = this.getContext();
  var names = Object.keys(env);

  Blockly.Events.disable();
  try {
    for (var i = 0, name; name = names[i]; i++) {
      var variable = env[name];
      // TODO(harukam): Avoid providing prototype name using string literal.
      var getterBlock = this.workspace_.newBlock('variables_get_typed');
      var field = getterBlock.getField('VAR');
      field.initModel();
      field.setVariableName(name);
      field.setBoundValue(variable);
      var dom = Blockly.Xml.blockToDom(getterBlock);
      getterBlock.dispose();
      xml.appendChild(dom);
    }
  } finally {
    Blockly.Events.enable();
  }
  return xml;
};

/**
 * Dispose of this mutator.
 */
Blockly.Workbench.prototype.dispose = function() {
  this.block_.mutator = null;
  Blockly.Icon.prototype.dispose.call(this);

  this.svgDialog_ = null;
  this.removeChangeListener();
  if (this.workspace_) {
    this.workspace_.dispose();
    this.workspace_ = null;
  }
  if (this.bubble_) {
    this.bubble_.dispose();
    this.bubble_ = null;
  }
  this.workspaceWidth_ = 0;
  this.workspaceHeight_ = 0;
};

/**
 * Remove a change listener for the mutator workspace.
 */
Blockly.Workbench.prototype.removeChangeListener = function() {
  if (this.changeListener_) {
    this.workspace_.removeChangeListener(this.changeListener_);
    this.changeListener_ = null;
  }
};

/**
 * Reconnect an block to a mutated input.
 * @param {Blockly.Connection} connectionChild Connection on child block.
 * @param {!Blockly.Block} block Parent block.
 * @param {string} inputName Name of input on parent block.
 * @return {boolean} True iff a reconnection was made, false otherwise.
 */
Blockly.Workbench.reconnect = function(connectionChild, block, inputName) {
  if (!connectionChild || !connectionChild.getSourceBlock().workspace) {
    return false;  // No connection or block has been deleted.
  }
  var connectionParent = block.getInput(inputName).connection;
  var currentParent = connectionChild.targetBlock();
  if ((!currentParent || currentParent == block) &&
      connectionParent.targetConnection != connectionChild) {
    if (connectionParent.isConnected()) {
      // There's already something connected here.  Get rid of it.
      connectionParent.disconnect();
    }
    connectionParent.connect(connectionChild);
    return true;
  }
  return false;
};

/**
 * Get the parent workspace of a workspace that is inside a mutator, taking into
 * account whether it is a flyout.
 * @param {?Blockly.Workspace} workspace The workspace that is inside a mutator.
 * @return {?Blockly.Workspace} The mutator's parent workspace or null.
 * @public
 */
Blockly.Workbench.findParentWs = function(workspace) {
  var outerWs = null;
  if (workspace && workspace.options) {
    var parent = workspace.options.parentWorkspace;
    // If we were in a flyout in a mutator, need to go up two levels to find
    // the actual parent.
    if (workspace.isFlyout) {
      if (parent && parent.options) {
        outerWs = parent.options.parentWorkspace;
      }
    } else if (parent) {
      outerWs = parent;
    }
  }
  return outerWs;
};

// Export symbols that would otherwise be renamed by Closure compiler.
if (!goog.global['Blockly']) {
  goog.global['Blockly'] = {};
}
if (!goog.global['Blockly']['Workbench']) {
  goog.global['Blockly']['Workbench'] = {};
}
goog.global['Blockly']['Workbench']['reconnect'] = Blockly.Workbench.reconnect;
