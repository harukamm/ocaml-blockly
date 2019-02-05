'use strict';

var Typed = {};

Typed.DEVMODE = false;
// Note: This demo page must be located in either of the two directories:
// demos/typed and docs/. The DEVMODE must be enabled if this page exists in
// the first one. Otherwise, it must be disabled.

Typed.SCRIPTS_FOR_DEV = [
  "../../blockly_uncompressed.js",
  "../../blocks/lists.js",
  "../../blocks/typed_blocks.js",
  "../../blocks/parameters.js",
  "../../blocks/datatypes.js",
  "../../generators/typedlang.js",
  "../../generators/typedlang/blocks.js",
  "../../msg/js/en.js",
  "../../block_of_ocaml/converter.js",
  "../../block_of_ocaml/utils.js",
];

Typed.SCRIPTS_FOR_PROD = [
  "blockly_compressed.js",
  "blocks_compressed.js",
  "typedlang_compressed.js",
  "en.js",
  "converter.js",
  "block_of_ocaml_utils.js",
];

Typed.BOOT = (function() {
  var scripts = document.getElementsByTagName('script');
  var re = new RegExp('(.+)[\/]typed\.js$');
  var dir;
  for (var i = 0, script; script = scripts[i]; i++) {
    var match = re.exec(script.src);
    if (match) {
      dir = match[1];
    }
  }
  if (!dir) {
    alert('Could not detect the directory name.');
    return;
  }
  var scripts = Typed.DEVMODE ? Typed.SCRIPTS_FOR_DEV : Typed.SCRIPTS_FOR_PROD;
  for (var i = 0, src; src = scripts[i]; i++) {
    document.write(
        '<script type="text/javascript" src="' + src + '"></' +
        'script>');
  }
})();


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
  if (Typed.DEVMODE) {
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
  // Use local media files if the DEVMODE is enabled.
  if (Typed.DEVMODE) {
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
