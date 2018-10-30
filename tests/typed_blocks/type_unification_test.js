'use strict';

function create_typed_workspace() {
  var workspaceOptions = {
    typedVersion: true
  };
  return new Blockly.Workspace(workspaceOptions);
}

function isVariableOf(varBlock, block, opt_variableName) {
  var name1, name2, checkType;
  switch (block.type) {
    case 'let_typed':
      name1 = varBlock.getField('VAR').getText();
      name2 = block.getField('VAR').getText();
      checkType = varBlock.outputConnection.typeExpr.deref() ==
          block.getInput('EXP1').connection.typeExpr.deref();
      break;
    case 'lambda_typed':
      name1 = varBlock.getField('VAR').getText();
      name2 = block.getField('VAR').getText();
      checkType = varBlock.outputConnection.typeExpr.deref() ==
          block.outputConnection.typeExpr.arg_type.deref();
      break;
    default:
      return false;
  }
  return checkType && name1 === name2 &&
      (!opt_variableName || opt_variableName === name1);
}

function setVariableName(block, fieldName, name, opt_defautlFieldVariable) {
  var variable;
  if (opt_defautlFieldVariable) {
    variable = Blockly.Variables.getOrCreateVariablePackage(
        block.workspace, null, name, '');
  } else {
    variable = Blockly.BoundVariables.createReference(block, name);
  }
  block.getField(fieldName).setValue(variable.getId());
}

