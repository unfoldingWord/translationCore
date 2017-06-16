import consts from '../actions/ActionTypes';

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
    default:
      return state;
  }
};

export default toolsReducer;
