import types from "./ActionTypes";
import { loadToolsInDir } from "../helpers/toolHelper";

/**
 * Registers a tool that has been loaded from the disk.
 * @param {object} tool - a tc-tool.
 */
export const registerTool = tool => ({
  type: types.ADD_TOOL,
  tool
});

/**
 * Loads the app tools.
 * This puts the tools into redux for later use.
 * @param {string} toolsDir - path to the tools directory
 * @returns {Function}
 */
export const loadTools = (toolsDir) => async (dispatch) => {
  const tools = await loadToolsInDir(toolsDir);
  for(let i = 0, len = tools.length; i < len; i ++) {
    dispatch(registerTool(tools[i]));
  }
};
