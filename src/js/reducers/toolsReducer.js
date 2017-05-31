import consts from '../actions/CoreActionConsts';

const initialState = {
  toolLoaded: false,
  toolsMetadatas: [],
  switchingTool: false
};

const toolsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.GET_TOOLS_METADATAS:
      return { ...state, toolsMetadatas: action.val }
    case consts.LOAD_TOOL:
      return { ...state, toolLoaded: action.val }
    case consts.SET_SWITCHING_TOOL_OR_PROJECT_TO_TRUE:
      return {
        ...state,
        switchingTool: true
      };
    case consts.SET_SWITCHING_TOOL_OR_PROJECT_TO_FALSE:
      return {
        ...state,
        switchingTool: false
      };
    default:
      return state;
  }
};

export default toolsReducer;
