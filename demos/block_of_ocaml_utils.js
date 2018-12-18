var BlockOfOCamlUtils = {};

BlockOfOCamlUtils.codeToBlock = function(code) {
  if (typeof blockOfOCaml === "undefined") {
    throw "Load script convert.js";
  }
  try {
    var xmlStr = blockOfOCaml(code);
  } catch (e) {
    alert ("Syntax error or not-supported AST error.");
    return;
  }
  var result = BlockOfOCamlUtils.fromXMLString(xmlStr);
  if (result.errMsg) {
    alert(result.errMsg);
  }
};

BlockOfOCamlUtils.disableTypeCheck = function(block) {
  var desc = block.getDescendants();
  for (var i = 0, child; child = desc[i]; i++) {
    var connections = child.getConnections_();
    for (var j = 0, conn; conn = connections[j]; j++) {
      conn.disableTypeCheck(true);
    }
  }
};

BlockOfOCamlUtils.forceDispose = function(block) {
  BlockOfOCamlUtils.disableTypeCheck(block);
  block.dispose();
};

BlockOfOCamlUtils.fromXMLString = function(str, opt_workspace) {
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
    BlockOfOCamlUtils.forceDispose(block);
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
    BlockOfOCamlUtils.forceDispose(block);
    return result;
  }
  block.workspace.renderTypeChangedWorkspaces();
  result.block = block;
  return result;
};
