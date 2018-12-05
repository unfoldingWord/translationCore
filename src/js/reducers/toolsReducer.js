import types from "../actions/ActionTypes";

const initialState = {
  currentToolName: null,
  currentToolTitle: null,
  tools: { byName: {}, byObject: [] }
};

/**
 * Reducers the list of tools
 * @param state
 * @param action
 * @returns {object}
 */
const tools = (state = { byName: {}, byObject: [] }, action) => {
  switch (action.type) {
    case types.ADD_TOOL: {
      const index = state.byObject.length;

      return {
        byName: {
          ...state.byName,
          [action.tool.name]: index
        },
        byObject: [
          ...state.byObject,
          action.tool
        ]
      };
    }
    default:
      return state;
  }
};

/**
 * Reduces the entire state of tools
 * @param state
 * @param action
 * @returns {object}
 */
const toolsReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.ADD_TOOL:
      return {
        ...state,
        tools: tools(state.tools, action)
      };
    case types.SET_CURRENT_TOOL_NAME:
      return {
        ...state,
        currentToolName: action.currentToolName
      };
    case types.SET_CURRENT_TOOL_TITLE:
      return {
        ...state,
        currentToolTitle: action.currentToolTitle
      };
    case types.CLEAR_CURRENT_TOOL_DATA:
      return {
        ...state,
        currentToolName: initialState.currentToolName,
        currentToolTitle: initialState.currentToolTitle
      };
    default:
      return state;
  }
};

export default toolsReducer;

/**
 * Returns the loaded tools
 * @param state
 * @returns {[]}
 */
export const getTools = state => {
  return [...state.tools.byObject];
};

/**
 * Returns the name of the currently selected tool
 * @param state
 * @return {string | undefined}
 */
export const getCurrentName = (state) => {
  if (state && state.currentToolName) {
    return state.currentToolName;
  } else {
    return undefined;
  }
};

/**
 * Returns the title of the currently selected tool
 * @param state
 * @return {string}
 */
export const getCurrentTitle = state => {
  if (state && state.currentToolTitle) {
    return state.currentToolTitle;
  } else {
    return "";
  }
};

/**
 * Returns the react component of the currently selected tool
 * @param state
 * @return {*}
 */
export const getCurrentContainer = state => {
  const name = getCurrentName(state);
  if (name && name in state.tools.byName) {
    const index = state.tools.byName[name];
    return state.tools.byObject[index].container;
  }
  return null;
};

/**
 * Returns the api of the currently selected tool
 * @param state
 * @return {ApiController}
 */
export const getCurrentApi = state => {
  const name = getCurrentName(state);
  if (name && name in state.tools.byName) {
    const index = state.tools.byName[name];
    return state.tools.byObject[index].api;
  }
  return null;
};

/**
 * Returns a dictionary of tool apis that support the currently selected tool.
 * These are tools that might in the future be labeled as dependencies, but for
 * now we're including all tool api's other than the currently selected one.
 * @param state
 * @return {ApiController[]}
 */
export const getSupportingToolApis = state => {
  const name = getCurrentName(state);
  const apis = {};
  for(let i = 0, len = state.tools.byObject.length; i < len; i ++) {
    const tool = state.tools.byObject[i];
    if(tool.name !== name) {
      apis[tool.name] = tool.api;
    }
  }
  return apis;
};
