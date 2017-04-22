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

/**
 * @description this action sets current tool title
 * @param {string} toolTitle - title of current tool
 * @return {object} New state for currentTool reducer.
 */
export const setToolTitle = (toolTitle) => {
  if (!toolTitle) {
    toolTitle = "";
  }
  return {
    type: consts.SET_TOOL_TITLE,
    toolTitle
  }
}

/**
 * @description This action should be used to set whether or
 * not a tool should run a 'fetchData' in the componentWillReceiveProps
 * function
 * 
 * @param {boolean} val - Designates if the data has been fetched from a tool load
 */
export const setDataFetched = (val) => {
  return {
    type:consts.SET_FETCHED_DATA,
    isDataFetched:val
  }
}
