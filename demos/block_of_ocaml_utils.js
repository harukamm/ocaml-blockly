var BlockOfOCamlUtils = {};

BlockOfOCamlUtils.ERROR_NONE = null;
BlockOfOCamlUtils.ERROR_AST_PARSING = 1;
BlockOfOCamlUtils.ERROR_XML_PARSING = 2;
BlockOfOCamlUtils.ERROR_INVALID_BLOCK_XML = 3;
BlockOfOCamlUtils.ERROR_UNDEFINED_VARIABLE = 4;
BlockOfOCamlUtils.ERROR_TYPE_INFERENCE = 5;

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
  var errMsg = BlockOfOCamlUtils.getErrorMessage(result.errCode);
  if (errMsg) {
    alert(errMsg);
  }
  return result;
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

BlockOfOCamlUtils.getErrorMessage = function(code) {
  switch (code) {
    case BlockOfOCamlUtils.ERROR_NONE:
      return null;
    case BlockOfOCamlUtils.ERROR_AST_PARSING:
      return "Syntax error or not-supported AST";
    case BlockOfOCamlUtils.ERROR_XML_PARSING:
      return "XML parsing error";
    case BlockOfOCamlUtils.ERROR_INVALID_BLOCK_XML:
      return "Invalid Block XML";
    case BlockOfOCamlUtils.ERROR_UNDEFINED_VARIABLE:
      return "Undefined varaible";
    case BlockOfOCamlUtils.ERROR_TYPE_INFERENCE:
      return "Type error";
    default:
      throw "Unknown error code.";
  }
};

BlockOfOCamlUtils.fromXMLString = function(str, opt_workspace) {
  var workspace = opt_workspace ? opt_workspace : Blockly.mainWorkspace;
  var parser = new DOMParser();
  var xml = parser.parseFromString(str, "text/xml");
  var parseError = xml.getElementsByTagName("parsererror").length != 0;
  var result = {
      errCode: BlockOfOCamlUtils.ERROR_NONE,
      block: null
  };
  if (parseError) {
    result.errCode = BlockOfOCamlUtils.ERROR_XML_PARSING;
    return result;
  }
  try {
    var block = Blockly.Xml.domToBlock(xml.children[0], workspace, true);
  } catch (e) {
    result.errCode = BlockOfOCamlUtils.ERROR_INVALID_BLOCK_XML;
    return result;
  }
  var resolved = block.resolveReference(null, true);
  if (!resolved) {
    result.errCode = BlockOfOCamlUtils.ERROR_UNDEFINED_VARIABLE;
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
    result.errCode = BlockOfOCamlUtils.ERROR_TYPE_INFERENCE;
    BlockOfOCamlUtils.forceDispose(block);
    return result;
  }
  block.workspace.renderTypeChangedWorkspaces();
  result.block = block;
  return result;
};
