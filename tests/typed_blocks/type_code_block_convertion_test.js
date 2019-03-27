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

function test_code_generator_matchPatternBlock() {
  var workspace = create_typed_workspace();
  var workbench;
  try {
    var defineRecord = workspace.newBlock('defined_recordtype_typed');
    var matchBlock = workspace.newBlock('match_typed');
    connectAsStatements(defineRecord, matchBlock);
    workbench = create_mock_pattern_workbench(matchBlock);
    var contentsMap = workbench.getContentsMap_();
    var blockXml = contentsMap.record[0];
    var recordPattern = domToFlyoutBlockInWorkbench(workbench, blockXml);
    var code = Blockly.TypedLang.blockToCode(recordPattern)[0];
    assertTrue(goog.isString(code));
    assertTrue(0 < code.length);
    var recordPatternValue = recordPattern.transformToValue(workspace);
    code = Blockly.TypedLang.blockToCode(recordPatternValue)[0];
    assertTrue(goog.isString(code));
    assertTrue(0 < code.length);

    matchBlock.getInput('PATTERN0').connection.connect(
        recordPatternValue.outputConnection);
    var code = Blockly.TypedLang.workspaceToCode(workspace);
    assertTrue(goog.isString(code));
    assertTrue(0 < code.length);
  } finally {
    workspace.dispose();
    if (workbench) {
      workbench.dispose();
    }
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
    "pi 9000.",
  "type t = {l:int*int*bool;l2:float;l3:string*int}",
  "type t = Ctor1 | Ctor2 of string | Bar of int * string * float | Foo of int * int",
  "[1;2;3]",
  "[]",
  "[[1;2];[2;3;4];[4;5;6]]"
];

function test_block_generator_convertSampleCodeList() {
  var workspace = create_typed_workspace();
  workspace.renderTypeChangedWorkspaces = function() {};
  Blockly.mainWorkspace = workspace;
  try {
    for (var i = 0, code; code = codeList[i]; i++) {
      var result = BlockOfOCamlUtils.codeToBlock(code, false);
      if (result.errCode != BlockOfOCamlUtils.ERROR_NONE) {
        var errMsg = BlockOfOCamlUtils.getErrorMessage(result);
        goog.asserts.fail(errMsg);
      }
    }
  } finally {
    workspace.dispose();
  }
}

/** End tests for block generator. */
