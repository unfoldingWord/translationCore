import consts from '../actions/ActionTypes';

const initialState = {
  toolViews: {},
  currentToolName: null,
  currentToolTitle: null,
  toolMetadatas:[]
};

const toolsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.SAVE_MODULE_VIEW:
      return {
        ...state,
        toolViews: {
          ...state.toolViews,
          [action.identifier]: action.module
        }
      }
    case consts.SET_TOOL_NAME:
      return {
        ...state,
        currentToolName: action.currentToolName
      }
    case consts.SET_TOOL_TITLE:
      return {
        ...state,
        currentToolTitle: action.currentToolTitle
      }
    case consts.GET_TOOLS_METADATAS:
      return {
        ...state,
        toolMetadatas: action.val
      }
    case consts.CLEAR_TOOL_DATA:
      return initialState;
    default:
      return state;
  }
};

export default toolsReducer;
