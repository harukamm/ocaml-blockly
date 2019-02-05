'use strict';

var Typed = {};

Typed.devmode = false;

Typed.workspace = null;

Typed.defaultCode =
    "let rec pi_impl n d =" +
    "if n > 0.0 then n *. n /. d /. (d -. 2.0) *. pi_impl (n -. 2.0) (d -. 2.0) else 1.0;;" +
    "let pi n = 2.0 *. pi_impl (n *. 2.0) (n *. 2.0 +. 1.0);;" +
    "let pi_exp = pi 9000.";

Typed.init = function() {
  Typed.setDocumentTitle_();

  var input = document.querySelector(".ocamlCode");
  input.value = Typed.defaultCode;

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
      Typed.getWorkspaceOptions_());
  onresize();
  Blockly.svgResize(Typed.workspace);
};

Typed.setDocumentTitle_ = function() {
  var title = "Blockly Demo";
  if (Typed.devmode) {
    title += " (dev)";
  }
  document.title = title;
};

Typed.getWorkspaceOptions_ = function() {
  var options =
      {toolbox: document.getElementById('toolbox'),
       grid:
           {spacing: 25,
            length: 3,
            colour: '#ccc',
            snap: true},
       trashcan: true,
       rtl: false, /*not support RTL */
       zoom:
           {controls: true,
            wheel: true},
       collapse: false,
       typedVersion: true
      };
  // Use local media files if the devmode is enabled.
  if (Typed.devmode) {
    options['path'] = '../../';
    options['media'] = '../../media/';
  }
  return options;
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
    BlockOfOCamlUtils.codeToBlock(code);
  }
}

window.addEventListener('load', Typed.init);
