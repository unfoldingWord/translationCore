import types from '../actions/ActionTypes';

const initialState = {
  selectedTool: null,
  tools: { byName: {}, byObject: [] },
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
        [action.name]: index,
      },
      byObject: [
        ...state.byObject,
        action.tool,
      ],
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
      tools: tools(state.tools, action),
    };
  case types.OPEN_TOOL:
    return {
      ...state,
      selectedTool: action.name,
    };
  case types.CLOSE_TOOL:
    return {
      ...state,
      selectedTool: initialState.selectedTool,
    };
  default:
    return state;
  }
};

export default toolsReducer;

/**
 * Returns the loaded tools
 * @param state
 * @returns {object[]}
 */
export const getTools = state => {
  if (state) {
    return [...state.tools.byObject];
  } else {
    return [];
  }
};

/**
 * Returns the loaded tools
 * @param state
 * @returns {object[]}
 */
export const getToolsByKey = state => {
  const obj = {};

  if (state) {
    Object.keys(state.tools.byObject).forEach((index) => {
      const toolApi = state.tools.byObject[index];
      obj[toolApi.name] = toolApi;
    });
    return obj;
  } else {
    return {};
  }
};


/**
 * Returns an array of tool names
 * @param state
 * @returns {*}
 */
export const getNames = state => {
  if (state) {
    return [...state.tools.byName];
  } else {
    return [];
  }
};

/**
 * Returns the name of the currently selected tool
 * @param state
 * @return {string | undefined}
 */
export const getCurrentToolName = (state) => {
  if (state && state.selectedTool) {
    return state.selectedTool;
  } else {
    return false;
  }
};

/**
 * Returns the title of the currently selected tool
 * @param state
 * @return {string}
 */
export const getSelectedToolTitle = state => {
  const tool = getSelectedTool(state);

  if (tool) {
    return tool.title;
  } else {
    return '';
  }
};

/**
 * Returns the selected tool
 * @param state
 * @returns {*}
 */
export const getSelectedTool = state => {
  if (state && state.selectedTool) {
    return getTool(state, state.selectedTool);
  } else {
    return null;
  }
};

/**
 * Returns a tool by it's name
 * @param state
 * @param {string} name - the name of the tool
 * @returns {*}
 */
export const getTool = (state, name) => {
  if (state && state.tools.byName.hasOwnProperty(name)) {
    const index = state.tools.byName[name];
    return state.tools.byObject[index];
  } else {
    return null;
  }
};

/**
 * Returns the react component of the currently selected tool
 * @param state
 * @return {*}
 */
export const getSelectedToolContainer = state => {
  const tool = getSelectedTool(state);

  if (tool) {
    return tool.container;
  } else {
    return null;
  }
};

/**
 * Returns the api of the currently selected tool
 * @param state
 * @return {ApiController}
 */
export const getSelectedToolApi = state => {
  const tool = getSelectedTool(state);

  if (tool) {
    return tool.api;
  } else {
    return null;
  }
};

/**
 * Returns a dictionary of tool apis that support the currently selected tool.
 * These are tools that might in the future be labeled as dependencies, but for
 * now we're including all tool api's other than the currently selected one.
 * @param state
 * @return {ApiController[]}
 */
export const getSupportingToolApis = state => {
  const name = getCurrentToolName(state);
  const apis = {};

  for (let i = 0, len = state.tools.byObject.length; i < len; i++) {
    const tool = state.tools.byObject[i];

    if (tool.name !== name) {
      apis[tool.name] = tool.api;
    }
  }
  return apis;
};
