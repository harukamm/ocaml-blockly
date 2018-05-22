'use strict';

function test_type_unification_ifThenElseStructure() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('logic_ternary_typed');
    var int1 = workspace.newBlock('int_typed');
    assertEquals(3, block.inputList && block.inputList.length);
    assertEquals(1, block.getInput('IF').connection.check_.length);
    assertEquals(Blockly.TypeExpr.prototype.BOOL_,
        block.getInput('IF').connection.typeExpr.label);
    assertEquals(Blockly.TypeExpr.prototype.TVAR_,
        block.getInput('THEN').connection.typeExpr.label);
    assertEquals(null, block.getInput('THEN').connection.typeExpr.val);
    assertEquals(block.getInput('THEN').connection.typeExpr,
        block.getInput('ELSE').connection.typeExpr);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_clearTypeVariableWhenDisconnectingListTypedBlocks() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('lists_create_with_typed');
    var int1 = workspace.newBlock('int_typed');
    var float1 = workspace.newBlock('float_typed');
    block.getInput('ADD0').connection.connect(int1.outputConnection);
    assertFalse(block.getInput('ADD1').connection.checkType_(
        float1.outputConnection));
    assertEquals(Blockly.TypeExpr.prototype.INT_,
        block.outputConnection.typeExpr.element_type.deref().label);
    block.getInput('ADD0').connection.disconnect(int1.outputConnection);
    assertEquals(Blockly.TypeExpr.prototype.TVAR_,
        block.outputConnection.typeExpr.element_type.deref().label);
    block.getInput('ADD1').connection.connect(float1.outputConnection);
    assertEquals(Blockly.TypeExpr.prototype.FLOAT_,
        block.outputConnection.typeExpr.element_type.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_clearTypeVariableWhenDisconnectingLetTypedBlocks() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('let_typed');
    var int1 = workspace.newBlock('int_typed');
    var var1 = workspace.newBlock('variables_get_typed');
    // Set a variable `i`
    var variableId = workspace.getVariable('i').getId();
    var1.getField('VAR').setValue(variableId);
    block.getField('VAR').setValue(variableId);

    block.getInput('EXP1').connection.connect(int1.outputConnection);
    block.getInput('EXP2').connection.connect(var1.outputConnection);
    assertEquals(Blockly.TypeExpr.prototype.INT_,
        block.getInput('EXP1').connection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.prototype.INT_,
        block.getInput('EXP2').connection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.prototype.INT_,
        var1.outputConnection.typeExpr.deref().label);
    block.getInput('EXP1').connection.disconnect(int1.outputConnection);
    assertEquals(Blockly.TypeExpr.prototype.TVAR_,
        block.getInput('EXP1').connection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.prototype.TVAR_,
        block.getInput('EXP2').connection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.prototype.TVAR_,
        var1.outputConnection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_deeplyCloningTypes() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('logic_ternary_typed');
    var float1 = workspace.newBlock('float_typed');

    block.getInput('THEN').connection.connect(float1.outputConnection);
    assertEquals(Blockly.TypeExpr.prototype.TVAR_,
        block.getInput('THEN').connection.typeExpr.label);
    assertEquals(Blockly.TypeExpr.prototype.FLOAT_,
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
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('lists_create_with_typed');
    var intArith1 = workspace.newBlock('int_arithmetic_typed');
    block.getInput('ADD0').connection.connect(intArith1.outputConnection);
    assertEquals(Blockly.TypeExpr.prototype.INT_,
        block.outputConnection.typeExpr.element_type.deref().label);
    assertEquals(Blockly.TypeExpr.prototype.INT_,
        block.getInput('ADD1').connection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.prototype.INT_,
        block.getInput('ADD2').connection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_intArithmeticStructure() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('int_arithmetic_typed');
    var var1 = workspace.newBlock('variables_get_typed');
    var var2 = workspace.newBlock('variables_get_typed');
    // Set a variable `i`
    var variableId = workspace.getVariable('i').getId();
    var1.getField('VAR').setValue(variableId);
    // Set a variable `j`
    var variableId = workspace.getVariable('j').getId();
    var2.getField('VAR').setValue(variableId);

    block.getInput('A').connection.connect(var1.outputConnection);
    block.getInput('B').connection.connect(var2.outputConnection);
    assertEquals(var1.outputConnection.typeExpr.deref().label,
        var2.outputConnection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.prototype.INT_,
        var1.outputConnection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_floatArithmeticStructure() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('float_arithmetic_typed');
    var var1 = workspace.newBlock('variables_get_typed');
    var var2 = workspace.newBlock('variables_get_typed');
    // Set a variable `i`
    var variableId = workspace.getVariable('i').getId();
    var1.getField('VAR').setValue(variableId);
    // Set a variable `j`
    var variableId = workspace.getVariable('j').getId();
    var2.getField('VAR').setValue(variableId);

    block.getInput('A').connection.connect(var1.outputConnection);
    block.getInput('B').connection.connect(var2.outputConnection);
    assertEquals(var1.outputConnection.typeExpr.deref().label,
        var2.outputConnection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.prototype.FLOAT_,
        var1.outputConnection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_pairStructure() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('pair_create_typed');
    var firstBlock = workspace.newBlock('pair_first_typed');
    var secondBlock = workspace.newBlock('pair_second_typed');
    var int1 = workspace.newBlock('int_typed');
    var bool1 = workspace.newBlock('logic_boolean_typed');
    block.getInput('FIRST').connection.connect(int1.outputConnection);
    block.getInput('SECOND').connection.connect(bool1.outputConnection);
    assertEquals(Blockly.TypeExpr.prototype.PAIR_,
        block.outputConnection.typeExpr.label);
    assertEquals(Blockly.TypeExpr.prototype.INT_,
        block.outputConnection.typeExpr.first_type.deref().label);
    assertEquals(Blockly.TypeExpr.prototype.BOOL_,
        block.outputConnection.typeExpr.second_type.deref().label);
  } finally {
    workspace.dispose();
  }
}

function test_type_unification_logicCompareStructure() {
  var workspace = new Blockly.Workspace();
  try {
    var block = workspace.newBlock('logic_compare_typed');
    var ifBlock = workspace.newBlock('logic_ternary_typed');
    var bool1 = workspace.newBlock('logic_boolean_typed');
    block.getField('OP').setValue('=');

    assertEquals(Blockly.TypeExpr.prototype.BOOL_,
        block.outputConnection.typeExpr.label);
    block.getInput('A').connection.connect(ifBlock.outputConnection);
    ifBlock.getInput('THEN').connection.connect(bool1.outputConnection);
    assertEquals(Blockly.TypeExpr.prototype.BOOL_,
        block.getInput('A').connection.typeExpr.deref().label);
    assertEquals(Blockly.TypeExpr.prototype.BOOL_,
        block.getInput('B').connection.typeExpr.deref().label);
  } finally {
    workspace.dispose();
  }
}
