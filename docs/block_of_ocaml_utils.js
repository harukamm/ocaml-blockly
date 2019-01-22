var BlockOfOCamlUtils = {};

BlockOfOCamlUtils.ERROR_NONE = null;
BlockOfOCamlUtils.ERROR_AST_PARSING = 1;
BlockOfOCamlUtils.ERROR_XML_PARSING = 2;
BlockOfOCamlUtils.ERROR_INVALID_BLOCK_XML = 3;
BlockOfOCamlUtils.ERROR_UNDEFINED_VARIABLE = 4;
BlockOfOCamlUtils.ERROR_TYPE_INFERENCE = 5;

BlockOfOCamlUtils.codeToBlock = function(code, opt_alert) {
  if (typeof blockOfOCaml === "undefined") {
    throw "Load script convert.js";
  }
  var result = BlockOfOCamlUtils.codeToBlockImpl_(code);
  var errMsg = BlockOfOCamlUtils.getErrorMessage(result);
  if (errMsg) {
    result.errMsg = errMsg;
    if (opt_alert !== false) {
      alert(errMsg);
    }
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

BlockOfOCamlUtils.getErrorMessage = function(result) {
  switch (result.errCode) {
    case BlockOfOCamlUtils.ERROR_NONE:
      return null;
    case BlockOfOCamlUtils.ERROR_AST_PARSING:
      return "Syntax error or not-supported AST";
    case BlockOfOCamlUtils.ERROR_XML_PARSING:
      return "XML parsing error";
    case BlockOfOCamlUtils.ERROR_INVALID_BLOCK_XML:
      return "Invalid Block XML";
    case BlockOfOCamlUtils.ERROR_UNDEFINED_VARIABLE:
      var names = result.undefines.join(' ');
      return "Undefined varaible: " + names;
    case BlockOfOCamlUtils.ERROR_TYPE_INFERENCE:
      return "Type error";
    default:
      throw "Unknown error code.";
  }
};

BlockOfOCamlUtils.codeToBlockImpl_ = function(code, opt_workspace) {
  var result = {
      errCode: BlockOfOCamlUtils.ERROR_NONE,
      block: null
  };
  try {
    var xmlStr = blockOfOCaml(code);
  } catch (e) {
    result.errCode = BlockOfOCamlUtils.ERROR_AST_PARSING;
    return result;
  }
  var workspace = opt_workspace ? opt_workspace : Blockly.mainWorkspace;
  var parser = new DOMParser();
  var xml = parser.parseFromString(xmlStr, "text/xml");
  var parseError = xml.getElementsByTagName("parsererror").length != 0;
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
  var collector = new Blockly.ErrorCollector();
  if (!block.resolveReference(null, true, null, collector)) {
    var undefineds = collector.getUnboundVariables();
    result.undefines = goog.array.map(undefineds, x => x.getVariableName());
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
