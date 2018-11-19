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
    assertEquals(getVariableFieldDisplayedText(var1),
        getVariableFieldDisplayedText(block));
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
    assertEquals(getVariableFieldDisplayedText(var1),
        getVariableFieldDisplayedText(lambdaBlock));
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
    var xml = workbench.getFlyoutLanguageTree_();
    var childNodes = xml.childNodes;
    assertEquals(childNodes.length, 2);
    var innersVars = Blockly.Xml.domToBlock(childNodes[0], workspace);
    var outersVar = Blockly.Xml.domToBlock(childNodes[1], workspace);
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
    var xml = workbench.getFlyoutLanguageTree_();
    var childNodes = xml.childNodes;
    assertEquals(childNodes.length, 2);
    var innersVars = Blockly.Xml.domToBlock(childNodes[0], workspace);
    var outersVar = Blockly.Xml.domToBlock(childNodes[1], workspace);
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
    assertTrue(getVariableFieldDisplayedText(varBlock) === 'i');

    setVariableName(outerBlock, 'x');
    assertTrue(getVariableFieldDisplayedText(varBlock) === 'x');
    // [let j = <> in < [let i = <> in < [j] >] >]

    // [let x = <> in < [let i = <> in <>] >]   [x]
    innerBlock.getInput('EXP2').connection.disconnect(
        varBlock.outputConnection);
    // Variable binding relation holds even after disconnect().
    assertTrue(isOfBoundVariable(varBlock, outerBlock));
    setVariableName(outerBlock, 'y');
    assertTrue(getVariableFieldDisplayedText(outerBlock) === 'y');
    assertTrue(getVariableFieldDisplayedText(varBlock) === 'y');

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
    assertTrue(getVariableFieldDisplayedText(outerBlock) === 'm');
    assertTrue(getVariableFieldDisplayedText(innerBlock) === 'i');
    assertTrue(getVariableFieldDisplayedText(varBlock) == 'm');
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
        assertTrue(getVariableFieldDisplayedText(valueBlocks[i]) === expected);
      }
    }
    setVariableName(var1, 'hogehoge');
    checkName(x, 'hogehoge');
    setVariableName(valueBlocks[x], 'foo');
    assertTrue(getVariableFieldDisplayedText(var1) === 'foo');
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

    assertTrue(!getVariable(letBlock).isReference());
    assertTrue(!getVariable(lambdaBlock).isReference());
    assertTrue(getVariable(varBlock).isReference());
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
    var xml = workbench.getFlyoutLanguageTree_();
    var childNodes = xml.childNodes;
    assertEquals(childNodes.length, 1);
    var referenceBlock = Blockly.Xml.domToBlock(childNodes[0],
        workbench.getWorkspace());
    var reference = getVariable(referenceBlock);
    assertEquals(reference.getBoundValue(), letValue);

    assertEquals(reference.getTypeExpr().deref(), letValue.getTypeExpr());
    assertEquals(reference.getTypeExpr().deref(), letValue.getTypeExpr());

    var arithBlock = workbench.getWorkspace().newBlock('int_arithmetic_typed');
    arithBlock.getInput('A').connection.connect(referenceBlock.outputConnection);

    assertEquals(letValue.getTypeExpr().deref().label, Blockly.TypeExpr.INT_);
    assertEquals(reference.getTypeExpr().deref().label, Blockly.TypeExpr.INT_);
    assertEquals(reference.getBoundValue(), letValue);

    arithBlock.getInput('A').connection.disconnect(referenceBlock.outputConnection);

    // TODO: The type-expr of letValue has no been cleared! Fix it.
    assertEquals(letValue.getTypeExpr().deref().label, Blockly.TypeExpr.INT_);
    /* The below tests fail though they are expected to pass. */

//    assertEquals(reference.getTypeExpr().deref(), letValue.getTypeExpr());
//    assertEquals(reference.getTypeExpr().deref(), letValue.getTypeExpr());
//
//    var letBlock2 = workbench.getWorkspace().newBlock('let_typed');
//    var letValue2 = getVariable(letBlock2);
//    setVariableName(letBlock2, 'j');
//    var exp2OnLetBlock2 = letBlock2.getInput('EXP2').connection;
//    assertEquals(reference.getBoundValue(), letValue);
//    // Can't connect to letBlock2 on the input 'EXP2' because variable
//    // references named 'j' inside the input must be bound to letValue2.
//    assertFalse(referenceBlock.resolveReference(null, exp2OnLetBlock2));
  } finally {
    workspace.dispose();
    if (workbench) {
      workbench.dispose();
    }
  }
}
