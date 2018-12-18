var Test = {};

Test.workspace = null;

Test.tests = [
    "let x = 1 in x",
    "1+2",
    "if 2 < 3 then 1 else 0"
  ];

Test.init = function() {
  var onresize = function(e) {
    var container = document.getElementById('workspaceArea');
    var bBox = Test.getBBox_(container);
    var workspaceDiv = document.getElementById('blocklyDiv');
    workspaceDiv.style.top = bBox.y + 'px';
    workspaceDiv.style.left = bBox.x + 'px';
    // Height and width need to be set, read back, then set again to
    // compensate for scrollbars.
    workspaceDiv.style.height = bBox.height + 'px';
    workspaceDiv.style.height = (2 * bBox.height - workspaceDiv.offsetHeight) + 'px';
    workspaceDiv.style.width = bBox.width + 'px';
    workspaceDiv.style.width = (2 * bBox.width - workspaceDiv.offsetWidth) + 'px';
  };
  window.addEventListener('resize', onresize, false);

  Test.workspace = Blockly.inject('blocklyDiv',
    {media: '../../../media/',
     toolbox: document.getElementById('toolbox'),
     zoom:
          {controls: true,
           wheel: true},
     typedVersion: true});

  onresize();
  Blockly.svgResize(Test.workspace);

  Test.run();
};

Test.run = function() {
  var prevHeight = 0;
  for (var i = 0; i < Test.tests.length; i++) {
    var code = Test.tests[i];
    var result = BlockOfOCamlUtils.codeToBlock(code, false);
    var block = result.block;
    var errCode = result.errCode;
    if (errCode) {
      var msg = result.errMsg;
      console.log("failed: '" + code + "' " + msg);
    } else {
      console.log("success: '" + code + "'");
      block.moveBy(10, prevHeight + 10);
      prevHeight = block.height;
    }
  }
};

Test.showCode = function() {
  try {
    var code = Blockly.TypedLang.workspaceToCode(Test.workspace);
    var input = document.querySelector(".generatedCode");
    input.value = code;
  } catch (e) {
    // alert('Some of blocks are not supported for converting.');
  }
};

Test.runCode = function() {
  //  alert('Not implemented yet.');
};

Test.onClickConvert = function(event) {
  event.preventDefault();
  var input = document.querySelector(".ocamlCode");
  var code = input.value;
  if (!code) {
    return;
  }
  try {
    BlockOfOCamlUtils.codeToBlock(code);
  } catch(e) {
    console.log(e);
  }
  return false;
};

Test.getBBox_ = function(element) {
  var height = element.offsetHeight;
  var width = element.offsetWidth;
  var x = 0;
  var y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  } while (element);
  return {
    height: height,
    width: width,
    x: x,
    y: y
  };
}

window.addEventListener('load', Test.init);
