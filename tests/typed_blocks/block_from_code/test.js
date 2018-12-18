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
    var result = Test.codeToBlock(Test.tests[i]);
    var block = result[0];
    var resolved = result[1];
    if (block && resolved) {
      console.log("success: '" + Test.tests[i] + "'");
    } else if (block) {
      console.log("succes but can not resolved: '" + Test.tests[i] + "'");
    } else {
      console.log("failed to convert code: '" + Test.tests[i] + "'");
    }
    block.moveBy(10, prevHeight + 10);
    prevHeight = block.height;
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
    Test.codeToBlock(code);
  } catch(e) {
    console.log(e);
  }
  return false;
};

Test.codeToBlock = function(code) {
  var xmlStr = blockOfOCaml(code);
  var block = null;
  return Test.fromXMLString(xmlStr);
};

Test.fromXMLString = function(str, opt_workspace) {
  var workspace = opt_workspace ? opt_workspace : Blockly.mainWorkspace;
  var parser = new DOMParser();
  var xml = parser.parseFromString(str, "text/xml");
  var parseError = xml.getElementsByTagName("parsererror").length != 0;
  if (parseError) {
    console.log(xml);
    throw "Parser error";
  } else {
    var block = Blockly.Xml.domToBlock(xml.children[0], workspace, true);
    var resolved = block.resolveReference(null, true);
    block.updateTypeInference();
    block.workspace.renderTypeChangedWorkspaces();
    return [block, resolved];
  }
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
