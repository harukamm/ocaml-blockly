'use strict';

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
    setVariableName(var1, 'i');
    setVariableName(block, 'i');

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
    setVariableName(var1, 'i');
    setVariableName(letVar1, 'i');
    // Set a variable `j`
    setVariableName(var2, 'j');
    setVariableName(letVar2, 'j');
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
    setVariableName(var1, 'i');
    setVariableName(letVar1, 'i');
    // Set a variable `j`
    setVariableName(var2, 'j');
    setVariableName(letVar2, 'j');
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
    setVariableName(block, 'x');
    setVariableName(var1, 'x');
    block.getInput('RETURN').connection.connect(var1.outputConnection);
    assertEquals(getVariableName(var1),
        getVariableName(block));
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
    var variableName = getVariable(lambdaBlock).getVariableName();
    setVariableName(var1, variableName);
    assertEquals(getVariableName(var1),
        getVariableName(lambdaBlock));
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
  var workbench;
  try {
    // Inner let typed block.
    var innerLetBlock = workspace.newBlock('let_typed');
    // Outer let typed block.
    var outerLetBlock = workspace.newBlock('let_typed');
    // Set a variable `j`
    setVariableName(innerLetBlock, 'j');
    // Set a variable `i`
    setVariableName(outerLetBlock, 'i');

    outerLetBlock.getInput('EXP2').connection.connect(innerLetBlock.outputConnection);
    workbench = create_mock_workbench(innerLetBlock);
    var blocks = getFlyoutBlocksFromWorkbench(workbench, workspace);
    assertEquals(blocks.length, 2);
    var innersVars = blocks[0];
    var outersVar = blocks[1];
    // workbench.getFlyoutLanguageTree_() does not guarantee any order. If
    // they seems to have been swapped, just swap them.
    if (isVariableOf(outersVar, innerLetBlock, 'j')) {
      var tmp = outersVar;
      outersVar = innersVars;
      innersVars = tmp;
    }
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
    if (workbench) {
      workbench.dispose();
    }
  }
}

