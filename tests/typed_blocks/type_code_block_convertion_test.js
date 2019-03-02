'use strict';

/** Begin tests for code generator. */

function test_code_generator_checkIfImplementations() {
  var workspace = create_typed_workspace();
  try {
    var prototypes = Object.keys(Blockly.Blocks);
    var blocks = [];
    for (var i = 0, type; type = prototypes[i]; i++) {
      if (!type.match(/\w+_typed/)) {
        continue;
      }
      blocks.push(workspace.newBlock(type));
    }
    var code = Blockly.TypedLang.workspaceToCode(workspace);
    assertTrue(goog.isString(code));
  } finally {
    workspace.dispose();
  }
}

/** End tests for code generator. */

/** Begin tests for block generator. */

var codeList = [
  "let x = 42 in x",
  "let f x y = x + y in f 1 2",
  "let rec pi_impl n d =" +
    "if n > 0.0 " +
    "then n *. n /. d /. (d -. 2.0) *. pi_impl (n -. 2.0) (d -. 2.0) " +
    "else 1.0;;" +
    "let pi n = 2.0 *. pi_impl (n *. 2.0) (n *. 2.0 +. 1.0);;" +
    "let pi_exp = pi 9000.",
  "let rec pi_impl n d =" +
    "if n > 0.0 " +
    "then n *. n /. d /. (d -. 2.0) *. pi_impl (n -. 2.0) (d -. 2.0) " +
    "else 1.0 in " +
    "let pi n = 2.0 *. pi_impl (n *. 2.0) (n *. 2.0 +. 1.0) in " +
    "pi 9000."
];

function test_block_generator_convertSampleCodeList() {
  var workspace = create_typed_workspace();
  workspace.renderTypeChangedWorkspaces = function() {};
  Blockly.mainWorkspace = workspace;
  try {
    for (var i = 0, code; code = codeList[i]; i++) {
      var result = BlockOfOCamlUtils.codeToBlock(code, false);
      if (result.errCode != BlockOfOCamlUtils.ERROR_NONE) {
        goog.asserts.fail('Could not convert to block: ' + code);
      }
    }
  } finally {
    workspace.dispose();
  }
}

/** End tests for block generator. */
