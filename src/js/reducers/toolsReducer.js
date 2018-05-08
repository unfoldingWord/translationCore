import types from '../actions/ActionTypes';

const initialState = {
  currentToolViews: {},
  currentToolName: null,
  currentToolTitle: null,
  toolsMetadata:[],
  apis: {},
};

const toolsReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SAVE_TOOL_VIEW:
      return {
        ...state,
        currentToolViews: {
          ...state.currentToolViews,
          [action.identifier]: action.module
        },
        apis: {
          ...state.apis,
          [action.identifier]: action.api
        }
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
    case types.GET_TOOLS_METADATA:
      return {
        ...state,
        toolsMetadata: action.val
      };
    case types.CLEAR_CURRENT_TOOL_DATA:
      return initialState;
    default:
      return state;
  }
};

export default toolsReducer;

/**
 * Returns the name of the currently selected tool
 * @param state
 * @return {string | undefined}
 */
export const getCurrentName = (state) => {
  if(state && state.currentToolName) {
    return state.currentToolName;
  } else {
    return undefined;
  }
};

/**
 * Returns the react component of the currently selected tool
 * @param state
 * @return {*}
 */
export const getCurrentContainer = state => {
  const name = getCurrentName(state);
  if(name && name in state.currentToolViews) {
    return state.currentToolViews[name];
  }
  return null;
};

/**
 * Returns the api of the currently selected tool
 * @param state
 * @return {*}
 */
export const getCurrentApi = state => {
  const name = getCurrentName(state);
  if(name && name in state.apis) {
    return state.apis[name];
  }
  return null;
};
