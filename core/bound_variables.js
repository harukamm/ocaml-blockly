/**
 * @fileoverview Utility functions for variable binding.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

/**
 * @name Blockly.BoundVariables
 * @namespace
 **/
goog.provide('Blockly.BoundVariables');

goog.require('Blockly.BoundVariableValue');
goog.require('Blockly.BoundVariableValueReference');
goog.require('Blockly.Workspace');
goog.require('goog.string');


/**
 * Create a value on the given block.
 * @param {!Blockly.TypeExpr} valueTypeExpr The type for the value.
 * @param {string} variableName The default name of this variable value.
 */
Blockly.BoundVariables.createValue = function(valueTypeExpr, variableName,
    label) {
  goog.asserts.assert(Blockly.BoundVariableAbstract.isValidLabel(label),
      'Invalid variable label.');
  return new Blockly.BoundVariableValue(valueTypeExpr, variableName, label);
};

/**
 * Adds a value to the list of values.
 * @param {!Blockly.Workspace} workspace The workspace to add the value to.
 * @param {!Blockly.BoundVariableValue}
 */
Blockly.BoundVariables.addValue = function(workspace, value) {
  var valueMap = Blockly.BoundVariables.getBlockVariableDB(value);

  if (valueMap) {
    var fieldName = value.getMainFieldName();
    if (valueMap[fieldName] || value.inBlockDB) {
      throw 'The value is already added to the variable map of other block.';
    }
    valueMap[fieldName] = value;
    value.inBlockDB = true;
  }

  var id = value.getId();
  var valueDB = workspace.getValueDB(value.label);

  if (valueDB[id] || value.inWorkspaceDB) {
    throw 'The value already exists in DB.';
  }
  valueDB[id] = value;
  value.inWorkspaceDB = true;
};

/**
 * Remove a value from the list of values.
 * @param {!Blockly.Workspace} workspace The workspace to remove the value
 *     from.
 * @param {!Blockly.BoundVariableValue}
 */
Blockly.BoundVariables.removeValue = function(workspace, value) {
  var valueMap = Blockly.BoundVariables.getBlockVariableDB(value);

  if (valueMap) {
    var fieldName = value.getMainFieldName();
    if (value.inBlockDB && !valueMap[fieldName]) {
      throw 'The value doesn\'t exist in DB.';
    }
    delete valueMap[fieldName];
    value.inBlockDB = false;
  }

  var id = value.getId();
  var valueDB = workspace.getValueDB(value.label);

  if (value.inWorkspaceDB && !valueDB[id]) {
    throw 'The value doesn\'t exist in DB.';
  }
  delete valueDB[id];
  value.inWorkspaceDB = false;
};

/**
 * Find the value on workspace workspace with the specified ID.
 * @param {!number} label An enum representing which type of value.
 * @param {!Blockly.Workspace} workspace The workspace to search for the value.
 * @param {string} id ID of workspace to find.
 * @return {Blockly.BoundVariableValue} The sought after value or null.
 */
Blockly.BoundVariables.getValueById = function(label, workspace, id) {
  var valueDB = workspace.getValueDB(label);
  return valueDB[id] || null;
};

/**
 * Create a reference on the given block.
 * @param {!Blockly.TypeExpr} typeExpr The type expression of the variable.
 * @param {string} name The default variable name.
 * @param {!number} label The enum presenting type of reference.
 * @param {Blockly.BoundVariableValue=} opt_defaultBoundValue
 */
Blockly.BoundVariables.createReference = function(typeExpr, name, label,
    opt_defaultBoundValue) {
  goog.asserts.assert(Blockly.BoundVariableAbstract.isValidLabel(label),
      'Invalid variable label.');
  return new Blockly.BoundVariableValueReference(typeExpr, name, label,
      opt_defaultBoundValue);
};

/**
 * Add the reference to the given workspace.
 * @param {!Blockly.Workspace} workspce The workspace to add the reference to.
 * @param {!Blockly.BoundVariableValueReference} The reference to add.
 */
