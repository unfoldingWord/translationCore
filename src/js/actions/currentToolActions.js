import consts from './ActionTypes';

/**
 * @description this action sets current tool name
 * @param {string} currentToolName - name of current tool
 * @return {object} New state for currentTool reducer.
 */
export const setToolName = (currentToolName) => {
  if (!currentToolName || currentToolName === ' ') {
    return {
      type: consts.SET_CURRENT_TOOL_NAME
    };
  }
  return {
    type: consts.SET_CURRENT_TOOL_NAME,
    currentToolName
  };
};

/**
 * @description this action sets current tool title
 * @param {string} currentToolTitle - title of current tool
 * @return {object} New state for currentTool reducer.
 */
export const setToolTitle = (currentToolTitle) => {
  if (!currentToolTitle) {
    currentToolTitle = "";
  }
  return {
    type: consts.SET_CURRENT_TOOL_TITLE,
    currentToolTitle
  };
};
