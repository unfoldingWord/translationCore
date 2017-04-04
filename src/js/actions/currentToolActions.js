import consts from '../actions/CoreActionConsts'

/**
 * @description this action sets current tool name
 * @param {string} toolName - name of current tool
 * @return {object} New state for currentTool reducer.
 */
export const setToolName = (toolName) => {
  if (!toolName || toolName === ' ') {
    return {
      type: consts.SET_TOOL_NAME
    }
  }
  return {
    type: consts.SET_TOOL_NAME,
    toolName
  }
}
