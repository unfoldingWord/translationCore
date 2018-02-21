import consts from '../actions/ActionTypes';

const initialState = {
  currentToolViews: {},
  currentToolName: null,
  currentToolTitle: null,
  toolsMetadata:[]
};

const toolsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.SAVE_TOOL_VIEW:
      return {
        ...state,
        currentToolViews: {
          ...state.currentToolViews,
          [action.identifier]: action.module
        }
      };
    case consts.SET_CURRENT_TOOL_NAME:
      return {
        ...state,
        currentToolName: action.currentToolName
      };
    case consts.SET_CURRENT_TOOL_TITLE:
      return {
        ...state,
        currentToolTitle: action.currentToolTitle
      };
    case consts.GET_TOOLS_METADATA:
      return {
        ...state,
        toolsMetadata: action.val
      };
    case consts.CLEAR_CURRENT_TOOL_DATA:
      return initialState;
    default:
      return state;
  }
};

export default toolsReducer;
