import types from '../actions/ActionTypes';

const initialState = {
  currentToolViews: {},
  currentToolName: null,
  currentToolTitle: null,
  toolsMetadata:[]
};

const toolsReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SAVE_TOOL_VIEW:
      return {
        ...state,
        currentToolViews: {
          ...state.currentToolViews,
          [action.identifier]: action.module
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
