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
 * The connection this mutator's context is bound to.
 * @type {Blockly.Connection}
 * @private
 */
Blockly.Workbench.prototype.contextConnection_ = null;

/**
 * The top margin for the icon.
 * @type {number}
 * @override
 */
Blockly.Workbench.prototype.TOP_MARGIN = 0;

/**
 * Draw the mutator icon.
 * @param {!Element} group The icon group.
 * @private
 */
Blockly.Workbench.prototype.drawIcon_ = function(group) {
  // Square with rounded corners.
  Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyWorkbenchIconShape',
        'rx': '4',
        'ry': '4',
        'height': '16',
        'width': '16'
      },
      group);
  // Gear teeth.
  Blockly.utils.createSvgElement('path',
      {
        'class': 'blocklyWorkbenchIconSymbol',
        'd': 'm 8.0,1.0 l 0,2.0 z M 1.0,8.0 l 2.0,0 z M 8.0,15.0 l 0,-2.0 z ' +
             'M 15.0,8.0 l -2.0,0 z M 8.0,5.0 l 0,6.0 z M 5.0,8.0 l 6.0,0 z'
      },
      group);
  // Axle hole.
  Blockly.utils.createSvgElement(
      'circle',
      {
        'class': 'blocklyWorkbenchIconShape',
        'r': '5.0',
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
  if (!this.svgDialog_) {
    this.svgDialog_ = Blockly.utils.createSvgElement('svg',
        {'x': Blockly.Bubble.BORDER_WIDTH, 'y': Blockly.Bubble.BORDER_WIDTH},
        null);
  }
  this.initWorkspace_();

  // Mutator flyouts go inside the mutator workspace's <g> rather than in
  // a top level svg. Instead of handling scale themselves, mutators
  // inherit scale from the parent workspace.
  // To fix this, scale needs to be applied at a different level in the dom.
  if (!this.flyoutSvg_) {
    this.flyoutSvg_ =  this.workspace_.addFlyout_('g',
        this.createFlyout_.bind(this));
  }
  if (!this.background_) {
    this.background_ = this.workspace_.createDom('blocklyMutatorBackground');
  }

  // Insert the flyout after the <rect> but before the block canvas so that
  // the flyout is underneath in z-order.  This makes blocks layering during
  // dragging work properly.
  this.background_.insertBefore(this.flyoutSvg_, this.workspace_.svgBlockCanvas_);
  this.svgDialog_.appendChild(this.background_);

  return this.svgDialog_;
};

/**
 * Remove the svg elements in this workbench.
 */
Blockly.Workbench.prototype.removeSvgElements = function() {
  if (!this.svgDialog_) {
    return;
  }
  this.background_.removeChild(this.flyoutSvg_);
  this.flyoutSvg_ = null;
  this.svgDialog_.removeChild(this.background_);
  this.background_ = null;

  if (this.bubble_) {
    this.bubble_.removeContent();
  }
  this.svgDialog_ = null;
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
 * @param {Element=} opt_childBubbleCavas The SVG element to form nested
 *     bubbles surface. Provided to use a element that already exists as the
 *     nested surface of this bubble.
 * @private
 */
Blockly.Workbench.prototype.init_ = function(opt_childBubbleCanvas) {
  if (this.initialized_) {
    return;
  }

  // Create the bubble.
  var anchorXY = this.iconXY_ ? this.iconXY_ : new goog.math.Coordinate(0, 0);
  this.bubble_ = new Blockly.Bubble(
      /** @type {!Blockly.WorkspaceSvg} */ (this.block_.workspace),
      this.createEditor_(), this.block_.svgPath_, anchorXY, null, null,
      opt_childBubbleCanvas);
  // Expose this mutator's block's ID on its top-level SVG group.
  this.bubble_.setSvgId(this.block_.id);

  this.workspace_.flyout_.init(this.workspace_);

  this.initialized_ = true;
};

Blockly.Workbench.prototype.initWorkspace_ = function() {
  if (this.workspace_) {
    return;
  }
  var workspaceOptions = this.createWorkspaceOptions_();
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
 * Set the connection whose context this mutator should be bound to.
 * @param {!Blockly.Connetion} connection The connection where this mutator's
 *     context is bound.
 * @param {!Blockly.Input} input The input that connection is attached to.
 */
Blockly.Workbench.prototype.setContextConnection = function(connection,
    input) {
  if (connection.getSourceBlock() != this.block_) {
    throw 'The connection and mutator belong to differenct blocks.';
  }
  this.contextConnection_ = connection;
  this.followingInput = input;
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
    this.init_();
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.UiWithUndo(this.block_,
      'mutatorOpen', !visible, visible));
  }

  // Show or hide the bubble. It also shows/hides the mutator because the
  // bubble contains whole the mutator.
  this.bubble_.setVisible(visible);
  // Update the visibility of the workspace for its components.
  if (this.workspace_) {
    this.workspace_.setVisible(visible);
  }

  if (visible) {
    goog.asserts.assert(this.workspace_, 'The workspace has been removed.');
    this.updateFlyoutTree();

    this.updateScreen_();
    this.addChangeListener();
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
  return this.block_.allVisibleVariables(this.contextConnection_,
      true/** Includes implicit context. */);
};

/**
 * Finds variables environment bound only to the mutator's block, and able to
 * be referred to by blocks inside this workbench workspace.
 * @return {!Object} The map to variable value keyed by its name.
 */
Blockly.Workbench.prototype.getBlockContext = function() {
  if (!this.block_) {
    // This workbench is in the process of being deleted.
    return {};
  }
  return this.block_.getVisibleVariablesImpl(this.contextConnection_);
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
 * Creates blocks to show in mutator's flyout on the given workspace.
 * @param {!Blockly.Workspace} flyoutWorkspace The workspace to create blocks.
 * @return {!Array.<!Blockly.Block>} List of blocks to show in a flyout.
 */
Blockly.Workbench.prototype.blocksForFlyout = function(flyoutWorkspace) {
  var env = this.getContext();
  var names = Object.keys(env);
  var blocks = [];

  for (var i = 0, name; name = names[i]; i++) {
    var variable = env[name];
    // TODO(harukam): Avoid providing prototype name using string literal.
    var getterBlock = flyoutWorkspace.newBlock('variables_get_typed');
    if (goog.isFunction(getterBlock.initSvg)) {
      getterBlock.initSvg();
    }
    var field = getterBlock.getField('VAR');
    field.initModel();
    field.setVariableName(name);
    field.setBoundValue(variable);
    blocks.push(getterBlock);
  }
  return blocks;
};

/**
 * Updates the shown blocks in the mutator flyout.
 */
Blockly.Workbench.prototype.updateFlyoutTree = function() {
  if (this.workspace_ && this.workspace_.flyout_) {
    this.workspace_.flyout_.show(this.blocksForFlyout.bind(this));
    this.updateScreen_();
  }
};

/**
 * Updates the bubble's size and position.
 */
Blockly.Workbench.prototype.updateScreen_ = function() {
  this.bubble_.setAnchorLocation(this.iconXY_);
  this.resizeBubble_();
};

/**
 * Check if all of reference blocks on the mutator's workspace and its nested
 * mutators are correctly bound to their context.
 * @param {!Object} env The variable environments the block can refer to.
 * @return {boolean} True if reference blocks on the mutator's workspace and
 *     its nested mutators' workspaces can be resolved.
 */
Blockly.Workbench.prototype.checkReference = function(env) {
  if (!this.workspace_) {
    return true;
  }
  var context = Object.assign({}, env);
  Object.assign(context, this.getBlockContext());

  var topBlocks = this.workspace_.getTopBlocks();
  for (var i = 0, topBlock; topBlock = topBlocks[i]; i++) {
    // This function will be called recursively for each of nested mutators.
    if (!topBlock.resolveReferenceOnDescendants(context)) {
      return false;
    }
  }
  return true;
};

/**
 * Dispose of this mutator.
 */
Blockly.Workbench.prototype.dispose = function() {
  this.block_.mutator = null;
  Blockly.Icon.prototype.dispose.call(this);

  this.removeSvgElements();
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
 * Add a change listener for the mutator workspace.
 */
Blockly.Workbench.prototype.addChangeListener = function() {
  if (!this.changeListener_) {
    this.changeListener_ = this.workspaceChanged_.bind(this);
    this.workspace_.addChangeListener(this.changeListener_);
  }
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
 * Release ownership of the current workspace in a mutator without destroying
 * it.
 */
Blockly.Workbench.prototype.releaseWorkspace = function() {
  if (this.workspace_) {
    this.removeChangeListener();
    Blockly.WorkspaceTree.setParent(this.workspace_, null);
    this.workspace_.ownerMutator_ = null;
    this.workspace_ = null;
  }
};

/**
 * Replace the mutator workspace with the given workspace.
 * @param {!Blockly.Workbench} workbench The mutator whose workspace to be
 *     stored to this mutator.
 */
Blockly.Workbench.prototype.replaceWorkspace = function(workbench) {
  var workspace = workbench.getWorkspace();
  if (!workspace) {
    return;
  }
  if (this.initialized_ || this.svgDialog_) {
    throw 'The mutator\'s DOM is already initialized.';
  }
  if (this.workspace_) {
    this.workspace_.ownerMutator_ = null;
    this.workspace_.dispose();
    this.workspace_ = null;
  }
  workbench.releaseWorkspace();

  Blockly.WorkspaceTree.setParent(workspace, this.block_.workspace);
  workspace.isMutator = true;
  workspace.ownerMutator_ = this;
  this.workspace_ = workspace;
  this.adaptWorkspace_(workbench);
};

/**
 * Adapts the workspace to this mutator condition. Called when the mutator
 * workspace is replaced with another one.
 * @param {!Blockly.Workbench} workbench The workbench the workspace originally
 *     belonged to.
 */
Blockly.Workbench.prototype.adaptWorkspace_ = function(workbench) {
  this.workspace_.updateOptions(this.createWorkspaceOptions_());

  var originalBackground = workbench.background_;
  workbench.removeSvgElements();

  // Recreate the flyout because the old flyout refers to the original mutator.
  this.workspace_.clearFlyout();
  this.workspace_.clearCached();

  this.background_ = originalBackground;

  this.workspace_.recordDeleteAreas();
  this.workspace_.recordWorkspaceArea();

  var bubble = workbench.getBubble();
  var originalChildBubble = bubble.getChildBubbleCanvas();
  bubble.removeChildBubbleCanvas();

  this.init_(originalChildBubble);
  this.setVisible(false);
};

/**
 * Returns workspace options for this mutator's workspace.
 * @return {!Object} Dictionary of options.
 */
Blockly.Workbench.prototype.createWorkspaceOptions_ = function() {
  var options = {};
  options.parentWorkspace = this.block_.workspace;
  options.pathToMedia = this.block_.workspace.options.pathToMedia;
  options.RTL = this.block_.RTL;
  options.toolboxPosition = this.block_.RTL ? Blockly.TOOLBOX_AT_RIGHT :
      Blockly.TOOLBOX_AT_LEFT;
  options.horizontalLayout = false;
  options.typedVersion = this.block_.workspace.options.typedVersion;
  options.getMetrics = this.getFlyoutMetrics_.bind(this);
  options.setMetrics = null;
  return options;
};

/**
 * Returns if this mutator is a workbench.
 */
Blockly.Workbench.prototype.isWorkbench = function() {
  return true;
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