function test_type_unification_useWorkbenchWithinLambdaTypedBlock() {
  var workspace = create_typed_workspace();
  var workbench;
  try {
    // Inner lambda typed block.
    var innerLambdaBlock = workspace.newBlock('lambda_typed');
    // Outer let typed block.
    var outerLetBlock = workspace.newBlock('let_typed');
    // Set a variable `j`
    setVariableName(innerLambdaBlock, 'j');
    // Set a variable `i`
    setVariableName(outerLetBlock, 'i');

    outerLetBlock.getInput('EXP2').connection.connect(
        innerLambdaBlock.outputConnection);
    workbench = create_mock_workbench(innerLambdaBlock);
    var blocks = getFlyoutBlocksFromWorkbench(workbench, workspace);
    assertEquals(blocks.length, 2);
    var innersVars = blocks[0];
    var outersVar = blocks[1];
    // workbench.getFlyoutLanguageTree_() does not guarantee any order. If
    // they seems to have been swapped, just swap them.
    if (isVariableOf(outersVar, innerLambdaBlock, 'j')) {
      var tmp = outersVar;
      outersVar = innersVars;
      innersVars = tmp;
    }
    assertTrue(isVariableOf(innersVars, innerLambdaBlock, 'j'));
    assertTrue(isVariableOf(outersVar, outerLetBlock, 'i'));

    var int1 = workspace.newBlock('int_typed');
    outerLetBlock.getInput('EXP1').connection.connect(int1.outputConnection);
    assertEquals(Blockly.TypeExpr.INT_,
        outersVar.outputConnection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
    if (workbench) {
      workbench.dispose();
    }
  }
}

function test_type_unification_simpleTreeInFlyoutReferences() {
  var workspace = create_typed_workspace();
  var workbench;
  try {
    var letBlock = workspace.newBlock('let_typed');
    workbench = create_mock_workbench(letBlock);
    setVariableName(letBlock, 'j');
    var xml = workbench.getFlyoutLanguageTree_();
    var childNodes = xml.childNodes;
    for (var i = 0, node; node = childNodes[i]; i++) {
      assertEquals(node.tagName, 'BLOCK');
    }
  } finally {
    workspace.dispose();
    if (workbench) {
      workbench.dispose();
    }
  }
}

function test_type_unification_changeVariablesNameReferences() {
  var workspace = create_typed_workspace();
  try {
    var outerBlock = workspace.newBlock('let_typed');
    var innerBlock = workspace.newBlock('let_typed');
    var varBlock = workspace.newBlock('variables_get_typed');
    setVariableName(outerBlock, 'j');
    setVariableName(innerBlock, 'i');
    setVariableName(varBlock, 'j');
    // [let j = <> in < [let i = <> in < [j] >] >]
    outerBlock.getInput('EXP2').connection.connect(innerBlock.outputConnection);
    innerBlock.getInput('EXP2').connection.connect(varBlock.outputConnection);

    assertTrue(isOfBoundVariable(varBlock, outerBlock));
    setVariableName(outerBlock, 'i');
    assertTrue(getVariableName(varBlock) === 'i');

    setVariableName(outerBlock, 'x');
    assertTrue(getVariableName(varBlock) === 'x');
    // [let j = <> in < [let i = <> in < [j] >] >]

    // [let x = <> in < [let i = <> in <>] >]   [x]
    innerBlock.getInput('EXP2').connection.disconnect(
        varBlock.outputConnection);
    // Variable binding relation holds even after disconnect().
    assertTrue(isOfBoundVariable(varBlock, outerBlock));
    setVariableName(outerBlock, 'y');
    assertTrue(getVariableName(outerBlock) === 'y');
    assertTrue(getVariableName(varBlock) === 'y');

    // [let y = <> in < [let i = <> in < >] >]   [y]
    setVariableName(varBlock, 'i');
    // varBlock can't connect to innerBlock on the 'EXP2' input because
    // variables named 'i' must be bound to the variable declared on
    // innerBlock.
    assertFalse(
        varBlock.resolveReference(innerBlock.getInput('EXP2').connection));
    assertTrue(
        varBlock.resolveReference(innerBlock.getInput('EXP1').connection));
    setVariableName(varBlock, 'm');
    innerBlock.getInput('EXP2').connection.connect(
        varBlock.outputConnection);
    assertTrue(getVariableName(outerBlock) === 'm');
    assertTrue(getVariableName(innerBlock) === 'i');
    assertTrue(getVariableName(varBlock) == 'm');
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_changeVariablesNameReferencesNested() {
  var workspace = create_typed_workspace();
  try {
    function getNthName(n) {
      return isNaN(n) ? null : 'var' + n;
    }
    var nestedSize = 20;
    var valueBlocks = createNestedValueBlock(workspace, nestedSize,
        getNthName);
    var var1 = workspace.newBlock('variables_get_typed');
    var lastBlock = valueBlocks[nestedSize - 1];
    var inputInLastBlock = getValueScopeInput(lastBlock);

    // Connect var1 and lastBlock.
    setVariableName(var1, 'hogehoge');
    var errored = false;
    try {
      inputInLastBlock.connection.connect(var1.outputConnection);
    } catch (err) {
      // Error is expected to occur because var1 block has a reference to an
      // undefined variable named 'hogehoge'.
      errored = true;
    }
    assertTrue(errored);

    // Bind variable of var1 with that of x-th value block.
    var x = 5;
    setVariableName(var1, getNthName(x));
    inputInLastBlock.connection.connect(var1.outputConnection);
    function checkName(n, nthName) {
      for (var i = 0; i < valueBlocks.length; i++) {
        var expected = i == n ? nthName : getNthName(i);
        assertTrue(getVariableName(valueBlocks[i]) === expected);
      }
    }
    setVariableName(var1, 'hogehoge');
    checkName(x, 'hogehoge');
    setVariableName(valueBlocks[x], 'foo');
    assertTrue(getVariableName(var1) === 'foo');
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_isReferenceOrValue() {
  var workspace = create_typed_workspace();
  try {
    var letBlock = workspace.newBlock('let_typed');
    var lambdaBlock = workspace.newBlock('lambda_typed');
    var varBlock = workspace.newBlock('variables_get_typed');
    assertTrue(getVariableField(letBlock).isForValue());
    assertTrue(getVariableField(lambdaBlock).isForValue());
    assertTrue(!getVariableField(varBlock).isForValue());

    var letValue = getVariable(letBlock);
    var lambdaValue = getVariable(lambdaBlock);
    var varValue = getVariable(varBlock);
    assertTrue(letValue.isValueVariable());
    assertTrue(lambdaValue.isValueVariable());
    assertTrue(varValue.isReferenceVariable());

    assertTrue(letValue.isNormalVariable());
    assertTrue(lambdaValue.isNormalVariable());
    assertTrue(varValue.isNormalVariable());

    assertFalse(letValue.isValueConstructor());
    assertFalse(lambdaValue.isValueConstructor());
    assertFalse(varValue.isValueConstructor());

    assertFalse(letValue.isReferenceConstructor());
    assertFalse(lambdaValue.isReferenceConstructor());
    assertFalse(varValue.isReferenceConstructor());

    assertFalse(letValue.isConstructor());
    assertFalse(lambdaValue.isConstructor());
    assertFalse(varValue.isConstructor());
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_resolveNestedReferenceBlock() {
  var workspace = create_typed_workspace();
  try {
    var letBlock = workspace.newBlock('let_typed');
    var varBlock1 = workspace.newBlock('variables_get_typed');
    var varBlock2_1 = workspace.newBlock('variables_get_typed');
    var varBlock2_2 = workspace.newBlock('variables_get_typed');
    var intArith1 = workspace.newBlock('int_arithmetic_typed');
    var intArith2 = workspace.newBlock('int_arithmetic_typed');
    setVariableName(letBlock, 'i');
    setVariableName(varBlock1, 'i');
    setVariableName(varBlock2_1, 'i');
    setVariableName(varBlock2_2, 'i');

    // let i = <> in <[ <[i]> + <[ <i> + <i> ]> ]>
    letBlock.getInput('EXP2').connection.connect(
        intArith1.outputConnection);
    intArith1.getInput('A').connection.connect(
        varBlock1.outputConnection);
    intArith1.getInput('B').connection.connect(
        intArith2.outputConnection);
    intArith2.getInput('A').connection.connect(
        varBlock2_1.outputConnection);
    intArith2.getInput('B').connection.connect(
        varBlock2_2.outputConnection);

    var value = getVariable(letBlock);
    var reference1 = getVariable(varBlock1);
    var reference2_1 = getVariable(varBlock2_1);
    var reference2_2 = getVariable(varBlock2_2);

    assertTrue(value.referenceCount() == 3);
    assertTrue(reference1.getBoundValue() == value);
    assertTrue(reference2_1.getBoundValue() == value);
    assertTrue(reference2_2.getBoundValue() == value);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_resolveNestedReferenceOnNestedValueBlock() {
  var workspace = create_typed_workspace();
  try {
    var lambdaBlock1 = workspace.newBlock('lambda_typed');
    var lambdaBlock2 = workspace.newBlock('lambda_typed');
    var letBlock1 = workspace.newBlock('let_typed');
    var letBlock2 = workspace.newBlock('let_typed');
    var varBlock_i = workspace.newBlock('variables_get_typed');
    var varBlock_j = workspace.newBlock('variables_get_typed');
    var listBlock = workspace.newBlock('lists_create_with_typed');
    setVariableName(lambdaBlock1, 'j');
    setVariableName(lambdaBlock2, 'i');
    setVariableName(letBlock1, 'i');
    setVariableName(letBlock2, 'j');
    setVariableName(varBlock_i, 'i');
    setVariableName(varBlock_j, 'j');

    // [lambda(j) <[lambda (i) <[<[j]>, <[i]>]>]>]
    // [let i = <> in <[let j = <> in <>]>]
    lambdaBlock1.getInput('RETURN').connection.connect(
        lambdaBlock2.outputConnection);
    lambdaBlock2.getInput('RETURN').connection.connect(
        listBlock.outputConnection);
    listBlock.getInput('ADD0').connection.connect(
        varBlock_j.outputConnection);
    listBlock.getInput('ADD1').connection.connect(
        varBlock_i.outputConnection);
    letBlock1.getInput('EXP2').connection.connect(
        letBlock2.outputConnection);

    var reference_i = getVariable(varBlock_i);
    var reference_j = getVariable(varBlock_j);

    assertTrue(getVariable(lambdaBlock1).referenceCount() == 1);
    assertTrue(getVariable(lambdaBlock1) == reference_j.getBoundValue());
    assertTrue(getVariable(lambdaBlock2).referenceCount() == 1);
    assertTrue(getVariable(lambdaBlock2) == reference_i.getBoundValue());

    lambdaBlock2.getInput('RETURN').connection.disconnect(
        listBlock.outputConnection);

    // [let i = <> in <[let j = <> in <[<[j]>, <[i]>]>]>]
    // listBlock can't connect to letBlock2 on the 'EXP2' input because
    // variables on varBlock_i and varBlock_j are bound to other values.
    assertTrue(isOfBoundVariable(varBlock_j, lambdaBlock1));
    assertTrue(isOfBoundVariable(varBlock_i, lambdaBlock2));
    assertFalse(listBlock.resolveReference(
        letBlock2.getInput('EXP2').connection));
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_disconnectReferenceBlock() {
  var workspace = create_typed_workspace();
  try {
    var letBlock = workspace.newBlock('let_typed');
    var varBlock = workspace.newBlock('variables_get_typed');
    var boolBlock = workspace.newBlock('logic_boolean_typed');
    setVariableName(letBlock, 'x');
    setVariableName(varBlock, 'x');

    letBlock.getInput('EXP1').connection.connect(boolBlock.outputConnection);
    letBlock.getInput('EXP2').connection.connect(varBlock.outputConnection);
    var value = getVariable(letBlock);
    var reference = getVariable(varBlock);

    assertEquals(reference.getTypeExpr().deref().label,
        Blockly.TypeExpr.BOOL_);
    assertEquals(reference.getBoundValue(), value);

    letBlock.getInput('EXP2').connection.disconnect(varBlock.outputConnection);

    assertEquals(reference.getTypeExpr().deref().label,
        Blockly.TypeExpr.BOOL_);
    assertEquals(reference.getBoundValue(), value);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_workbenchVariableContext() {
  var workspace = create_typed_workspace();
  var workbench;
  try {
    var letBlock = workspace.newBlock('let_typed');
    var letValue = getVariable(letBlock);
    setVariableName(letBlock, 'j');
    workbench = create_mock_workbench(letBlock);
    var blocks = getFlyoutBlocksFromWorkbench(workbench);
    assertEquals(blocks.length, 1);
    var referenceBlock = blocks[0];
    var reference = getVariable(referenceBlock);
    assertEquals(reference.getBoundValue(), letValue);

    var exp1Type = letBlock.getInput('EXP1').connection.typeExpr;
    assertEquals(reference.getTypeExpr().deref(), exp1Type);
    assertNotEquals(reference.getTypeExpr().deref(), letValue.getTypeExpr());
    assertEquals(reference.getTypeExpr().deref(), letValue.getTypeExpr().deref());

    var arithBlock = workbench.getWorkspace().newBlock('int_arithmetic_typed');
    arithBlock.getInput('A').connection.connect(referenceBlock.outputConnection);

    assertEquals(exp1Type.deref().label, Blockly.TypeExpr.INT_);
    assertEquals(letValue.getTypeExpr().deref().label, Blockly.TypeExpr.INT_);
    assertEquals(reference.getTypeExpr().deref().label, Blockly.TypeExpr.INT_);
    assertEquals(reference.getBoundValue(), letValue);

    arithBlock.getInput('A').connection.disconnect(referenceBlock.outputConnection);

    assertEquals(reference.getTypeExpr().deref(), exp1Type);
    assertNotEquals(reference.getTypeExpr().deref(), letValue.getTypeExpr());
    assertEquals(reference.getTypeExpr().deref(), letValue.getTypeExpr().deref());

    var letBlock2 = workbench.getWorkspace().newBlock('let_typed');
    var letValue2 = getVariable(letBlock2);
    setVariableName(letBlock2, 'j');
    var exp2OnLetBlock2 = letBlock2.getInput('EXP2').connection;
    assertEquals(reference.getBoundValue(), letValue);
    assertNotEquals(reference.getBoundValue(), letValue2);
    // Can't connect to letBlock2 on the input 'EXP2' because variable
    // references named 'j' inside the input must be bound to letValue2.
    assertFalse(referenceBlock.resolveReference(exp2OnLetBlock2));
  } finally {
    workspace.dispose();
    if (workbench) {
      workbench.dispose();
    }
  }
}

function test_type_unification_workbenchReferencesTypeExprCleared() {
  var workspace = create_typed_workspace();
  var workbench;
  try {
    var letBlock = workspace.newBlock('let_typed');
    var letValue = getVariable(letBlock);
    setVariableName(letBlock, 'j');
    workbench = create_mock_workbench(letBlock);
    var blocks = getFlyoutBlocksFromWorkbench(workbench);
    assertEquals(blocks.length, 1);
    var referenceBlock = blocks[0];
    var reference = getVariable(referenceBlock);
    var exp1Type = letBlock.getInput('EXP1').connection.typeExpr;
    assertEquals(reference.getBoundValue(), letValue);
    assertNotEquals(reference.getTypeExpr().deref(), letValue.getTypeExpr());
    assertEquals(reference.getTypeExpr().deref(), letValue.getTypeExpr().deref());
    assertEquals(reference.getTypeExpr().deref(), exp1Type)

    // [ <[if then <[j]> else <>]> .+ <> ]
    var ifBlock = workbench.getWorkspace().newBlock('logic_ternary_typed');
    ifBlock.getInput('THEN').connection.connect(referenceBlock.outputConnection);
    var floatArith = workbench.getWorkspace().newBlock('float_arithmetic_typed');
    floatArith.getInput('A').connection.connect(ifBlock.outputConnection);

    assertEquals(exp1Type.deref().label, Blockly.TypeExpr.FLOAT_);
    assertEquals(reference.getTypeExpr().deref().label, Blockly.TypeExpr.FLOAT_);
    assertEquals(letValue.getTypeExpr().deref().label, Blockly.TypeExpr.FLOAT_);

    // [ <> .+ <> ]  [if then <[j]> else <>]
    floatArith.getInput('A').connection.disconnect();

    assertNotEquals(reference.getTypeExpr().deref(), letValue.getTypeExpr());
    assertEquals(reference.getTypeExpr().deref(), letValue.getTypeExpr().deref());
    assertEquals(reference.getTypeExpr().deref(), exp1Type)
  } finally {
    if (workbench) {
      workbench.dispose();
    }
    workspace.dispose();
  }
}

function test_type_unification_nestedWorkbenchContext() {
  var workspace = create_typed_workspace();
  var workbench;
  var nestedWorkbench;
  try {
    var letBlock = workspace.newBlock('let_typed');
    var letValue = getVariable(letBlock);
    setVariableName(letBlock, 'xx');
    workbench = create_mock_workbench(letBlock);
    var blocks = getFlyoutBlocksFromWorkbench(workbench);
    assertEquals(blocks.length, 1);
    var referenceBlockWB = blocks[0];
    var referenceWB = getVariable(referenceBlockWB);

    var letBlockWB = workbench.getWorkspace().newBlock('let_typed');
    var letValueWB = getVariable(letBlockWB);
    setVariableName(letBlockWB, 'xx');
    nestedWorkbench = create_mock_workbench(letBlockWB);
    var blocks = getFlyoutBlocksFromWorkbench(nestedWorkbench);
    assertEquals(blocks.length, 1);
    var referenceBlockNestedWB = blocks[0];
    var referenceNestedWB = getVariable(referenceBlockNestedWB);
    assertEquals(referenceNestedWB.getBoundValue(), letValueWB);

    var letBlockNestedWB = nestedWorkbench.getWorkspace().newBlock('let_typed');
    setVariableName(letBlockNestedWB, 'xx');

    var exp2 = letBlock.getInput('EXP2').connection;
    var exp1_WB = letBlockWB.getInput('EXP1').connection;
    var exp2_WB = letBlockWB.getInput('EXP2').connection;
    var exp2_NestedWB = letBlockNestedWB.getInput('EXP2').connection;

    assertTrue(referenceBlockWB.resolveReference(exp2));
    assertFalse(referenceBlockWB.resolveReference(exp2_WB));
    assertFalse(referenceBlockWB.resolveReference(exp2_NestedWB));

    assertEquals(referenceNestedWB.getBoundValue(), letValueWB)
    assertFalse(referenceBlockNestedWB.resolveReference(exp2));
    assertTrue(referenceBlockNestedWB.resolveReference(exp2_WB));
    assertFalse(referenceBlockNestedWB.resolveReference(exp2_NestedWB));

    exp1_WB.connect(referenceBlockWB.outputConnection);
    var copy = copyAndPasteBlock(referenceBlockNestedWB,
        workbench.getWorkspace());
    exp2_WB.connect(copy.outputConnection);

    assertEquals(referenceWB.getTypeExpr().deref(),
        letValueWB.getTypeExpr().deref());
    assertEquals(referenceNestedWB.getTypeExpr().deref(),
        letValueWB.getTypeExpr().deref());
  } finally {
    if (nestedWorkbench) {
      nestedWorkbench.dispose();
    }
    if (workbench) {
      workbench.dispose();
    }
    workspace.dispose();
  }
}

function test_type_unification_howReferenceBlockDiffers() {
  // This test shows the difference between reference block created by
  // workbench and one created manually using workspace.newBlock().
  var workspace = create_typed_workspace();
  var workbench;
  try {
    // Blocks for "created by workbench" case.
    var letBlockWB = workspace.newBlock('let_typed');
    var letValueWB = getVariable(letBlockWB);
    setVariableName(letBlockWB, 'j');
    workbench = create_mock_workbench(letBlockWB);
    var blocks = getFlyoutBlocksFromWorkbench(workbench);
    assertEquals(blocks.length, 1);
    var referenceBlockWB = blocks[0];
    var referenceWB = getVariable(referenceBlockWB);

    // Blocks for "created manually" case.
    var letBlockMN = workspace.newBlock('let_typed');
    var letValueMN = getVariable(letBlockMN);
    setVariableName(letBlockMN, 'k');
    var referenceBlockMN = workspace.newBlock('variables_get_typed');
    var referenceMN = getVariable(referenceBlockMN);
    setVariableName(referenceBlockMN, 'k');
    referenceMN.setBoundValue(letValueMN);

    // Conditions hold in "created by workbench" case.
    assertTrue(isVariableOf(referenceBlockWB, letBlockWB, 'j'));
    assertEquals(referenceWB.getBoundValue(), letValueWB);
    var exp1Type = letBlockWB.getInput('EXP1').connection.typeExpr;
    assertNotEquals(referenceWB.getTypeExpr().deref(), letValueWB.getTypeExpr());
    assertEquals(referenceWB.getTypeExpr().deref(), letValueWB.getTypeExpr().deref());
    assertEquals(referenceWB.getTypeExpr().deref(), exp1Type);
    var intArithWB = workspace.newBlock('int_arithmetic_typed');
    var left = intArithWB.getInput('A').connection;
    assertFalse(referenceBlockWB.resolveReference(left));
    var copy = copyAndPasteBlock(referenceBlockWB, intArithWB.workspace);
    // The result of reference resolution must be consistent between blocks
    // and copied ones.
    assertFalse(copy.resolveReference(left));

    // Conditions hold in "created manually" case.
    assertTrue(isVariableOf(referenceBlockMN, letBlockMN, 'k'));
    assertEquals(referenceMN.getBoundValue(), letValueMN);
    var exp1Type = letBlockMN.getInput('EXP1').connection.typeExpr;
    assertNotEquals(referenceMN.getTypeExpr(), letValueMN.getTypeExpr());
    assertNotEquals(referenceMN.getTypeExpr().deref(), letValueMN.getTypeExpr());
    assertEquals(referenceMN.getTypeExpr().deref(), exp1Type);
    var intArithMN = workspace.newBlock('int_arithmetic_typed');
    var left = intArithMN.getInput('A').connection;
    assertFalse(referenceBlockMN.resolveReference(left));
  } finally {
    if (workbench) {
      workbench.dispose();
    }
    workspace.dispose();
  }
}

function test_type_unification_workbenchBlocksTransferWorkspace() {
  var workspace = create_typed_workspace();
  var workbench;
  try {
    var letBlock = workspace.newBlock('let_typed');
    var letValue = getVariable(letBlock);
    setVariableName(letBlock, 'j');
    workbench = create_mock_workbench(letBlock);
    var blocks = getFlyoutBlocksFromWorkbench(workbench);
    assertEquals(blocks.length, 1);
    var referenceBlock = blocks[0];
    var reference = getVariable(referenceBlock);

    var floatArith = workspace.newBlock('float_arithmetic_typed');
    var left = floatArith.getInput('A').connection;
    assertFalse(referenceBlock.resolveReference(left));
    var copy = copyAndPasteBlock(referenceBlock, floatArith.workspace);
    // The result of reference resolution must be consistent between blocks
    // and copied ones.
    assertFalse(copy.resolveReference(left));

    assertFalse(referenceBlock.resolveReference(null, false, workspace));
    assertFalse(copy.resolveReference(null));
    var var1 = workspace.newBlock('variables_get_typed');
    assertFalse(var1.resolveReference(null));
  } finally {
    if (workbench) {
      workbench.dispose();
    }
    workspace.dispose();
  }
}

function test_type_unification_2levelNestWorkbenchImplicitContext() {
  var workspace = create_typed_workspace();
  var workbench;
  var nestedWorkbench;
  var nested2Workbench;
  try {
    var letBlock = workspace.newBlock('lambda_typed');
    var letValue = getVariable(letBlock);
    setVariableName(letBlock, 'f');
    workbench = create_mock_workbench(letBlock);
    var blocks = getFlyoutBlocksFromWorkbench(workbench);
    assertEquals(blocks.length, 1);
    var referenceBlockWB = blocks[0];
    var referenceWB = getVariable(referenceBlockWB);

    var letBlockWB = workbench.getWorkspace().newBlock('let_typed');
    var letValueWB = getVariable(letBlockWB);
    setVariableName(letBlockWB, 'j');
    nestedWorkbench = create_mock_workbench(letBlockWB);
    blocks = getFlyoutBlocksFromWorkbench(nestedWorkbench);
    assertEquals(blocks.length, 2);
    var referenceBlockNestedWB1 = blocks[0];
    var referenceBlockNestedWB2 = blocks[1];
    var referenceNestedWB1 = getVariable(referenceBlockNestedWB1);
    var referenceNestedWB2 = getVariable(referenceBlockNestedWB2);
    assertEquals(referenceNestedWB1.getBoundValue(), letValue);
    assertEquals(referenceNestedWB2.getBoundValue(), letValueWB);

    var letBlockNestedWB = nestedWorkbench.getWorkspace().newBlock('let_typed');
    var letValueNestedWB = getVariable(letBlockNestedWB);
    setVariableName(letBlockNestedWB, 'f');
    nested2Workbench = create_mock_workbench(letBlockNestedWB);
    blocks = getFlyoutBlocksFromWorkbench(nested2Workbench);
    assertEquals(blocks.length, 2);
    // Variable 'f' that 'letValue' represents is just overwritten in the
    // context. Blocks in workbench flyout are not always in order of
    // occurrence.
    assertEquals(getVariable(blocks[0]).getBoundValue(), letValueNestedWB);
    assertEquals(getVariable(blocks[1]).getBoundValue(), letValueWB);
    // If blocks are in order of occurrence, blocks[0] should have referred to
    // 'letValueWB', and blocks[1] to 'letValueNestedWB'.

    setVariableName(letBlock, 'x');
    blocks = getFlyoutBlocksFromWorkbench(nested2Workbench);
    assertEquals(blocks.length, 3);
    assertEquals(getVariable(blocks[0]).getBoundValue(), letValue);
    assertEquals(getVariable(blocks[1]).getBoundValue(), letValueWB);
    assertEquals(getVariable(blocks[2]).getBoundValue(), letValueNestedWB);
  } finally {
    if (nested2Workbench) {
      nested2Workbench.dispose();
    }
    if (nestedWorkbench) {
      nestedWorkbench.dispose();
    }
    if (workbench) {
      workbench.dispose();
    }
    workspace.dispose();
  }
}

function test_type_unification_fixBugReferenceBlockTypeInference() {
  var workspace = create_typed_workspace();
  var workbench;
  try {
    var letBlock = workspace.newBlock('let_typed');
    var letValue = getVariable(letBlock);
    setVariableName(letBlock, 'j');
    workbench = create_mock_workbench(letBlock);
    var blocks = getFlyoutBlocksFromWorkbench(workbench);
    assertEquals(blocks.length, 1);
    var referenceBlock = blocks[0];
    var reference = getVariable(referenceBlock);

    var intArith = workbench.getWorkspace().newBlock('int_arithmetic_typed');
    var left = intArith.getInput('A').connection;
    left.connect(referenceBlock.outputConnection);

    assertEquals(reference.getTypeExpr().deref().label, Blockly.TypeExpr.INT_);
    assertEquals(letValue.getTypeExpr().deref().label, Blockly.TypeExpr.INT_);

    var int1 = workspace.newBlock('int_typed');
    letBlock.getInput('EXP1').connection.connect(int1.outputConnection);
    int1.outputConnection.disconnect();

    assertEquals(reference.getTypeExpr().deref().label, Blockly.TypeExpr.INT_);
    assertEquals(letValue.getTypeExpr().deref().label, Blockly.TypeExpr.INT_);
  } finally {
    if (workbench) {
      workbench.dispose();
    }
    workspace.dispose();
  }
}

function test_type_unification_mockMutator() {
  var workspace = create_typed_workspace();
  try {
    var letBlock = workspace.newBlock('let_typed');
    var mutator = create_mock_mutator(letBlock, 'args_create_with_item');
    assertEquals(letBlock.argumentCount_, 0);
    mutator._append();
    mutator._append();
    mutator._append();
    mutator._update();
    assertEquals(letBlock.argumentCount_, 3);
    assertNotNull(letBlock.typedValue['ARG0']);
    assertNotNull(letBlock.typedValue['ARG1']);
    assertNotNull(letBlock.typedValue['ARG2']);

    var scheme = letBlock.getTypeScheme('VAR');
    assertNotNull(scheme);
    assertEquals(scheme.names.length, 4);
    // poly types are not yet implemented.
    // ∀txyz. t -> x -> y -> z
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_polyTypeForIdFunc() {
  var workspace = create_typed_workspace();
  var workbench;
  var workbench2;
  try {
    var letBlock = workspace.newBlock('let_typed');
    var mutator = create_mock_mutator(letBlock, 'args_create_with_item');
    assertEquals(letBlock.argumentCount_, 0);
    mutator._append();
    mutator._update();
    assertEquals(letBlock.argumentCount_, 1);
    assertNotNull(letBlock.typedValue['ARG0']);
    setVariableName(letBlock, 'id');

    workbench = create_mock_workbench(letBlock, 'EXP1');
    var blocks = getFlyoutBlocksFromWorkbench(workbench, workspace);
    assertEquals(blocks.length, 1);
    var referenceBlock = blocks[0];
    var reference = getVariable(referenceBlock);
    var argValue = letBlock.typedValue['ARG0'];
    assertEquals(reference.getBoundValue(), argValue);
    assertEquals(reference.getTypeExpr().val, argValue.getTypeExpr());

    letBlock.getInput('EXP1').connection.connect(referenceBlock.outputConnection);

    var letValue = getVariable(letBlock);
    assertEquals(letValue.getTypeExpr().val.label,
        Blockly.TypeExpr.FUN_);
    assertEquals(letValue.getTypeExpr().val.arg_type, argValue.getTypeExpr());
    assertEquals(letValue.getTypeExpr().val.return_type,
        letBlock.getInput('EXP1').connection.typeExpr);

    var workbench2 = create_mock_workbench(letBlock, 'EXP2');
    var blocks = getFlyoutBlocksFromWorkbench(workbench2, workspace);
    assertEquals(blocks.length, 1);
    var referenceBlock = blocks[0];
    var reference = getVariable(referenceBlock);
    assertEquals(reference.getBoundValue(), letValue);
    assertNotEquals(reference.getTypeExpr().deref(), letValue.getTypeExpr().deref());
  } finally {
    if (workbench) {
      workbench.dispose();
    }
    if (workbench2) {
      workbench2.dispose();
    }
    workspace.dispose();
  }
}

function test_type_unification_fixFstSndInference() {
  var workspace = create_typed_workspace();
  try {
    var fstBlock = workspace.newBlock('pair_first_typed');
    var sndBlock = workspace.newBlock('pair_second_typed');
    var ifBlock = workspace.newBlock('logic_ternary_typed');
    fstBlock.getInput('FIRST').connection.connect(ifBlock.outputConnection);
    sndBlock.getInput('SECOND').connection.connect(ifBlock.outputConnection);
  } finally {
    workspace.dispose();
  }
}

function fixLambdaIdInLetPoly(firstConnectLambda, setRefInExp2) {
  var workspace = create_typed_workspace();
  var workbench;
  try {
    var letBlock = workspace.newBlock('let_typed');
    var lambdaBlock = workspace.newBlock('lambda_typed');
    var var1 = workspace.newBlock('variables_get_typed');

    if (firstConnectLambda) {
      letBlock.getInput('EXP1').connection.connect(
          lambdaBlock.outputConnection);
    }

    workbench = create_mock_workbench(letBlock);
    var ws = setRefInExp2 ? workspace : workbench.getWorkspace();
    var blocks = getFlyoutBlocksFromWorkbench(workbench, ws);
    assertEquals(blocks.length, 1);
    var referenceBlock = blocks[0];
    var reference = getVariable(referenceBlock);
    var refType = reference.getTypeExpr();

    if (setRefInExp2) {
      // let x = fun c -> c in x
      letBlock.getInput('EXP2').connection.connect(
          referenceBlock.outputConnection);
    }  else {
      //                  |___  x ___|
      //                      |/
      // let x = fun c -> c in ..
    }
    if (!firstConnectLambda) {
      var exp1 = letBlock.getInput('EXP1').connection;
      assertEquals(reference.getTypeExpr().deref(), exp1.typeExpr);
      exp1.connect(lambdaBlock.outputConnection);
    }

    setVariableName(lambdaBlock, 'c');
    setVariableName(var1, 'c');
    getVariable(var1).setBoundValue(getVariable(lambdaBlock));

    var lambdaType = lambdaBlock.outputConnection.typeExpr;

    // Assertion for let-poly
    function polyCheck() {
      var argType = lambdaType.arg_type;
      var returnType = lambdaType.return_type;
      assertFalse(refType.occur(argType.name));
      assertFalse(refType.occur(returnType.name));

      var derefLam = lambdaType.deepDeref();
      var derefRef = refType.deepDeref();
      assertTrue(derefLam.isFunction());
      assertTrue(derefRef.isFunction());
      assertNotEquals(derefLam, derefRef);
      assertNotEquals(derefLam.toString(), derefRef.toString());
      assertNotEquals(lambdaType.toString(), refType.toString());
    }

    polyCheck();

    // let x = fun c -> c in ..
    lambdaBlock.getInput('RETURN').connection.connect(var1.outputConnection);

    polyCheck();

    // let x = fun c -> .. in ..
    var1.outputConnection.disconnect();

    polyCheck();
  } finally {
    if (workbench) {
      workbench.dispose();
    }
    workspace.dispose();
  }
}

function test_type_unification_fixLambdaIdInLetPoly() {
  fixLambdaIdInLetPoly(true, true);
  fixLambdaIdInLetPoly(true, false);
  fixLambdaIdInLetPoly(false, true);
  fixLambdaIdInLetPoly(false, false);
}

function test_type_unification_constructBlockSimple() {
  var workspace = create_typed_workspace();
  try {
    var defineCtr = workspace.newBlock('defined_datatype_typed');
    var ctrValue = getVariable(defineCtr, 0);
    var ctr = workspace.newBlock('create_construct_typed');
    var ctrReference = getVariable(ctr);
    // TODO(harukam): The following call fails. Fix it.
    ctrReference.setBoundValue(ctrValue);
  } finally {
    workspace.dispose();
  }
}
