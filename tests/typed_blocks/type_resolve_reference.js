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