function test_type_unification_ifThenElseStructure() {
  var workspace = create_typed_workspace();
  try {
    var block = workspace.newBlock('logic_ternary_typed');
    var int1 = workspace.newBlock('int_typed');
    assertEquals(3, block.inputList && block.inputList.length);
    assertEquals(1, block.getInput('IF').connection.check_.length);
    assertEquals(Blockly.TypeExpr.BOOL_,
        block.getInput('IF').connection.typeExpr.label);
    assertEquals(Blockly.TypeExpr.TVAR_,
        block.getInput('THEN').connection.typeExpr.label);
    assertEquals(null, block.getInput('THEN').connection.typeExpr.val);
    assertEquals(block.getInput('THEN').connection.typeExpr,
        block.getInput('ELSE').connection.typeExpr);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_clearTypeVariableWhenDisconnectingListTypedBlocks() {
  var workspace = create_typed_workspace();
  try {
    var block = workspace.newBlock('lists_create_with_typed');
    var int1 = workspace.newBlock('int_typed');
    var float1 = workspace.newBlock('float_typed');
    block.getInput('ADD0').connection.connect(int1.outputConnection);
    assertFalse(block.getInput('ADD1').connection.checkType_(
        float1.outputConnection));
    assertEquals(Blockly.TypeExpr.INT_,
        block.outputConnection.typeExpr.element_type.deref().label);
    block.getInput('ADD0').connection.disconnect(int1.outputConnection);
    assertEquals(Blockly.TypeExpr.TVAR_,
        block.outputConnection.typeExpr.element_type.deref().label);
    block.getInput('ADD1').connection.connect(float1.outputConnection);
    assertEquals(Blockly.TypeExpr.FLOAT_,
        block.outputConnection.typeExpr.element_type.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_clearTypeVariableWhenDisconnectingLetTypedBlocks() {
  var workspace = create_typed_workspace();
  try {
    var block = workspace.newBlock('let_typed');
    var int1 = workspace.newBlock('int_typed');
    var var1 = workspace.newBlock('variables_get_typed');
    // Set a variable `i`
    setVariableName(var1, 'VAR', 'i');
    setVariableName(block, 'VAR', 'i');

    block.getInput('EXP1').connection.connect(int1.outputConnection);
    block.getInput('EXP2').connection.connect(var1.outputConnection);
    assertEquals(Blockly.TypeExpr.INT_,
        block.getInput('EXP1').connection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.INT_,
        block.getInput('EXP2').connection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.INT_,
        var1.outputConnection.typeExpr.deref().label);
    block.getInput('EXP1').connection.disconnect(int1.outputConnection);
    assertEquals(Blockly.TypeExpr.TVAR_,
        block.getInput('EXP1').connection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.TVAR_,
        block.getInput('EXP2').connection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.TVAR_,
        var1.outputConnection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_clearTypeVariableWhenDisconnectingLambdaAppTypedBlocks() {
  var workspace = create_typed_workspace();
  try {
    var block = workspace.newBlock('lambda_app_typed');
    var lambdaBlock = workspace.newBlock('lambda_typed');
    var bool1 = workspace.newBlock('logic_boolean_typed');
    block.getInput('FUN').connection.connect(lambdaBlock.outputConnection);
    block.getInput('ARG').connection.connect(bool1.outputConnection);
    assertEquals(Blockly.TypeExpr.BOOL_,
        lambdaBlock.outputConnection.typeExpr.arg_type.deref().label);
    assertEquals(Blockly.TypeExpr.BOOL_,
        block.getInput('FUN').connection.typeExpr.arg_type.deref().label);
    assertEquals(Blockly.TypeExpr.BOOL_,
        block.getInput('ARG').connection.typeExpr.deref().label);
    block.getInput('ARG').connection.disconnect(bool1.outputConnection);
    assertEquals(Blockly.TypeExpr.TVAR_,
        lambdaBlock.outputConnection.typeExpr.arg_type.deref().label);
    assertEquals(Blockly.TypeExpr.TVAR_,
        block.getInput('FUN').connection.typeExpr.arg_type.deref().label);
    assertEquals(Blockly.TypeExpr.TVAR_,
        block.getInput('ARG').connection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_clearTypeVariableWhenDisconnectingLambdaTypedBlocks() {
  var workspace = create_typed_workspace();
  try {
    var block = workspace.newBlock('lambda_app_typed');
    var lambdaBlock = workspace.newBlock('lambda_typed');
    var bool1 = workspace.newBlock('logic_boolean_typed');
    block.getInput('FUN').connection.connect(lambdaBlock.outputConnection);
    block.getInput('ARG').connection.connect(bool1.outputConnection);
    assertEquals(Blockly.TypeExpr.BOOL_,
        lambdaBlock.outputConnection.typeExpr.arg_type.deref().label);
    assertEquals(Blockly.TypeExpr.BOOL_,
        block.getInput('FUN').connection.typeExpr.arg_type.deref().label);
    assertEquals(Blockly.TypeExpr.BOOL_,
        block.getInput('ARG').connection.typeExpr.deref().label);
    block.getInput('FUN').connection.disconnect(lambdaBlock.outputConnection);
    assertEquals(Blockly.TypeExpr.TVAR_,
        lambdaBlock.outputConnection.typeExpr.arg_type.deref().label);
    assertEquals(Blockly.TypeExpr.BOOL_,
        block.getInput('FUN').connection.typeExpr.arg_type.deref().label);
    assertEquals(Blockly.TypeExpr.BOOL_,
        block.getInput('ARG').connection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_clearTypeVariableWhenNestedLambdaTypedBlocks() {
  var workspace = create_typed_workspace();
  try {
    var block = workspace.newBlock('lambda_app_typed');
    var lambdaBlock = workspace.newBlock('lambda_typed');
    var ifBlock = workspace.newBlock('logic_ternary_typed');
    var float1 = workspace.newBlock('float_typed');
    block.getInput('FUN').connection.connect(lambdaBlock.outputConnection);
    ifBlock.getInput('THEN').connection.connect(float1.outputConnection);
    lambdaBlock.getInput('RETURN').connection.connect(ifBlock.outputConnection);
    assertEquals(Blockly.TypeExpr.FLOAT_,
        lambdaBlock.outputConnection.typeExpr.return_type.deref().label);
    assertEquals(Blockly.TypeExpr.FLOAT_,
        block.outputConnection.typeExpr.deref().label);
    ifBlock.getInput('THEN').connection.disconnect(float1.outputConnection);
    assertEquals(Blockly.TypeExpr.TVAR_,
        lambdaBlock.outputConnection.typeExpr.return_type.deref().label);
    assertEquals(Blockly.TypeExpr.TVAR_,
        block.outputConnection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_clearTypeVariableWhenNestedLetTypedBlocks() {
  var workspace = create_typed_workspace();
  try {
    var lambdaBlock = workspace.newBlock('lambda_typed');
    var letBlock = workspace.newBlock('let_typed');
    lambdaBlock.getInput('RETURN').connection.connect(
        letBlock.outputConnection);
    assertTrue(lambdaBlock.outputConnection.typeExpr.return_type.deref() ===
        letBlock.outputConnection.typeExpr.deref());
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_multiLevelNestedLambdaApp() {
  var workspace = create_typed_workspace();
  try {
    var appBlock1 = workspace.newBlock('lambda_app_typed');
    var appBlock2 = workspace.newBlock('lambda_app_typed');
    appBlock1.getInput('FUN').connection.connect(appBlock2.outputConnection);
    assertTrue(appBlock1.getInput('FUN').connection.typeExpr.deref() ===
        appBlock2.outputConnection.typeExpr.deref());
    assertTrue(appBlock1.getInput('FUN').connection.typeExpr.deref() ===
        appBlock2.outputConnection.typeExpr.deref());
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_deeplyCloningTypes() {
  var workspace = create_typed_workspace();
  try {
    var block = workspace.newBlock('logic_ternary_typed');
    var float1 = workspace.newBlock('float_typed');

    block.getInput('THEN').connection.connect(float1.outputConnection);
    assertEquals(Blockly.TypeExpr.TVAR_,
        block.getInput('THEN').connection.typeExpr.label);
    assertEquals(Blockly.TypeExpr.FLOAT_,
        block.getInput('THEN').connection.typeExpr.val.label);
    assertTrue(block.getInput('THEN').connection.typeExpr.val ===
        float1.outputConnection.typeExpr);
    var clonedThenType = block.getInput('THEN').connection.typeExpr.clone();
    assertFalse(clonedThenType.val === float1.outputConnection.typeExpr);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_listStructure() {
  var workspace = create_typed_workspace();
  try {
    var block = workspace.newBlock('lists_create_with_typed');
    var intArith1 = workspace.newBlock('int_arithmetic_typed');
    block.getInput('ADD0').connection.connect(intArith1.outputConnection);
    assertEquals(Blockly.TypeExpr.INT_,
        block.outputConnection.typeExpr.element_type.deref().label);
    assertEquals(Blockly.TypeExpr.INT_,
        block.getInput('ADD1').connection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.INT_,
        block.getInput('ADD2').connection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_intArithmeticStructure() {
  var workspace = create_typed_workspace();
  try {
    var block = workspace.newBlock('int_arithmetic_typed');
    var var1 = workspace.newBlock('variables_get_typed');
    var var2 = workspace.newBlock('variables_get_typed');
    var letVar1 = workspace.newBlock('let_typed');
    var letVar2 = workspace.newBlock('let_typed');
    // Set a variable `i`
    setVariableName(var1, 'VAR', 'i');
    setVariableName(letVar1, 'VAR', 'i');
    // Set a variable `j`
    var variableId = workspace.getVariable('j').getId();
    var2.getField('VAR').setValue(variableId);
    letVar2.getField('VAR').setValue(variableId);
    setVariableName(var2, 'VAR', 'i');
    setVariableName(letVar2, 'VAR', 'i');
    // Define variables `i` and `j`
    letVar1.getInput('EXP2').connection.connect(var1.outputConnection);
    letVar2.getInput('EXP2').connection.connect(var2.outputConnection);

    block.getInput('A').connection.connect(letVar1.outputConnection);
    block.getInput('B').connection.connect(letVar2.outputConnection);
    assertEquals(letVar1.getInput('EXP1').connection.typeExpr.deref().label,
        letVar2.getInput('EXP1').connection.typeExpr.deref().label);
    assertEquals(var1.outputConnection.typeExpr.deref().label,
        var2.outputConnection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.INT_,
        var1.outputConnection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_floatArithmeticStructure() {
  var workspace = create_typed_workspace();
  try {
    var block = workspace.newBlock('float_arithmetic_typed');
    var var1 = workspace.newBlock('variables_get_typed');
    var var2 = workspace.newBlock('variables_get_typed');
    var letVar1 = workspace.newBlock('let_typed');
    var letVar2 = workspace.newBlock('let_typed');
    // Set a variable `i`
    var variableId = workspace.getVariable('i').getId();
    var1.getField('VAR').setValue(variableId);
    letVar1.getField('VAR').setValue(variableId);
    // Set a variable `j`
    var variableId = workspace.getVariable('j').getId();
    var2.getField('VAR').setValue(variableId);
    letVar2.getField('VAR').setValue(variableId);
    // Define variables `i` and `j`
    letVar1.getInput('EXP2').connection.connect(var1.outputConnection);
    letVar2.getInput('EXP2').connection.connect(var2.outputConnection);

    block.getInput('A').connection.connect(letVar1.outputConnection);
    block.getInput('B').connection.connect(letVar2.outputConnection);
    assertEquals(letVar1.getInput('EXP1').connection.typeExpr.deref().label,
        letVar2.getInput('EXP1').connection.typeExpr.deref().label);
    assertEquals(var1.outputConnection.typeExpr.deref().label,
        var2.outputConnection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.FLOAT_,
        var1.outputConnection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_pairStructure() {
  var workspace = create_typed_workspace();
  try {
    var block = workspace.newBlock('pair_create_typed');
    var firstBlock = workspace.newBlock('pair_first_typed');
    var secondBlock = workspace.newBlock('pair_second_typed');
    var int1 = workspace.newBlock('int_typed');
    var bool1 = workspace.newBlock('logic_boolean_typed');
    block.getInput('FIRST').connection.connect(int1.outputConnection);
    block.getInput('SECOND').connection.connect(bool1.outputConnection);
    assertEquals(Blockly.TypeExpr.PAIR_,
        block.outputConnection.typeExpr.label);
    assertEquals(Blockly.TypeExpr.INT_,
        block.outputConnection.typeExpr.first_type.deref().label);
    assertEquals(Blockly.TypeExpr.BOOL_,
        block.outputConnection.typeExpr.second_type.deref().label);
    firstBlock.getInput('FIRST').connection.connect(block.outputConnection);
    assertEquals(Blockly.TypeExpr.INT_,
        firstBlock.outputConnection.typeExpr.deref().label);
    firstBlock.getInput('FIRST').connection.disconnect(block.outputConnection);
    secondBlock.getInput('SECOND').connection.connect(block.outputConnection);
    assertEquals(Blockly.TypeExpr.BOOL_,
        secondBlock.outputConnection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_lambdaStructure() {
  var workspace = create_typed_workspace();
  try {
    var block = workspace.newBlock('lambda_typed');
    var var1 = workspace.newBlock('variables_get_typed');
    // Set the same variable name with the name of lambda's argument.
    var variable = block.getField('VAR').getVariable();
    var variableId = variable.getId();
    var1.getField('VAR').setValue(variableId);
    block.getInput('RETURN').connection.connect(var1.outputConnection);
    assertEquals(var1.getField('VAR').getText(),
        block.getField('VAR').getText());
    assertTrue(block.outputConnection.typeExpr.return_type.deref() ===
        var1.outputConnection.typeExpr.deref());
    assertTrue(block.outputConnection.typeExpr.arg_type.deref() ==
        var1.outputConnection.typeExpr.deref());
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_lambdaAppStructure() {
  var workspace = create_typed_workspace();
  try {
    var block = workspace.newBlock('lambda_app_typed');
    var lambdaBlock = workspace.newBlock('lambda_typed');
    var int1 = workspace.newBlock('int_typed');
    block.getInput('FUN').connection.connect(lambdaBlock.outputConnection);
    block.getInput('ARG').connection.connect(int1.outputConnection);
    var var1 = workspace.newBlock('variables_get_typed');
    // Set the same variable name with the name of lambda's argument.
    var variable = lambdaBlock.getField('VAR').getVariable();
    var variableId = variable.getId();
    var1.getField('VAR').setValue(variableId);
    assertEquals(var1.getField('VAR').getText(),
        lambdaBlock.getField('VAR').getText());
    lambdaBlock.getInput('RETURN').connection.connect(var1.outputConnection);
    assertTrue(block.outputConnection.typeExpr.deref() ===
        lambdaBlock.outputConnection.typeExpr.return_type.deref());
    assertEquals(Blockly.TypeExpr.INT_,
        lambdaBlock.outputConnection.typeExpr.arg_type.deref().label);
    assertEquals(Blockly.TypeExpr.INT_,
        var1.outputConnection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_logicCompareStructure() {
  var workspace = create_typed_workspace();
  try {
    var block = workspace.newBlock('logic_compare_typed');
    var ifBlock = workspace.newBlock('logic_ternary_typed');
    var bool1 = workspace.newBlock('logic_boolean_typed');
    block.getField('OP').setValue('=');
    assertEquals(Blockly.TypeExpr.BOOL_,
        block.outputConnection.typeExpr.label);
    block.getInput('A').connection.connect(ifBlock.outputConnection);
    ifBlock.getInput('THEN').connection.connect(bool1.outputConnection);
    assertEquals(Blockly.TypeExpr.BOOL_,
        block.getInput('A').connection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.BOOL_,
        block.getInput('B').connection.typeExpr.deref().label);
    block.getInput('A').connection.disconnect(ifBlock.outputConnection);
    assertEquals(Blockly.TypeExpr.TVAR_,
        block.getInput('A').connection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_matchStructure() {
  var workspace = create_typed_workspace();
  try {
    var block = workspace.newBlock('match_typed');
    var intInput = workspace.newBlock('int_typed');
    var intPtn = workspace.newBlock('int_typed');
    var boolOutput = workspace.newBlock('logic_boolean_typed');
    block.getInput('INPUT').connection.connect(intInput.outputConnection);
    block.getInput('PATTERN1').connection.connect(intPtn.outputConnection);
    block.getInput('OUTPUT1').connection.connect(boolOutput.outputConnection);

    assertEquals(Blockly.TypeExpr.BOOL_,
        block.outputConnection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.INT_,
        block.getInput('INPUT').connection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_useWorkbenchWithinLetTypedBlock() {
  var workspace = create_typed_workspace();
  try {
    // Inner let typed block.
    var innerLetBlock = workspace.newBlock('let_typed');
    // Outer let typed block.
    var outerLetBlock = workspace.newBlock('let_typed');
    // Set a variable `j`
    setVariableName(innerLetBlock, 'VAR', 'j');
    // Set a variable `i`
    setVariableName(outerLetBlock, 'VAR', 'i');

    outerLetBlock.getInput('EXP2').connection.connect(innerLetBlock.outputConnection);
    var xml = innerLetBlock.getTreeInFlyout();
    var childNodes = xml.childNodes;
    assertEquals(childNodes.length, 2);
    var innersVars = Blockly.Xml.domToBlock(childNodes[0], workspace);
    var outersVar = Blockly.Xml.domToBlock(childNodes[1], workspace);
    assertTrue(isVariableOf(innersVars, innerLetBlock, 'j'));
    assertTrue(isVariableOf(outersVar, outerLetBlock, 'i'));

    var int1 = workspace.newBlock('int_typed');
    outerLetBlock.getInput('EXP1').connection.connect(int1.outputConnection);
    assertEquals(Blockly.TypeExpr.INT_,
        outersVar.outputConnection.typeExpr.deref().label);
    var float1 = workspace.newBlock('float_typed');
    innerLetBlock.getInput('EXP1').connection.connect(float1.outputConnection);
    assertEquals(Blockly.TypeExpr.FLOAT_,
        innersVars.outputConnection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_useWorkbenchWithinLambdaTypedBlock() {
  var workspace = create_typed_workspace();
  try {
    // Inner lambda typed block.
    var innerLambdaBlock = workspace.newBlock('lambda_typed');
    // Outer let typed block.
    var outerLetBlock = workspace.newBlock('let_typed');
    // Set a variable `j`
    var variable2 = Blockly.Variables.getOrCreateVariablePackage(
        workspace, null, 'j', '');
    innerLambdaBlock.getField('VAR').setValue(variable2.getId());
    // Set a variable `i`
    var variable1 = Blockly.Variables.getOrCreateVariablePackage(
        workspace, null, 'i', '');
    outerLetBlock.getField('VAR').setValue(variable1.getId());

    outerLetBlock.getInput('EXP2').connection.connect(
        innerLambdaBlock.outputConnection);
    var xml = innerLambdaBlock.getTreeInFlyout();
    var childNodes = xml.childNodes;
    assertEquals(childNodes.length, 2);
    var innersVars = Blockly.Xml.domToBlock(childNodes[0], workspace);
    var outersVar = Blockly.Xml.domToBlock(childNodes[1], workspace);
    assertTrue(isVariableOf(innersVars, innerLambdaBlock, 'j'));
    assertTrue(isVariableOf(outersVar, outerLetBlock, 'i'));

    var int1 = workspace.newBlock('int_typed');
    outerLetBlock.getInput('EXP1').connection.connect(int1.outputConnection);
    assertEquals(Blockly.TypeExpr.INT_,
        outersVar.outputConnection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_simpleTreeInFlyoutReferences() {
  var workspace = create_typed_workspace();
  try {
    var letBlock = workspace.newBlock('let_typed');
    setVariableName(letBlock, 'VAR', 'j');
    var xml = letBlock.getTreeInFlyout();
    var childNodes = xml.childNodes;
    for (var i = 0, node; node = childNodes[i]; i++) {
      assertEqual(node.tagName, 'BLOCK');
    }
  } finally {
    workspace.dispose();
  }
}
