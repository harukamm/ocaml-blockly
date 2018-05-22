'use strict';

function test_type_unification_structure() {
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

function test_type_unification_clearTypeVariableWhenDisconnectingBlocks() {
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
