'use strict';

var Typed = {};

Typed.workspace = null;

Typed.init = function() {
  var onresize = function(e) {
    var container = document.getElementById('workspaceArea');
    var bBox = Typed.getBBox_(container);
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

  Typed.workspace = Blockly.inject(document.getElementById('blocklyDiv'),
      {path: '../../', toolbox: document.getElementById('toolbox'),
       grid:
           {spacing: 25,
            length: 3,
            colour: '#ccc',
            snap: true},
       trashcan: true,
       media: '../../media/',
       rtl: false, /*not support RTL */
       zoom:
           {controls: true,
            wheel: true},
       collapse: false,
       typedVersion: true
      });
  onresize();
  Blockly.svgResize(Typed.workspace);
};

Typed.getBBox_ = function(element) {
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

Typed.showCode = function() {
  try {
    var code = Blockly.TypedLang.workspaceToCode(Typed.workspace);
    var input = document.querySelector(".generatedCode");
    input.value = code;
  } catch (e) {
    // alert('Some of blocks are not supported for converting.');
  }
}

Typed.runCode = function() {
  //  alert('Not implemented yet.');
}

Typed.onClickConvert = function(event) {
  event.preventDefault();
  var input = document.querySelector(".ocamlCode");
  var code = input.value;
  if (code) {
    Typed.codeToBlock(code);
  }
}

Typed.codeToBlock = function(code) {
  try {
    var xmlStr = blockOfOCaml(code);
  } catch (e) {
    alert ("Syntax error or not-supported AST error.");
    return;
  }
  var result = Typed.fromXMLString(xmlStr);
  if (result.errMsg) {
    alert(result.errMsg);
  }
}

Typed.disableTypeCheck = function(block) {
  var desc = block.getDescendants();
  for (var i = 0, child; child = desc[i]; i++) {
    var connections = child.getConnections_();
    for (var j = 0, conn; conn = connections[j]; j++) {
      conn.disableTypeCheck(true);
    }
  }
}

Typed.forceDispose = function(block) {
  Typed.disableTypeCheck(block);
  block.dispose();
}

Typed.fromXMLString = function(str, opt_workspace) {
  var workspace = opt_workspace ? opt_workspace : Blockly.mainWorkspace;
  var parser = new DOMParser();
  var xml = parser.parseFromString(str, "text/xml");
  var parseError = xml.getElementsByTagName("parsererror").length != 0;
  var result = {errMsg:null, block:null};
  if (parseError) {
    result.errMsg = "XML parsing error";
    return result;
  }
  try {
    var block = Blockly.Xml.domToBlock(xml.children[0], workspace, true);
  } catch (e) {
    result.errMsg = "Illegal block XML.";
    return result;
  }
  var resolved = block.resolveReference(null, true);
  if (!resolved) {
    result.errMsg = "Undefined varaible.";
    Typed.forceDispose(block);
    return result;
  }
  var typeCheck = true;
  try {
    block.updateTypeInference();
  } catch (e) {
    typeCheck = false;
  }
  if (!typeCheck) {
    result.errMsg = "Type error.";
    Typed.forceDispose(block);
    return result;
  }
  block.workspace.renderTypeChangedWorkspaces();
  result.block = block;
  return result;
}

window.addEventListener('load', Typed.init);