Blockly.BoundVariables.addReference = function(workspace, reference) {
  var referenceMap = Blockly.BoundVariables.getBlockVariableDB(reference);

  if (referenceMap) {
    var fieldName = reference.getMainFieldName();
    if (fieldName in referenceMap || reference.inBlockDB) {
      throw 'The reference is already added to the variable map of other ' +
          'block.';
    }
    referenceMap[fieldName] = reference;
    reference.inBlockDB = true;
  }

  var id = reference.getId();
  var referenceDB = workspace.getReferenceDB(reference.label);

  if (referenceDB[id] || reference.inWorkspaceDB) {
    throw 'The reference ID already exists in the DB.';
  }
  referenceDB[id] = reference;
  reference.inWorkspaceDB = true;
};

/**
 * Remove the reference with the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace to remove the reference
 *     from.
 * @param {!Blockly.BoundVariableValueReference} The reference to remove.
 */
Blockly.BoundVariables.removeReference = function(workspace, reference) {
  var referenceMap = Blockly.BoundVariables.getBlockVariableDB(reference);

  if (referenceMap) {
    var fieldName = reference.getMainFieldName();
    if (reference.inBlockDB && !(fieldName in referenceMap)) {
      throw 'The reference doesn\'t exist in DB.';
    }
    delete referenceMap[fieldName];
    reference.inBlockDB = false;
  }

  var id = reference.getId();
  var referenceDB = workspace.getReferenceDB(reference.label);

  if (!referenceDB[id] || !reference.inWorkspaceDB) {
    throw 'The reference doesn\'t exist in DB.';
  }
  delete referenceDB[id];
  reference.inWorkspaceDB = false;
};

/**
 * Look up a reference on the given workspace.
 * @param {!number} label An enum representing which type of value.
 * @param {!Blockly.Workspace} workspace The workspace to search for the
 *     reference.
 * @param {string} id The ID to use to look up the variable, or null.
 * @return {Blockly.BoundVariableValueReference} The sought after reference or
 *     null.
 */
Blockly.BoundVariables.getReferenceById = function(label, workspace, id) {
  var referenceDB = workspace.getReferenceDB(label);
  return referenceDB[id] || null;
};

/**
 * Clear the database of variables on the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace whose variable database
 *     to be cleared.
 */
Blockly.BoundVariables.clearWorkspaceVariableDB = function(workspace) {
  function clearVariableDB(db) {
    var ids = Object.keys(db);
    for (var i = 0, id; id = ids[i]; i++) {
      var variable = db[id];
      if (!variable.inWorkspaceDB) {
        throw 'Invalid status.';
      }
      variable.inWorkspaceDB = false;
      delete db[id];
    }
  }
  var labelList = Blockly.BoundVariableAbstract._LABEL_LIST;
  for (var i = 0; i < labelList.length; i++) {
    var referenceDB = workspace.getReferenceDB(labelList[i]);
    var valueDB = workspace.getValueDB(labelList[i]);
    clearVariableDB(referenceDB);
    clearVariableDB(valueDB);
  }
};

/**
 * Returns a block's database which keeps variables inside the block.
 * @param {!Blockly.BoundVariableAbstract} variable The variable.
 * @return {!Object|null} The variable database if the variable is need to be
 *     stored in it. Otherwise null.
 */
Blockly.BoundVariables.getBlockVariableDB = function(variable) {
  var block = variable.getSourceBlock();
  if (!variable.isReference()) {
    return variable.isVariable() ? block.typedValue : null;
  }
  if (variable.isVariable()) {
    return block.typedReference;
  }
  if (variable.isRecord()) {
    return block.typedStructureReference;
  }
  return null;
};

/**
 * Clear variable-binding relation of the references which share the same root
 * block with the given block, and refer to the value existing in the block or
 * its nested blocks.
 * @param {!Blockly.Block} block The block whose cyclic references to be
 *     removed.
 */
Blockly.BoundVariables.clearCyclicReferenceOnBlock = function(block) {
  function clearCyclicReferenceImpl(childBlock) {
    var names = Object.keys(childBlock.typedValue);
    for (var i = 0, name; name = names[i]; i++) {
      var value = childBlock.typedValue[name];
      value.clearCyclicReference();
    }
  }
  var descendants = block.getDescendants();
  for (var i = 0, childBlock; childBlock = descendants[i]; i++) {
    clearCyclicReferenceImpl(childBlock);
  }
};

