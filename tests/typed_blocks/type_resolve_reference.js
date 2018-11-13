'use strict';

function create_typed_workspace() {
  var workspaceOptions = {
    typedVersion: true
  };
  return new Blockly.Workspace(workspaceOptions);
}

function test_resolve_reference_letNested() {
  var workspace = create_typed_workspace();
  try {
    var letBlock1 = workspace.newBlock('let_typed');
    var letBlock2 = workspace.newBlock('let_typed');
    setVariableName(letBlock1, 'hoge');
    setVariableName(letBlock2, 'hoge');
    letBlock1.getInput('EXP2').connection.connect(letBlock2.outputConnection);

    var exp2 = letBlock2.getInput('EXP2').connection;
    var env = letBlock2.allVisibleVariables(exp2);
    assertEquals(env['hoge'], getVariable(letBlock2));
  } finally {
    workspace.dispose();
  }
}

function test_resolve_reference_letTreeSepareted() {
  var workspace = create_typed_workspace();
  try {
    var letBlock1 = workspace.newBlock('let_typed');
    var letBlock2 = workspace.newBlock('let_typed');
    var varBlock = workspace.newBlock('variables_get_typed');
    setVariableName(letBlock1, 'x');
    setVariableName(letBlock2, 'x');
    setVariableName(varBlock, 'x');
    letBlock1.getInput('EXP2').connection.connect(varBlock.outputConnection);

    var exp2 = letBlock2.getInput('EXP2').connection;
    assertTrue(letBlock1.resolveReference(exp2, true));
    assertEquals(getVariable(letBlock1),
        getVariable(varBlock).getBoundValue());
  } finally {
    workspace.dispose();
  }
}

function test_resolve_reference_NotShareVariables() {
  var workspace = create_typed_workspace();
  try {
    var intArith = workspace.newBlock('int_arithmetic_typed');
    var letBlock1 = workspace.newBlock('let_typed');
    var letBlock2 = workspace.newBlock('let_typed');
    var varBlock1 = workspace.newBlock('variables_get_typed');
    var varBlock2 = workspace.newBlock('variables_get_typed');
    setVariableName(letBlock1, 'x');
    setVariableName(letBlock2, 'x');
    setVariableName(varBlock1, 'x');
    setVariableName(varBlock2, 'x');

    // [let x = <> in [ <[let x = <> in <[x]>]> + <x> ]]
    letBlock2.getInput('EXP2').connection.connect(intArith.outputConnection);
    intArith.getInput('A').connection.connect(letBlock1.outputConnection);
    intArith.getInput('B').connection.connect(varBlock2.outputConnection);
    letBlock1.getInput('EXP2').connection.connect(varBlock1.outputConnection);

    // Arithmetic blocks are disconnected from outer let-block, variable 'x'
    // on the right operand can not be resolved.
    assertFalse(intArith.resolveReference(null));
  } finally {
    workspace.dispose();
  }
}
