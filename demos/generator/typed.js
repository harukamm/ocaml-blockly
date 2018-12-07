'use strict';

var Typed = {};

Typed.workspace = null;

Typed.init = function() {
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
};

Typed.showCode = function() {
  // Generate TypedLang code and display it.
  Blockly.TypedLang.INFINITE_LOOP_TRAP = null;
  var code = Blockly.TypedLang.workspaceToCode();
  alert(code);
}

Typed.runCode = function() {
  // Generate TypedLang code and run it.
  window.LoopTrap = 1000;
  Blockly.TypedLang.INFINITE_LOOP_TRAP =
      'if (--window.LoopTrap == 0) throw "Infinite loop.";\n';
  var code = Blockly.TypedLang.workspaceToCode();
  Blockly.TypedLang.INFINITE_LOOP_TRAP = null;
  try {
    eval(code);
  } catch (e) {
    alert(e);
  }
}

Typed.onClickConvert = function(event) {
  event.preventDefault();
  var input = document.querySelector("input.ocamlCode");
  var code = input.value;
  if (code) {
    Typed.codeToBlock(code);
  }
}

Typed.codeToBlock = function(code) {
  var xmlStr = blockOfOCaml(code);
  try {
    Typed.fromXMLString(xmlStr);
  } catch (e) {
    console.log("Conveted: \n" + xmlStr);
    console.log(e);
  }
}

Typed.fromXMLString = function(str, opt_workspace) {
  var workspace = opt_workspace ? opt_workspace : Blockly.mainWorkspace;
  var parser = new DOMParser();
  var xml = parser.parseFromString(str, "text/xml");
  var parseError = xml.getElementsByTagName("parsererror").length != 0;
  if (parseError) {
    console.log(xml);
    throw "Parser error";
  } else {
    var block = Blockly.Xml.domToBlock(xml.children[0], workspace);
    return block;
  }
}

window.addEventListener('load', Typed.init);