/**
 * Get whether the given variable name is unique on the related workspaces.
 * @param {!number} label An enum representing which type of value.
 * @param {!string} name The name of variable.
 * @param {!Blockly.Workspace} workspace The workspace to specify a group of
 *     related workspaces. Check if these workspaces don't have a variable of
 *     the given name.
 * @return {boolean} True if the name is unique on the related workspaces.
 */
Blockly.BoundVariables.isUniqueName = function(label, name, workspace) {
  var workspaceFamily = Blockly.WorkspaceTree.getFamily(workspace);
  for (var i = 0, ws; ws = workspaceFamily[i]; i++) {
    var valueDB = ws.getValueDB(label);
    var keys = Object.keys(valueDB);
    for (var j = 0, key; key = keys[j]; j++) {
      var value = valueDB[key];
      if (value.getVariableName() === name) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Find all root blocks without duplicates which contain the given variables
 * inside or directly.
 * @param {!Array.<!Blockly.BoundVariableAbstract>} variables The list of
 *     variables.
 * @param {boolean=} opt_bounds If true, also collect root blocks which contain
 *     bound variables of each variable in the list.
 * @return {!Array.<!Blockly.Block>} Root blocks which contain any variable
 *     existing in the give list.
 */
Blockly.BoundVariables.getAllRootBlocks = function(variables, opt_bounds) {
  var targetVariables = [];
  if (opt_bounds === true) {
    for (var i = 0, variable; variable = variables[i]; i++) {
      var bounds = variable.getAllBoundVariables();
      Array.prototype.push.apply(targetVariables, bounds);
    }
  } else {
    targetVariables = variables;
  }
  var rootBlocks = [];
  for (var i = 0, variable; variable = targetVariables[i]; i++) {
    var block = variable.getSourceBlock();
    var root = block.getRootBlock();
    if (rootBlocks.indexOf(root) == -1) {
      rootBlocks.push(root);
    }
  }
  return rootBlocks;
};

Blockly.BoundVariables.findReferencesInside = function(value, connection) {
  if (value.referenceCount() == 0) {
    return [];
  }
  var references = [].concat(value.referenceList_);
  var block = connection.getSourceBlock();
  var contextWorkspace = connection.contextWorkbench &&
      connection.contextWorkbench.getWorkspace();
  var result = [];

  for (var i = 0, ref; ref = references[i]; i++) {
    var workspace = ref.getWorkspace();
    if (workspace.isMutator && workspace != block.workspace) {
      var isDescendant = !!contextWorkspace &&
          Blockly.WorkspaceTree.isDescendant(workspace, contextWorkspace);
      if (isDescendant) {
        result.push(ref);
      }
    }
    if (workspace == block.workspace) {
      var refBlock = ref.getSourceBlock();
      while (refBlock && refBlock.getParent()) {
        var parent = refBlock.getParent();
        if (parent != block) {
          // NOP.
        } else if (refBlock.outputConnection.targetConnection == connection) {
          result.push(ref);
        }
        refBlock = parent;
      }
    }
  }
  return result;
};

/**
 * Returns a list of values without duplicates that the given references refer
 * to.
 * @param {!Array.<!Blockly.BoundVariableValueReference>} references A list of
 *     references whose variables values to get.
 * @return {!Array.<!Blockly.BoundVariableValue>} A list of values.
 */
Blockly.BoundVariables.getValuesFromReferenceList = function(references) {
  var values = [];
  for (var i = 0, reference; reference = references[i]; i++) {
    var value = reference.getBoundValue();
    if (value && values.indexOf(value) == -1) {
      values.push(value);
    }
  }
  return values;
};

/**
 * Collects all of variables which exist in or inside the given block.
 * @param {!Blockly.Block} block The block to search for variables.
 * @param {boolean=} opt_filter If true, collect only variable references. If
 *     false, collect only values. If not provided, include both of them.
 * @return {!Array.<!Blockly.BoundVariableAbstract>} List of variables.
 */
Blockly.BoundVariables.getAllVariablesOnBlocks = function(block, opt_filter) {
  var variables = [];
  var descendants = block.getDescendants();
  for (var i = 0, block; block = descendants[i]; i++) {
    Array.prototype.push.apply(variables, block.getVariables(opt_filter));
  }
  return variables;
};

/**
 * Returns if any existing variable references will never be changed even if
 * the variable is renamed to the given name.
 * @param {!Blockly.BoundVariableAbstract} variable The variable to be renamed.
 * @param {!string} The variable's new name.
 * @return {boolean} True if the renaming is valid.
 */
Blockly.BoundVariables.canRenameTo = function(variable, newName) {
  if (!Blockly.BoundVariables.isLegalName(variable.label, newName)) {
    return false;
  }
  var oldName = variable.getVariableName();
  if (oldName === newName) {
    return true;
  }
  if (Blockly.BoundVariables.isUniqueName(variable.label, newName,
        variable.getWorkspace())) {
    return true;
  }

  var renamedVars = variable.getAllBoundVariables();
  var renamedTopBlocks = Blockly.BoundVariables.getAllRootBlocks(renamedVars);

  var failedIndex = 0;
  variable.setVariableName(newName);
  try {
    failedIndex = goog.array.findIndex(renamedTopBlocks, function(block) {
        return !block.isInFlyout && !block.resolveReference(null);
      });
  } finally {
    variable.setVariableName(oldName);
  }
  return failedIndex < 0;
};

// Reference: http://caml.inria.fr/pub/docs/manual-ocaml/lex.html#sec84
Blockly.BoundVariables.RESERVED_KEYWORDS = [
  "and", "as", "assert", "asr", "begin", "class", "constraint", "do", "done",
  "downto", "else", "end", "exception", "external", "false", "for", "fun",
  "function", "functor", "if", "in", "include", "inherit", "initializer",
  "land", "lazy", "let", "lor", "lsl", "lsr", "lxor", "match", "method", "mod",
  "module", "mutable", "new", "nonrec", "object", "of", "open", "or",
  "private", "rec", "sig", "struct", "then", "to", "true", "try", "type",
  "val", "virtual", "when", "while", "with"
];

/**
 * Returns whether the given name is legal as a variable name.
 * @param {!number} label An enum representing which type of variable.
 * @param {string} newName The new variable name.
 * @return {boolean} True if the name is legal.
 */
Blockly.BoundVariables.isLegalName = function(label, newName) {
  if (!newName) {
    return false;
  }
  goog.asserts.assert(Blockly.BoundVariableAbstract.isValidLabel(label));

  if (Blockly.BoundVariables.RESERVED_KEYWORDS.indexOf(newName) != -1) {
    return false;
  }

  // Check if a string follows the naming convention.
  // Reference: https://caml.inria.fr/pub/docs/manual-ocaml/names.html
  if (Blockly.BoundVariableAbstract.isConstructorLabel(label)) {
    // [A-Z][\w']*
    if (newName.match(/^[A-Z][\w']*$/) == null) {
      return false;
    }
  } else {
    // [a-z_][\w']*
    if (newName.match(/^[a-z_][\w']*$/) == null) {
      return false;
    }
    // TODO(harukam): Support wildcard.
    if (newName === '_') {
      return false;
    }
  }
  return true;
};

/**
 * Validate the given name based on a type of variable.
 * @param {!number} label An enum representing which type of variable.
 * @param {string} newName The new variable name.
 * @param {string|null} Either the accepted text, a replacement text, or null
 *     to abort the change.
 */
Blockly.BoundVariables.variableNameValidator = function(label, newName) {
  if (!newName) {
    return null;
  }
  var trimmed = newName.trim();
  if (Blockly.BoundVariables.isLegalName(label, trimmed)) {
    return trimmed;
  }
  return null;
};

/**
 * Return a new variable name that is not yet being used on the related
 * workspace except for flyout ones.
 * @param {!number} label An enum representing which type of value.
 * @param {!Blockly.Workspace} workspace The workspace on which to generate
 *     a new variable name.
 * @return {!string} New variable name.
 */
Blockly.BoundVariables.generateUniqueName = function(label, workspace) {
  var workspaceFamily = Blockly.WorkspaceTree.getFamily(workspace);
  var namesMap = {};
  for (var i = 0, ws; ws = workspaceFamily[i]; i++) {
    var valueDB = ws.getValueDB(label);
    var keys = Object.keys(valueDB);
    for (var j = 0, key; key = keys[j]; j++) {
      var value = valueDB[key];
      namesMap[value.getVariableName()] = true;
    }
  }

  var isCtr = Blockly.BoundVariableAbstract.isConstructorLabel(label);
  var name = null;
  var acode = 'a'.charCodeAt(0);
  var zcode = 'z';
  var n = 0;
  while (!name) {
    var code = 'a'.charCodeAt(0);
    var zcode = 'z'.charCodeAt(0);
    for (; !name && code <= zcode; code++) {
      name = String.fromCharCode(code);
      name = isCtr ? name.toUpperCase() : name;
      if (0 < n) {
        name += n;
      }
      if (!Blockly.BoundVariables.isLegalName(label, name) ||
          name in namesMap) {
        name = null;
      }
    }
    n++;
  }
  return name;
};

/**
 * Rename variable values that are on the given block and its descendants to
 * generated names.
 * @param {!Blockly.Block} block The block whose variable values to be renamed.
 */
Blockly.BoundVariables.renameToGeneratedNames = function(block) {
  var workspace = block.workspace;
  var values = Blockly.BoundVariables.getAllVariablesOnBlocks(block, false);
  for (var i = 0, val; val = values[i]; i++) {
    var generated = Blockly.BoundVariables.generateUniqueName(
        Blockly.BoundVariableAbstract.VARIABLE, workspace);
    val.setVariableName(generated);
  }

  var ctorValueDB =
      workspace.getValueDB(Blockly.BoundVariableAbstract.CONSTRUCTOR);
  var keys = Object.keys(ctorValueDB);
  for (var i = 0, key; key = keys[i]; i++) {
    var val = ctorValueDB[key];
    if (val.getSourceBlock() == block) {
      var generated = Blockly.BoundVariables.generateUniqueName(
          Blockly.BoundVariableAbstract.CONSTRUCTOR, workspace);
      val.setVariableName(generated);
    }
  }
};

/**
 * Helper function for renaming the variable as the given name.
 * @param {Blockly.BoundVariableAbstract} variable The variable to rename.
 * @param {string} newName The new variable name.
 * @return {boolean} True if variable is renamed. Otherwise, false.
 */
Blockly.BoundVariables.renameVariableImpl_ = function(variable, newName) {
  newName = newName.trim();
  if (!Blockly.BoundVariables.canRenameTo(variable, newName)) {
    return false;
  }
  variable.setVariableName(newName);

  // Rerender flyout in related workbench.
  var block = variable.getSourceBlock();
  if (block.rendered) {
    var workspace = variable.getWorkspace();
    var wsList = Blockly.WorkspaceTree.getFamilyMutator(workspace);
    for (var i = 0, ws; ws = wsList[i]; i++) {
      var mutator = ws.ownerMutator_;
      if (mutator.isWorkbench()) {
        mutator.updateFlyoutTree();
      }
    }
  }
  return true;
};

/**
 * Rename the given variable. Open a user prompt dialog to get a new variable
 * name.
 * @param {!Blockly.BoundVariableAbstract} variable The variable to rename.
 */
Blockly.BoundVariables.renameVariable = function(variable) {
  var promptAndCheckWithAlert = function(defaultName) {
    var name = variable.getVariableName();
    var promptText =
        Blockly.Msg['RENAME_VARIABLE_TITLE'].replace('%1', name);
    Blockly.prompt(promptText, defaultName,
        function(newName) {
          if (!newName) {
            // NOP. User canceled prompt.
          } else {
            var changed = Blockly.BoundVariables.renameVariableImpl_(variable,
                newName);
            if (!changed) {
              // TODO: Define the message in the Blockly.Msg class.
              var msg = 'Invalid variable name!';
              Blockly.alert(msg, promptAndCheckWithAlert.bind(null, defaultName));
            }
          }
        });
  };
  promptAndCheckWithAlert('');
};
